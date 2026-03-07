"""
Scam Call Detection — Combined Inference Pipeline (3-Model Fusion)
==================================================================
Usage:
    python inference.py path/to/call.wav
    python inference.py path/to/call.wav --threshold 0.45

Models:
    Phoneme CNN    → detects scripted speech patterns   (MFCC 420×120)
    Prosody XGBoost → detects urgency & pressure         (12 features)
    Repetition CNN → detects scam keyword density        (MFCC 150×40)

Final risk score (per call):
    risk = 0.4 × avg_phoneme + 0.3 × avg_prosody + 0.3 × keyword_density
"""

import sys
import warnings
import numpy as np
import librosa
import joblib
from pathlib import Path

warnings.filterwarnings("ignore")

from tensorflow.keras.models import load_model

# ── Reuse all preprocessing from the scam_detection package ──────────────────
from scam_detection.config import SR, WINDOW_SEC, OVERLAP, MIN_SPEECH_S, HOP_LENGTH
from scam_detection.audio_pipeline import (
    load_audio, rolling_buffer, vad_filter, dominant_speaker_filter
)
from scam_detection.feature_extraction import extract_mfcc, extract_prosody


# ─────────────────────────────────────────────
# INFERENCE-ONLY CONFIG
# ─────────────────────────────────────────────

# Phoneme CNN
MAX_LEN             = 420   # must match MAX_LEN in phoneme_layer.ipynb
PHONEME_MODEL_PATH  = "models/best_phoneme_model.keras"

# Prosody XGBoost
PROSODY_MODEL_PATH  = "models/best_prosody_xgb_model.pkl"

# Repetition CNN
MAX_PHRASE_LEN      = 500   # must match MAX_PHRASE_LEN in repetition_preprocessing.py
N_MFCC_REP         = 40    # raw MFCC only — no delta stacking
                             # into phrase-sized chunks for the repetition model
REP_THRESHOLD       = 0.8   # probability above which a phrase is a keyword hit
REP_MIN_HITS        = 3     # minimum keyword hits before density is trusted
REPETITION_MODEL_PATH = "models/best_repetition_model.keras"

# 3-Model fusion weights — must sum to 1.0
PHONEME_WEIGHT      = 0.40
PROSODY_WEIGHT      = 0.30
REPETITION_WEIGHT   = 0.30


# ─────────────────────────────────────────────
# LOAD MODELS
# ─────────────────────────────────────────────
def load_models() -> tuple:
    """Load all 3 trained models. Fails fast with clear messages."""
    paths = [
        (PHONEME_MODEL_PATH,    "phoneme_layer.ipynb"),
        (PROSODY_MODEL_PATH,    "prosody_layer.ipynb"),
        (REPETITION_MODEL_PATH, "repetition_layer.ipynb"),
    ]
    for path, notebook in paths:
        if not Path(path).exists():
            raise FileNotFoundError(
                f"Model not found: '{path}'\n"
                f"Train it first using {notebook}"
            )

    print(f"Loading Phoneme CNN      <- {PHONEME_MODEL_PATH}")
    print(f"Loading Prosody XGBoost  <- {PROSODY_MODEL_PATH}")
    print(f"Loading Repetition CNN   <- {REPETITION_MODEL_PATH}")

    phoneme_model    = load_model(PHONEME_MODEL_PATH)
    prosody_model    = joblib.load(PROSODY_MODEL_PATH)
    repetition_model = load_model(REPETITION_MODEL_PATH)

    print("All 3 models loaded.\n")
    return phoneme_model, prosody_model, repetition_model


# ─────────────────────────────────────────────
# PHONEME — prepare input
# ─────────────────────────────────────────────
def prepare_mfcc_for_cnn(audio: np.ndarray) -> np.ndarray:
    """Extract MFCC+delta+delta2 → pad to (MAX_LEN,120) → (1,420,120)"""
    mfcc = extract_mfcc(audio)                      # (T, 120)
    if mfcc.shape[0] < MAX_LEN:
        pad  = np.zeros((MAX_LEN - mfcc.shape[0], mfcc.shape[1]))
        mfcc = np.vstack((mfcc, pad))
    else:
        mfcc = mfcc[:MAX_LEN, :]
    return np.expand_dims(mfcc, axis=0)             # (1, 420, 120)


# ─────────────────────────────────────────────
# PROSODY — prepare input
# ─────────────────────────────────────────────
def prepare_prosody_for_xgb(audio: np.ndarray) -> np.ndarray:
    """Extract 12 prosody features → (1, 12)"""
    return extract_prosody(audio).reshape(1, -1)


# ─────────────────────────────────────────────
# REPETITION — prepare input
#
# Key difference from the other two models:
# The repetition CNN was trained on SHORT phrase clips (~1.5 sec).
# Feeding it a full 5-sec dominant window would be a training/inference
# mismatch. Instead we slice the 5-sec window into overlapping
# phrase-sized sub-windows, run the model on each, and take the MAX
# probability as the window-level repetition score.
# ─────────────────────────────────────────────
def extract_mfcc_raw(audio: np.ndarray) -> np.ndarray:
    """Raw MFCC only (no delta). Output: (T, N_MFCC_REP)"""
    mfcc = librosa.feature.mfcc(
        y=audio, sr=SR,
        n_mfcc=N_MFCC_REP,
        n_fft=400,
        hop_length=HOP_LENGTH
    )
    return mfcc.T.astype(np.float32)


def pad_phrase_mfcc(mfcc: np.ndarray) -> np.ndarray:
    """Pad/truncate to (MAX_PHRASE_LEN, 40)"""
    T = mfcc.shape[0]
    if T < MAX_PHRASE_LEN:
        pad  = np.zeros((MAX_PHRASE_LEN - T, mfcc.shape[1]), dtype=np.float32)
        return np.vstack((mfcc, pad))
    return mfcc[:MAX_PHRASE_LEN, :]


def repetition_score_for_window(audio: np.ndarray,
                                 repetition_model) -> float:
    """
    Truncate dominant audio to MAX_PHRASE_LEN frames and run once.
    No sub-windowing needed — VAD already removed silence, so the
    first MAX_PHRASE_LEN frames contain the densest speech content.
    """
    mfcc = extract_mfcc_raw(audio)
    mfcc = pad_phrase_mfcc(mfcc)
    inp  = np.expand_dims(mfcc, axis=0)
    return float(repetition_model.predict(inp, verbose=0)[0][0])


# ─────────────────────────────────────────────
# INFERENCE — Per Window
# ─────────────────────────────────────────────
def predict_window(audio: np.ndarray,
                   speech,
                   phoneme_model,
                   prosody_model,
                   repetition_model) -> dict:
    """
    Run all 3 models on one preprocessed dominant-speech window.
    Returns individual probabilities — fusion happens at call level.
    """
    phoneme_prob    = float(
        phoneme_model.predict(prepare_mfcc_for_cnn(audio), verbose=0)[0][0]
    )
    prosody_prob    = float(
        prosody_model.predict_proba(prepare_prosody_for_xgb(audio))[0][1]
    )
    repetition_prob = repetition_score_for_window(speech, repetition_model)

    return {
        "phoneme_prob":    round(phoneme_prob,    4),
        "prosody_prob":    round(prosody_prob,    4),
        "repetition_prob": round(repetition_prob, 4),
    }


# ─────────────────────────────────────────────
# INFERENCE — Full Call
# ─────────────────────────────────────────────
def run_inference(audio_path: str,
                  phoneme_model,
                  prosody_model,
                  repetition_model,
                  threshold: float = 0.45) -> dict:
    """
    Run the full 3-model pipeline on one audio file.

    Per-window fusion:
        fused = 0.4×phoneme + 0.3×prosody + 0.3×repetition_prob

    Call-level repetition score uses DENSITY (not mean probability):
        density = keyword_hits / total_windows
        A window counts as a "keyword hit" if repetition_prob > REP_THRESHOLD
        AND total hits >= REP_MIN_HITS (prevents single false-trigger)

    Final call score:
        risk = 0.4×avg_phoneme + 0.3×avg_prosody + 0.3×keyword_density
    """
    print(f"\n{'='*60}\nFILE: {audio_path}\n{'='*60}")

    audio   = load_audio(audio_path)
    windows = rolling_buffer(audio)
    print(f"  Windows: {len(windows)} ({WINDOW_SEC}s, {int(OVERLAP*100)}% overlap)\n")

    window_results  = []
    skipped         = 0
    keyword_hits    = 0          # tracks repetition density across windows

    for idx, window in enumerate(windows):

        # Stage 2 — VAD
        speech = vad_filter(window)
        if len(speech) < SR * MIN_SPEECH_S:
            skipped += 1
            continue

        # Stage 2b — Dominant speaker filter
        dominant = dominant_speaker_filter(speech)
        if len(dominant) < SR * MIN_SPEECH_S:
            skipped += 1
            continue

        # Stage 3 — All 3 models
        result = predict_window(dominant, speech, phoneme_model,
                                prosody_model, repetition_model)
        result["window"] = idx

        # Track keyword hits for density score
        if result["repetition_prob"] >= REP_THRESHOLD:
            keyword_hits += 1

        # Per-window fused score
        fused = (PHONEME_WEIGHT    * result["phoneme_prob"]
               + PROSODY_WEIGHT    * result["prosody_prob"]
               + REPETITION_WEIGHT * result["repetition_prob"])
        result["fused_prob"] = round(fused, 4)

        window_results.append(result)

        tag = "SCAM" if fused >= threshold else "normal"
        print(
            f"  Window {idx:03d} | "
            f"Phoneme: {result['phoneme_prob']:.3f}  "
            f"Prosody: {result['prosody_prob']:.3f}  "
            f"Repeat: {result['repetition_prob']:.3f}  "
            f"Fused: {fused:.3f}  -> {tag}"
        )

    processed = len(window_results)
    print(f"\n  Processed: {processed} windows  |  Skipped: {skipped}")
    print(f"  Keyword hits: {keyword_hits}/{processed}")

    if not window_results:
        print("\n  No valid speech windows found -- cannot classify.")
        return {"verdict": "UNKNOWN", "windows": [], "final_score": None}

    # ── Call-level aggregation ────────────────────────────────────────
    all_phoneme  = [w["phoneme_prob"]    for w in window_results]
    all_prosody  = [w["prosody_prob"]    for w in window_results]
    all_fused    = [w["fused_prob"]      for w in window_results]

    avg_phoneme  = float(np.mean(all_phoneme))
    avg_prosody  = float(np.mean(all_prosody))

    # Density: fraction of windows with a keyword hit
    # Only trusted if minimum hit count is met (avoids single false trigger)
    keyword_density = (keyword_hits / processed
                       if keyword_hits >= REP_MIN_HITS else 0.0)

    # Final 3-model risk score using density (not mean rep prob)
    # Density is more meaningful here because it captures HOW OFTEN
    # scam phrases appear across the whole call, not just their intensity
    final_score  = (PHONEME_WEIGHT    * avg_phoneme
                  + PROSODY_WEIGHT    * avg_prosody
                  + REPETITION_WEIGHT * keyword_density)

    verdict      = "SCAM" if final_score >= threshold else "NORMAL"
    scam_windows = sum(1 for s in all_fused if s >= threshold)

    # Density interpretation
    if keyword_density < 0.1:
        density_label = "normal conversation"
    elif keyword_density < 0.3:
        density_label = "suspicious"
    elif keyword_density < 0.6:
        density_label = "scam flow likely"
    else:
        density_label = "strong scam script"

    print(f"\n{'='*60}")
    print(f"  FINAL SCORE      : {final_score:.4f}  (threshold={threshold})")
    print(f"  Avg Phoneme      : {avg_phoneme:.4f}")
    print(f"  Avg Prosody      : {avg_prosody:.4f}")
    print(f"  Keyword Density  : {keyword_density:.4f}  → {density_label}")
    print(f"  Keyword Hits     : {keyword_hits}/{processed} windows")
    print(f"  Scam windows     : {scam_windows}/{processed} "
          f"({scam_windows/processed*100:.1f}%)")
    print(f"  VERDICT          : {verdict}")
    print(f"{'='*60}\n")

    return {
        "verdict":          verdict,
        "final_score":      round(final_score, 4),
        "avg_phoneme":      round(avg_phoneme, 4),
        "avg_prosody":      round(avg_prosody, 4),
        "keyword_density":  round(keyword_density, 4),
        "density_label":    density_label,
        "keyword_hits":     keyword_hits,
        "scam_windows":     scam_windows,
        "total_windows":    processed,
        "windows":          window_results,
    }


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python inference.py path/to/audio.wav [--threshold 0.45]")
        sys.exit(1)

    audio_path = sys.argv[1]
    threshold  = 0.45
    if "--threshold" in sys.argv:
        threshold = float(sys.argv[sys.argv.index("--threshold") + 1])
        print(f"Custom threshold: {threshold}")

    phoneme_model, prosody_model, repetition_model = load_models()
    run_inference(audio_path, phoneme_model, prosody_model,
                  repetition_model, threshold)
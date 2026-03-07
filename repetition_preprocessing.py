"""
Repetition Score Model — Preprocessing & Augmentation Pipeline
==============================================================
Works like wake-word detection: CNN trained on short phrase clips.

Dataset expected at:
  repetition_dataset/
    REPETITIVE/      *.wav   → label 1  (scam phrases repeated)
    NON_REPETITIVE/  *.wav   → label 0  (normal varied speech)

Each original clip is augmented into 3 additional variants:
  1. Time stretch slow  (rate=0.85 → speaker sounds slower/deliberate)
  2. Time stretch fast  (rate=1.15 → speaker sounds rushed/urgent)
  3. Pitch shift        (±2 semitones randomly)
  4. Volume scaling     (±20% randomly)
  → Every clip yields 4 total samples (1 original + 3 augmented)

Feature extraction:
  - Raw MFCC only (T, 40) — no delta/delta-delta, no CMVN
  - Simpler representation suited for short phrase-level CNN
  - Padded/truncated to MAX_PHRASE_LEN frames for consistent CNN input

Outputs saved to:
  rep_features/
    REPETITIVE/      mfcc_<stem>_<aug_tag>.npy    shape: (MAX_PHRASE_LEN, 40)
    NON_REPETITIVE/  mfcc_<stem>_<aug_tag>.npy
  rep_features/repetition_labels.csv              → (filepath, label)

Preprocessing chain (identical to main pipeline stages 1 & 2):
  load_audio → VAD → dominant_speaker_filter → augment → extract_mfcc_raw
"""

import os
import csv
import logging
import numpy as np
import librosa
import webrtcvad
from pathlib import Path

# ── Reuse shared config from scam_detection package ──────────────────────────
# These values MUST stay in sync with config.py so all 3 models see
# the same audio preprocessing (same SR, VAD settings, hop length etc.)
from scam_detection.config import SR, HOP_LENGTH
from scam_detection.audio_pipeline import vad_filter

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# REPETITION-SPECIFIC CONFIG
# These are separate from config.py because they
# only apply to the repetition model, not the
# phoneme or prosody pipelines.
# ─────────────────────────────────────────────
N_MFCC_REP       = 40     # Raw MFCC only — no delta stacking
N_FFT_REP        = 400    # ~25 ms at 16kHz (same as main pipeline)
MAX_PHRASE_LEN   = 150    # frames — ~1.5 sec at 10ms hop; covers most phrases
                           # increase to 200 if your clips are longer than 2 sec

# Augmentation parameters
STRETCH_SLOW     = 0.85   # time stretch factor — slower speech
STRETCH_FAST     = 1.15   # time stretch factor — faster/rushed speech
PITCH_SEMITONES  = 2      # max pitch shift in semitones (applied ±randomly)
VOLUME_MIN       = 0.80   # minimum volume scale factor
VOLUME_MAX       = 1.20   # maximum volume scale factor

REP_DATASET_ROOT = "repetition_dataset"
REP_FEATURE_ROOT = "rep_features"

REP_LABEL_MAP = {
    "REPETITIVE":     1,
    "NON_REPETITIVE": 0,
}


# ─────────────────────────────────────────────
# LOAD — with resampling like main pipeline
# ─────────────────────────────────────────────
def load_audio_rep(path: str) -> np.ndarray:
    """Load any audio file → mono float32 at SR Hz."""
    try:
        audio, _ = librosa.load(path, sr=SR, mono=True)
    except Exception as e:
        raise RuntimeError(f"Could not load '{path}': {e}")
    if len(audio) == 0:
        raise ValueError(f"'{path}' is empty after loading.")
    return audio


# ─────────────────────────────────────────────
# AUGMENTATION
# Each function takes clean audio and returns
# a new augmented variant as float32 array.
# ─────────────────────────────────────────────
def augment_time_stretch(audio: np.ndarray, rate: float) -> np.ndarray:
    """
    Time stretch without changing pitch.
    rate < 1.0 = slower,  rate > 1.0 = faster.
    Simulates deliberate slow persuasion vs rushed urgency.
    """
    return librosa.effects.time_stretch(audio, rate=rate).astype(np.float32)


def augment_pitch_shift(audio: np.ndarray) -> np.ndarray:
    """
    Random pitch shift ± PITCH_SEMITONES.
    Simulates different caller voices / phone codec distortions.
    Direction is random so the model learns pitch-invariant patterns.
    """
    n_steps = np.random.uniform(-PITCH_SEMITONES, PITCH_SEMITONES)
    return librosa.effects.pitch_shift(
        audio, sr=SR, n_steps=n_steps
    ).astype(np.float32)


def augment_volume_scale(audio: np.ndarray) -> np.ndarray:
    """
    Random volume scaling between VOLUME_MIN and VOLUME_MAX.
    Simulates varying microphone distances and recording levels.
    Keeps the model from overfitting to a specific loudness level.
    """
    scale = np.random.uniform(VOLUME_MIN, VOLUME_MAX)
    return (audio * scale).astype(np.float32)


def get_all_augmentations(audio: np.ndarray) -> list[tuple[str, np.ndarray]]:
    """
    Return all augmented variants of one clip as (tag, audio) pairs.
    Tag is used in the saved filename so you can trace back each variant.

    Returns 3 augmented variants (original is handled separately):
      - 'slow'    time stretched at STRETCH_SLOW
      - 'fast'    time stretched at STRETCH_FAST
      - 'pitch'   random pitch shift ± PITCH_SEMITONES semitones
      - 'vol'     random volume scaling

    Note: Volume scaling is applied ON TOP OF time stretches to
    further increase variety, not as an isolated augmentation.
    This gives more realistic combinations.
    """
    slow  = augment_time_stretch(audio, STRETCH_SLOW)
    fast  = augment_time_stretch(audio, STRETCH_FAST)
    pitch = augment_pitch_shift(audio)
    vol   = augment_volume_scale(audio)

    return [
        ("orig",  audio),   # original — always included
        ("slow",  slow),
        ("fast",  fast),
        ("pitch", pitch),
        ("vol",   vol),
    ]


# ─────────────────────────────────────────────
# FEATURE EXTRACTION — Raw MFCC (T, 40)
# Simpler than main pipeline — no delta stacking,
# no CMVN. Augmentation handles the variance.
# ─────────────────────────────────────────────
def extract_mfcc_raw(audio: np.ndarray) -> np.ndarray:
    """
    Extract raw MFCC only. Output shape: (T, N_MFCC_REP) = (T, 40)

    Why no delta here (unlike the phoneme model)?
    - Phoneme model needs delta to capture HOW features change over time
      across a 5-sec window with many phonemes.
    - Repetition model works on short phrases — it's matching the
      acoustic fingerprint of the phrase itself, not its temporal dynamics.
      Raw MFCC is sufficient and keeps the CNN simpler.
    """
    mfcc = librosa.feature.mfcc(
        y=audio, sr=SR,
        n_mfcc=N_MFCC_REP,
        n_fft=N_FFT_REP,
        hop_length=HOP_LENGTH
    )
    return mfcc.T.astype(np.float32)    # (T, 40)


# ─────────────────────────────────────────────
# SAVE
# ─────────────────────────────────────────────
def save_rep_feature(mfcc: np.ndarray, folder_name: str,
                     file_stem: str, aug_tag: str) -> str:
    """Save one padded MFCC array and return the path."""
    out_dir = os.path.join(REP_FEATURE_ROOT, folder_name)
    os.makedirs(out_dir, exist_ok=True)
    filename = f"mfcc_{file_stem}_{aug_tag}.npy"
    path = os.path.join(out_dir, filename)
    np.save(path, mfcc)
    return path


# ─────────────────────────────────────────────
# PIPELINE — Single Clip
# ─────────────────────────────────────────────
def process_clip(wav_path: str, folder_name: str,
                 label: int, csv_writer) -> int:
    """
    Process one audio clip through the full repetition pipeline:
      load → VAD → augment × 5 → MFCC → save

    Returns number of feature files saved (0 if clip is skipped).

    VAD is reused from the main pipeline
    to ensure the model trains on the same quality of speech signal
    that it will receive during inference.
    """
    log.info(f"  Processing: {Path(wav_path).name}")
    try:
        audio = load_audio_rep(wav_path)
    except Exception as e:
        log.error(f"    Skipped — {e}")
        return 0

    # Apply VAD — remove silence from phrase clips
    speech = vad_filter(audio)
    if len(speech) < SR * 0.3:     # skip if less than 300ms of speech
        log.warning(f"    Skipped — too little speech after VAD "
                    f"({len(speech)/SR:.2f}s)")
        return 0


    file_stem = Path(wav_path).stem
    saved     = 0

    for aug_tag, aug_audio in get_all_augmentations(speech):
        mfcc    = extract_mfcc_raw(aug_audio)       # (T, 40)
        path    = save_rep_feature(mfcc, folder_name, file_stem, aug_tag)
        csv_writer.writerow([path, label])
        log.info(f"    [{aug_tag}] saved {mfcc.shape} → {path}")
        saved += 1

    return saved


# ─────────────────────────────────────────────
# PIPELINE — Full Dataset
# ─────────────────────────────────────────────
def process_repetition_dataset() -> None:
    """
    Auto-discovers repetition_dataset/REPETITIVE and NON_REPETITIVE,
    processes all clips with augmentation, and writes repetition_labels.csv.

    Each original clip produces 5 saved files (orig + 4 augmentations),
    so if you have 50 clips you will get 250 feature files.
    """
    os.makedirs(REP_FEATURE_ROOT, exist_ok=True)
    labels_path = os.path.join(REP_FEATURE_ROOT, "repetition_labels.csv")

    total_clips   = 0
    total_saved   = 0

    with open(labels_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["filepath", "label"])

        for folder_name, label in REP_LABEL_MAP.items():
            folder_path = os.path.join(REP_DATASET_ROOT, folder_name)

            if not os.path.isdir(folder_path):
                log.warning(f"Folder not found: '{folder_path}' — skipping.")
                continue

            wav_files = sorted(Path(folder_path).glob("*.wav"))
            log.info(f"\n{'='*55}")
            log.info(f"Folder : {folder_name}  (label={label})")
            log.info(f"Clips  : {len(wav_files)} .wav files found")
            log.info(f"Each clip → 5 augmented variants")
            log.info(f"Expected output: {len(wav_files) * 5} feature files")
            log.info(f"{'='*55}")

            if not wav_files:
                log.warning(f"  No .wav files in '{folder_path}'")
                continue

            for wav_path in wav_files:
                saved = process_clip(str(wav_path), folder_name, label, writer)
                total_saved += saved
                total_clips += 1

    log.info(f"\n{'='*55}")
    log.info(f"DONE — {total_clips} clips processed")
    log.info(f"       {total_saved} feature files saved")
    log.info(f"Labels CSV → {labels_path}")
    log.info(f"{'='*55}")


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    process_repetition_dataset()
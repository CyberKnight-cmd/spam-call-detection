from repetition_preprocessing import *
from tensorflow.keras.models import load_model

MAX_LEN = 500
model = load_model(r"models\best_repetition_model.keras")

def pad_features(features: np.ndarray, max_len: int) -> np.ndarray:
    if features.shape[0] < max_len:
        padding = np.zeros((max_len - features.shape[0], features.shape[1]))
        features = np.vstack((features, padding))
    else:
        features = features[:max_len, :]
    return features

def process_clip(wav_path: str) -> None:
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



    for aug_tag, aug_audio in get_all_augmentations(speech):
        mfcc    = extract_mfcc_raw(aug_audio)       # (T, 40)
        mfcc = pad_features(mfcc, MAX_LEN)
        print(model.predict(np.expand_dims(mfcc, axis=0)))
        
process_clip(r"C:\Users\RadhaKrishna\Downloads\test2.mpeg")
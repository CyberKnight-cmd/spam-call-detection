import numpy as np
import librosa
import sounddevice as sd
import joblib

SR = 16000
WINDOW_SEC = 4
THRESHOLD = 0.60

model = joblib.load("urgency.pkl")
scaler = joblib.load("urgency_scaler.pkl")


def extract_features(audio):

    mfcc = librosa.feature.mfcc(y=audio, sr=SR, n_mfcc=13)
    mfcc = np.mean(mfcc.T, axis=0)

    zcr = np.mean(librosa.feature.zero_crossing_rate(audio))

    energy = np.mean(librosa.feature.rms(y=audio))

    spectral_centroid = np.mean(
        librosa.feature.spectral_centroid(y=audio, sr=SR)
    )

    pitch, _ = librosa.piptrack(y=audio, sr=SR)

    pitch = pitch[pitch > 0]

    if len(pitch) > 0:
        pitch_mean = np.mean(pitch)
        pitch_std = np.std(pitch)
    else:
        pitch_mean = 0
        pitch_std = 0

    features = np.hstack([
        mfcc,
        zcr,
        energy,
        spectral_centroid,
        pitch_mean,
        pitch_std
    ])

    return features


def run_realtime():

    window_samples = int(WINDOW_SEC * SR)

    print("\n==============================")
    print("REALTIME URGENCY DETECTOR")
    print("==============================\n")

    try:

        while True:

            print("Listening...", end="\r")

            audio = sd.rec(
                frames=window_samples,
                samplerate=SR,
                channels=1,
                dtype="float32"
            )

            sd.wait()

            audio = audio.flatten()

            features = extract_features(audio)

            features = features.reshape(1, -1)

            features = scaler.transform(features)

            prob = model.predict_proba(features)[0][1]

            if prob > THRESHOLD:
                print(f"Urgent Speech ⚠ | probability: {prob:.3f}")
            else:
                print(f"Normal Speech | probability: {prob:.3f}")

    except KeyboardInterrupt:
        print("\nStopped")


run_realtime()
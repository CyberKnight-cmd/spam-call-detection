import numpy as np
import librosa
import webrtcvad

SR = 16000

vad = webrtcvad.Vad(2)


def load_audio_rep(path):
    audio, sr = librosa.load(path, sr=SR)
    return audio


def extract_mfcc_raw(audio):

    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=SR,
        n_mfcc=40
    )

    return mfcc.T


def vad_filter(audio):

    frame_length = int(0.03 * SR)
    frames = []

    for i in range(0, len(audio), frame_length):

        frame = audio[i:i + frame_length]

        if len(frame) < frame_length:
            continue

        pcm = (frame * 32768).astype(np.int16).tobytes()

        if vad.is_speech(pcm, SR):
            frames.append(frame)

    if len(frames) == 0:
        return np.array([])

    return np.concatenate(frames)
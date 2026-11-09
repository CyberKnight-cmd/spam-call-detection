# Scam Call Detection System

Real-time AI-powered scam call detection system using multi-modal analysis of audio features, speech patterns, and conversation context. The system combines an Android mobile application with a Python backend to provide live scam detection during phone calls.

## Youtube Pitch
[![Watch the video](https://img.youtube.com/vi/TFx9VcgPPic/0.jpg)](https://youtu.be/TFx9VcgPPic)


## Research Paper

**"Real-Time Multimodal Detection of Fraud and Scam Calls Using Conversation Stage Modeling and Ensemble Learning"**
Pritam Paul, Arya Gupta, Srijan Sarkar, Shinjan Saha, Subhalaxmi Chakraborty — Institute of Engineering & Management / University of Engineering and Management, Kolkata.

This repository is the public implementation of the paper. Key points:

- Every call is split into **non-overlapping 4-second windows** (16 kHz, 16-bit PCM), streamed live over a WebSocket.
- **Four models run in parallel** on each window (phoneme CNN, prosody/urgency, script-repetition CNN, conversation-stage detection).
- Outputs are combined with **weighted risk fusion** and smoothed with an **Exponential Moving Average (EMA)** so one noisy window can't trigger a false alarm.
- Conversation-stage modelling (Greeting → Authority → Problem → Urgency → Data Request) carries the largest weight and gives the largest gain.

### Results (per-call, 16 calls: 7 legitimate, 9 scam, threshold 0.40)

| Metric | Value |
|---|---|
| Accuracy | **81.25%** |
| Weighted F1 | 0.8132 |
| Macro F1 | 0.8118 |
| ROC-AUC | **0.8730** |
| Average Precision (PR) | 0.8412 |
| Scam-class precision | 0.8750 |

Confusion matrix: 6/7 legitimate and 7/9 scam calls classified correctly (13/16).

### Ablation study

| Configuration | Accuracy |
|---|---|
| Conversation Stage only | 75.00% |
| + Phoneme CNN | 77.50% |
| + Prosody/Urgency | 79.38% |
| Full framework (+ Script Repetition) | **81.25%** |

## Overview

This project uses a 4-model ensemble approach to detect scam calls in real-time:

1. **Phoneme CNN** - Analyzes speech phonetic patterns
2. **Urgency Detector** - Measures pitch, energy, and speech rate anomalies
3. **Repetition CNN** - Detects repetitive keyword patterns
4. **Sentence Transformer** - Tracks conversation stages via intent classification

## Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│  Android App    │ ◄────────────────────────► │  Python Backend  │
│  (Kotlin)       │    4-sec audio chunks      │  (FastAPI)       │
└─────────────────┘                            └──────────────────┘
        │                                               │
        │                                               ▼
        │                                      ┌────────────────┐
        │                                      │  4 AI Models   │
        │                                      │  - Phoneme CNN │
        │                                      │  - Urgency MLP │
        │                                      │  - Repetition  │
        │                                      │  - Stage Track(Transcribing Audio) │
        │                                      └────────────────┘
        │                                               │
        │                                               ▼
        │                                      ┌────────────────┐
        │                                      │  Risk Score    │
        │ ◄────────────────────────────────────│  (0.0 - 1.0)   │
        │         Risk Assessment              └────────────────┘
        ▼
┌─────────────────┐
│  User Alert     │
│  ✅ SAFE        │
│  🟡 LOW RISK    │
│  🟠 MODERATE    │
│  🔴 HIGH RISK   │
│  🚨 SCAM ALERT  │
└─────────────────┘
```

## Features

- **Real-time Audio Processing** - 4-second sliding window analysis
- **Multi-Model Fusion** - Combines 4 AI models for comprehensive detection
- **WebSocket API** - Live audio streaming from mobile clients
- **Voice Activity Detection** - Filters silence and non-speech segments
- **Conversation Stage Tracking** - Monitors call progression patterns
- **Risk Assessment** - Continuous risk scoring with 5 alert levels

## Project Structure

```
Hackathon-Projects/
├── app/                          # Android application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/example/audio/
│   │       │   ├── MainActivity.kt
│   │       │   ├── Model/        # Data layer
│   │       │   ├── View/         # UI screens
│   │       │   └── ViewModel/    # Business logic
│   │       └── AndroidManifest.xml
│   └── build.gradle.kts
│
├── Backend/                      # Python backend server
│   ├── models/                   # Trained AI models
│   ├── whisper.cpp/              # Speech transcription
│   ├── newServer.py              # FastAPI server
│   ├── config.py                 # Configuration
│   ├── feature_extraction.py    # Audio preprocessing
│   ├── audio_pipeline.py        # Processing pipeline
│   └── pyproject.toml
│
├── dataset/                      # Training data
│   ├── NORMAL_CALLS/
│   └── SCAM_CALLS/
│
├── models/                       # Trained models
│   ├── best_phoneme_model.tflite
│   └── Prosody_model/
│
├── notebooks/                    # Training notebooks
│   ├── phoneme_layer.ipynb
│   └── prosody_layer.ipynb
│
└── training_config.json          # Model training config
```

## Getting Started

### Prerequisites

**Backend:**
- Python 3.12.6+
- Whisper.cpp (for speech transcription)
- TensorFlow/Keras
- FastAPI

**Android:**
- Android Studio
- Kotlin
- Gradle 8.13+
- Min SDK 26 (Android 8.0)
- Target SDK 36

### Backend Setup

1. **Navigate to Backend directory:**
```bash
cd Backend
```

2. **Install dependencies:**
```bash
uv init
uv sync
```

3. **Build Whisper.cpp:**
```bash
cd whisper.cpp
make
```

4. **Download Whisper model:**
```bash
wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin -P models/
```

5. **Place trained models in `models/` directory:**
- `best_phoneme_model.keras`
- `best_repetition_model.keras`
- `ggml-tiny.en.bin`

6. **Start the server:**
```bash
python newServer.py
```

Server starts on `http://localhost:8000`

### Android Setup

1. **Open project in Android Studio:**
```bash
# Open the root directory in Android Studio
```

2. **Sync Gradle dependencies:**
- Android Studio will automatically sync dependencies

3. **Configure backend URL:**
- Update WebSocket URL in the app to point to your backend server

4. **Build and run:**
```bash
./gradlew assembleDebug
# Or use Android Studio's Run button
```

## API Documentation

### Health Check
```
GET /health
```
Returns server status.

### WebSocket Audio Stream
```
WS /ws/audio
```

**Input:** 4-second int16 PCM audio chunks (128KB at 16kHz)

**Output:** Risk assessment string
- `✅ SAFE` - Risk < 0.15
- `🟡 LOW RISK` - Risk 0.15-0.35
- `🟠 MODERATE` - Risk 0.35-0.55
- `🔴 HIGH RISK` - Risk 0.55-0.80
- `🚨 SCAM ALERT` - Risk > 0.80

## Configuration

### Backend Configuration (`Backend/config.py`)

```python
SR = 16000              # Audio sample rate
WINDOW_SEC = 4          # Analysis window size
VAD_MODE = 2            # Voice activity detection sensitivity
MIN_SPEECH_S = 1.0      # Minimum speech duration

# Model fusion weights
W_STAGE = 0.60          # Stage tracking weight
W_REP = 0.20            # Repetition detection weight
W_PHONEME = 0.10        # Phoneme analysis weight
W_URGENCY = 0.10        # Urgency detection weight

# Risk calculation
ALPHA = 0.7             # Running risk smoothing
BETA = 0.3              # New risk weight
THRESHOLD = 0.45        # Live-server scam threshold (paper evaluation used 0.40, chosen via Youden J)
```

### Training Configuration (`training_config.json`)

```json
{
  "sequence_length": 301,
  "feature_dim": 39,
  "n_mfcc": 13,
  "sample_rate": 16000,
  "chunk_duration": 3.0,
  "scam_threshold": 0.75
}
```

## How It Works

### 1. Audio Capture
The Android app captures audio during phone calls and sends 4-second chunks to the backend via WebSocket.

### 2. Voice Activity Detection
The backend filters out silence and non-speech segments using WebRTC VAD.

### 3. Feature Extraction
- **MFCC Features** - Mel-frequency cepstral coefficients for phoneme analysis
- **Prosody Features** - Pitch, energy, speech rate for urgency detection
- **Repetition Features** - Keyword pattern detection
- **Transcription** - Speech-to-text using Whisper

### 4. Model Inference
All 4 models run in parallel:
- Phoneme CNN analyzes MFCCs of the dominant speaker (padded/trimmed to 370 frames)
- Urgency detector scores 0–3 by comparing pitch mean, pitch variation, RMS energy, spectral centroid and speech rate against thresholds
- Repetition CNN splits each window into four 1-second segments (470 frames each) and takes the max scam probability
- Sentence transformer tracks conversation stages

### 5. Risk Fusion
Weighted combination of all model outputs:
```
risk = 0.60 × stage_risk + 0.20 × repetition + 0.10 × phoneme + 0.10 × urgency
```

Then the running risk is smoothed across windows with EMA:
```
running_risk_t = 0.7 × running_risk_(t-1) + 0.3 × raw_risk_t
```

### 6. Alert Generation
Risk score is mapped to one of 5 alert levels and sent back to the Android app.

## Conversation Stage Detection

The system tracks 5 conversation stages common in scam calls:

0. **NONE** - No stage detected yet (Risk: 0.05)
1. **GREETING** - Initial contact (Risk: 0.10)
2. **AUTHORITY** - Claims to be from bank/official (Risk: 0.25)
3. **PROBLEM** - Describes a fictitious problem (Risk: 0.50)
4. **URGENCY** - Demands immediate action (Risk: 0.70)
5. **DATA_REQUEST** - Asks for OTP/password/bank details (Risk: 0.95)

How it works: Whisper.cpp transcribes each window, `all-MiniLM-L6-v2` embeds the transcript, and it is compared with English **and Hindi** example phrases for each intent. A match needs cosine similarity ≥ **0.55**. Stages only move **forward** (scam scripts follow a fixed order).

## Model Training

Training notebooks are available in the `notebooks/` directory:

- `phoneme_layer.ipynb` - Train phoneme CNN model
- `prosody_layer.ipynb` - Train urgency detection model

Dataset structure:
```
dataset/
├── NORMAL_CALLS/    # Legitimate call recordings
└── SCAM_CALLS/      # Scam call recordings
```

## Technologies Used

### Backend
- **FastAPI** - Web framework
- **TensorFlow/Keras** - Deep learning models
- **Librosa** - Audio processing
- **Sentence Transformers** - Text embeddings
- **WebRTC VAD** - Voice activity detection
- **Whisper.cpp** - Speech-to-text
- **Uvicorn** - ASGI server

### Android
- **Kotlin** - Programming language
- **Jetpack Compose** - UI framework
- **Room** - Local database
- **Retrofit** - HTTP client
- **Coroutines** - Async programming
- **TensorFlow Lite** - On-device inference
- **Zego UIKit** - Call functionality

## Performance

- **Latency** - ~500ms per 4-second window
- **Accuracy** - 81.25% per-call accuracy, ROC-AUC 0.873 (see Research Paper section)
- **Real-time** - Processes audio as it streams
- **Scalability** - Thread pool for concurrent connections

## Security & Privacy

- Audio is processed in real-time and not stored
- Encrypted communication via WebSocket
- Local processing option with TensorFlow Lite
- No personal data collection

## Limitations

- Requires stable internet connection for backend processing
- Works best with clear audio (minimal background noise)
- Evaluated on a small set (16 calls); larger, more diverse datasets are needed
- Whisper can make transcription errors on noisy telephone audio, which affects stage detection
- Urgency thresholds are hand-set and may not generalise across all speakers
- Intent examples cover English and Hindi; other regional languages are future work
- Requires 16kHz audio sample rate

## Future Enhancements

- [ ] Multi-language support (Hindi, regional languages)
- [ ] On-device processing with TFLite models
- [ ] Historical call analysis dashboard
- [ ] Community-driven scam pattern database
- [ ] Integration with telecom providers
- [ ] Automatic call blocking

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Team

- [Arya Gupta](https://github.com/CyberKnight-cmd) - All rounder (System Design + Contribution in all other aspects)
- [Srijan Sarkar](https://github.com/Nameless-Seeker) - Android App Development
- [Shinjan Saha](https://github.com/Code-r4Life/) - AI/ML Development
- [Pritam Paul](https://github.com/Pritam27112004) - AI/ML Developement

## Acknowledgments

- Whisper.cpp for speech transcription
- Sentence Transformers for text embeddings
- TensorFlow team for deep learning framework
- Research paper: "Spam Detection in Voicemails" (ASA Meeting 2021) 

## Contact

For questions or support, please open an issue in the repository.

---

**Note:** This is a research project built in DoubleSlash Hackathon, Jadavpur. Always verify suspicious calls through official channels.

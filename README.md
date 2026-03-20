# gain

Automated setup for [RVC (Retrieval-based Voice Conversion)](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI) — AI voice conversion tool.

## Requirements

- Python 3.8+
- Git
- ~5 GB disk space (for models and dependencies)
- NVIDIA GPU recommended (runs on CPU/AMD/Mac but slower)

## Quick Start

```bash
# 1. Run the setup script (installs everything automatically)
./setup_rvc.sh

# 2. Launch the WebUI
./start_rvc.sh
```

The setup script automatically detects your OS and GPU, then installs:
- ffmpeg
- PyTorch (with appropriate GPU support)
- RVC and all dependencies
- Pre-trained base models

## Downloading Voice Models

Get voice models from [Hugging Face Music-AI-Voices](https://huggingface.co/models?search=rvc) and download `.pth` files.

```bash
# Download a model directly from a URL
./download_voice_model.sh https://huggingface.co/someone/model/resolve/main/voice.pth

# Or copy a local .pth file
./download_voice_model.sh /path/to/voice.pth
```

## Using RVC

1. Launch with `./start_rvc.sh`
2. Open the WebUI in your browser (usually `http://localhost:7865`)
3. Go to the **Model Inference** tab
4. Select your voice model from the dropdown
5. Upload a clean vocal file (use [vocalremover.org](https://vocalremover.org) to isolate vocals)
6. Set pitch shift (0 = same gender, +12 = up one octave, -12 = down one octave)
7. Select **RMVPE** as the pitch extraction method
8. Click **Convert**

## File Structure

```
gain/
├── setup_rvc.sh              # One-click setup script
├── start_rvc.sh              # Launcher (created by setup)
├── download_voice_model.sh   # Helper to download voice models
└── Retrieval-based-Voice-Conversion-WebUI/  # RVC (created by setup)
    └── weights/              # Place .pth voice models here
```

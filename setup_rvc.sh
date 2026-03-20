#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# RVC (Retrieval-based Voice Conversion) Automated Setup Script
# Supports: Linux, macOS, Windows (Git Bash/WSL)
# Tested with Python 3.8 - 3.12
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RVC_DIR="${SCRIPT_DIR}/Retrieval-based-Voice-Conversion-WebUI"

# ---- Detect OS ----
detect_os() {
    case "$(uname -s)" in
        Linux*)  OS="linux" ;;
        Darwin*) OS="mac" ;;
        MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
        *) error "Unsupported OS: $(uname -s)" ;;
    esac
    info "Detected OS: ${OS}"
}

# ---- Detect GPU ----
detect_gpu() {
    GPU="none"
    if command -v nvidia-smi &>/dev/null; then
        GPU="nvidia"
        CUDA_VER=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader 2>/dev/null | head -1 || echo "unknown")
        info "NVIDIA GPU detected (driver: ${CUDA_VER})"
    elif [[ "$OS" == "linux" ]] && lspci 2>/dev/null | grep -qi "amd.*radeon\|amd.*gpu"; then
        GPU="amd"
        info "AMD GPU detected"
    elif [[ "$OS" == "mac" ]]; then
        GPU="mps"
        info "Apple Silicon / MPS will be used"
    else
        warn "No GPU detected - RVC will run on CPU (slower inference)"
    fi
}

# ---- Check Python ----
check_python() {
    # Prefer Python 3.10 or 3.11 for best RVC compatibility
    # Python 3.13+ has issues with many ML packages
    if command -v python3.11 &>/dev/null; then
        PYTHON=python3.11
    elif command -v python3.10 &>/dev/null; then
        PYTHON=python3.10
    elif command -v python3.12 &>/dev/null; then
        PYTHON=python3.12
    elif command -v python3 &>/dev/null; then
        PYTHON=python3
    elif command -v python &>/dev/null; then
        PYTHON=python
    else
        error "Python 3.8+ is required. Install from https://python.org"
    fi

    PY_VER=$($PYTHON --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
    PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
    PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)

    if [[ "$PY_MAJOR" -lt 3 ]] || [[ "$PY_MAJOR" -eq 3 && "$PY_MINOR" -lt 8 ]]; then
        error "Python 3.8+ required, found $PY_VER"
    fi

    if [[ "$PY_MINOR" -ge 13 ]]; then
        warn "Python ${PY_VER} detected. RVC works best with Python 3.10-3.11."
        warn "If you hit errors, install Python 3.11: brew install python@3.11"
    fi

    info "Python ${PY_VER} found ($PYTHON)"
}

# ---- Install ffmpeg ----
install_ffmpeg() {
    if command -v ffmpeg &>/dev/null; then
        info "ffmpeg already installed: $(ffmpeg -version 2>&1 | head -1)"
        return
    fi

    info "Installing ffmpeg..."
    local installed=false

    case "$OS" in
        mac)
            if command -v brew &>/dev/null; then
                brew install ffmpeg && installed=true
            fi
            ;;
        linux)
            if command -v apt &>/dev/null; then
                sudo apt update && sudo apt install -y ffmpeg && installed=true
            elif command -v dnf &>/dev/null; then
                sudo dnf install -y ffmpeg && installed=true
            elif command -v pacman &>/dev/null; then
                sudo pacman -S --noconfirm ffmpeg && installed=true
            fi
            ;;
        windows)
            warn "On Windows, download ffmpeg from https://ffmpeg.org/download.html"
            warn "Place ffmpeg.exe and ffprobe.exe in the RVC project root folder."
            warn "Press Enter to continue after installing ffmpeg, or Ctrl+C to abort."
            read -r
            return
            ;;
    esac

    # Fallback: install ffmpeg via pip (imageio-ffmpeg includes a static binary)
    if [[ "$installed" == "false" ]] || ! command -v ffmpeg &>/dev/null; then
        warn "System ffmpeg install failed. Installing via pip fallback..."
        $PYTHON -m pip install imageio-ffmpeg
        FFMPEG_BIN=$($PYTHON -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
        if [[ -n "$FFMPEG_BIN" && -f "$FFMPEG_BIN" ]]; then
            sudo ln -sf "$FFMPEG_BIN" /usr/local/bin/ffmpeg 2>/dev/null || \
                ln -sf "$FFMPEG_BIN" "${HOME}/.local/bin/ffmpeg" 2>/dev/null || \
                warn "Could not symlink ffmpeg. Add this to your PATH: $(dirname "$FFMPEG_BIN")"
        fi
    fi

    if command -v ffmpeg &>/dev/null; then
        info "ffmpeg ready: $(ffmpeg -version 2>&1 | head -1)"
    else
        warn "ffmpeg not found in PATH. RVC may have issues with audio processing."
    fi
}

# ---- Clone RVC repo ----
clone_rvc() {
    if [[ -d "$RVC_DIR" ]]; then
        info "RVC directory already exists, pulling latest..."
        cd "$RVC_DIR"
        git pull || warn "git pull failed, continuing with existing code"
        cd "$SCRIPT_DIR"
    else
        info "Cloning RVC repository..."
        git clone https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git "$RVC_DIR"
    fi
}

# ---- Install PyTorch ----
install_pytorch() {
    info "Installing PyTorch..."
    cd "$RVC_DIR"

    case "$GPU" in
        nvidia)
            # CUDA 11.8 is widely compatible with RTX 20/30/40 series
            $PYTHON -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
            ;;
        amd)
            if [[ "$OS" == "linux" ]]; then
                $PYTHON -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.6
            else
                # Windows AMD uses DirectML
                $PYTHON -m pip install torch torchvision torchaudio
                $PYTHON -m pip install torch-directml
            fi
            ;;
        mps)
            # macOS - standard pip install gets MPS support
            $PYTHON -m pip install torch torchvision torchaudio
            ;;
        none)
            # CPU only - try dedicated CPU index first, fall back to default
            $PYTHON -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu || \
                $PYTHON -m pip install torch torchvision torchaudio
            ;;
    esac
}

# ---- Install dependencies ----
install_deps() {
    info "Installing RVC dependencies..."
    cd "$RVC_DIR"

    # Determine which requirements file to use
    local REQ_FILE="requirements.txt"
    case "$GPU" in
        amd)
            if [[ "$OS" == "linux" ]]; then
                REQ_FILE="requirements-amd.txt"
            else
                REQ_FILE="requirements-dml.txt"
            fi
            ;;
    esac

    # Python 3.11+ has compatibility issues with pinned versions in requirements.txt
    # Relax version pins for numba, numpy, llvmlite, librosa, faiss-cpu, gradio, fastapi, ffmpy
    if [[ "$PY_MINOR" -ge 11 ]]; then
        info "Python 3.11+ detected - adjusting version pins for compatibility..."
        sed \
            -e 's/numba==0.56.4/numba/' \
            -e 's/numpy==1.23.5/numpy/' \
            -e 's/llvmlite==0.39.0/llvmlite/' \
            -e 's/librosa==0.9.1/librosa/' \
            -e 's/faiss-cpu==1.7.3/faiss-cpu/' \
            -e 's/gradio==3.34.0/gradio/' \
            -e 's/fastapi==0.88/fastapi/' \
            -e 's/ffmpy==0.3.1/ffmpy/' \
            "$REQ_FILE" | grep -v 'fairseq' > "${REQ_FILE}.patched"

        $PYTHON -m pip install -r "${REQ_FILE}.patched"

        # Install fairseq separately (patched fork for Python 3.11+ compatibility)
        info "Installing fairseq (Python 3.11+ compatible fork)..."
        $PYTHON -m pip install --no-deps 'fairseq @ git+https://github.com/One-sixth/fairseq.git'
        $PYTHON -m pip install bitarray cffi regex sacrebleu
        $PYTHON -m pip install --no-deps hydra-core omegaconf

        rm -f "${REQ_FILE}.patched"
    else
        $PYTHON -m pip install -r "$REQ_FILE"
    fi
}

# ---- Download pre-trained models ----
download_models() {
    info "Downloading pre-trained models (this may take a while)..."
    cd "$RVC_DIR"

    if $PYTHON tools/download_models.py; then
        info "Models downloaded successfully."
    else
        warn "Model download failed. You can retry later by running:"
        warn "  cd ${RVC_DIR} && python3 tools/download_models.py"
    fi
}

# ---- Verify launcher exists ----
check_launcher() {
    if [[ -x "${SCRIPT_DIR}/start_rvc.sh" ]]; then
        info "start_rvc.sh launcher found."
    else
        warn "start_rvc.sh not found. You can launch RVC manually with:"
        warn "  cd ${RVC_DIR} && python3 infer-web.py"
    fi
}

# ---- Verify installation ----
verify_install() {
    info "Verifying installation..."
    cd "$RVC_DIR"

    $PYTHON -c "
import torch; print(f'  PyTorch {torch.__version__} - OK')
import numpy; print(f'  NumPy {numpy.__version__} - OK')
import librosa; print(f'  Librosa {librosa.__version__} - OK')
import scipy; print(f'  SciPy {scipy.__version__} - OK')
import soundfile; print(f'  SoundFile {soundfile.__version__} - OK')
import fairseq; print(f'  Fairseq {fairseq.__version__} - OK')
import gradio; print(f'  Gradio {gradio.__version__} - OK')
import torchcrepe; print('  torchcrepe - OK')
print()
print(f'  CUDA available: {torch.cuda.is_available()}')
print(f'  Device: {\"cuda\" if torch.cuda.is_available() else \"cpu\"}')
" 2>&1 | grep -v "^DEBUG:" || warn "Some packages failed to import. Check errors above."
}

# ---- Main ----
main() {
    echo "==========================================="
    echo "  RVC Automated Setup"
    echo "==========================================="
    echo ""

    detect_os
    detect_gpu
    check_python
    install_ffmpeg
    clone_rvc
    install_pytorch
    install_deps
    download_models
    check_launcher
    verify_install

    echo ""
    echo "==========================================="
    info "Setup complete!"
    echo "==========================================="
    echo ""
    echo "To launch RVC:"
    echo "  ./start_rvc.sh"
    echo ""
    echo "Quick start guide:"
    echo "  1. Download a .pth voice model from HuggingFace"
    echo "  2. Place it in: ${RVC_DIR}/weights/"
    echo "  3. Launch RVC and go to 'Model Inference' tab"
    echo "  4. Select your model, upload vocals, and convert!"
    echo ""
    if [[ "$GPU" == "none" ]]; then
        warn "No GPU detected. Inference will be slow on CPU."
        warn "For best results, run on a machine with an NVIDIA GPU."
    fi
}

main "$@"

#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# RVC (Retrieval-based Voice Conversion) Automated Setup Script
# Supports: Linux, macOS, Windows (Git Bash/WSL)
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
    if command -v python3 &>/dev/null; then
        PYTHON=python3
    elif command -v python &>/dev/null; then
        PYTHON=python
    else
        error "Python 3.8+ is required. Install from https://python.org"
    fi

    PY_VER=$($PYTHON --version 2>&1 | grep -oP '\d+\.\d+')
    PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
    PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)

    if [[ "$PY_MAJOR" -lt 3 ]] || [[ "$PY_MAJOR" -eq 3 && "$PY_MINOR" -lt 8 ]]; then
        error "Python 3.8+ required, found $PY_VER"
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
    case "$OS" in
        mac)
            if command -v brew &>/dev/null; then
                brew install ffmpeg
            else
                error "Homebrew not found. Install it first: https://brew.sh"
            fi
            ;;
        linux)
            if command -v apt &>/dev/null; then
                sudo apt update && sudo apt install -y ffmpeg
            elif command -v dnf &>/dev/null; then
                sudo dnf install -y ffmpeg
            elif command -v pacman &>/dev/null; then
                sudo pacman -S --noconfirm ffmpeg
            else
                error "Could not detect package manager. Install ffmpeg manually."
            fi
            ;;
        windows)
            warn "On Windows, download ffmpeg from https://ffmpeg.org/download.html"
            warn "Place ffmpeg.exe and ffprobe.exe in the RVC project root folder."
            warn "Press Enter to continue after installing ffmpeg, or Ctrl+C to abort."
            read -r
            ;;
    esac
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
            # CPU only
            $PYTHON -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
            ;;
    esac
}

# ---- Install dependencies ----
install_deps() {
    info "Installing RVC dependencies..."
    cd "$RVC_DIR"

    case "$GPU" in
        nvidia)
            $PYTHON -m pip install -r requirements.txt
            ;;
        amd)
            if [[ "$OS" == "linux" ]]; then
                $PYTHON -m pip install -r requirements-amd.txt
            else
                $PYTHON -m pip install -r requirements-dml.txt
            fi
            ;;
        *)
            # CPU / Mac - use standard requirements
            if [[ "$OS" == "mac" ]]; then
                $PYTHON -m pip install -r requirements.txt
            else
                $PYTHON -m pip install -r requirements.txt
            fi
            ;;
    esac
}

# ---- Download pre-trained models ----
download_models() {
    info "Downloading pre-trained models (this may take a while)..."
    cd "$RVC_DIR"
    $PYTHON tools/download_models.py
    info "Models downloaded successfully."
}

# ---- Create convenience launcher ----
create_launcher() {
    cat > "${SCRIPT_DIR}/start_rvc.sh" << 'LAUNCHER'
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/Retrieval-based-Voice-Conversion-WebUI"
python3 infer-web.py
LAUNCHER
    chmod +x "${SCRIPT_DIR}/start_rvc.sh"
    info "Created start_rvc.sh launcher script."
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
    create_launcher

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

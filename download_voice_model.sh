#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Download a voice model (.pth) from Hugging Face into RVC weights folder
# Usage: ./download_voice_model.sh <huggingface_url_to_pth_file>
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEIGHTS_DIR="${SCRIPT_DIR}/Retrieval-based-Voice-Conversion-WebUI/weights"

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <huggingface_url_or_direct_link_to_pth_file>"
    echo ""
    echo "Examples:"
    echo "  $0 https://huggingface.co/someone/model/resolve/main/voice.pth"
    echo "  $0 /path/to/local/voice.pth"
    exit 1
fi

INPUT="$1"

# Ensure weights directory exists
mkdir -p "$WEIGHTS_DIR"

if [[ -f "$INPUT" ]]; then
    # Local file - copy it
    FILENAME=$(basename "$INPUT")
    cp "$INPUT" "${WEIGHTS_DIR}/${FILENAME}"
    info "Copied ${FILENAME} to weights folder."
else
    # URL - download it
    # Convert HF blob URLs to resolve URLs for direct download
    URL=$(echo "$INPUT" | sed 's|/blob/|/resolve/|')
    FILENAME=$(basename "$URL" | sed 's/?.*//')

    if [[ ! "$FILENAME" == *.pth ]]; then
        error "URL does not point to a .pth file: ${FILENAME}"
    fi

    info "Downloading ${FILENAME}..."
    if command -v wget &>/dev/null; then
        wget -O "${WEIGHTS_DIR}/${FILENAME}" "$URL"
    elif command -v curl &>/dev/null; then
        curl -L -o "${WEIGHTS_DIR}/${FILENAME}" "$URL"
    else
        error "Neither wget nor curl found. Install one and try again."
    fi
    info "Downloaded ${FILENAME} to ${WEIGHTS_DIR}/"
fi

echo ""
info "Model ready! Launch RVC and select '${FILENAME}' from the Model Inference tab."

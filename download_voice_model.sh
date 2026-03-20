#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Download a voice model (.pth or .zip) from Hugging Face into RVC weights folder
# Usage: ./download_voice_model.sh <url_or_local_file>
# Supports: .pth files directly, .zip files (auto-extracts .pth)
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEIGHTS_DIR="${SCRIPT_DIR}/Retrieval-based-Voice-Conversion-WebUI/weights"

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <huggingface_url_or_local_file>"
    echo ""
    echo "Supports .pth and .zip files. Zips are auto-extracted."
    echo ""
    echo "Examples:"
    echo "  $0 https://huggingface.co/someone/model/resolve/main/voice.pth"
    echo "  $0 https://huggingface.co/QuickWick/Music-AI-Voices/resolve/main/Frank%20Ocean%20(RVC)%20500%20Epoch/Frank%20Ocean%20(RVC)%20500%20Epoch.zip"
    echo "  $0 /path/to/local/voice.pth"
    echo "  $0 /path/to/local/model.zip"
    exit 1
fi

INPUT="$1"
mkdir -p "$WEIGHTS_DIR"

# Download or copy the file to a temp location
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

if [[ -f "$INPUT" ]]; then
    FILENAME=$(basename "$INPUT")
    cp "$INPUT" "${TMPDIR}/${FILENAME}"
    info "Using local file: ${FILENAME}"
else
    # Convert HF blob URLs to resolve URLs for direct download
    URL=$(echo "$INPUT" | sed 's|/blob/|/resolve/|')
    FILENAME=$(basename "$URL" | sed 's/?.*//')
    # URL-decode the filename
    FILENAME=$(python3 -c "import urllib.parse; print(urllib.parse.unquote('$FILENAME'))" 2>/dev/null || echo "$FILENAME")

    info "Downloading ${FILENAME}..."
    if command -v wget &>/dev/null; then
        wget -q --show-progress -O "${TMPDIR}/${FILENAME}" "$URL"
    elif command -v curl &>/dev/null; then
        curl -L --progress-bar -o "${TMPDIR}/${FILENAME}" "$URL"
    else
        error "Neither wget nor curl found. Install one and try again."
    fi
    info "Download complete."
fi

# Handle the file based on extension
FILE="${TMPDIR}/${FILENAME}"

if [[ "$FILENAME" == *.zip ]]; then
    info "Extracting zip file..."
    unzip -o "$FILE" -d "${TMPDIR}/extracted" || error "Failed to extract zip"

    # Find all .pth files in the extracted contents
    PTH_FILES=$(find "${TMPDIR}/extracted" -name "*.pth" -type f)
    INDEX_FILES=$(find "${TMPDIR}/extracted" -name "*.index" -type f)

    if [[ -z "$PTH_FILES" ]]; then
        warn "No .pth files found in zip. Contents:"
        ls -la "${TMPDIR}/extracted/"
        error "Could not find a .pth model file in the archive."
    fi

    # Copy all .pth files to weights
    while IFS= read -r pth; do
        PTH_NAME=$(basename "$pth")
        cp "$pth" "${WEIGHTS_DIR}/${PTH_NAME}"
        info "Extracted model: ${PTH_NAME}"
    done <<< "$PTH_FILES"

    # Copy any .index files too (used for better voice quality)
    if [[ -n "$INDEX_FILES" ]]; then
        while IFS= read -r idx; do
            IDX_NAME=$(basename "$idx")
            cp "$idx" "${WEIGHTS_DIR}/${IDX_NAME}"
            info "Extracted index: ${IDX_NAME}"
        done <<< "$INDEX_FILES"
    fi

elif [[ "$FILENAME" == *.pth ]]; then
    cp "$FILE" "${WEIGHTS_DIR}/${FILENAME}"
    info "Installed model: ${FILENAME}"

else
    warn "Unrecognized file type: ${FILENAME}"
    warn "Copying to weights folder as-is."
    cp "$FILE" "${WEIGHTS_DIR}/${FILENAME}"
fi

echo ""
info "Done! Model(s) installed to: ${WEIGHTS_DIR}/"
echo ""
echo "Files in weights folder:"
ls -lh "${WEIGHTS_DIR}/"*.pth 2>/dev/null || echo "  (no .pth files found)"
echo ""
info "Launch RVC with ./start_rvc.sh and select your model from the Model Inference tab."

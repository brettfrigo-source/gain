#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# RVC Launcher - starts the RVC WebUI
# If setup hasn't been run yet, runs it first.
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RVC_DIR="${SCRIPT_DIR}/Retrieval-based-Voice-Conversion-WebUI"

# Check if RVC is set up
if [[ ! -d "$RVC_DIR" ]]; then
    error "RVC directory not found. Run ./setup_rvc.sh first."
fi

# Try to find a working Python
if command -v python3.11 &>/dev/null; then
    PYTHON=python3.11
elif command -v python3.10 &>/dev/null; then
    PYTHON=python3.10
elif command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    error "Python not found. Install Python 3.10 or 3.11."
fi

info "Using $($PYTHON --version 2>&1)"

# Check if dependencies are installed
if ! $PYTHON -c "import torch" 2>/dev/null; then
    warn "PyTorch not installed. Running setup first..."
    bash "${SCRIPT_DIR}/setup_rvc.sh"
fi

cd "$RVC_DIR"
info "Starting RVC WebUI..."
info "Once running, open http://localhost:7865 in your browser"
echo ""

$PYTHON infer-web.py

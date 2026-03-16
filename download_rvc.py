#!/usr/bin/env python3
"""Download and set up RVC (Retrieval-based Voice Conversion) WebUI."""

import os
import subprocess
import sys
import urllib.request
import shutil

RVC_REPO = "https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git"
RVC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rvc")

HF_BASE = "https://huggingface.co/lj1995/VoiceConversionWebUI/resolve/main"

MODEL_FILES = {
    "hubert/hubert_base.pt": "assets/hubert/hubert_base.pt",
    "rmvpe.pt": "assets/rmvpe/rmvpe.pt",
    "pretrained/D32k.pth": "assets/pretrained/D32k.pth",
    "pretrained/D40k.pth": "assets/pretrained/D40k.pth",
    "pretrained/D48k.pth": "assets/pretrained/D48k.pth",
    "pretrained/G32k.pth": "assets/pretrained/G32k.pth",
    "pretrained/G40k.pth": "assets/pretrained/G40k.pth",
    "pretrained/G48k.pth": "assets/pretrained/G48k.pth",
    "pretrained/f0D32k.pth": "assets/pretrained/f0D32k.pth",
    "pretrained/f0D40k.pth": "assets/pretrained/f0D40k.pth",
    "pretrained/f0D48k.pth": "assets/pretrained/f0D48k.pth",
    "pretrained/f0G32k.pth": "assets/pretrained/f0G32k.pth",
    "pretrained/f0G40k.pth": "assets/pretrained/f0G40k.pth",
    "pretrained/f0G48k.pth": "assets/pretrained/f0G48k.pth",
    "pretrained_v2/D32k.pth": "assets/pretrained_v2/D32k.pth",
    "pretrained_v2/D40k.pth": "assets/pretrained_v2/D40k.pth",
    "pretrained_v2/D48k.pth": "assets/pretrained_v2/D48k.pth",
    "pretrained_v2/G32k.pth": "assets/pretrained_v2/G32k.pth",
    "pretrained_v2/G40k.pth": "assets/pretrained_v2/G40k.pth",
    "pretrained_v2/G48k.pth": "assets/pretrained_v2/G48k.pth",
    "pretrained_v2/f0D32k.pth": "assets/pretrained_v2/f0D32k.pth",
    "pretrained_v2/f0D40k.pth": "assets/pretrained_v2/f0D40k.pth",
    "pretrained_v2/f0D48k.pth": "assets/pretrained_v2/f0D48k.pth",
    "pretrained_v2/f0G32k.pth": "assets/pretrained_v2/f0G32k.pth",
    "pretrained_v2/f0G40k.pth": "assets/pretrained_v2/f0G40k.pth",
    "pretrained_v2/f0G48k.pth": "assets/pretrained_v2/f0G48k.pth",
    "uvr5_weights/HP2-人声vocals+非人声instrumentals.pth": "assets/uvr5_weights/HP2-人声vocals+非人声instrumentals.pth",
    "uvr5_weights/HP5-主旋律人声vocals+其他able.pth": "assets/uvr5_weights/HP5-主旋律人声vocals+其他able.pth",
}


def check_prerequisites():
    """Check that git and python are available."""
    for cmd in ["git", "pip"]:
        if shutil.which(cmd) is None:
            print(f"Error: '{cmd}' is not installed or not in PATH.")
            sys.exit(1)


def clone_repo():
    """Clone the RVC WebUI repository."""
    if os.path.isdir(RVC_DIR):
        print(f"RVC directory already exists at {RVC_DIR}, skipping clone.")
        return
    print(f"Cloning RVC WebUI repository into {RVC_DIR}...")
    subprocess.run(["git", "clone", "--depth", "1", RVC_REPO, RVC_DIR], check=True)
    print("Clone complete.")


def install_dependencies():
    """Install Python dependencies from the RVC requirements file."""
    req_file = os.path.join(RVC_DIR, "requirements.txt")
    if not os.path.isfile(req_file):
        print("Warning: requirements.txt not found, skipping dependency install.")
        return
    print("Installing Python dependencies...")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", req_file],
        check=True,
    )
    print("Dependencies installed.")


def download_file(url, dest):
    """Download a single file from a URL."""
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.isfile(dest):
        print(f"  Already exists: {dest}")
        return
    print(f"  Downloading: {os.path.basename(dest)}...")
    try:
        urllib.request.urlretrieve(url, dest)
    except Exception as e:
        print(f"  Failed to download {url}: {e}")


def download_models():
    """Download pre-trained models from Hugging Face."""
    print("Downloading pre-trained models...")
    for hf_path, local_path in MODEL_FILES.items():
        url = f"{HF_BASE}/{hf_path}"
        dest = os.path.join(RVC_DIR, local_path)
        download_file(url, dest)
    print("Model downloads complete.")


def run_rvc_download_script():
    """Run RVC's built-in download_models.py if available."""
    script = os.path.join(RVC_DIR, "tools", "download_models.py")
    if not os.path.isfile(script):
        print("RVC's download_models.py not found, skipping.")
        return
    print("Running RVC's built-in model downloader...")
    subprocess.run([sys.executable, script], cwd=RVC_DIR)
    print("Built-in downloader finished.")


def main():
    print("=== RVC (Retrieval-based Voice Conversion) Setup ===\n")
    check_prerequisites()
    clone_repo()
    install_dependencies()
    download_models()
    run_rvc_download_script()
    print("\n=== Setup complete! ===")
    print(f"RVC is installed at: {RVC_DIR}")
    print("To launch the WebUI, run:")
    print(f"  cd {RVC_DIR} && python infer-web.py")


if __name__ == "__main__":
    main()

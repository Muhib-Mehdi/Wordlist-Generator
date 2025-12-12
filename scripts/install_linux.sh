#!/bin/bash

echo "[INFO] Installing Wordlist Generator for Linux..."

# Python Deps
echo "[INFO] Installing Python Dependencies..."
pip install flet --break-system-packages 2>/dev/null || pip install flet

# Create .desktop entry
REPO_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
DESKTOP_FILE="$HOME/.local/share/applications/wordlist-gen.desktop"

mkdir -p "$HOME/.local/share/applications"

cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Type=Application
Name=Wordlist Generator
Comment=Optimized Wordlist Generator
Exec=python3 "$REPO_DIR/src/gui/main.py"
Path=$REPO_DIR
Terminal=false
Categories=Utility;Security;
EOF

chmod +x "$DESKTOP_FILE"

echo "[SUCCESS] Installed! You can now search for 'Wordlist Generator' in your app launcher."
echo "[INFO] To run CLI mode: python3 src/gui/main.py --cli [args]"

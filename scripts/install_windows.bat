@echo off
echo [INFO] Installing Wordlist Generator...

REM Install Python Deps
echo [INFO] Installing Python Dependencies...
pip install flet
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install flet. Ensure pip is in PATH.
)

REM Create Shortcut (PowerShell)
echo [INFO] Installing Python Dependencies...
pip install flet
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install flet. Ensure pip is in PATH.
)

REM Create Shortcut (PowerShell)
echo [INFO] Creating Start Menu Shortcut...
set "TARGET=%~dp0..\src\gui\main.py"
set "ICON=%~dp0icon.ico"
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Wordlist Generator.lnk"
set "PWS=powershell.exe -ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile"

%PWS% -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = 'pythonw.exe'; $s.Arguments = '\"%TARGET%\"'; $s.WorkingDirectory = '%~dp0..'; $s.Save()"

echo [SUCCESS] Installation Complete! You can search for "Wordlist Generator" in Start.
pause

# Ultra-Fast Wordlist Generator

![Banner](https://img.shields.io/badge/Status-Stable-success?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge) ![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-lightgrey?style=for-the-badge)

A high-performance, zero-dependency password profiling and wordlist generation suite. Built for professionals who need precision, speed, and flexibility without the bloat of compiled binaries.

---

## 🚀 Features

### 🔍 Smart Profiling
Generate targeted wordlists based on known information.
*   **Person-Aware**: Combines names, dates, and aliases intelligently.
*   **Smart Permutations**: Automatically handles case variants and "Leet Speak" (e.g., `Password` -> `P@ssw0rd`).
*   **Date Logic**: Generates all valid date formats (DDMM, MMDD, YYYY) from a single birthdate input.

### ⚡ Ultra-Performance Search
Find what you need instantly, even in multi-gigabyte files.
*   **Memory-Mapped Scanning**: Searches 1GB+ files in milliseconds using optimized chunk reading.
*   **Incremental Filtering**: Search results refine instantly as you type ("drill-down" interaction).
*   **Pagination**: Smoothly browse infinite result sets without crashing RAM.

### 🛠️ Advanced Toolkit
Professional-grade utilities built right in.
*   **Combinator**: Merge two wordlists (e.g., `Names.txt` + `Years.txt`) efficiently.
*   **Hybrid Attack**: Combine a dictionary with a brute-force mask (e.g., `common_passwords` + `?d?d?d`).
*   **Rule Processor**: Apply transformations like "Append", "Prepend", "Reverse", and "Case Toggle" to entire lists.
*   **Mask Mode**: Generate words based on structural patterns (e.g., `Admin?d?d?d` -> `Admin000`...`Admin999`).

---

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Language** | ![Python](https://img.shields.io/badge/Python-3.x-blue?style=flat-square&logo=python&logoColor=white) | pure Python 3 implementation for maximum compatibility. |
| **GUI Framework** | ![Flet](https://img.shields.io/badge/Flet-UI-purple?style=flat-square&logo=flutter&logoColor=white) | Modern, responsive interface powered by Flutter. |
| **Engine** | **Itertools & MMap** | Standard library optimizations for C-speed performance. |

---

## 📦 Installation & Usage

### Windows
1.  Run `scripts/install_windows.bat` to create a Desktop Shortcut.
2.  Or run directly:
    ```powershell
    python src/gui/main.py
    ```

### Linux
1.  Ensure Python 3 is installed.
2.  Run:
    ```bash
    python3 src/gui/main.py
    ```

---

## 👤 Author

**[Placeholder for Your Name]**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Muhib-Mehdi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/muhib-mehdi-677bb7391/)

---

*Disclaimer: This tool is for educational and security testing purposes only. Usage for unauthorized attack is strictly prohibited.*

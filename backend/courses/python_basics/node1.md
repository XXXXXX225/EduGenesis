# Python Environment Setup & IDE Configuration

Building a stable, isolated, and reproducible Python runtime is the foundation of all software engineering work.

## 1. Interpreter Installation
- **Download**: Use official stable Python releases (3.10 or 3.11) from `python.org`.
- **PATH Configuration**: On Windows, **must** check `Add python.exe to PATH`. This registers both the interpreter bin directory and the `Scripts/` directory into the system''s global search path. Without this, running `python` or `pip` in terminal throws `CommandNotFound`.

## 2. Virtual Environments
To avoid third-party dependency version conflicts across projects, use `venv`:
```bash
# Create
python -m venv .venv
# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
# Activate (Linux/macOS)
source .venv/bin/activate
```

## 3. IDE Integration: VS Code
1. Install **Visual Studio Code**.
2. Install the official **Python** extension.
3. Via `Ctrl+Shift+P`, select `Python: Select Interpreter` and point to the venv interpreter.
4. Integrate `Pytest` for automated testing — visible in the Testing sidebar panel.

**Key Takeaway**: `venv` + VS Code + Pytest = reproducible professional Python workflow.

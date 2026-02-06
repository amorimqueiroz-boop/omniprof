#!/usr/bin/env python3
"""
Launcher Omniprof: roda Streamlit a partir de omnicraft/ para que
pages/ seja encontrada corretamente. O cwd deve ser omnicraft/.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OMNICRAFT = os.path.join(ROOT, "omnicraft")
sys.exit(
    subprocess.call(
        [sys.executable, "-m", "streamlit", "run", "omnicraft_app.py", *sys.argv[1:]],
        cwd=OMNICRAFT,
    )
)

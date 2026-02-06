#!/bin/bash
# Roda Omniprof a partir de omnicraft/ para que pages/ seja encontrada corretamente.
# O cwd deve ser omnicraft/ para evitar conflito com inclusao/pages/ (Omnisfera).
cd "$(dirname "$0")"
exec streamlit run omnicraft_app.py --server.headless=true "$@"

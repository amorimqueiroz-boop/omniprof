# Mapas Mentais — Omnicraft
"""Crie mapas mentais a partir de temas."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft import config
from omnicraft.docs import criar_docx_simples, criar_pdf_generico
from omnicraft.hub_logic import gerar_mapa_mental
from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar

st.set_page_config(
    page_title="Mapas Mentais | Omniprof",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Mapas Mentais")

st.markdown("## 🧠 Mapas Mentais")
st.markdown("Crie mapas mentais estruturados a partir de um tema central. Opcional: informe ramificações ou deixe a IA sugerir.")

api_key = config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key()

with st.sidebar:
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="mapa_engine")

with st.form("mapa_form"):
    tema_central = st.text_input("Tema central", placeholder="Ex: Fotossíntese", key="mapa_tema")
    ramificacoes = st.text_area("Ramificações (opcional)", placeholder="Ex: Etapas, fatores, importância... Deixe em branco para a IA sugerir.", height=80, key="mapa_ramos")
    if st.form_submit_button("🧠 Gerar Mapa Mental"):
        if not tema_central:
            st.warning("Informe o tema central.")
        elif not api_key:
            st.error("Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY.")
        else:
            with st.spinner("Gerando mapa mental..."):
                try:
                    texto = gerar_mapa_mental(api_key, tema_central, ramificacoes, engine=engine)
                    st.session_state["mapa_result"] = texto
                    st.rerun()
                except Exception as e:
                    st.error(str(e))

if st.session_state.get("mapa_result"):
    st.markdown("---")
    st.markdown("### Mapa Mental")
    st.markdown(st.session_state["mapa_result"])
    st.markdown("---")
    docx = criar_docx_simples(st.session_state["mapa_result"], titulo="Mapa Mental")
    pdf_bytes = criar_pdf_generico(st.session_state["mapa_result"])
    c1, c2 = st.columns(2, gap="medium")
    c1.download_button("📄 Baixar DOCX", data=docx, file_name="Mapa_Mental.docx", mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document", use_container_width=True)
    c2.download_button("📕 Baixar PDF", data=pdf_bytes, file_name="Mapa_Mental.pdf", mime="application/pdf", use_container_width=True)
    if st.button("🗑️ Limpar"):
        del st.session_state["mapa_result"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("omnicraft_app.py")

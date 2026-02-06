# Inclusão no Brincar — Omnicraft (Educação Infantil)
"""Dinâmicas para mediação social e brincadeiras inclusivas. Recurso específico para EI."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft import config
from omnicraft.docs import criar_docx_simples, criar_pdf_generico
from omnicraft.hub_logic import gerar_dinamica
from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar

st.set_page_config(
    page_title="Inclusão no Brincar | Omniprof",
    page_icon="🤝",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Inclusão no Brincar")

st.markdown("## 🤝 Inclusão no Brincar")
st.markdown("Crie pontes através do interesse da criança. A IA criará uma brincadeira inclusiva onde ela é protagonista.")

api_key = config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key()

with st.sidebar:
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="brincar_engine")

tema = st.text_input("Tema/Momento:", placeholder="Ex: Brincadeira de massinha", key="dina_ei")
qtd = st.number_input("Quantidade de crianças (pequeno grupo)", min_value=2, max_value=20, value=10, key="brincar_qtd")
caract = st.text_input("Características do grupo:", placeholder="Ex: Crianças pequenas, algumas com dificuldade de interação", key="brincar_caract")

if st.button("🤝 GERAR DINÂMICA", type="primary", key="btn_dina_ei"):
    if not tema or not tema.strip():
        st.warning("Informe o tema ou momento da brincadeira.")
    elif not api_key:
        st.error("Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY.")
    else:
        with st.spinner("Criando ponte social..."):
            try:
                texto = gerar_dinamica(
                    api_key,
                    "Educação Infantil",
                    tema.strip(),
                    qtd,
                    caract or "Crianças pequenas",
                    engine=engine,
                )
                st.session_state["brincar_result"] = texto
                st.rerun()
            except Exception as e:
                st.error(str(e))

if st.session_state.get("brincar_result"):
    st.markdown("---")
    st.markdown("### Dinâmica para Inclusão no Brincar")
    st.markdown(st.session_state["brincar_result"])
    st.markdown("---")
    docx = criar_docx_simples(st.session_state["brincar_result"], titulo="Inclusao_no_Brincar")
    pdf_bytes = criar_pdf_generico(st.session_state["brincar_result"])
    c1, c2 = st.columns(2, gap="medium")
    c1.download_button("📄 Baixar DOCX", data=docx, file_name="Inclusao_Brincar.docx", mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document", use_container_width=True)
    c2.download_button("📕 Baixar PDF", data=pdf_bytes, file_name="Inclusao_Brincar.pdf", mime="application/pdf", use_container_width=True)
    if st.button("🗑️ Limpar"):
        del st.session_state["brincar_result"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("streamlit_app.py")

# Dinâmica — Omnicraft
"""Dinâmicas gerais para sala de aula."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft import config
from omnicraft.bncc_simple import criar_dropdowns_bncc
from omnicraft.constantes import TAXONOMIA_BLOOM
from omnicraft.docs import criar_docx_simples, criar_pdf_generico
from omnicraft.hub_logic import gerar_dinamica
from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar

st.set_page_config(
    page_title="Dinâmica | Omniprof",
    page_icon="👥",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Dinâmica")

st.markdown("## 👥 Dinâmica")
st.markdown("Gere dinâmicas para sala de aula com BNCC e verbos de Bloom.")

api_key = config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key()

with st.sidebar:
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="din_engine")

with st.form("din_form"):
    bncc = criar_dropdowns_bncc(key_prefix="dinamica", multiselect_habilidades=True)
    materia = bncc["disciplina"] or "Geral"
    assunto = st.text_input("Tema/Assunto", placeholder="Ex: Frações", key="din_assunto")
    qtd_alunos = st.number_input("Quantidade de estudantes", min_value=1, max_value=100, value=25, key="din_qtd")
    caracteristicas = st.text_area("Características da turma", placeholder="Ex: turma participativa, alguns com dificuldade em leitura...", height=80, key="din_caract")

    usar_bloom = st.checkbox("Usar Taxonomia de Bloom", key="din_bloom")
    verbos_bloom = []
    if usar_bloom:
        cat = st.selectbox("Categoria Bloom", list(TAXONOMIA_BLOOM.keys()), key="din_cat")
        verbos_bloom = st.multiselect("Verbos", TAXONOMIA_BLOOM[cat], key="din_verbos")

    if st.form_submit_button("🎯 Gerar Dinâmica"):
        if not assunto:
            st.warning("Preencha o Tema/Assunto.")
        elif not api_key:
            st.error("Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY.")
        else:
            with st.spinner("Gerando dinâmica..."):
                try:
                    texto = gerar_dinamica(
                        api_key,
                        materia or "Geral",
                        assunto,
                        qtd_alunos,
                        caracteristicas or "Não informado",
                        habilidades_bncc=bncc["habilidades"] or None,
                        verbos_bloom=verbos_bloom if verbos_bloom else None,
                        ano=bncc.get("ano") or None,
                        engine=engine,
                    )
                    st.session_state["din_result"] = texto
                    st.rerun()
                except Exception as e:
                    st.error(str(e))

if st.session_state.get("din_result"):
    st.markdown("---")
    st.markdown("### Dinâmica Gerada")
    st.markdown(st.session_state["din_result"])
    st.markdown("---")
    docx = criar_docx_simples(st.session_state["din_result"], titulo="Dinâmica")
    pdf_bytes = criar_pdf_generico(st.session_state["din_result"])
    c1, c2 = st.columns(2, gap="medium")
    c1.download_button("📄 Baixar DOCX", data=docx, file_name="Dinamica.docx", mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document", use_container_width=True)
    c2.download_button("📕 Baixar PDF", data=pdf_bytes, file_name="Dinamica.pdf", mime="application/pdf", use_container_width=True)
    if st.button("🗑️ Limpar"):
        del st.session_state["din_result"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("streamlit_app.py")

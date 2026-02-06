# Papo de Mestre — Omnicraft
"""Converse com a IA sobre assuntos de interesse dos alunos."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft import config
from omnicraft.hub_logic import gerar_quebra_gelo_profundo
from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar

st.set_page_config(
    page_title="Papo de Mestre | Omniprof",
    page_icon="💬",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Papo de Mestre")

st.markdown("## 💬 Papo de Mestre")
st.markdown("Quebra-gelo para conectar a turma ao tema da aula. Use assunto de interesse dos alunos como ponte.")

api_key = config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key()

with st.sidebar:
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="papo_engine")

with st.form("papo_form"):
    materia = st.text_input("Componente Curricular", placeholder="Ex: Matemática, Ciências...", key="papo_materia")
    assunto = st.text_input("Assunto da aula", placeholder="Ex: Equações do 2º grau", key="papo_assunto")
    assunto_interesse = st.text_input("Assunto de interesse (conexão com a turma)", placeholder="Ex: jogos, música, futebol...", key="papo_interesse")
    tema_turma = st.text_area("Tema/perfil da turma (opcional)", placeholder="Ex: turma com muitos gamificadores...", height=60, key="papo_turma")
    if st.form_submit_button("🎯 Gerar sugestões"):
        if not materia or not assunto:
            st.warning("Preencha Componente e Assunto.")
        elif not api_key:
            st.error("Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY em .streamlit/secrets.toml")
        else:
            with st.spinner("Gerando..."):
                try:
                    texto = gerar_quebra_gelo_profundo(
                        api_key, materia, assunto,
                        assunto_interesse or "Geral",
                        tema_turma_extra=tema_turma or "",
                        engine=engine,
                    )
                    st.session_state["papo_result"] = texto
                    st.rerun()
                except Exception as e:
                    st.error(str(e))

if st.session_state.get("papo_result"):
    st.markdown("---")
    st.markdown("### Sugestões de Papo de Mestre")
    st.markdown(st.session_state["papo_result"])
    if st.button("🗑️ Limpar"):
        del st.session_state["papo_result"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("omnicraft_app.py")

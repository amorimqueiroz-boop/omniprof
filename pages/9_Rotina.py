# Rotina & AVD — Omnicraft (Educação Infantil)
"""Analise e adapte rotinas com sugestões sensoriais e visuais. Recurso específico para EI."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft import config
from omnicraft.docs import criar_docx_simples, criar_pdf_generico
from omnicraft.ia import chat_completion
from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar

st.set_page_config(
    page_title="Rotina & AVD | Omniprof",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Rotina & AVD")

st.markdown("## 📝 Rotina & AVD")
st.markdown("A rotina organiza o pensamento da criança. Analise e adapte rotinas com sugestões sensoriais e visuais.")

api_key = config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key()

with st.sidebar:
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="rotina_engine")

rotina_detalhada = st.text_area("Descreva a Rotina da Turma:", height=200, placeholder="Ex:\n8:00 - Chegada e Acolhida\n8:30 - Roda de Conversa\n9:00 - Lanche\n...", key="rotina_ei")
topico_foco = st.text_input("Ponto de Atenção (Opcional):", placeholder="Ex: Transição para o parque", key="topico_foco_ei")

if st.button("📝 ANALISAR E ADAPTAR ROTINA", type="primary", key="btn_rotina_ei"):
    if not rotina_detalhada or not rotina_detalhada.strip():
        st.warning("Descreva a rotina da turma.")
    elif not api_key:
        st.error("Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY.")
    else:
        with st.spinner("Analisando rotina..."):
            try:
                prompt = f"""Analise esta rotina de Educação Infantil e sugira adaptações sensoriais e visuais para crianças que precisam de mais estrutura e antecipação.

ROTINA:
{rotina_detalhada}

Foco específico: {topico_foco or "Não informado"}

Estruture sua resposta em:
1. **Pontos de atenção** (transições, possíveis gatilhos)
2. **Adaptações sensoriais** (luz, som, espaço)
3. **Adaptações visuais** (rotina visual, pictogramas, antecipação)
4. **Estratégias de mediação** (como o professor pode apoiar)
"""
                texto = chat_completion(engine, [{"role": "user", "content": prompt}], temperature=0.7, api_key=api_key)
                st.session_state["rotina_result"] = texto
                st.rerun()
            except Exception as e:
                st.error(str(e))

if st.session_state.get("rotina_result"):
    st.markdown("---")
    st.markdown("### Sugestões de Adaptação")
    st.markdown(st.session_state["rotina_result"])
    st.markdown("---")
    docx = criar_docx_simples(st.session_state["rotina_result"], titulo="Rotina Adaptada")
    pdf_bytes = criar_pdf_generico(st.session_state["rotina_result"])
    c1, c2 = st.columns(2, gap="medium")
    c1.download_button("📄 Baixar DOCX", data=docx, file_name="Rotina_Adaptada.docx", mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document", use_container_width=True)
    c2.download_button("📕 Baixar PDF", data=pdf_bytes, file_name="Rotina_Adaptada.pdf", mime="application/pdf", use_container_width=True)
    if st.button("🗑️ Limpar"):
        del st.session_state["rotina_result"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("omnicraft_app.py")

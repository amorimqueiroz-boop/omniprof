# Plano de Aula — Omnicraft
"""Elabore planos de aula com BNCC e verbos de Bloom."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft import config
from omnicraft.bncc_simple import criar_dropdowns_bncc
from omnicraft.constantes import METODOLOGIAS, RECURSOS_DISPONIVEIS, TAXONOMIA_BLOOM, TECNICAS_ATIVAS
from omnicraft.docs import criar_docx_simples, criar_pdf_generico
from omnicraft.hub_logic import gerar_plano_aula
from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar

st.set_page_config(
    page_title="Plano de Aula | Omniprof",
    page_icon="📅",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Plano de Aula")

st.markdown("## 📅 Plano de Aula")
st.markdown("Elabore planos de aula completos com BNCC, metodologias e DUA.")

api_key = config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key()

with st.sidebar:
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="plano_engine")

with st.form("plano_form"):
    bncc = criar_dropdowns_bncc(key_prefix="plano")
    materia = bncc["disciplina"] or "Geral"
    assunto = st.text_input("Tema/Assunto", placeholder="Ex: Equações do 2º grau", key="plano_assunto")
    metodologia = st.selectbox("Metodologia", ["", *METODOLOGIAS], key="plano_metodologia")
    tecnica = st.selectbox("Técnica Ativa", ["", *TECNICAS_ATIVAS], key="plano_tecnica")
    qtd_alunos = st.number_input("Quantidade de estudantes", min_value=1, max_value=100, value=25, key="plano_qtd")
    duracao = st.selectbox("Duração (min)", [50, 100], key="plano_duracao")
    recursos = st.multiselect("Recursos disponíveis", RECURSOS_DISPONIVEIS, key="plano_recursos")

    usar_bloom = st.checkbox("Usar Taxonomia de Bloom", key="plano_bloom")
    verbos_bloom = []
    if usar_bloom:
        cat = st.selectbox("Categoria Bloom", list(TAXONOMIA_BLOOM.keys()), key="plano_cat")
        verbos_bloom = st.multiselect("Verbos", TAXONOMIA_BLOOM[cat], key="plano_verbos")

    if st.form_submit_button("🎯 Gerar Plano de Aula"):
        if not assunto:
            st.warning("Preencha o Tema/Assunto.")
        elif not api_key:
            st.error("Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY.")
        else:
            with st.spinner("Gerando plano..."):
                try:
                    texto = gerar_plano_aula(
                        api_key,
                        materia or "Geral",
                        assunto,
                        metodologia or "Aula Expositiva Dialogada",
                        tecnica or "Não especificada",
                        qtd_alunos,
                        recursos or ["Quadro/Giz"],
                        habilidades_bncc=bncc["habilidades"] or None,
                        verbos_bloom=verbos_bloom if verbos_bloom else None,
                        ano=bncc.get("ano") or None,
                        duracao_minutos=duracao,
                        engine=engine,
                    )
                    st.session_state["plano_result"] = texto
                    st.rerun()
                except Exception as e:
                    st.error(str(e))

if st.session_state.get("plano_result"):
    st.markdown("---")
    st.markdown("### Plano de Aula Gerado")
    st.markdown(st.session_state["plano_result"])
    st.markdown("---")
    docx = criar_docx_simples(st.session_state["plano_result"], titulo="Plano de Aula")
    pdf_bytes = criar_pdf_generico(st.session_state["plano_result"])
    c1, c2 = st.columns(2, gap="medium")
    c1.download_button("📄 Baixar DOCX", data=docx, file_name="Plano_de_Aula.docx", mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document", use_container_width=True)
    c2.download_button("📕 Baixar PDF", data=pdf_bytes, file_name="Plano_de_Aula.pdf", mime="application/pdf", use_container_width=True)
    if st.button("🗑️ Limpar"):
        del st.session_state["plano_result"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("omnicraft_app.py")

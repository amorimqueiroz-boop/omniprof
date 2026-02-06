# Estúdio Visual — Omnicraft
"""Geração de imagens para aulas. Sem pictogramas CAA. Usa omnicraft.ia (independente)."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar
from omnicraft.ia import gerar_imagem_inteligente
from omnicraft.config import get_gemini_api_key, get_openai_api_key, get_setting, get_unsplash_key

st.set_page_config(
    page_title="Estúdio Visual | Omniprof",
    page_icon="🖼️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Estúdio Visual")

st.markdown("## 🖼️ Estúdio Visual")
st.markdown("Gere imagens para suas aulas. Sem pictogramas CAA. Omniprof independente (Gemini, DALL-E, Unsplash).")

api_key = get_openai_api_key() or get_setting("OPENAI_API_KEY", "")
unsplash_key = get_unsplash_key() or get_setting("UNSPLASH_ACCESS_KEY", "")
gemini_key = get_gemini_api_key()

if "res_scene_url" not in st.session_state:
    st.session_state.res_scene_url = None
if "valid_scene" not in st.session_state:
    st.session_state.valid_scene = False

st.markdown("#### 🎨 Ilustração")
desc_m = st.text_area("Descreva a imagem:", height=100, key="vdm_omnicraft", placeholder="Ex: Sistema Solar simplificado com planetas coloridos...")
assunto_interesse = st.text_input(
    "Assunto de interesse (opcional):",
    key="assunto_ilustracao_omnicraft",
    placeholder="Ex: dinossauros, espaço, música...",
    help="Tema que será usado na geração da ilustração.",
)
tema_ilustracao = (assunto_interesse or "").strip()

if st.button("🎨 Gerar Imagem", key="btn_cena_omnicraft", type="primary"):
    with st.spinner("Desenhando..."):
        prompt_completo = f"{desc_m}. Context: Education."
        if tema_ilustracao:
            prompt_completo = f"Tema da ilustração: {tema_ilustracao}. {prompt_completo}"
        st.session_state.res_scene_url = gerar_imagem_inteligente(
            api_key, prompt_completo, unsplash_key, prioridade="IA", gemini_key=gemini_key
        )
        st.session_state.valid_scene = False

if st.session_state.res_scene_url:
    st.image(st.session_state.res_scene_url)
    if st.session_state.valid_scene:
        st.success("Imagem validada!")
    else:
        c_vs1, c_vs2 = st.columns([1, 2], gap="medium")
        with c_vs1:
            if st.button("✅ Validar", key="val_sc_omnicraft"):
                st.session_state.valid_scene = True
                st.rerun()
        with c_vs2.expander("🔄 Refazer"):
            fb_scene = st.text_input("Ajuste:", key="fb_sc_omnicraft")
            if st.button("Refazer", key="ref_sc_omnicraft"):
                with st.spinner("Redesenhando..."):
                    prompt_completo = f"{desc_m}. Context: Education."
                    if tema_ilustracao:
                        prompt_completo = f"Tema da ilustração: {tema_ilustracao}. {prompt_completo}"
                    st.session_state.res_scene_url = gerar_imagem_inteligente(
                        api_key, prompt_completo, unsplash_key,
                        feedback_anterior=fb_scene, prioridade="IA", gemini_key=gemini_key
                    )
                    st.session_state.valid_scene = False
                    st.rerun()

st.markdown("---")
if st.button("🏠 Voltar ao Início"):
    st.switch_page("streamlit_app.py")

# Adaptar Prova — Omnicraft
"""Adapte provas com checklist. Sem PEI."""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

from omnicraft import config
from omnicraft.bncc_simple import criar_dropdowns_bncc
from omnicraft.docs import construir_docx_final, criar_pdf_generico, extrair_dados_docx
from omnicraft.hub_logic import adaptar_conteudo_docx
from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar

st.set_page_config(
    page_title="Adaptar Prova | Omniprof",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Adaptar Prova")

st.markdown("## 📝 Adaptar Prova")
st.markdown("Adapte provas com checklist. Upload DOCX. BNCC + checklist. Sem PEI.")

api_key = config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key()

with st.sidebar:
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="adaptar_prova_engine")

with st.expander("📚 BNCC e Assunto", expanded=True):
    bncc = criar_dropdowns_bncc(key_prefix="adaptar_prova", multiselect_habilidades=False)
    disciplina_bncc = bncc["disciplina"]
    objeto_bncc = bncc["objeto"]
    assunto_livre = st.text_input("Assunto (se não escolher BNCC)", placeholder="Ex: Equações", key="adaptar_assunto")

arquivo_d = st.file_uploader("Upload do arquivo DOCX", type=["docx"], key="fd_prova")

if "docx_imgs_prova" not in st.session_state:
    st.session_state.docx_imgs_prova = []
if "docx_txt_prova" not in st.session_state:
    st.session_state.docx_txt_prova = None

if arquivo_d and arquivo_d.file_id != st.session_state.get("last_d_prova"):
    st.session_state.last_d_prova = arquivo_d.file_id
    txt, imgs = extrair_dados_docx(arquivo_d)
    st.session_state.docx_txt_prova = txt
    st.session_state.docx_imgs_prova = imgs
    st.success(f"Texto extraído. {len(imgs)} imagens encontradas.")

map_d = {}
qs_d = []
if st.session_state.docx_imgs_prova:
    st.markdown("### Mapeamento de imagens")
    cols = st.columns(3, gap="medium")
    for i, img in enumerate(st.session_state.docx_imgs_prova):
        with cols[i % 3]:
            st.image(img, width=80)
            q = st.number_input(f"Pertence à questão:", 0, 50, key=f"dq_prova_{i}")
            if q > 0:
                map_d[int(q)] = img
                qs_d.append(int(q))

with st.expander("🎯 Checklist de Adaptação", expanded=False):
    st.caption("Marque as adaptações que devem ser aplicadas.")
    col1, col2 = st.columns(2, gap="medium")
    with col1:
        check_desafio = st.checkbox("Questões mais desafiadoras", value=False, key="ap_desafio")
        check_complexas = st.checkbox("Compreende instruções complexas", value=True, key="ap_complexas")
        check_passo = st.checkbox("Instruções passo a passo", value=False, key="ap_passo")
        check_etapas = st.checkbox("Dividir em etapas menores", value=False, key="ap_etapas")
    with col2:
        check_paragrafos = st.checkbox("Parágrafos curtos", value=False, key="ap_paragrafos")
        check_dicas = st.checkbox("Dicas de apoio", value=False, key="ap_dicas")
        check_figuras = st.checkbox("Compreende figuras de linguagem", value=True, key="ap_figuras")
        check_descricao = st.checkbox("Descrição de imagens", value=False, key="ap_descricao")
    checklist_prova = {
        "questoes_desafiadoras": check_desafio,
        "compreende_instrucoes_complexas": check_complexas,
        "instrucoes_passo_a_passo": check_passo,
        "dividir_em_etapas": check_etapas,
        "paragrafos_curtos": check_paragrafos,
        "dicas_apoio": check_dicas,
        "compreende_figuras_linguagem": check_figuras,
        "descricao_imagens": check_descricao,
    }

st.markdown("---")
if st.button("🚀 ADAPTAR PROVA", type="primary", key="btn_adaptar_prova", use_container_width=True):
    if not st.session_state.get("docx_txt_prova"):
        st.warning("Faça o upload de um arquivo DOCX.")
    elif not api_key:
        st.error("Configure DEEPSEEK_API_KEY ou GEMINI_API_KEY.")
    else:
        materia_d = disciplina_bncc or "Geral"
        tema_d = objeto_bncc or assunto_livre or "Geral"
        tipo_d = "Prova"
        with st.spinner("Adaptando conteúdo..."):
            try:
                rac, txt = adaptar_conteudo_docx(
                    api_key,
                    st.session_state.docx_txt_prova,
                    materia_d,
                    tema_d,
                    tipo_d,
                    remover_resp=True,
                    checklist_adaptacao=checklist_prova,
                    engine=engine,
                )
                st.session_state["res_prova"] = {"rac": rac, "txt": txt, "map": map_d, "checklist": checklist_prova, "materia": materia_d, "tipo": tipo_d}
                st.rerun()
            except Exception as e:
                st.error(str(e))

if st.session_state.get("res_prova"):
    res = st.session_state["res_prova"]
    st.markdown("---")
    st.markdown("### Análise Pedagógica")
    st.markdown(res["rac"])
    st.markdown("### Prova Adaptada")
    with st.container(border=True):
        partes = re.split(r"(\[\[IMG.*?\d+\]\])", res["txt"], flags=re.IGNORECASE)
        for p in partes:
            if "IMG" in p.upper() and re.search(r"\d+", p):
                num = int(re.search(r"\d+", p).group(0))
                im = res["map"].get(num)
                if im:
                    st.image(im, width=300)
            elif p.strip():
                st.markdown(p.strip())
    st.markdown("---")
    docx = construir_docx_final(
        res["txt"],
        materia=res.get("materia", "Prova"),
        mapa_imgs=res.get("map", {}),
        tipo_atv=res.get("tipo", "Prova"),
        checklist_adaptacao=res.get("checklist"),
    )
    pdf_bytes = criar_pdf_generico(res["txt"])
    c1, c2 = st.columns(2, gap="medium")
    c1.download_button("📄 Baixar DOCX", data=docx, file_name="Prova_Adaptada.docx", mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document", use_container_width=True)
    c2.download_button("📕 Baixar PDF", data=pdf_bytes, file_name="Prova_Adaptada.pdf", mime="application/pdf", use_container_width=True)
    if st.button("🗑️ Limpar"):
        del st.session_state["res_prova"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("omnicraft_app.py")

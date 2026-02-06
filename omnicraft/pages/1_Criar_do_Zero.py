# Criar Itens — Omniprof (principal)
"""Cria itens complexos a partir de BNCC e objetivos. Sem PEI/aluno."""

import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

try:
    from omnicraft import config
    from omnicraft.bncc_simple import criar_dropdowns_bncc
    from omnicraft.constantes import TAXONOMIA_BLOOM
    from omnicraft.docs import construir_docx_final, criar_pdf_generico
    from omnicraft.hub_logic import baixar_imagem_url, criar_profissional
    from omnicraft.ia import gerar_imagem_inteligente
    from omnicraft.omnicraft_ui import inject_omnicraft_css, render_omnicraft_header, render_omnicraft_navbar
except Exception as e:
    st.set_page_config(page_title="Criar Itens | Omniprof", layout="wide")
    st.error(f"Erro ao carregar módulos: {e}")
    st.stop()

st.set_page_config(
    page_title="Criar Itens | Omniprof",
    page_icon="🔧",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
render_omnicraft_navbar(active="Criar Itens")

st.markdown("## ✨ Criar Itens")
st.markdown("Crie atividades a partir de BNCC, objetivos e assunto de interesse.")

api_key = config.get_deepseek_api_key()
unsplash_key = config.get_unsplash_key()

with st.sidebar:
    st.markdown("### ⚙️ API")
    engine = st.radio("Motor IA", ["red", "green", "yellow", "orange"], format_func=lambda x: {"red": "DeepSeek", "green": "Claude", "yellow": "Gemini", "orange": "OpenAI"}[x], horizontal=True, key="criar_engine")
    if not api_key and engine == "red":
        st.warning("Configure DEEPSEEK_API_KEY em .streamlit/secrets.toml")

with st.expander("📚 BNCC", expanded=True):
    try:
        bncc = criar_dropdowns_bncc(key_prefix="criar_do_zero")
    except Exception as e:
        st.warning(f"BNCC: {e}. Usando valores padrão.")
        bncc = {"disciplina": "Geral", "objeto": "", "unidade_tematica": "", "assunto_livre": "", "habilidades": []}
    mat_c = bncc.get("disciplina") or "Geral"
    obj_c = bncc.get("objeto") or bncc.get("unidade_tematica") or bncc.get("assunto_livre") or "Geral"
    habilidades_bncc = bncc.get("habilidades") or []

st.markdown("---")
assunto_interesse = st.text_input("Assunto de interesse (conexão com a turma)", placeholder="Ex: jogos, dinossauros, espaço...", key="assunto_interesse")
is_ei = (mat_c or "").strip() == "Educação Infantil"
r1, r2, r3, r4 = st.columns(4, gap="medium")
with r1:
    qtd_c = st.slider("Quantidade de Questões", 1, 10, 5, key="cq", disabled=is_ei)
with r2:
    tipo_quest = st.selectbox("Tipo de Questão", ["Objetiva", "Discursiva"], key="ctq", disabled=is_ei)
with r3:
    usar_img = st.checkbox("Incluir Imagens?", value=True, key="usar_img", disabled=is_ei)
with r4:
    qtd_img_sel = st.slider("Qtd. imagens", 0, qtd_c, int(qtd_c / 2) if qtd_c > 1 else 0, disabled=not usar_img or is_ei, key="qtd_img_slider")
if is_ei:
    st.caption("🧸 Educação Infantil: Criando **experiência lúdica** em vez de prova.")

checklist_criar = {}
verbos_finais_para_ia = []
usar_bloom = False

col_check, col_bloom = st.columns(2, gap="medium")
with col_check:
    with st.expander("🎯 Checklist de Adaptação (opcional)", expanded=False):
        st.caption("Marque as adaptações que devem ser consideradas.")
        col_c1, col_c2 = st.columns(2, gap="medium")
        with col_c1:
            check_desafio = st.checkbox("Questões mais desafiadoras", value=False, key="c0_desafio")
            check_complexas = st.checkbox("Compreende instruções complexas", value=True, key="c0_complexas")
            check_passo = st.checkbox("Instruções passo a passo", value=False, key="c0_passo")
            check_etapas = st.checkbox("Dividir em etapas menores", value=False, key="c0_etapas")
        with col_c2:
            check_paragrafos = st.checkbox("Parágrafos curtos", value=False, key="c0_paragrafos")
            check_dicas = st.checkbox("Dicas de apoio", value=False, key="c0_dicas")
            check_figuras = st.checkbox("Compreende figuras de linguagem", value=True, key="c0_figuras")
            check_descricao = st.checkbox("Descrição de imagens", value=False, key="c0_descricao")
        checklist_criar = {
            "questoes_desafiadoras": check_desafio,
            "compreende_instrucoes_complexas": check_complexas,
            "instrucoes_passo_a_passo": check_passo,
            "dividir_em_etapas": check_etapas,
            "paragrafos_curtos": check_paragrafos,
            "dicas_apoio": check_dicas,
            "compreende_figuras_linguagem": check_figuras,
            "descricao_imagens": check_descricao,
        }

with col_bloom:
    with st.expander("🧠 Taxonomia de Bloom (opcional)", expanded=False):
        usar_bloom = st.checkbox("Usar Taxonomia de Bloom", key="usar_bloom")
        if usar_bloom:
            if "bloom_memoria" not in st.session_state:
                st.session_state.bloom_memoria = {cat: [] for cat in TAXONOMIA_BLOOM.keys()}
            cat_atual = st.selectbox("Categoria:", list(TAXONOMIA_BLOOM.keys()), key="cat_bloom")
            selecao_atual = st.multiselect("Verbos:", TAXONOMIA_BLOOM[cat_atual], default=st.session_state.bloom_memoria.get(cat_atual, []), key="ms_bloom")
            st.session_state.bloom_memoria[cat_atual] = selecao_atual
            for cat in st.session_state.bloom_memoria:
                verbos_finais_para_ia.extend(st.session_state.bloom_memoria.get(cat, []))
            if verbos_finais_para_ia:
                st.info(f"Verbos: {', '.join(verbos_finais_para_ia)}")

st.markdown("---")
if st.button("✨ CRIAR ATIVIDADE" + (" / EXPERIÊNCIA" if is_ei else ""), type="primary", key="btn_c", use_container_width=True):
    with st.spinner("Elaborando " + ("experiência lúdica..." if is_ei else "atividade...")):
        try:
            qtd_final = (qtd_img_sel if usar_img else 0) if not is_ei else 0
            rac, txt = criar_profissional(
                config.get_deepseek_api_key() or config.get_gemini_api_key() or config.get_openai_api_key(),
                assunto_interesse or "Geral",
                mat_c,
                obj_c,
                qtd_c,
                tipo_quest,
                qtd_final,
                verbos_bloom=verbos_finais_para_ia if usar_bloom else None,
                habilidades_bncc=habilidades_bncc,
                checklist_adaptacao=checklist_criar,
                engine=engine,
            )
            novo_map = {}
            count = 0
            tags = re.findall(r"\[\[GEN_IMG: (.*?)\]\]", txt) if not is_ei else []
            for p in tags:
                count += 1
                url = gerar_imagem_inteligente(api_key, p.strip(), unsplash_key, prioridade="BANCO")
                if not url and unsplash_key:
                    url = gerar_imagem_inteligente(api_key, p.strip(), unsplash_key, prioridade="IA")
                if url:
                    io = baixar_imagem_url(url)
                    if io:
                        novo_map[count] = io.getvalue() if hasattr(io, "getvalue") else io.read()
            txt_fin = txt
            for i in range(1, count + 1):
                txt_fin = re.sub(r"\[\[GEN_IMG: .*?\]\]", f"[[IMG_G{i}]]", txt_fin, count=1)
            st.session_state["res_create"] = {
                "rac": rac,
                "txt": txt_fin,
                "map": novo_map,
                "mat_c": mat_c,
                "obj_c": obj_c,
                "checklist": checklist_criar,
            }
            st.rerun()
        except Exception as e:
            st.error(str(e))

if "res_create" in st.session_state:
    res = st.session_state["res_create"]
    st.markdown("---")
    st.markdown(f"### Atividade: {res.get('mat_c', '')} — {res.get('obj_c', '')}")
    if res.get("rac"):
        with st.expander("🧠 Análise Pedagógica"):
            st.markdown(res["rac"])
    st.markdown("#### 📝 Atividade Gerada")
    with st.container(border=True):
        partes = re.split(r"(\[\[IMG_G\d+\]\])", res["txt"])
        for p in partes:
            tag = re.search(r"\[\[IMG_G(\d+)\]\]", p)
            if tag:
                i = int(tag.group(1))
                im = res["map"].get(i)
                if im:
                    st.image(im, width=300)
            elif p.strip():
                st.markdown(p.strip())
    st.markdown("---")
    st.markdown("### 📥 Download")
    col_down1, col_down2, col_down3 = st.columns(3, gap="medium")
    with col_down1:
        docx = construir_docx_final(res["txt"], materia=res.get("mat_c", "Atividade"), mapa_imgs=res.get("map", {}), tipo_atv="Criada", checklist_adaptacao=res.get("checklist"))
        st.download_button(
            "📄 Baixar DOCX",
            data=docx,
            file_name=f"Atividade_{res.get('mat_c', 'doc')}_{date.today().strftime('%Y%m%d')}.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            use_container_width=True,
        )
    with col_down2:
        pdf_bytes = criar_pdf_generico(res["txt"])
        st.download_button(
            "📕 Baixar PDF",
            data=pdf_bytes,
            file_name=f"Atividade_{res.get('mat_c', 'doc')}_{date.today().strftime('%Y%m%d')}.pdf",
            mime="application/pdf",
            use_container_width=True,
        )
    with col_down3:
        st.download_button(
            "📝 Baixar Texto",
            data=res["txt"],
            file_name=f"Atividade_{res.get('mat_c', 'doc')}_{date.today().strftime('%Y%m%d')}.txt",
            mime="text/plain",
            use_container_width=True,
        )
    if st.button("🗑️ Descartar e criar outra"):
        del st.session_state["res_create"]
        st.rerun()

if st.button("🏠 Voltar ao Início"):
    st.switch_page("omnicraft_app.py")

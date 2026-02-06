# Home — Omniprof (página independente)
"""Página inicial: segmento + componente curricular (como master escolhe). BNCC fica dentro de cada recurso."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st
from datetime import datetime
from zoneinfo import ZoneInfo

from omnicraft.constantes import SEGMENTOS
from omnicraft.bncc_simple import obter_componentes_por_segmento
from omnicraft.omnicraft_ui import (
    inject_omnicraft_css,
    render_omnicraft_header,
    create_tool_card,
)

st.set_page_config(
    page_title="Omniprof | Início",
    page_icon="🔧",
    layout="wide",
    initial_sidebar_state="collapsed",
)

inject_omnicraft_css()
render_omnicraft_header()
# Navbar oculta na Home (como na Omnisfera)

# Seletor: Segmento + Componente Curricular (como master escolhe; BNCC fica dentro de cada recurso)
st.session_state.setdefault("omnicraft_segmento", "EFAI")
st.session_state.setdefault("omnicraft_componente", "")
col_seg, col_comp, _ = st.columns([1, 1, 2], gap="medium")
with col_seg:
    seg_opts = [s[0] for s in SEGMENTOS]
    seg_default = st.session_state.omnicraft_segmento
    seg_idx = seg_opts.index(seg_default) if seg_default in seg_opts else 1
    seg_id = st.selectbox(
        "Segmento",
        options=seg_opts,
        index=seg_idx,
        format_func=lambda x: next((s[1] for s in SEGMENTOS if s[0] == x), x),
        key="home_segmento",
    )
    if seg_id != st.session_state.omnicraft_segmento:
        st.session_state.omnicraft_segmento = seg_id
        st.session_state.omnicraft_componente = ""
with col_comp:
    comp_opts = obter_componentes_por_segmento(st.session_state.omnicraft_segmento)
    comp_sel = st.selectbox(
        "Componente Curricular",
        options=["", *comp_opts],
        key="home_componente",
    )
    if comp_sel != st.session_state.get("omnicraft_componente"):
        st.session_state.omnicraft_componente = comp_sel or ""

# Hero
agora = datetime.now(ZoneInfo("America/Sao_Paulo"))
hora = agora.hour
saudacao = "Bom dia" if 5 <= hora < 12 else "Boa tarde" if 12 <= hora < 18 else "Boa noite"
nome = st.session_state.get("omnicraft_usuario_nome", "Professor(a)").split()[0]

hero_html = f'<div class="omni-hero"><h1>{saudacao}, {nome}!</h1><p>Crie materiais didáticos de forma inteligente. Sem PEI, sem vínculo com estudante — só você e as ferramentas.</p></div>'
if hasattr(st, "html"):
    st.html(hero_html)
else:
    st.markdown(hero_html, unsafe_allow_html=True)

st.markdown("### 🔧 Ferramentas")

is_ei = st.session_state.omnicraft_segmento == "EI"

if is_ei:
    # Educação Infantil: recursos específicos (como no Hub Omnisfera)
    st.caption("🧸 **Educação Infantil:** Criar Experiência | Estúdio Visual & CAA | Rotina & AVD | Inclusão no Brincar")
    TOOLS = [
        ("🧸 Criar Experiência (BNCC)", "Experiências lúdicas com Campos de Experiência e Objetivos BNCC EI.", "ri-lightbulb-fill", "cherry", "pages/1_Criar_do_Zero.py", "t_ei_exp"),
        ("🎨 Estúdio Visual & CAA", "Ilustrações e pictogramas para rotinas e comunicação.", "ri-image-edit-fill", "blue", "pages/2_Estudio_Visual.py", "t_ei_estudio"),
        ("📝 Rotina & AVD", "Analise e adapte rotinas com sugestões sensoriais e visuais.", "ri-time-fill", "cherry", "pages/9_Rotina.py", "t_ei_rotina"),
        ("🤝 Inclusão no Brincar", "Dinâmicas para mediação social e brincadeiras inclusivas.", "ri-group-fill", "blue", "pages/10_Inclusao_Brincar.py", "t_ei_brincar"),
    ]
else:
    # EF/EM: recursos padrão
    TOOLS = [
        ("Criar Itens", "Crie itens complexos a partir de BNCC e objetivos.", "ri-magic-fill", "cherry", "pages/1_Criar_do_Zero.py", "t_criar"),
        ("Estúdio Visual", "Geração de imagens para suas aulas.", "ri-image-edit-fill", "blue", "pages/2_Estudio_Visual.py", "t_estudio"),
        ("Papo de Mestre", "Converse com a IA sobre assuntos de interesse dos seus alunos.", "ri-chat-smile-2-fill", "cherry", "pages/3_Papo_de_Mestre.py", "t_papo"),
        ("Dinâmica", "Dinâmicas gerais para sala de aula.", "ri-group-fill", "blue", "pages/4_Dinamica.py", "t_dinamica"),
        ("Plano de Aula", "Elabore planos de aula com BNCC e verbos de Bloom.", "ri-calendar-todo-fill", "cherry", "pages/5_Plano_de_Aula.py", "t_plano"),
        ("Mapas Mentais", "Crie mapas mentais a partir de temas que você escolher.", "ri-bubble-chart-fill", "blue", "pages/6_Mapa_Mental.py", "t_mapa"),
        ("Adaptar Prova", "Adapte provas com checklist (sem PEI).", "ri-file-edit-fill", "cherry", "pages/7_Adaptar_Prova.py", "t_prova"),
        ("Adaptar Atividade", "Adapte atividades com checklist (sem PEI).", "ri-scissors-cut-fill", "blue", "pages/8_Adaptar_Atividade.py", "t_atividade"),
    ]

cols = st.columns(3, gap="medium")
for i, (title, desc, icon, color, page, key) in enumerate(TOOLS):
    with cols[i % 3]:
        create_tool_card(title, desc, icon, color, page, key)

st.markdown("<div style='height:40px'></div>", unsafe_allow_html=True)
st.markdown("---")
st.caption("Omniprof — Ferramentas para professores. Independente.")

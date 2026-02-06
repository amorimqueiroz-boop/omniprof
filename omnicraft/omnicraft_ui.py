# omnicraft_ui.py — UI compartilhada Omniprof
"""Navbar e CSS para Omniprof. Cores: #f3474a (cereja), #004aad (azul). Topbar removida."""

import sys
import base64
from pathlib import Path

OMNICRAFT_DIR = Path(__file__).resolve().parent
ROOT = OMNICRAFT_DIR.parent  # projeto pai (para sys.path)
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import streamlit as st

OMNICRAFT_CHERRY = "#f3474a"
OMNICRAFT_BLUE = "#004aad"


def inject_omnicraft_css():
    """Injeta CSS via st.markdown (evita components.html que pode travar no Streamlit Cloud)."""
    css_content = f"""
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css">
    <style>
    .block-container {{ padding-top: 1rem !important; padding-bottom: 4rem !important; max-width: 95% !important; }}
    .streamlit-expander {{ margin-bottom: 1rem !important; border: 1px solid #E2E8F0 !important; border-radius: 12px !important; }}
    .omni-hero {{ background: linear-gradient(135deg, {OMNICRAFT_BLUE} 0%, #1e6bd6 50%, {OMNICRAFT_CHERRY} 100%); border-radius: 20px; padding: 2.5rem; color: white; margin-bottom: 2rem; min-height: 140px; }}
    .omni-hero h1 {{ font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }}
    .omni-hero p {{ font-size: 1.05rem; opacity: 0.95; }}
    .omni-card {{ background: white; border-radius: 16px; border: 1px solid #E2E8F0; padding: 0; overflow: hidden; margin-bottom: 1rem; }}
    .omni-card-bar {{ width: 6px; height: 100%; min-height: 120px; }}
    .omni-card-bar.cherry {{ background: {OMNICRAFT_CHERRY} !important; }}
    .omni-card-bar.blue {{ background: {OMNICRAFT_BLUE} !important; }}
    .omni-card-content {{ display: flex; align-items: center; padding: 0; height: 120px; }}
    .omni-card-icon {{ width: 90px; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: #F8FAFC; }}
    .omni-card-icon.cherry i {{ color: {OMNICRAFT_CHERRY}; }}
    .omni-card-icon i {{ color: {OMNICRAFT_BLUE}; }}
    .omni-card-text {{ flex: 1; padding: 0 1.5rem; }}
    .omni-card-title {{ font-weight: 800; font-size: 1.1rem; color: #1E293B; margin-bottom: 4px; }}
    .omni-card-desc {{ font-size: 0.85rem; color: #64748B; line-height: 1.4; }}
    </style>
    """
    st.markdown(css_content, unsafe_allow_html=True)


def create_tool_card(title: str, desc: str, icon: str, color: str, page: str, key: str):
    """Card de ferramenta com link de acesso (st.page_link mais confiável no Cloud)."""
    bar_cls = "cherry" if color == "cherry" else "blue"
    icon_cls = "omni-card-icon cherry" if color == "cherry" else "omni-card-icon"
    html = f'<div class="omni-card"><div class="omni-card-content"><div class="omni-card-bar {bar_cls}"></div><div class="{icon_cls}"><i class="{icon}"></i></div><div class="omni-card-text"><div class="omni-card-title">{title}</div><div class="omni-card-desc">{desc}</div></div></div></div>'
    if hasattr(st, "html"):
        st.html(html)
    else:
        st.markdown(html, unsafe_allow_html=True)
    if hasattr(st, "page_link"):
        st.page_link(page, label=f"📂 Acessar {title}", icon="📂", width="stretch")
    else:
        if st.button(f"📂 Acessar {title}", key=key, use_container_width=True):
            st.switch_page(page)


def render_omnicraft_header():
    """Topbar removida. Mantém a função para compatibilidade com as páginas."""
    pass


# Menus por segmento — refletem os cards da Home. Labels curtos para não quebrar linha.
# Paths relativos ao main script (streamlit_app.py na raiz)
TOOLS_EF_EM = [
    ("Início", "house", "streamlit_app.py"),
    ("Criar Itens", "pencil-square", "pages/1_Criar_do_Zero.py"),
    ("Estúdio Visual", "image", "pages/2_Estudio_Visual.py"),
    ("Papo de Mestre", "chat-dots", "pages/3_Papo_de_Mestre.py"),
    ("Dinâmica", "people", "pages/4_Dinamica.py"),
    ("Plano de Aula", "calendar-check", "pages/5_Plano_de_Aula.py"),
    ("Mapas Mentais", "diagram-3", "pages/6_Mapa_Mental.py"),
    ("Adaptar Prova", "file-text", "pages/7_Adaptar_Prova.py"),
    ("Adaptar Atividade", "scissors", "pages/8_Adaptar_Atividade.py"),
]
TOOLS_EI = [
    ("Início", "house", "streamlit_app.py"),
    ("Criar Experiência", "lightbulb", "pages/1_Criar_do_Zero.py"),
    ("Estúdio Visual", "image", "pages/2_Estudio_Visual.py"),
    ("Rotina & AVD", "time", "pages/9_Rotina.py"),
    ("Inclusão Brincar", "heart", "pages/10_Inclusao_Brincar.py"),
]
# Mapeia label EF/EM → label EI quando a mesma página é acessada por ambos
ACTIVE_ALIAS = {"Criar Itens": "Criar Experiência", "Inclusão no Brincar": "Inclusão Brincar"}


def render_omnicraft_navbar(active: str):
    """Navbar dinâmica: EF/EM ou EI conforme st.session_state.omnicraft_segmento. Labels sem quebra."""
    seg = st.session_state.get("omnicraft_segmento", "EFAI")
    tools = TOOLS_EI if seg == "EI" else TOOLS_EF_EM
    active_resolved = ACTIVE_ALIAS.get(active, active)
    options = [t[0] for t in tools]
    icons = [t[1] for t in tools]
    routes = {t[0]: t[2] for t in tools}
    try:
        default_idx = options.index(active_resolved)
    except ValueError:
        default_idx = 0
    try:
        from streamlit_option_menu import option_menu
        selected = option_menu(
            menu_title=None,
            options=options,
            icons=icons,
            default_index=default_idx,
            orientation="horizontal",
            key="omnicraft_nav",
            styles={
                "container": {"padding": "2px 4px", "margin": "0", "background-color": "#fff", "border": "1px solid #E2E8F0", "border-radius": "14px"},
                "icon": {"color": "#64748B"},
                "nav-link": {"font-size": "11px", "padding": "6px 8px", "--hover-color": "#F8FAFC", "color": "#64748B", "white-space": "nowrap"},
                "nav-link-selected": {"background-color": "#F0F9FF", "color": "#004aad", "font-weight": "700", "white-space": "nowrap"},
            },
        )
    except Exception:
        selected = active_resolved
        cols = st.columns(len(tools), gap="small")
        for i, (title, _, page) in enumerate(tools):
            with cols[i]:
                if st.button(title[:12], key=f"nav_{i}", use_container_width=True, type="primary" if title == active_resolved else "secondary"):
                    st.switch_page(page)
    if selected and selected != active_resolved:
        target = routes.get(selected)
        if target:
            try:
                st.switch_page(target)
            except Exception:
                pass

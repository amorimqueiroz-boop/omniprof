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
    """Injeta CSS Omniprof via iframe+JS para evitar exibição como texto."""
    import streamlit.components.v1 as components

    css_content = (
        "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');"
        "html, body, [class*='css'] { font-family: 'Plus Jakarta Sans', sans-serif !important; }"
        "header, [data-testid='stHeader'], [data-testid='stToolbar'], .stDeployButton, #MainMenu, [data-testid='stMainMenu'], footer, [data-testid='stFooter'] { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; }"
        ".block-container { padding-top: 1rem !important; padding-bottom: 4rem !important; padding-left: 1.5rem !important; padding-right: 1.5rem !important; max-width: 95% !important; }"
        ".streamlit-expander { margin-bottom: 1rem !important; border: 1px solid #E2E8F0 !important; border-radius: 12px !important; }"
        ".streamlit-expander summary { padding: 14px 18px !important; }"
        "[data-testid='stVerticalBlockBorderWrapper'] { padding: 1.25rem !important; margin-bottom: 1rem !important; }"
        "[data-testid='column'] { padding: 0 0.5rem !important; }"
        "h2 { margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; }"
        "h3 { margin-top: 1.25rem !important; margin-bottom: 0.5rem !important; }"
        ".stTextInput > div, .stSelectbox > div, .stMultiSelect > div { margin-bottom: 0.25rem !important; }"
        ".stButton { margin: 0.5rem 0 !important; }"
        "hr { margin: 1.5rem 0 !important; }"
        "[data-testid='stForm'] { margin-bottom: 1.5rem !important; }"
        f".omni-hero {{ background: linear-gradient(135deg, {OMNICRAFT_BLUE} 0%, #1e6bd6 50%, {OMNICRAFT_CHERRY} 100%); border-radius: 20px; padding: 2.5rem; color: white; margin-bottom: 2rem; box-shadow: 0 20px 40px -10px rgba(0,74,173,0.35); min-height: 140px; }}"
        ".omni-hero h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }"
        ".omni-hero p { font-size: 1.05rem; opacity: 0.95; }"
        ".omni-card { background: white; border-radius: 16px; border: 1px solid #E2E8F0; padding: 0; overflow: hidden; transition: all 0.25s ease; margin-bottom: 1rem; }"
        ".omni-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); border-color: #CBD5E1; }"
        ".omni-card-bar { width: 6px; height: 100%; min-height: 120px; }"
        f".omni-card-bar.cherry {{ background: {OMNICRAFT_CHERRY} !important; }}"
        f".omni-card-bar.blue {{ background: {OMNICRAFT_BLUE} !important; }}"
        ".omni-card-content { display: flex; align-items: center; padding: 0; height: 120px; }"
        ".omni-card-icon { width: 90px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: #F8FAFC; border-right: 1px solid #F1F5F9; }"
        f".omni-card-icon i {{ color: {OMNICRAFT_BLUE}; }}"
        f".omni-card-icon.cherry i {{ color: {OMNICRAFT_CHERRY}; }}"
        ".omni-card-text { flex: 1; padding: 0 1.5rem; }"
        ".omni-card-title { font-weight: 800; font-size: 1.1rem; color: #1E293B; margin-bottom: 4px; }"
        ".omni-card-desc { font-size: 0.85rem; color: #64748B; line-height: 1.4; }"
        ".st-emotion-cache-1gwvy71 [class*='nav-link'], [class*='nav-link'] { white-space: nowrap !important; }"
    )
    css_escaped = css_content.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    html = f"""<script>
(function() {{
  var d = window.parent.document;
  var s = d.createElement('style');
  s.id = 'omnicraft-css';
  s.textContent = `{css_escaped}`;
  if (!d.getElementById('omnicraft-css')) d.head.appendChild(s);
  var l = d.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css';
  if (!d.querySelector('link[href*="remixicon"]')) d.head.appendChild(l);
}})();
</script>"""
    components.html(html, height=0)


def create_tool_card(title: str, desc: str, icon: str, color: str, page: str, key: str):
    """Card de ferramenta com botão de acesso."""
    bar_cls = "cherry" if color == "cherry" else "blue"
    icon_cls = "omni-card-icon cherry" if color == "cherry" else "omni-card-icon"
    html = f'<div class="omni-card"><div class="omni-card-content"><div class="omni-card-bar {bar_cls}"></div><div class="{icon_cls}"><i class="{icon}"></i></div><div class="omni-card-text"><div class="omni-card-title">{title}</div><div class="omni-card-desc">{desc}</div></div></div></div>'
    if hasattr(st, "html"):
        st.html(html)
    else:
        st.markdown(html, unsafe_allow_html=True)
    if st.button(f"📂 Acessar {title}", key=key, use_container_width=True):
        st.switch_page(page)


def render_omnicraft_header():
    """Topbar removida. Mantém a função para compatibilidade com as páginas."""
    pass


# Menus por segmento — refletem os cards da Home. Labels curtos para não quebrar linha.
TOOLS_EF_EM = [
    ("Início", "house", "omnicraft_app.py"),
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
    ("Início", "house", "omnicraft_app.py"),
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

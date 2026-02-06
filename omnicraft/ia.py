# ia.py — Geração de imagens e chat (Omnicraft independente)
"""
Cópia independente das funções de IA. Sem vínculo com Omnisfera.
Gemini, DALL-E, Unsplash — leitura de chaves via omnicraft.config.
"""

from io import BytesIO

import requests
from PIL import Image
from openai import OpenAI

from omnicraft import config


def buscar_imagem_unsplash(query: str, access_key: str):
    """Busca imagem no Unsplash. Retorna URL ou None."""
    if not access_key:
        return None
    url = f"https://api.unsplash.com/search/photos?query={query}&per_page=1&client_id={access_key}&lang=pt"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if data.get("results"):
            return data["results"][0]["urls"]["regular"]
    except Exception:
        pass
    return None


def _gemini_gerar_imagem_core(prompt: str, api_key: str):
    """Core: chama Gemini e retorna (bytes_png, None) ou (None, erro)."""
    try:
        from google import genai
        import base64
        client = genai.Client(api_key=api_key)
        response = None
        for model_id in ("gemini-3-pro-image-preview", "gemini-2.5-flash-image"):
            try:
                response = client.models.generate_content(model=model_id, contents=[prompt])
                if response is not None:
                    break
            except Exception as model_err:
                if "404" in str(model_err).lower() or "not found" in str(model_err).lower():
                    continue
                raise
        if response is None:
            response = client.models.generate_content(model="gemini-2.5-flash-image", contents=[prompt])
        parts = getattr(response, "parts", None)
        if not parts and getattr(response, "candidates", None) and response.candidates:
            content = getattr(response.candidates[0], "content", None)
            parts = getattr(content, "parts", None) if content else None
        if not parts:
            return None, "Resposta sem partes de imagem."
        for part in parts:
            inline = getattr(part, "inline_data", None) or getattr(part, "inlineData", None)
            if inline is not None:
                data = getattr(inline, "data", None)
                if data:
                    return (data, None) if isinstance(data, bytes) else (base64.b64decode(data), None)
            as_img = getattr(part, "as_image", None)
            if callable(as_img):
                try:
                    img = as_img()
                    if img is not None:
                        buf = BytesIO()
                        img.save(buf, format="PNG")
                        return buf.getvalue(), None
                except Exception:
                    pass
        return None, "Nenhuma imagem gerada na resposta."
    except Exception as e:
        return None, str(e)[:300]


def gerar_imagem_ilustracao_gemini(prompt: str, feedback_anterior: str = "", api_key=None):
    """Gera ilustração educacional com Gemini."""
    key = api_key or config.get_gemini_api_key()
    if not key:
        return None, "Configure GEMINI_API_KEY para gerar a imagem."
    texto = (prompt or "").strip()
    if feedback_anterior:
        texto = f"{texto}. Ajuste solicitado: {feedback_anterior}"
    prompt_final = (
        "Ilustração educacional, estilo vetorial plano, fundo claro. "
        "REGRA OBRIGATÓRIA: NÃO inclua texto, palavras, letras ou números na imagem. "
        "Apenas a representação visual do conceito. Público: Brasil. Proporção quadrada (1:1). "
        f"Cena a representar: {texto[:2000]}"
    )
    return _gemini_gerar_imagem_core(prompt_final, key)


def gerar_imagem_inteligente(
    api_key, prompt, unsplash_key=None, feedback_anterior="", prioridade="IA", gemini_key=None
):
    """
    Gera imagem: prioridade Gemini, depois DALL-E, depois Unsplash.
    Retorna bytes (PNG) ou URL (str); st.image() aceita ambos.
    """
    key_gemini = gemini_key or config.get_gemini_api_key()
    if key_gemini and prioridade == "IA":
        img_bytes, _ = gerar_imagem_ilustracao_gemini(
            prompt, feedback_anterior=feedback_anterior, api_key=key_gemini
        )
        if img_bytes:
            return img_bytes
    if prioridade == "BANCO" and unsplash_key:
        termo = prompt.split(".")[0] if "." in prompt else prompt
        url_banco = buscar_imagem_unsplash(termo, unsplash_key)
        if url_banco:
            return url_banco
    if not api_key or not str(api_key).strip():
        if unsplash_key and prioridade == "IA":
            termo = prompt.split(".")[0] if "." in prompt else prompt
            return buscar_imagem_unsplash(termo, unsplash_key)
        return None
    try:
        client = OpenAI(api_key=api_key)
        prompt_final = f"{prompt}. Adjustment requested: {feedback_anterior}" if feedback_anterior else prompt
        didactic_prompt = (
            f"Educational textbook illustration, clean flat vector style, white background. "
            f"CRITICAL RULE: STRICTLY NO TEXT, NO TYPOGRAPHY, NO ALPHABET, NO NUMBERS, NO LABELS inside the image. "
            f"Just the visual representation of: {prompt_final}"
        )
        resp = client.images.generate(
            model="dall-e-3", prompt=didactic_prompt, size="1024x1024", quality="standard", n=1
        )
        return resp.data[0].url
    except Exception:
        if prioridade == "IA" and unsplash_key:
            termo = prompt.split(".")[0] if "." in prompt else prompt
            return buscar_imagem_unsplash(termo, unsplash_key)
        return None


def chat_completion(engine: str, messages: list, temperature: float = 0.7, api_key=None):
    """
    Chat completion. engine: red (DeepSeek), green (Claude), yellow (Gemini), orange (OpenAI).
    Sem vínculo com Omnisfera.
    """
    from openai import OpenAI
    engine = (engine or "red").strip().lower()
    if engine not in ("red", "green", "yellow", "orange"):
        engine = "red"

    # Green (Anthropic Claude)
    if engine == "green":
        k = config.get_anthropic_api_key() or api_key or ""
        if not k or not str(k).strip():
            raise Exception("Configure ANTHROPIC_API_KEY para usar o motor Claude (green).")
        try:
            import anthropic
            system_parts = []
            user_texts = []
            for m in messages:
                role = m.get("role", "user")
                cont = m.get("content", "")
                if isinstance(cont, list):
                    texts = [p.get("text", "") for p in cont if isinstance(p, dict) and p.get("type") == "text"]
                    cont = "\n".join(texts) if texts else ""
                else:
                    cont = str(cont or "").strip()
                if not cont:
                    continue
                if role == "system":
                    system_parts.append(cont)
                else:
                    user_texts.append(cont)
            system_text = "\n\n".join(system_parts) if system_parts else None
            user_content = "\n\n".join(user_texts).strip() or "Responda."
            client = anthropic.Anthropic(api_key=k)
            model = config.get_setting("ANTHROPIC_MODEL", "") or "claude-sonnet-4-20250514"
            kwargs = {
                "model": model,
                "max_tokens": 4096,
                "messages": [{"role": "user", "content": user_content}],
                "temperature": temperature,
            }
            if system_text:
                kwargs["system"] = system_text
            resp = client.messages.create(**kwargs)
            return (resp.content[0].text if resp.content else "").strip()
        except ImportError:
            raise Exception("Pacote 'anthropic' necessário. pip install anthropic")

    # Orange (OpenAI)
    if engine == "orange":
        k = config.get_openai_api_key() or api_key or ""
        if not k or not str(k).strip():
            raise Exception("Configure OPENAI_API_KEY para usar o motor OpenAI.")
        client = OpenAI(api_key=k)
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=messages, temperature=temperature)
        return (resp.choices[0].message.content or "").strip()

    # Yellow (Gemini)
    if engine == "yellow":
        k = config.get_gemini_api_key() or api_key or ""
        if not k or not str(k).strip():
            raise Exception("Configure GEMINI_API_KEY para usar o motor Gemini.")
        try:
            from google import genai
            full = ""
            for m in messages:
                cont = (m.get("content") or "").strip()
                full += f"[{m.get('role', 'user')}]\n{cont}\n\n" if cont else ""
            full = full.strip() or "Responda."
            client = genai.Client(api_key=k)
            response = client.models.generate_content(model="gemini-2.0-flash", contents=full)
            return (response.text or "").strip()
        except Exception as e:
            raise Exception(f"Erro Gemini: {str(e)[:200]}")

    # Red (DeepSeek)
    k = config.get_deepseek_api_key()
    if not k or not str(k).strip():
        raise Exception("Configure DEEPSEEK_API_KEY. Local: .streamlit/secrets.toml")
    base_url = config.get_setting("DEEPSEEK_BASE_URL", "") or "https://api.deepseek.com"
    model = config.get_setting("DEEPSEEK_MODEL", "") or "deepseek-chat"
    try:
        client = OpenAI(api_key=k, base_url=base_url)
        resp = client.chat.completions.create(model=model, messages=messages, temperature=temperature)
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        raise Exception(f"Erro DeepSeek: {str(e)[:200]}")

/**
 * Serviço de Geração de Imagens para ferramentas OmniProf
 * Portado de Omnisfera: Unsplash (banco) → Gemini (IA) fallback
 */

/**
 * Busca imagem no Unsplash (banco de imagens)
 * Retorna URL da imagem ou null
 */
export async function buscarImagemUnsplash(
    query: string,
    accessKey: string
): Promise<string | null> {
    if (!accessKey?.trim()) return null;

    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${accessKey}&lang=pt`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!resp.ok) return null;

        const data = await resp.json();
        if (data?.results?.length > 0) {
            return data.results[0].urls?.regular || null;
        }
    } catch (error) {
        console.error("Erro ao buscar imagem Unsplash:", error);
    }

    return null;
}

/**
 * Gera imagem com prioridade: BANCO (Unsplash) → IA (Gemini)
 * Retorna URL ou base64
 */
export async function gerarImagemInteligente(
    prompt: string,
    prioridade: "BANCO" | "IA" = "IA",
    unsplashKey?: string,
    geminiKey?: string
): Promise<string | null> {
    // Se prioridade é BANCO, tenta Unsplash primeiro
    if (prioridade === "BANCO" && unsplashKey) {
        const termo = prompt.split(".")[0] || prompt;
        const urlBanco = await buscarImagemUnsplash(termo, unsplashKey);
        if (urlBanco) return urlBanco;
    }

    // Tenta Gemini se prioridade é IA
    if (prioridade === "IA" && geminiKey) {
        try {
            const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
            let lastError: Error | null = null;

            const didacticPrompt = `Educational textbook illustration, clean flat vector style, white background. CRITICAL RULE: STRICTLY NO TEXT, NO TYPOGRAPHY, NO ALPHABET, NO NUMBERS, NO LABELS inside the image. Just the visual representation of: ${prompt}`;

            for (const modelId of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`;
                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: didacticPrompt }] }],
                        }),
                    });

                    if (!response.ok) {
                        if (response.status === 404) continue;
                        const errorText = await response.text();
                        throw new Error(`API retornou ${response.status}: ${errorText}`);
                    }

                    const data = await response.json();
                    const candidates = data.candidates || [];
                    if (candidates.length > 0) {
                        const parts = candidates[0].content?.parts || [];
                        for (const part of parts) {
                            if (part.inlineData) {
                                return `data:image/png;base64,${part.inlineData.data}`;
                            }
                        }
                    }
                } catch (err: unknown) {
                    const errStr = String(err).toLowerCase();
                    if (errStr.includes("404") || errStr.includes("not found")) {
                        lastError = err instanceof Error ? err : new Error(String(err));
                        continue;
                    }
                    throw err;
                }
            }

            if (lastError) throw lastError;
        } catch (error) {
            console.error("Erro ao gerar imagem com Gemini:", error);
        }

        // Fallback para Unsplash se IA falhar
        if (unsplashKey) {
            const termo = prompt.split(".")[0] || prompt;
            return await buscarImagemUnsplash(termo, unsplashKey);
        }
    }

    return null;
}

/**
 * Baixa imagem de URL e retorna como base64
 */
export async function baixarImagemUrl(url: string): Promise<string | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!resp.ok) return null;

        const arrayBuffer = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mimeType = resp.headers.get("content-type") || "image/jpeg";

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error("Erro ao baixar imagem:", error);
        return null;
    }
}

import { NextResponse } from "next/server";
import { visionAdapt, getVisionApiKey, type EngineId } from "@/lib/ai-engines";
import { promptAdaptarConteudo, splitAnaliseConteudo } from "@/lib/hub-prompts";
import { chatCompletionText } from "@/lib/ai-engines";
import { comprimirArquivoImagem } from "@/lib/image-compression";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VISION_BYTES = 3 * 1024 * 1024;

export async function POST(request: Request) {
    const contentType = request.headers.get("content-type") || "";

    // === Modo texto (JSON body) — fallback para fluxo simples ===
    if (contentType.includes("application/json")) {
        try {
            const body = await request.json();
            if (!body.texto?.trim()) {
                return NextResponse.json({ error: "Cole o texto da atividade." }, { status: 400 });
            }

            const prompt = promptAdaptarConteudo({
                texto: body.texto,
                materia: body.materia || "",
                tema: body.tema || "",
                removerRespostas: !!body.removerRespostas,
                checklist: body.checklist,
                tipo: "atividade",
            });

            const fullText = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.4 });
            const { analise, conteudo } = splitAnaliseConteudo(fullText);
            return NextResponse.json({ analise, conteudo });
        } catch (err) {
            return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno." }, { status: 500 });
        }
    }

    // === Modo imagem (FormData) — vision OCR ===
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const meta = formData.get("meta") as string | null;

        if (!file || !file.size) {
            return NextResponse.json({ error: "Envie uma imagem (PNG, JPG ou JPEG)." }, { status: 400 });
        }

        // Parse metadata
        let materia = "Geral";
        let tema = "Geral";
        let tipo = "Atividade";
        let livroProfessor = false;
        let modoProfundo = false;
        let checklist: Record<string, boolean> = {};
        let engine: EngineId = "red";

        if (meta) {
            try {
                const parsed = JSON.parse(meta);
                materia = parsed.materia || materia;
                tema = parsed.tema || tema;
                tipo = parsed.tipo || tipo;
                livroProfessor = !!parsed.livro_professor;
                modoProfundo = !!parsed.modo_profundo;
                checklist = parsed.checklist || {};
                if (["red", "blue", "green", "yellow", "orange"].includes(parsed.engine || "")) {
                    engine = parsed.engine as EngineId;
                }
            } catch {
                // ignore parse errors
            }
        }

        // Comprimir imagem
        const compressedBuffer = await comprimirArquivoImagem(file, MAX_VISION_BYTES);
        if (compressedBuffer.length > MAX_IMAGE_BYTES) {
            return NextResponse.json({ error: "Imagem muito grande mesmo após compressão. Use até 4MB." }, { status: 400 });
        }

        const imagemBase64 = compressedBuffer.toString("base64");
        const mime = file.type || "image/jpeg";

        // Gerar prompt
        const prompt = promptAdaptarConteudo({
            texto: "[IMAGEM ENVIADA — extraia o conteúdo via OCR e adapte]",
            materia,
            tema,
            removerRespostas: false,
            checklist,
            tipo: tipo.toLowerCase() as "atividade" | "prova",
        });

        const visionPrompt = livroProfessor
            ? `${prompt}\n\nATENÇÃO: O professor possui o Livro do Professor. Inclua gabarito e orientações didáticas detalhadas.`
            : prompt;

        const finalPrompt = modoProfundo
            ? `${visionPrompt}\n\nMODO PROFUNDO ativado: forneça análise pedagógica detalhada antes da atividade adaptada. Separe as seções com ---DIVISOR---`
            : visionPrompt;

        // Chamar vision API
        const fullText = await visionAdapt(finalPrompt, imagemBase64, mime);

        let analise = "";
        let atividade = fullText;

        if (fullText.includes("---DIVISOR---")) {
            const parts = fullText.split("---DIVISOR---");
            analise = parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").trim();
            atividade = parts[1].replace("[ATIVIDADE]", "").trim();
        }

        return NextResponse.json({ analise, conteudo: atividade });
    } catch (err) {
        console.error("Adaptar Atividade (visão):", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao adaptar com imagem." },
            { status: 500 }
        );
    }
}

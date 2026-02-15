import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptAdaptarConteudo, splitAnaliseConteudo } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            texto: string; materia: string; tema: string;
            removerRespostas?: boolean; checklist?: Record<string, boolean | string>;
            engine?: EngineId;
        }>(request);

        if (!body.texto?.trim()) return errorResponse("Cole o texto da prova.");

        const prompt = promptAdaptarConteudo({
            texto: body.texto, materia: body.materia || "",
            tema: body.tema || "", removerRespostas: !!body.removerRespostas,
            checklist: body.checklist, tipo: "prova",
        });

        const fullText = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.4 });
        const { analise, conteudo } = splitAnaliseConteudo(fullText);
        return NextResponse.json({ analise, conteudo });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}

import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptSequenciaDidatica } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            materia: string; tema: string; ano: string; duracaoAulas: number;
            objetivos: string; habilidadesBncc?: string[];
            metodologia?: string; recursos?: string[]; verbosBloom?: string[];
            engine?: EngineId;
        }>(request);

        const prompt = promptSequenciaDidatica({
            materia: body.materia, tema: body.tema,
            ano: body.ano || "", duracaoAulas: body.duracaoAulas || 8,
            objetivos: body.objetivos || "",
            habilidadesBncc: body.habilidadesBncc,
            metodologia: body.metodologia,
            recursos: body.recursos,
        });

        const result = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.7 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}

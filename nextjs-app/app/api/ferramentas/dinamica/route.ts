import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptDinamica } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            materia: string; assunto: string; qtdAlunos: number;
            caracteristicasTurma: string; habilidadesBncc?: string[];
            verbosBloom?: string[]; ano?: string; engine?: EngineId;
        }>(request);

        const prompt = promptDinamica({
            materia: body.materia, assunto: body.assunto,
            qtdAlunos: body.qtdAlunos || 30,
            caracteristicasTurma: body.caracteristicasTurma || "",
            habilidadesBncc: body.habilidadesBncc,
            verbosBloom: body.verbosBloom, ano: body.ano,
        });

        const result = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.7 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}

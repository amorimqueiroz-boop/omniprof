import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptRotinaVisual } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            tipoRotina: string; turma: string; periodo: string;
            observacoes?: string; engine?: EngineId;
        }>(request);

        const prompt = promptRotinaVisual({
            tipoRotina: body.tipoRotina || "Rotina Diária",
            turma: body.turma || "", periodo: body.periodo || "Manhã",
            observacoes: body.observacoes,
        });

        const result = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.7 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}

import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptAtividadesLudicas } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            faixaEtaria: string; objetivo: string; espaco: string;
            materiais?: string; engine?: EngineId;
        }>(request);

        const prompt = promptAtividadesLudicas({
            faixaEtaria: body.faixaEtaria || "",
            objetivo: body.objetivo || "",
            espaco: body.espaco || "Sala de aula",
            materiais: body.materiais,
        });

        const result = await chatCompletionText(body.engine || "red", [{ role: "user", content: prompt }], { temperature: 0.7 });
        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}

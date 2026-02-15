import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { promptExperienciaEI } from "@/lib/hub-prompts";
import { parseBody, errorResponse } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await parseBody<{
            campoExperiencia: string;
            objetivos: string[];
            assuntoInteresse: string;
            engine?: EngineId;
        }>(request);

        const prompt = promptExperienciaEI({
            campoExperiencia: body.campoExperiencia || "",
            objetivos: body.objetivos || [],
            assuntoInteresse: body.assuntoInteresse || "",
        });

        const result = await chatCompletionText(
            body.engine || "red",
            [{ role: "user", content: prompt }],
            { temperature: 0.7 }
        );

        return NextResponse.json({ result });
    } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Erro interno.", 500);
    }
}

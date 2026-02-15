import { NextResponse } from "next/server";
import { createSupabaseServer, getUser } from "@/lib/supabase-auth";

// GET — retorna perfil + estatísticas de uso
export async function GET() {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const supabase = await createSupabaseServer();

    // Contagem de itens na biblioteca
    const { count: bibliotecaCount } = await supabase
        .from("omniprof_biblioteca")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    // Contagem de usos de IA
    const { count: usoCount } = await supabase
        .from("omniprof_uso_ia")
        .select("*", { count: "exact", head: true })
        .eq("professor_id", user.id);

    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || "",
            plan: user.user_metadata?.plan || "free",
            created_at: user.created_at,
        },
        stats: {
            biblioteca: bibliotecaCount || 0,
            geracoes: usoCount || 0,
        },
    });
}

// PATCH — atualizar nome
export async function PATCH(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    try {
        const body = await request.json();
        const { name } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
        }

        const supabase = await createSupabaseServer();
        const { error } = await supabase.auth.updateUser({
            data: { name: name.trim() },
        });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
    }
}

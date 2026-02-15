import { NextResponse } from "next/server";
import { createSupabaseServer, getUser } from "@/lib/supabase-auth";

// GET — listar itens salvos (paginação + filtro por ferramenta + busca)
export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const ferramenta = searchParams.get("ferramenta") || "";
    const busca = searchParams.get("busca") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const supabase = await createSupabaseServer();

    let query = supabase
        .from("omniprof_biblioteca")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (ferramenta) query = query.eq("ferramenta", ferramenta);
    if (busca) query = query.or(`titulo.ilike.%${busca}%,conteudo.ilike.%${busca}%`);

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ items: data || [], total: count || 0, page, limit });
}

// POST — salvar item na biblioteca
export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    try {
        const body = await request.json();
        const { ferramenta, titulo, conteudo, analise, tags } = body;

        if (!conteudo?.trim()) {
            return NextResponse.json({ error: "Conteúdo vazio." }, { status: 400 });
        }

        const supabase = await createSupabaseServer();
        const { data, error } = await supabase
            .from("omniprof_biblioteca")
            .insert({
                user_id: user.id,
                ferramenta: ferramenta || "geral",
                titulo: titulo || `Conteúdo ${new Date().toLocaleDateString("pt-BR")}`,
                conteudo,
                analise: analise || "",
                tags: tags || [],
            })
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ item: data });
    } catch (err) {
        return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
    }
}

// DELETE — remover item
export async function DELETE(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID necessário." }, { status: 400 });

    const supabase = await createSupabaseServer();
    const { error } = await supabase
        .from("omniprof_biblioteca")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

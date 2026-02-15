"use client";

import { useState, useEffect, useCallback } from "react";
import { FERRAMENTAS } from "@/lib/constants";
import { PageHero } from "@/components/PageHero";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import {
    Library, Search, Trash2, ChevronDown, ChevronUp,
    FileText, Clock, Filter, Loader2, BookOpen,
} from "lucide-react";

type BibliotecaItem = {
    id: string;
    ferramenta: string;
    titulo: string;
    conteudo: string;
    analise: string;
    tags: string[];
    created_at: string;
};

const TOOL_LABELS: Record<string, string> = {};
FERRAMENTAS.forEach((f) => { TOOL_LABELS[f.id] = f.label; });

export default function BibliotecaPage() {
    const [items, setItems] = useState<BibliotecaItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [filtroTool, setFiltroTool] = useState("");
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (busca) params.set("busca", busca);
            if (filtroTool) params.set("ferramenta", filtroTool);
            params.set("page", String(page));

            const res = await fetch(`/api/biblioteca?${params}`);
            const data = await res.json();
            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [busca, filtroTool, page]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    async function handleDelete(id: string) {
        setDeleting(id);
        try {
            await fetch(`/api/biblioteca?id=${id}`, { method: "DELETE" });
            setItems((prev) => prev.filter((i) => i.id !== id));
            setTotal((prev) => prev - 1);
        } catch { /* ignore */ }
        setDeleting(null);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        fetchItems();
    }

    const totalPages = Math.ceil(total / 20);

    return (
        <div className="w-full animate-fade-in-up space-y-6">
            <PageHero
                icon={Library}
                title="Biblioteca"
                desc="Seus conteúdos salvos — acesse, revise e reutilize materiais gerados com IA."
                color="blue"
            />

            <div className="hub-panel hub-panel-cyan p-4 sm:p-5 rounded-2xl">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por título ou conteúdo..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6B8A]/30"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={filtroTool}
                            onChange={(e) => { setFiltroTool(e.target.value); setPage(1); }}
                            className="pl-8 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2B6B8A]/30 appearance-none cursor-pointer"
                        >
                            <option value="">Todas as ferramentas</option>
                            {FERRAMENTAS.map((f) => (
                                <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-gradient-to-r from-[#2B6B8A] to-[#1E4F6A] text-white rounded-xl text-sm font-medium hover:from-[#1E4F6A] hover:to-[#163F55] transition-all"
                    >
                        Buscar
                    </button>
                </form>
            </div>

            {/* Results */}
            <div className="mt-6 space-y-4">
                {loading ? (
                    <div className="text-center py-16">
                        <Loader2 size={28} className="mx-auto text-[#3D8CB0] animate-spin" />
                        <p className="text-sm text-slate-500 mt-3">Carregando biblioteca...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">Nenhum conteúdo salvo</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Use as ferramentas e clique em &quot;Salvar na Biblioteca&quot; para guardar seus melhores resultados.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-slate-500">
                            {total} {total === 1 ? "item" : "itens"} encontrado{total !== 1 ? "s" : ""}
                        </p>
                        {items.map((item) => {
                            const isExpanded = expandedId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`hub-panel rounded-2xl bg-white transition-all duration-200 ${isExpanded ? "ring-1 ring-[#2B6B8A]/20" : ""}`}
                                    style={isExpanded ? { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } : undefined}
                                >
                                    <div
                                        className="flex items-center gap-3 p-4 cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[#EDF5F9] flex items-center justify-center flex-shrink-0">
                                            <FileText size={18} className="text-[#2B6B8A]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm text-slate-800 truncate">
                                                {item.titulo || "Sem título"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs px-2 py-0.5 bg-[#EDF5F9] text-[#2B6B8A] rounded-full font-medium">
                                                    {TOOL_LABELS[item.ferramenta] || item.ferramenta}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                disabled={deleting === item.id}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remover"
                                            >
                                                {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            </button>
                                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-slate-100">
                                            {item.analise && (
                                                <div className="mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                                    <p className="text-xs font-semibold text-amber-700 mb-1">📊 Análise Pedagógica</p>
                                                    <FormattedTextDisplay texto={item.analise} />
                                                </div>
                                            )}
                                            <div className="mt-3">
                                                <FormattedTextDisplay texto={item.conteudo} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${p === page
                                            ? "bg-[#2B6B8A] text-white shadow-sm"
                                            : "bg-white text-slate-600 border border-slate-200 hover:bg-[#EDF5F9]"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

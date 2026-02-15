"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FERRAMENTAS, SEGMENTOS, getFerramentasPorSegmento, type SegmentoId } from "@/lib/constants";
import { PageHero } from "@/components/PageHero";
import {
    Sparkles, BookOpen, Users, MessageCircle, Network, Image as ImageIcon,
    FileEdit, Scissors, Clock, Gamepad2, ListOrdered, Star, Wrench, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
    Sparkles, BookOpen, Users, MessageCircle, Network,
    Image: ImageIcon, FileEdit, Scissors, Clock, Gamepad2, ListOrdered, Star,
};

const SEGMENTO_STORAGE_KEY = "omniprof_segmento";

function ToolCard({
    tool,
    segmento,
}: {
    tool: { id: string; label: string; icon: string; description: string; color: string };
    segmento: SegmentoId;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = ICON_MAP[tool.icon] || Sparkles;
    const href = `/ferramentas/${tool.id}${segmento ? `?segmento=${segmento}` : ""}`;

    return (
        <Link
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hub-panel ferramentas-card group text-left p-6 rounded-2xl transition-all duration-300 min-h-[168px] flex flex-col no-underline text-inherit"
            style={{
                boxShadow: isHovered ? "var(--shadow-md)" : "var(--shadow-sm)",
                transform: isHovered ? "scale(1.01)" : undefined,
                background: "var(--surface-1)",
                borderColor: "var(--border-light)",
            }}
        >
            <div
                className="ferramentas-card-icon rounded-xl flex items-center justify-center backdrop-blur-sm shadow-md relative z-10 transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 mb-4"
                style={{ width: "72px", height: "72px", padding: "8px", background: "var(--surface-2)" }}
            >
                <Icon className="w-9 h-9 transition-colors duration-300" style={{ color: tool.color }} />
            </div>
            <div className="font-bold text-[15px] leading-tight ferramentas-card-title">{tool.label}</div>
            <div className="text-[13px] mt-1.5 leading-snug ferramentas-card-desc">{tool.description}</div>
        </Link>
    );
}

export default function FerramentasPage() {
    const [segmento, setSegmento] = useState<SegmentoId>("EFAI");

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(SEGMENTO_STORAGE_KEY) as SegmentoId | null;
            if (saved && SEGMENTOS.some((s) => s.id === saved)) setSegmento(saved);
        } catch {
            // ignore
        }
    }, []);

    const handleSegmentoChange = (id: SegmentoId) => {
        setSegmento(id);
        try {
            sessionStorage.setItem(SEGMENTO_STORAGE_KEY, id);
        } catch {
            // ignore
        }
    };

    const ferramentasFiltradas = getFerramentasPorSegmento(segmento);
    const isEI = segmento === "EI";

    return (
        <div className="w-full space-y-6 animate-fade-in-up">
            <PageHero
                icon={Wrench}
                title="Ferramentas"
                desc={isEI
                    ? "Recursos para Educação Infantil — experiências, rotinas e atividades lúdicas."
                    : "Recursos para Ensino Fundamental e Médio — planos, atividades, provas e mais."}
                color="blue"
            />

            {/* Seletor de segmento — estilo Omnisfera */}
            <div className="hub-panel hub-panel-cyan p-4 sm:p-5 rounded-2xl segmento-panel" style={{ borderColor: "var(--border-light)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide shrink-0 segmento-label">
                        Etapa de Ensino
                    </span>
                    <div
                        className="grid gap-2 w-full sm:max-w-2xl"
                        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
                    >
                        {SEGMENTOS.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => handleSegmentoChange(s.id)}
                                className={`py-2.5 rounded-xl text-sm font-semibold transition-all min-w-0 ${
                                    segmento === s.id ? "segmento-btn-active" : "segmento-btn-inactive"
                                }`}
                                style={
                                    segmento === s.id
                                        ? {
                                            background: "linear-gradient(135deg, #2B6B8A, #3D8CB0)",
                                            color: "white",
                                            boxShadow: "0 2px 8px rgba(43, 107, 138, 0.35)",
                                            border: "none",
                                        }
                                        : undefined
                                }
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {ferramentasFiltradas.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} segmento={segmento} />
                ))}
            </section>
        </div>
    );
}

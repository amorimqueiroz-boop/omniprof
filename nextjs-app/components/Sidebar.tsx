"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
    Sparkles, BookOpen, Users, MessageCircle, Network, Image as ImageIcon,
    FileEdit, Scissors, Clock, Gamepad2, ListOrdered, Library, User,
    ChevronLeft, ChevronRight, LogOut, Wrench
} from "lucide-react";

/* ── Gradient colors per tool (Omnisfera-style) ── */
const ROUTE_COLORS: Record<string, { from: string; to: string }> = {
    "/ferramentas": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/criar-itens": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/plano-aula": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/dinamica": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/sequencia-didatica": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/papo-mestre": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/mapa-mental": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/adaptar-prova": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/adaptar-atividade": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/estudio-visual": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/rotina-visual": { from: "#2B6B8A", to: "#3D8CB0" },
    "/ferramentas/atividades-ludicas": { from: "#2B6B8A", to: "#3D8CB0" },
    "/biblioteca": { from: "#2B6B8A", to: "#3D8CB0" },
    "/perfil": { from: "#64748b", to: "#94a3b8" },
};

const NAV_ITEMS = [
    { href: "/ferramentas", label: "Ferramentas", icon: Wrench },
    { type: "divider" as const, label: "FERRAMENTAS" },
    { href: "/ferramentas/criar-itens", label: "Criar Itens", icon: Sparkles },
    { href: "/ferramentas/plano-aula", label: "Plano de Aula", icon: BookOpen },
    { href: "/ferramentas/dinamica", label: "Dinâmica", icon: Users },
    { href: "/ferramentas/sequencia-didatica", label: "Seq. Didática", icon: ListOrdered },
    { href: "/ferramentas/papo-mestre", label: "Papo de Mestre", icon: MessageCircle },
    { href: "/ferramentas/mapa-mental", label: "Mapa Mental", icon: Network },
    { href: "/ferramentas/adaptar-prova", label: "Adaptar Prova", icon: FileEdit },
    { href: "/ferramentas/adaptar-atividade", label: "Adaptar Atividade", icon: Scissors },
    { href: "/ferramentas/estudio-visual", label: "Estúdio Visual", icon: ImageIcon },
    { href: "/ferramentas/rotina-visual", label: "Rotina Visual", icon: Clock },
    { href: "/ferramentas/atividades-ludicas", label: "Ativ. Lúdicas", icon: Gamepad2 },
    { type: "divider" as const, label: "MAIS" },
    { href: "/biblioteca", label: "Biblioteca", icon: Library },
    { href: "/perfil", label: "Perfil", icon: User },
] as const;

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [userName, setUserName] = useState("Professor");

    // Fetch user name from Supabase
    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
        supabase.auth.getUser().then(({ data }) => {
            const name = data.user?.user_metadata?.name || data.user?.email?.split("@")[0] || "Professor";
            setUserName(name);
        });
    }, []);

    async function handleLogout() {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
        await supabase.auth.signOut();
        window.location.href = "/login";
    }

    const initials = userName
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <aside style={{
            width: collapsed ? 68 : 250,
            minHeight: "100vh",
            background: "linear-gradient(180deg, #1e1b4b 0%, #1a1744 50%, #151238 100%)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)",
            position: "sticky",
            top: 0,
            flexShrink: 0,
            overflow: "hidden",
            boxShadow: "4px 0 24px rgba(0, 0, 0, 0.15)",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                padding: collapsed ? "20px 12px" : "20px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                {!collapsed && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: "linear-gradient(135deg, #2B6B8A, #3D8CB0)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 2px 10px rgba(43, 107, 138, 0.4)",
                            }}>
                                <Sparkles size={17} color="white" />
                            </div>
                            {/* Pulsing online dot */}
                            <div style={{
                                position: "absolute", top: -2, right: -2,
                                width: 10, height: 10,
                                borderRadius: "50%",
                                background: "#10b981",
                                border: "2px solid #1e1b4b",
                                animation: "omni-pulse 2s ease-in-out infinite",
                            }} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>OmniProf</span>
                    </div>
                )}
                {collapsed && (
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: "linear-gradient(135deg, #2B6B8A, #3D8CB0)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 10px rgba(43, 107, 138, 0.4)",
                        }}>
                            <Sparkles size={17} color="white" />
                        </div>
                        <div style={{
                            position: "absolute", top: -2, right: -2,
                            width: 10, height: 10,
                            borderRadius: "50%",
                            background: "#10b981",
                            border: "2px solid #1e1b4b",
                            animation: "omni-pulse 2s ease-in-out infinite",
                        }} />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expandir" : "Recolher"}
                    style={{
                        background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8,
                        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "rgba(255,255,255,0.5)",
                        transition: "all 200ms ease",
                        marginLeft: collapsed ? 0 : undefined,
                        position: collapsed ? "absolute" : undefined,
                        right: collapsed ? 4 : undefined,
                        top: collapsed ? 56 : undefined,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
                {NAV_ITEMS.map((item, i) => {
                    if ("type" in item && item.type === "divider") {
                        if (collapsed) return <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 8px" }} />;
                        return (
                            <div key={i} style={{
                                fontSize: "0.63rem", color: "rgba(255,255,255,0.25)", padding: "14px 14px 6px",
                                fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                            }}>
                                {item.label}
                            </div>
                        );
                    }

                    if (!("href" in item)) return null;
                    const isActive = pathname === item.href || (item.href !== "/ferramentas" && pathname.startsWith(item.href));
                    const isHovered = hoveredIdx === i;
                    const Icon = item.icon;
                    const colors = ROUTE_COLORS[item.href] || { from: "#2B6B8A", to: "#3D8CB0" };

                    return (
                        <Link
                            key={i}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            style={{
                                display: "flex", alignItems: "center", gap: 11,
                                padding: collapsed ? "10px 0" : "9px 14px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                borderRadius: 10,
                                background: isActive
                                    ? `linear-gradient(135deg, ${colors.from}, ${colors.to})`
                                    : isHovered
                                        ? "rgba(255,255,255,0.06)"
                                        : "transparent",
                                color: isActive ? "white" : isHovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
                                textDecoration: "none",
                                fontSize: "0.84rem",
                                fontWeight: isActive ? 650 : 450,
                                transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                                marginBottom: 2,
                                boxShadow: isActive ? `0 2px 8px ${colors.from}66` : "none",
                                position: "relative",
                            }}
                        >
                            <Icon size={18} style={{
                                flexShrink: 0,
                                filter: isActive ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" : "none",
                            }} />
                            {!collapsed && (
                                <span style={{
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                                }}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div style={{
                padding: "14px 10px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.15)",
            }}>
                {/* User info */}
                {!collapsed && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "0 6px", marginBottom: 10,
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "linear-gradient(135deg, #2B6B8A, #3D8CB0)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 700, color: "white",
                            boxShadow: "0 2px 6px rgba(43, 107, 138, 0.3)",
                            flexShrink: 0,
                            border: "2px solid rgba(255,255,255,0.15)",
                        }}>
                            {initials}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                            <div style={{
                                fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.9)",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                                {userName}
                            </div>
                            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>
                                Professor
                            </div>
                        </div>
                    </div>
                )}

                {collapsed && (
                    <div style={{
                        display: "flex", justifyContent: "center", marginBottom: 8,
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "linear-gradient(135deg, #2B6B8A, #3D8CB0)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.65rem", fontWeight: 700, color: "white",
                            border: "2px solid rgba(255,255,255,0.15)",
                        }}>
                            {initials}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    title="Sair"
                    style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: collapsed ? "8px 0" : "8px 14px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        background: "none", border: "none", borderRadius: 8,
                        color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "0.82rem",
                        transition: "all 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#f87171";
                        (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                        (e.currentTarget as HTMLElement).style.background = "none";
                    }}
                >
                    <LogOut size={16} />
                    {!collapsed && "Sair"}
                </button>
            </div>
        </aside>
    );
}

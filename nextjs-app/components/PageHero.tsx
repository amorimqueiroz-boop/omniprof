"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

// Color palette matching Omnisfera's getColorClasses
const COLOR_MAP: Record<string, { bg: string; text: string; accent: string }> = {
    blue: { bg: "#EDF5F9", text: "#2B6B8A", accent: "#3D8CB0" },
    cyan: { bg: "#ecfeff", text: "#0891b2", accent: "#06b6d4" },
    violet: { bg: "#EDF5F9", text: "#2B6B8A", accent: "#3D8CB0" },
    rose: { bg: "#FDF2F2", text: "#D94F4F", accent: "#E87272" },
    emerald: { bg: "#ecfdf5", text: "#059669", accent: "#10b981" },
    amber: { bg: "#fffbeb", text: "#d97706", accent: "#f59e0b" },
    red: { bg: "#FDF2F2", text: "#D94F4F", accent: "#E87272" },
    indigo: { bg: "#EDF5F9", text: "#1E4F6A", accent: "#2B6B8A" },
    teal: { bg: "#f0fdfa", text: "#0d9488", accent: "#14b8a6" },
    orange: { bg: "#fff7ed", text: "#ea580c", accent: "#f97316" },
    sky: { bg: "#f0f9ff", text: "#0284c7", accent: "#0ea5e9" },
    slate: { bg: "#f8fafc", text: "#475569", accent: "#64748b" },
};

type PageHeroProps = {
    icon: LucideIcon;
    title: string;
    desc: string;
    color?: string;
};

export function PageHero({ icon: Icon, title, desc, color = "blue" }: PageHeroProps) {
    const colors = COLOR_MAP[color] || COLOR_MAP.blue;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="hub-panel page-hero group rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up"
            style={{
                backgroundColor: colors.bg,
                boxShadow: isHovered ? "var(--shadow-md)" : "var(--shadow-sm)",
                border: "1px solid var(--border-light)",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="h-1 w-full page-hero-accent"
                style={{ background: `linear-gradient(to right, ${colors.text}, ${colors.accent})` }}
            />
            <div className="flex items-center gap-6 h-[116px] px-6 md:px-8">
                <div
                    className="page-hero-icon rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-105 flex-shrink-0"
                    style={{
                        width: "56px",
                        height: "56px",
                        padding: "6px",
                        boxShadow: "var(--shadow-sm)",
                        background: "var(--surface-2)",
                        color: colors.text,
                    }}
                >
                    <Icon className="transition-all duration-300" style={{ color: "inherit" }} size={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="page-hero-title text-xl md:text-2xl font-extrabold mb-0.5 tracking-tight" style={{ color: colors.text }}>
                        {title}
                    </h1>
                    <p className="text-[13px] leading-relaxed page-hero-desc">{desc}</p>
                </div>
            </div>
        </div>
    );
}

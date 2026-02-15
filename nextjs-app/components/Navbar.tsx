"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
    Wrench, Library, User,
    LogOut, type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
    { href: "/ferramentas", label: "Ferramentas", icon: Wrench },
    { href: "/biblioteca", label: "Biblioteca", icon: Library },
    { href: "/perfil", label: "Perfil", icon: User },
];

/* Brand‑aligned pill colors */
const NAV_ROUTE_COLORS: Record<string, { from: string; to: string }> = {
    "/ferramentas": { from: "#2B6B8A", to: "#3D8CB0" },   // brand-blue
    "/biblioteca": { from: "#D94F4F", to: "#E87272" },     // brand-red
    "/perfil": { from: "#64748b", to: "#475569" },         // neutral slate
};

function NavItemPill({ item, isActive }: { item: NavItem; isActive: boolean }) {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = item.icon;
    const routeColor = NAV_ROUTE_COLORS[item.href] || { from: "#2B6B8A", to: "#3D8CB0" };

    return (
        <Link
            href={item.href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold whitespace-nowrap flex-shrink-0 ${isActive
                ? "text-white shadow-lg"
                : "nav-pill-inactive"
                }`}
            style={{
                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                ...(isActive ? {
                    background: `linear-gradient(135deg, ${routeColor.from}, ${routeColor.to})`,
                    boxShadow: `0 4px 12px ${routeColor.from}40`,
                } : {}),
            }}
        >
            <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-300 ${isActive ? "text-white" : "nav-pill-icon"}`}
                style={!isActive && isHovered ? { color: "var(--text-dark)" } : undefined}
            />
            <span>{item.label}</span>
        </Link>
    );
}

function NavSeparator() {
    return <div className="w-1 h-1 rounded-full mx-3 flex-shrink-0 nav-sep" />;
}

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [userName, setUserName] = useState("Professor");

    useEffect(() => {
        setIsMounted(true);
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

    const initials = (userName || "U")
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    function isActiveRoute(href: string): boolean {
        if (href === "/ferramentas") {
            return pathname === "/ferramentas" || pathname.startsWith("/ferramentas/");
        }
        return pathname === href;
    }

    // Skeleton navbar during SSR
    if (!isMounted) {
        return (
            <header className="navbar-header glass-strong border-b sticky top-0 z-50" style={{ borderColor: "var(--border-light)", boxShadow: "var(--shadow-xs)" }}>
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex items-center justify-between h-[68px]">
                        <Link href="/ferramentas" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl font-bold flex-shrink-0" style={{ color: "var(--text-dark)" }}>
                            <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse" />
                            <div className="w-24 h-5 bg-slate-100 rounded animate-pulse" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-2">
                            <div className="w-24 h-8 bg-slate-100 rounded-xl animate-pulse" />
                            <div className="w-24 h-8 bg-slate-100 rounded-xl animate-pulse" />
                            <div className="w-24 h-8 bg-slate-100 rounded-xl animate-pulse" />
                        </nav>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-9 h-9 bg-slate-100 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="navbar-header glass-strong border-b sticky top-0 z-50" style={{ borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex items-center justify-between h-[68px]">
                    {/* Logo — real brand logo */}
                    <Link
                        href="/ferramentas"
                        className="flex items-center px-2 py-1.5 rounded-xl transition-all group flex-shrink-0 nav-logo-hover"
                    >
                        <Image
                            src="/logo-horizontal.png"
                            alt="OmniProf"
                            width={144}
                            height={36}
                            className="group-hover:scale-[1.02] transition-transform"
                            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
                            priority
                        />
                    </Link>

                    {/* Navegação */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item, i) => (
                            <div key={item.href} className="flex items-center">
                                {i > 0 && <NavSeparator />}
                                <NavItemPill item={item} isActive={isActiveRoute(item.href)} />
                            </div>
                        ))}
                    </nav>

                    {/* Mobile dropdown */}
                    <div className="md:hidden flex items-center gap-2 ml-2 flex-shrink-0">
                        <select
                            value={isActiveRoute("/ferramentas") ? "/ferramentas" : pathname}
                            onChange={(e) => router.push(e.target.value)}
                            className="text-sm px-3 py-2 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#2B6B8A]/30 nav-mobile-select"
                            style={{ borderColor: 'var(--border-light)', background: 'var(--surface-1)', color: 'var(--text-dark)' }}
                        >
                            {NAV_ITEMS.map((item) => (
                                <option key={item.href} value={item.href}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tema + User Info & Logout */}
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <ThemeToggle />
                        <div className="hidden md:flex flex-col items-end text-right">
                            <span className="text-[13px] font-semibold leading-tight nav-user-name">{userName}</span>
                            <span className="text-[11px] font-medium nav-user-role">Professor</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white"
                                style={{ background: 'linear-gradient(135deg, #2B6B8A, #3D8CB0)' }}
                            >
                                {initials}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all nav-logout"
                                title="Sair"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden md:inline">Sair</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

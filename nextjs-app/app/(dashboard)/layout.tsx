import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-auth";
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        const user = await getUser();
        if (!user) redirect("/login");
    } catch {
        redirect("/login");
    }

    return (
        <div className="min-h-screen flex flex-col dashboard-bg">
            <Navbar />
            <main className="w-full px-6 py-6 flex-1">{children}</main>
        </div>
    );
}

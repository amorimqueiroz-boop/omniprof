import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "OmniProf | Ferramentas Inteligentes para Professores",
  description: "Crie planos de aula, atividades, provas e muito mais com inteligência artificial. A plataforma do professor moderno.",
};

const themeScript = `
(function(){
  var t = localStorage.getItem('omniprof_theme');
  var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

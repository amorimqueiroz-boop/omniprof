import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Zap, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image
            src="/logo-icon.png"
            alt="OmniProf"
            width={36}
            height={36}
            className="drop-shadow-sm"
            priority
          />
          <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>
            <span style={{ color: "#D94F4F" }}>Omni</span>
            <span style={{ color: "#2B6B8A" }}>Prof</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/login" className="landing-btn secondary">
            Entrar
          </Link>
          <Link href="/cadastro" className="landing-btn primary">
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <Image
          src="/logo-styled.png"
          alt="OmniProf"
          width={360}
          height={90}
          className="mx-auto mb-8"
          style={{ objectFit: "contain" }}
          priority
        />
        <div className="landing-hero-pill">
          ✨ Inteligência Artificial para Professores
        </div>
        <h1 className="landing-hero-title">
          Crie materiais didáticos em minutos, não em horas
        </h1>
        <p className="landing-hero-desc">
          11 ferramentas com IA para criar planos de aula, atividades, provas, mapas mentais,
          sequências didáticas e muito mais — tudo alinhado à BNCC.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/cadastro" className="landing-cta primary">
            Começar Grátis →
          </Link>
          <Link href="#ferramentas" className="landing-cta secondary">
            Ver Ferramentas
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        {[
          { icon: <BookOpen size={22} />, label: "11 Ferramentas", sub: "com IA" },
          { icon: <Users size={22} />, label: "BNCC", sub: "EI, EF e EM" },
          { icon: <Zap size={22} />, label: "5 Motores IA", sub: "DeepSeek, Claude, Gemini..." },
        ].map((s, i) => (
          <div key={i} className="landing-stat-item">
            <div className="landing-stat-icon">{s.icon}</div>
            <div className="landing-stat-label">{s.label}</div>
            <div className="landing-stat-sub">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Tools Grid */}
      <section id="ferramentas" className="landing-tools">
        <h2 className="landing-tools-title">
          Ferramentas que transformam seu planejamento
        </h2>
        <div className="landing-tools-grid">
          {[
            { name: "Criar Itens", desc: "Construção de atividades com critérios pedagógicos, BNCC e Bloom.", color: "#2B6B8A" },
            { name: "Plano de Aula", desc: "Planos completos com metodologia ativa e habilidades BNCC.", color: "#2B6B8A" },
            { name: "Dinâmica", desc: "Dinâmicas de grupo para engajar toda a turma.", color: "#2B6B8A" },
            { name: "Sequência Didática", desc: "Sequências completas de conteúdo aula a aula.", color: "#2B6B8A" },
            { name: "Papo de Mestre", desc: "Quebra-gelo e introduções criativas.", color: "#2B6B8A" },
            { name: "Mapa Mental", desc: "Mapas mentais estruturados para qualquer tema.", color: "#2B6B8A" },
            { name: "Adaptar Prova", desc: "Adapte provas com checklist pedagógico.", color: "#2B6B8A" },
            { name: "Adaptar Atividade", desc: "Adapte atividades com diferenciação pedagógica.", color: "#2B6B8A" },
            { name: "Estúdio Visual", desc: "Ilustrações educacionais geradas por IA.", color: "#2B6B8A" },
          ].map((tool, i) => (
            <div key={i} className="landing-card">
              <div className="landing-card-icon" style={{ color: tool.color }}>
                <Sparkles size={22} />
              </div>
              <h3 className="landing-card-title">{tool.name}</h3>
              <p className="landing-card-desc">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <Image src="/logo-flat.png" alt="OmniProf" width={28} height={28} />
          <span style={{ fontWeight: 700 }}>
            <span style={{ color: "#D94F4F" }}>Omni</span>
            <span style={{ color: "#2B6B8A" }}>Prof</span>
          </span>
        </div>
        Ferramentas inteligentes para professores. © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

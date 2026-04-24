import { useEffect, useState } from "react";

const PILLARS = [
  { icon: "⬡", label: "Governed", desc: "Every claim is owned, contested, and revocable by design" },
  { icon: "⊕", label: "Traceable", desc: "Every output carries its full provenance chain" },
  { icon: "◎", label: "Tacit-aware", desc: "Implicit expertise is first-class evidence, not second-class story" },
  { icon: "⊞", label: "Compounding", desc: "Collective intelligence grows through governed update cycles" },
];

const DOMAINS = [
  { id: "drug_discovery",         label: "Drug Discovery",       color: "#3b82f6" },
  { id: "fukushima_governance",   label: "Governance",           color: "#f97316" },
  { id: "euv_lithography",        label: "EUV Operations",       color: "#22c55e" },
  { id: "climate_policy",         label: "Climate Policy",       color: "#06b6d4" },
  { id: "extreme_environments",   label: "Extreme Environments", color: "#ef4444" },
  { id: "aviation_safety",        label: "Aviation Safety",      color: "#94a3b8" },
  { id: "pandemic_governance",    label: "Pandemic Governance",  color: "#a855f7" },
];

const THESIS_LINES = [
  "Intelligence is not a single mind.",
  "It is an ecology of knowing.",
  "It is governed, traceable, and distributed.",
  "It compounds over time.",
  "Omega is the substrate.",
];

interface Props {
  onEnter: () => void;
  onEnterDecision?: () => void;
  demoMode: boolean;
}

export function LandingView({ onEnter, onEnterDecision, demoMode }: Props) {
  const [lineIdx, setLineIdx] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (lineIdx < THESIS_LINES.length - 1) {
      const t = setTimeout(() => setLineIdx(i => i + 1), 900);
      return () => clearTimeout(t);
    }
  }, [lineIdx]);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(onEnter, 600);
  };

  const handleEnterDecision = () => {
    setEntered(true);
    setTimeout(() => onEnterDecision?.(), 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "#020610",
        opacity: entered ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Star field */}
      <StarField />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Core content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-8">

        {/* Logo mark */}
        <div className="mb-8">
          <OmegaGlyph />
        </div>

        {/* Brand */}
        <div className="mb-2">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "#6366f1" }}
          >
            Collective Intelligence Substrate
          </span>
        </div>
        <h1
          className="text-6xl font-bold tracking-tight mb-8"
          style={{ color: "#f8fafc", letterSpacing: "-0.02em" }}
        >
          Omega
        </h1>

        {/* Animated thesis */}
        <div className="h-12 mb-10">
          <p
            className="text-lg text-slate-300 transition-all duration-700"
            style={{ opacity: lineIdx >= 0 ? 1 : 0, transform: `translateY(0)` }}
          >
            {THESIS_LINES[lineIdx]}
          </p>
        </div>

        {/* Four pillars */}
        <div className="grid grid-cols-4 gap-4 mb-10 w-full">
          {PILLARS.map((p, i) => (
            <div
              key={p.label}
              className="rounded-xl p-4 transition-all duration-500"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: lineIdx >= 2 + i * 0.3 ? 1 : 0,
                transform: lineIdx >= 2 ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`,
              }}
            >
              <div className="text-2xl mb-2" style={{ color: "#6366f1" }}>{p.icon}</div>
              <div className="text-xs font-semibold text-slate-200 mb-1">{p.label}</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Domain range */}
        <div className="flex items-center gap-6 mb-10">
          {DOMAINS.map(d => (
            <div key={d.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>

        {/* Not-list */}
        <div
          className="flex items-center gap-6 mb-10 text-[11px] text-slate-600"
          style={{ opacity: lineIdx >= 3 ? 1 : 0, transition: "opacity 0.5s 0.3s" }}
        >
          <span className="line-through">Monolithic AGI</span>
          <span className="text-slate-700">·</span>
          <span className="line-through">Generic agent wrapper</span>
          <span className="text-slate-700">·</span>
          <span className="line-through">Chat UI with a graph</span>
          <span className="text-slate-700">·</span>
          <span className="line-through">Prettier RAG</span>
        </div>

        {/* Entry buttons */}
        <div className="flex items-center gap-4"
          style={{
            opacity: lineIdx >= 3 ? 1 : 0,
            transform: lineIdx >= 3 ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.4s 0.2s",
          }}>
          {/* Primary: Decision Board */}
          <button
            onClick={handleEnterDecision}
            className="group relative px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.5)",
              color: "#fb923c",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(249,115,22,0.28)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fdba74";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(249,115,22,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fb923c";
            }}
          >
            ▶ Show me a hard decision
          </button>

          {/* Secondary: Explore */}
          <button
            onClick={handleEnter}
            className="group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#6366f1",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(99,102,241,0.18)";
              (e.currentTarget as HTMLButtonElement).style.color = "#818cf8";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(99,102,241,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#6366f1";
            }}
          >
            Explore the substrate →
          </button>
        </div>

        {demoMode && (
          <p className="text-[10px] text-slate-600 mt-4">
            Operating in demo mode · No backend required
          </p>
        )}

        {/* Research attribution */}
        <div className="mt-8 flex items-center gap-2"
          style={{ opacity: lineIdx >= 4 ? 0.4 : 0, transition: "opacity 0.6s 0.5s" }}>
          <div className="h-px w-8" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
          <span className="text-[10px] text-slate-700 tracking-widest uppercase">
            A Cross Labs × Cognisee research prototype
          </span>
          <div className="h-px w-8" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(transparent, #020610)" }}
      />
    </div>
  );
}

function OmegaGlyph() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {/* Outer ring */}
      <circle cx="36" cy="36" r="34" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" opacity={0.3} />
      {/* Middle hexagon */}
      <polygon
        points="36,6 62,21 62,51 36,66 10,51 10,21"
        fill="none" stroke="#6366f1" strokeWidth="1.5" opacity={0.6}
      />
      {/* Inner hexagon */}
      <polygon
        points="36,16 54,26 54,46 36,56 18,46 18,26"
        fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="1"
      />
      {/* Core */}
      <circle cx="36" cy="36" r="6" fill="#6366f1" opacity={0.9} />
      <circle cx="36" cy="36" r="10" fill="none" stroke="#6366f1" strokeWidth="1" opacity={0.4} />
      {/* Node connection dots */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 36 + 22 * Math.cos(rad);
        const y = 36 + 22 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="2" fill="#6366f1" opacity={0.7} />;
      })}
    </svg>
  );
}

function StarField() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.5 + 0.3,
    opacity: Math.random() * 0.5 + 0.1,
    animDuration: Math.random() * 4 + 3,
  }));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }}>
      {stars.map(s => (
        <circle
          key={s.id}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="white"
          opacity={s.opacity}
        >
          <animate
            attributeName="opacity"
            values={`${s.opacity};${s.opacity * 0.3};${s.opacity}`}
            dur={`${s.animDuration}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

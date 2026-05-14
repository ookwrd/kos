import { useEffect, useState } from "react";

export function CogniseeGlyph({ size = 28, color = "var(--accent)", opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ opacity }}>
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.2" opacity="0.7" />
      <path d="M 14,2 Q 14,14 4,20"  stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 4,20 Q 14,14 24,20" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 24,20 Q 14,14 14,2" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="2"  r="2.2" fill={color} />
      <circle cx="4"  cy="20" r="2.2" fill={color} />
      <circle cx="24" cy="20" r="2.2" fill={color} />
    </svg>
  );
}

const PILLARS = [
  { icon: "⬡", label: "Governed",    desc: "Every claim is owned, contested, and revocable by design" },
  { icon: "⊕", label: "Traceable",   desc: "Every output carries its full provenance chain" },
  { icon: "◎", label: "Tacit-aware", desc: "Implicit expertise is first-class evidence, not second-class story" },
  { icon: "⊞", label: "Compounding", desc: "Collective intelligence grows through governed update cycles" },
];

const DOMAINS = [
  { id: "drug_discovery",       label: "Drug Discovery",       color: "#3b82f6" },
  { id: "fukushima_governance", label: "Governance",           color: "#f97316" },
  { id: "euv_lithography",      label: "EUV Operations",       color: "#22c55e" },
  { id: "climate_policy",       label: "Climate Policy",       color: "#06b6d4" },
  { id: "extreme_environments", label: "Extreme Environments", color: "#ef4444" },
  { id: "aviation_safety",      label: "Aviation Safety",      color: "#94a3b8" },
  { id: "pandemic_governance",  label: "Pandemic Governance",  color: "#a855f7" },
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
  onEnterTheater?: () => void;
  demoMode: boolean;
}

export function LandingView({ onEnter, onEnterDecision, onEnterTheater, demoMode }: Props) {
  const [lineIdx, setLineIdx] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (lineIdx < THESIS_LINES.length - 1) {
      const t = setTimeout(() => setLineIdx(i => i + 1), 900);
      return () => clearTimeout(t);
    }
  }, [lineIdx]);

  const handleEnter = () => { setEntered(true); setTimeout(onEnter, 600); };
  const handleEnterDecision = () => { setEntered(true); setTimeout(() => onEnterDecision?.(), 600); };
  const handleEnterTheater  = () => { setEntered(true); setTimeout(() => onEnterTheater?.(), 600); };

  const mono: React.CSSProperties = { fontFamily: '"IBM Plex Mono", monospace' };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "var(--bg-field)",
        backgroundColor: "var(--bg)",
        opacity: entered ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Star field — hidden in light mode via CSS */}
      <StarField />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none landing-glow" />

      {/* Core content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-8">

        {/* Logo mark */}
        <div className="mb-8" style={{ filter: "drop-shadow(0 0 28px color-mix(in srgb, var(--accent) 40%, transparent))" }}>
          <CogniseeGlyph size={72} />
        </div>

        {/* Eyebrow */}
        <div className="mb-3">
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--accent)", ...mono }}>
            Collective Intelligence Substrate
          </span>
        </div>

        {/* Brand name */}
        <h1 style={{
          margin: "0 0 28px",
          color: "var(--text)",
          fontFamily: '"Newsreader", Georgia, serif',
          fontSize: "clamp(3rem, 8vw, 4.5rem)",
          fontWeight: 400,
          lineHeight: 1.04,
          letterSpacing: "-0.032em",
        }}>
          Omega
        </h1>

        {/* Animated thesis */}
        <div style={{ height: 44, marginBottom: 36, display: "flex", alignItems: "center" }}>
          <p style={{
            margin: 0,
            fontSize: "1.08rem",
            lineHeight: 1.5,
            color: "var(--text-body)",
            transition: "opacity 0.7s",
            opacity: lineIdx >= 0 ? 1 : 0,
            fontFamily: '"IBM Plex Sans", sans-serif',
          }}>
            {THESIS_LINES[lineIdx]}
          </p>
        </div>

        {/* Four pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32, width: "100%" }}>
          {PILLARS.map((p, i) => (
            <div key={p.label} style={{
              padding: "14px 12px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--line)",
              opacity: lineIdx >= 2 + i * 0.3 ? 1 : 0,
              transform: lineIdx >= 2 ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`,
            }}>
              <div style={{ fontSize: "1.3rem", marginBottom: 8, color: "var(--accent)" }}>{p.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 5, ...mono, letterSpacing: "0.04em", textTransform: "uppercase" }}>{p.label}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Domain range */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {DOMAINS.map(d => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", ...mono }}>{d.label}</span>
            </div>
          ))}
        </div>

        {/* Not-list */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20, marginBottom: 32,
          fontSize: 10, color: "var(--text-quiet)", ...mono,
          opacity: lineIdx >= 3 ? 1 : 0, transition: "opacity 0.5s 0.3s",
        }}>
          {["Monolithic AGI", "Generic agent wrapper", "Chat UI with a graph", "Prettier RAG"].map((item, i, arr) => (
            <span key={item} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ textDecoration: "line-through" }}>{item}</span>
              {i < arr.length - 1 && <span style={{ color: "var(--line-strong)" }}>·</span>}
            </span>
          ))}
        </div>

        {/* Entry buttons */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          opacity: lineIdx >= 3 ? 1 : 0,
          transform: lineIdx >= 3 ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.4s 0.2s",
        }}>
          <LandingButton
            onClick={handleEnterDecision}
            color="var(--accent-strong)"
            label="▶ Hard decision"
          />
          <LandingButton
            onClick={handleEnterTheater}
            color="var(--accent)"
            label="⬡ Decision Board"
          />
          <LandingButton
            onClick={handleEnter}
            color="var(--text-muted)"
            label="Explore substrate →"
            subtle
          />
        </div>

        {demoMode && (
          <p style={{ fontSize: 10, color: "var(--text-quiet)", marginTop: 16, ...mono }}>
            Operating in demo mode · No backend required
          </p>
        )}

        {/* Attribution */}
        <div style={{
          marginTop: 32,
          display: "flex", alignItems: "center", gap: 12,
          opacity: lineIdx >= 4 ? 0.45 : 0, transition: "opacity 0.6s 0.5s",
        }}>
          <div style={{ height: 1, width: 32, background: "var(--line-strong)" }} />
          <span style={{ fontSize: 9, color: "var(--text-quiet)", letterSpacing: "0.2em", textTransform: "uppercase", ...mono }}>
            Knowledge Operating System · research prototype
          </span>
          <div style={{ height: 1, width: 32, background: "var(--line-strong)" }} />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(transparent, var(--bg))" }} />
    </div>
  );
}

function LandingButton({ onClick, color, label, subtle }: {
  onClick: () => void;
  color: string;
  label: string;
  subtle?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 22px",
        background: hovered ? color : (subtle ? "transparent" : `color-mix(in srgb, ${color} 12%, transparent)`),
        border: `1px solid ${subtle ? "var(--line-strong)" : `color-mix(in srgb, ${color} 45%, transparent)`}`,
        color: hovered ? "var(--bg)" : color,
        cursor: "pointer",
        fontSize: 12,
        fontFamily: '"IBM Plex Mono", monospace',
        fontWeight: 500,
        letterSpacing: "0.04em",
        transition: "background 0.18s, color 0.18s, border-color 0.18s",
        outline: "none",
      }}
    >
      {label}
    </button>
  );
}

function StarField() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.4 + 0.3,
    opacity: Math.random() * 0.5 + 0.1,
    animDuration: Math.random() * 4 + 3,
  }));

  return (
    <svg className="star-field absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }}>
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.opacity}>
          <animate attributeName="opacity" values={`${s.opacity};${s.opacity * 0.3};${s.opacity}`} dur={`${s.animDuration}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

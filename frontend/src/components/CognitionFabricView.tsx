import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VaultNode {
  id: string;
  label: string;
  domain: string;
  color: string;
  calibration: number;
  nodeCount: number;
  activeIntentChannels: string[];
  sharedContextWith: string[];
  innovations: number;
  sovereignty: "full" | "partial" | "federated";
}

interface TransferPacket {
  id: string;
  from: string;
  to: string;
  channel: "intent" | "context" | "innovation";
  label: string;
  status: "active" | "pending" | "blocked";
  t: number; // animation progress 0→1
}

interface CognitionEngine {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  role: string;
  status: "active" | "idle" | "blocked";
  operatingOn?: string;
}

// ── Static demo data ──────────────────────────────────────────────────────────

const VAULTS: VaultNode[] = [
  {
    id: "drug",        label: "Drug Discovery",     domain: "drug_discovery",       color: "#3b82f6",
    calibration: 0.74, nodeCount: 62, sovereignty: "full",
    activeIntentChannels: ["gov", "euv"], sharedContextWith: ["gov", "surgery"],
    innovations: 3,
  },
  {
    id: "gov",         label: "Fukushima / Gov",    domain: "fukushima_governance",  color: "#f97316",
    calibration: 0.31, nodeCount: 58, sovereignty: "partial",
    activeIntentChannels: ["drug", "climate", "aviation"], sharedContextWith: ["aviation", "extreme"],
    innovations: 1,
  },
  {
    id: "euv",         label: "EUV Lithography",    domain: "euv_lithography",        color: "#22c55e",
    calibration: 0.82, nodeCount: 47, sovereignty: "full",
    activeIntentChannels: ["surgery", "drug"], sharedContextWith: ["surgery", "fab"],
    innovations: 5,
  },
  {
    id: "surgery",     label: "Surgical Robotics",  domain: "surgical_robotics",      color: "#ec4899",
    calibration: 0.79, nodeCount: 44, sovereignty: "full",
    activeIntentChannels: ["euv", "drug"], sharedContextWith: ["euv"],
    innovations: 2,
  },
  {
    id: "climate",     label: "Climate Policy",     domain: "climate_policy",         color: "#06b6d4",
    calibration: 0.68, nodeCount: 39, sovereignty: "federated",
    activeIntentChannels: ["gov", "pandemic"], sharedContextWith: ["gov", "pandemic"],
    innovations: 2,
  },
  {
    id: "aviation",    label: "Aviation Safety",    domain: "aviation_safety",        color: "#94a3b8",
    calibration: 0.71, nodeCount: 41, sovereignty: "partial",
    activeIntentChannels: ["gov", "extreme"], sharedContextWith: ["gov"],
    innovations: 1,
  },
  {
    id: "extreme",     label: "Extreme Environ.",   domain: "extreme_environments",   color: "#ef4444",
    calibration: 0.77, nodeCount: 36, sovereignty: "full",
    activeIntentChannels: ["gov", "aviation"], sharedContextWith: ["aviation"],
    innovations: 2,
  },
  {
    id: "math",        label: "Category Theory",    domain: "mathematics_category_theory",   color: "#8b5cf6",
    calibration: 0.95, nodeCount: 29, sovereignty: "full",
    activeIntentChannels: ["euv", "drug", "surgery"], sharedContextWith: [],
    innovations: 7,
  },
  {
    id: "fab",         label: "Semiconductor Fab",  domain: "semiconductor_hardware", color: "#eab308",
    calibration: 0.80, nodeCount: 45, sovereignty: "full",
    activeIntentChannels: ["euv"], sharedContextWith: ["euv"],
    innovations: 3,
  },
  {
    id: "pandemic",    label: "Pandemic Gov.",      domain: "pandemic_governance",    color: "#a855f7",
    calibration: 0.62, nodeCount: 37, sovereignty: "federated",
    activeIntentChannels: ["climate", "gov"], sharedContextWith: ["climate", "gov"],
    innovations: 1,
  },
];

const ENGINES: CognitionEngine[] = [
  { id: "transfer",    label: "Transfer / Translation Engine",  shortLabel: "Transfer",   icon: "⇕", role: "Cross-domain functor mapping with structural loss accounting", status: "active", operatingOn: "euv→surgery" },
  { id: "provenance",  label: "Provenance / Audit Engine",      shortLabel: "Audit",      icon: "⊕", role: "SHA-256 custody chains; tracks every claim to its origin", status: "active" },
  { id: "guardrail",   label: "Guardrail / Compliance Engine",  shortLabel: "Guard",      icon: "⬡", role: "Permission checks; blocks transfers that violate governance policy", status: "idle" },
  { id: "expert_twin", label: "Expert Twin Engine",             shortLabel: "Twin",       icon: "⊙", role: "Semantic model of an expert's epistemic state; belief + calibration", status: "active", operatingOn: "ASML calibration specialist" },
  { id: "assay",       label: "Collective Assay Engine",        shortLabel: "Assay",      icon: "⊗", role: "Aggregates heterogeneous agent beliefs; surfaces divergence and conflict", status: "idle" },
  { id: "novelty",     label: "Novelty / Bridge Engine",        shortLabel: "Novelty",    icon: "⟺", role: "Detects structurally novel bridges; proposes cross-domain transfers", status: "active", operatingOn: "math→surgery (new)" },
];

// ── Channel definitions ───────────────────────────────────────────────────────

const CHANNEL_COLORS = {
  intent:     { main: "#6366f1", bg: "rgba(99,102,241,0.06)",  label: "Shared Intent",     desc: "Aligned goals across vaults — not consensus, but explicit coordination of purpose" },
  context:    { main: "#06b6d4", bg: "rgba(6,182,212,0.06)",   label: "Shared Context",    desc: "Governed exchange of structured knowledge — permission-gated, scope-limited" },
  innovation: { main: "#22c55e", bg: "rgba(34,197,94,0.06)",   label: "Collective Innovation", desc: "Collectively invented bridges that no local vault had alone — ratchet effect" },
};

// ── Animated transfer packet hook ────────────────────────────────────────────

function usePackets() {
  const [packets, setPackets] = useState<TransferPacket[]>([
    { id: "p1", from: "euv",  to: "surgery",  channel: "context",    label: "delayed-feedback abstraction", status: "active",  t: 0.15 },
    { id: "p2", from: "gov",  to: "aviation", channel: "intent",     label: "dissent-governance schema",    status: "active",  t: 0.58 },
    { id: "p3", from: "math", to: "euv",      channel: "innovation", label: "functor: calibration→control", status: "active",  t: 0.82 },
    { id: "p4", from: "drug", to: "gov",      channel: "intent",     label: "threshold-gate schema",        status: "pending", t: 0.40 },
    { id: "p5", from: "math", to: "surgery",  channel: "innovation", label: "natural-transformation bridge",status: "active",  t: 0.25 },
    { id: "p6", from: "euv",  to: "fab",      channel: "context",    label: "process-window tacit trace",   status: "active",  t: 0.70 },
  ]);

  const rafRef = useRef<number>();
  const lastRef = useRef<number>(0);

  useEffect(() => {
    const animate = (ts: number) => {
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setPackets(prev => prev.map(p => ({
        ...p,
        t: p.status === "pending" ? p.t : (p.t + dt * 0.12) % 1,
      })));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return packets;
}

// ── VaultCard ─────────────────────────────────────────────────────────────────

function VaultCard({ vault, selected, onClick }: {
  vault: VaultNode;
  selected: boolean;
  onClick: () => void;
}) {
  const sovereigntyColor = vault.sovereignty === "full" ? "#22c55e" : vault.sovereignty === "partial" ? "#f97316" : "#8b5cf6";
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-all duration-200"
      style={{
        borderRadius: 8,
        border: `1px solid ${selected ? vault.color : "rgba(255,255,255,0.07)"}`,
        background: selected ? `${vault.color}12` : "rgba(255,255,255,0.02)",
        padding: "8px 10px",
        boxShadow: selected ? `0 0 12px ${vault.color}30` : "none",
        minWidth: 140,
      }}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: vault.color, flexShrink: 0 }} />
        <span className="text-[10px] font-semibold text-slate-300 flex-1 leading-tight">{vault.label}</span>
        <span title={`Sovereignty: ${vault.sovereignty}`}
          style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: sovereigntyColor, flexShrink: 0 }} />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: `${vault.calibration * 100}%`, background: `linear-gradient(90deg, ${vault.color}60, ${vault.color})` }} />
        </div>
        <span className="text-[8px] font-mono" style={{ color: vault.calibration > 0.7 ? "#22c55e" : vault.calibration > 0.5 ? "#f97316" : "#ef4444" }}>
          {vault.calibration.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[8px] text-slate-700">{vault.nodeCount} nodes</span>
        {vault.innovations > 0 && (
          <span className="text-[8px] px-1 rounded" style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
            +{vault.innovations} inv.
          </span>
        )}
      </div>
    </div>
  );
}

// ── EngineCard ────────────────────────────────────────────────────────────────

function EngineCard({ engine, selected, onClick }: {
  engine: CognitionEngine;
  selected: boolean;
  onClick: () => void;
}) {
  const statusColor = engine.status === "active" ? "#22c55e" : engine.status === "blocked" ? "#ef4444" : "#334155";
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-all duration-150 flex-shrink-0"
      style={{
        border: `1px solid ${selected ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 6,
        padding: "6px 10px",
        background: selected ? "rgba(99,102,241,0.10)" : "rgba(255,255,255,0.02)",
        minWidth: 80,
        maxWidth: 130,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ fontSize: 11, lineHeight: 1 }}>{engine.icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: selected ? "#818cf8" : "#475569" }}>
          {engine.shortLabel}
        </span>
        <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: statusColor, marginLeft: "auto", flexShrink: 0 }} />
      </div>
      {engine.operatingOn && (
        <div className="text-[8px] text-slate-600 truncate">{engine.operatingOn}</div>
      )}
    </div>
  );
}

// ── FabricCanvas ──────────────────────────────────────────────────────────────

function FabricCanvas({
  leftVaults,
  rightVaults,
  packets,
  selectedVault,
}: {
  leftVaults: VaultNode[];
  rightVaults: VaultNode[];
  packets: TransferPacket[];
  selectedVault: string | null;
}) {
  const W = 520;
  const H = 300;
  const LEFT_X = 60;
  const RIGHT_X = W - 60;
  const CHANNEL_X1 = LEFT_X + 30;
  const CHANNEL_X2 = RIGHT_X - 30;

  const vaultY = (i: number, total: number) => 30 + ((H - 60) / (total - 1 || 1)) * i;

  const channelY: Record<string, number> = {
    intent: H * 0.20,
    context: H * 0.50,
    innovation: H * 0.80,
  };

  const allVaults = [...leftVaults, ...rightVaults];
  const getVaultSide = (id: string): "left" | "right" =>
    leftVaults.some(v => v.id === id) ? "left" : "right";
  const getVaultY = (id: string): number => {
    const li = leftVaults.findIndex(v => v.id === id);
    const ri = rightVaults.findIndex(v => v.id === id);
    if (li >= 0) return vaultY(li, leftVaults.length);
    if (ri >= 0) return vaultY(ri, rightVaults.length);
    return H / 2;
  };
  const getVaultX = (id: string) => getVaultSide(id) === "left" ? LEFT_X : RIGHT_X;

  const getPacketPos = (packet: TransferPacket) => {
    const x1 = getVaultX(packet.from);
    const y1 = getVaultY(packet.from);
    const x2 = getVaultX(packet.to);
    const y2 = getVaultY(packet.to);
    const cy = channelY[packet.channel] ?? H / 2;
    const t = packet.t;

    if (t < 0.3) {
      const st = t / 0.3;
      const cx = x1 === LEFT_X ? (CHANNEL_X1 - x1) : (CHANNEL_X2 - x1);
      return {
        x: x1 + cx * st,
        y: y1 + (cy - y1) * st,
      };
    } else if (t < 0.7) {
      const st = (t - 0.3) / 0.4;
      return {
        x: x1 === LEFT_X ? CHANNEL_X1 + (CHANNEL_X2 - CHANNEL_X1) * st : CHANNEL_X2 - (CHANNEL_X2 - CHANNEL_X1) * st,
        y: cy,
      };
    } else {
      const st = (t - 0.7) / 0.3;
      const cx = x2 === LEFT_X ? (CHANNEL_X1 - x2) : (CHANNEL_X2 - x2);
      return {
        x: x2 + cx * (1 - st),
        y: y2 + (cy - y2) * (1 - st),
      };
    }
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        {Object.entries(CHANNEL_COLORS).map(([key, val]) => (
          <linearGradient key={key} id={`grad-${key}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={val.main} stopOpacity={0.0} />
            <stop offset="20%" stopColor={val.main} stopOpacity={0.15} />
            <stop offset="80%" stopColor={val.main} stopOpacity={0.15} />
            <stop offset="100%" stopColor={val.main} stopOpacity={0.0} />
          </linearGradient>
        ))}
      </defs>

      {/* Channel bands */}
      {Object.entries(CHANNEL_COLORS).map(([key, val]) => (
        <g key={key}>
          <rect x={CHANNEL_X1} y={channelY[key] - 18} width={CHANNEL_X2 - CHANNEL_X1} height={36}
            fill={`url(#grad-${key})`} rx={4} />
          <line x1={CHANNEL_X1} y1={channelY[key]} x2={CHANNEL_X2} y2={channelY[key]}
            stroke={val.main} strokeWidth={0.5} strokeOpacity={0.25} strokeDasharray="4 4" />
          <text x={(CHANNEL_X1 + CHANNEL_X2) / 2} y={channelY[key] - 10}
            textAnchor="middle" fill={val.main} fontSize={8} fontFamily="monospace" opacity={0.5}>
            {val.label}
          </text>
        </g>
      ))}

      {/* Connections from vaults to channel entry points */}
      {allVaults.map(v => {
        const isLeft = getVaultSide(v.id) === "left";
        const vy = getVaultY(v.id);
        const vx = getVaultX(v.id);
        const chx = isLeft ? CHANNEL_X1 : CHANNEL_X2;
        const isSelected = selectedVault === v.id;
        const isConnected = selectedVault && (v.activeIntentChannels.includes(selectedVault) || v.sharedContextWith.includes(selectedVault));
        return Object.keys(channelY).map(ch => (
          <line key={`${v.id}-${ch}`}
            x1={vx} y1={vy} x2={chx} y2={channelY[ch]}
            stroke={v.color}
            strokeWidth={isSelected || isConnected ? 1.2 : 0.3}
            strokeOpacity={isSelected || isConnected ? 0.45 : 0.10}
            strokeDasharray={ch === "innovation" ? "2 3" : ch === "intent" ? undefined : "1 2"}
          />
        ));
      })}

      {/* Vault dots */}
      {leftVaults.map((v, i) => (
        <circle key={v.id} cx={LEFT_X} cy={vaultY(i, leftVaults.length)} r={5}
          fill={v.color} fillOpacity={selectedVault === v.id ? 1 : 0.5}
          stroke={v.color} strokeWidth={selectedVault === v.id ? 1.5 : 0.5}
        />
      ))}
      {rightVaults.map((v, i) => (
        <circle key={v.id} cx={RIGHT_X} cy={vaultY(i, rightVaults.length)} r={5}
          fill={v.color} fillOpacity={selectedVault === v.id ? 1 : 0.5}
          stroke={v.color} strokeWidth={selectedVault === v.id ? 1.5 : 0.5}
        />
      ))}

      {/* Transfer packets */}
      {packets.map(packet => {
        if (packet.status === "pending") return null;
        const pos = getPacketPos(packet);
        const ch = CHANNEL_COLORS[packet.channel as keyof typeof CHANNEL_COLORS];
        return (
          <g key={packet.id}>
            <circle cx={pos.x} cy={pos.y} r={3.5} fill={ch.main} fillOpacity={0.85} />
            <circle cx={pos.x} cy={pos.y} r={7} fill={ch.main} fillOpacity={0.08} />
          </g>
        );
      })}

      {/* Governance gates at channel midpoint */}
      {packets.filter(p => p.status === "blocked").map(packet => {
        const pos = { x: (CHANNEL_X1 + CHANNEL_X2) / 2, y: channelY[packet.channel] };
        return (
          <text key={packet.id} x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={10} fill="#ef4444" opacity={0.7}>⬡</text>
        );
      })}
    </svg>
  );
}

// ── Federation Map (MetaCity view) ───────────────────────────────────────────

const FEDERATIONS = [
  {
    id: "gov-safety",
    label: "Governance & Safety",
    shortLabel: "A",
    color: "#f97316",
    cities: [
      { id: "fukushima_governance",       label: "Governance",   color: "#f97316", cal: 0.31 },
      { id: "aviation_safety",            label: "Aviation",     color: "#94a3b8", cal: 0.71 },
      { id: "pandemic_governance",        label: "Pandemic Gov", color: "#a855f7", cal: 0.62 },
      { id: "climate_policy",             label: "Climate",      color: "#06b6d4", cal: 0.68 },
      { id: "disaster_response_operations",label: "Disaster Ops",color: "#fb923c", cal: 0.55 },
      { id: "public_health_coordination", label: "Public Health",color: "#fbbf24", cal: 0.58 },
    ],
    x: 30, y: 30, w: 220, h: 148,
  },
  {
    id: "phys-intel",
    label: "Physical Intelligence",
    shortLabel: "B",
    color: "#22c55e",
    cities: [
      { id: "euv_lithography",             label: "EUV Litho",    color: "#22c55e", cal: 0.82 },
      { id: "semiconductor_hardware",      label: "Fab",          color: "#eab308", cal: 0.80 },
      { id: "surgical_robotics",           label: "Surgery",      color: "#ec4899", cal: 0.79 },
      { id: "industrial_quality_control",  label: "Industrial QC",color: "#84cc16", cal: 0.72 },
      { id: "supply_chain_resilience",     label: "Supply Chain", color: "#0ea5e9", cal: 0.65 },
      { id: "extreme_environments",        label: "Extreme",      color: "#ef4444", cal: 0.77 },
    ],
    x: 270, y: 30, w: 220, h: 148,
  },
  {
    id: "discovery",
    label: "Discovery Science",
    shortLabel: "C",
    color: "#3b82f6",
    cities: [
      { id: "drug_discovery",                      label: "Drug",         color: "#3b82f6", cal: 0.74 },
      { id: "translational_biomedicine",           label: "Translational",color: "#60a5fa", cal: 0.66 },
      { id: "developmental_biology_morphogenesis", label: "Morphogenesis",color: "#34d399", cal: 0.61 },
      { id: "causality_and_complex_systems",       label: "Causality",    color: "#38bdf8", cal: 0.70 },
      { id: "experimental_design_and_measurement", label: "Experiment",   color: "#818cf8", cal: 0.67 },
      { id: "expert_preservation",                 label: "Expert Pres.", color: "#d97706", cal: 0.58 },
    ],
    x: 30, y: 200, w: 220, h: 148,
  },
  {
    id: "math-transfer",
    label: "Mathematical Transfer",
    shortLabel: "D",
    color: "#8b5cf6",
    cities: [
      { id: "mathematics_category_theory", label: "Category",    color: "#8b5cf6", cal: 0.95 },
      { id: "algebraic_structures",        label: "Algebra",     color: "#a78bfa", cal: 0.88 },
      { id: "graph_theory_and_networks",   label: "Graph Theory",color: "#c084fc", cal: 0.85 },
      { id: "information_theory",          label: "Info Theory", color: "#d946ef", cal: 0.90 },
      { id: "optimization_and_control",    label: "Optimization",color: "#4ade80", cal: 0.83 },
      { id: "scientific_model_transfer",   label: "Model Xfer",  color: "#cbd5e1", cal: 0.78 },
    ],
    x: 270, y: 200, w: 220, h: 148,
  },
];

const FED_TRANSFERS = [
  { from: "gov-safety",  to: "discovery",    label: "Expert Evidence Schema", color: "#f97316", strength: 0.88, failed: false },
  { from: "gov-safety",  to: "phys-intel",   label: "Authority Override",     color: "#22c55e", strength: 0.85, failed: false },
  { from: "phys-intel",  to: "discovery",    label: "Process Window↔Clinical",color: "#3b82f6", strength: 0.74, failed: false },
  { from: "math-transfer",to: "phys-intel",  label: "Functor→Calibration",   color: "#8b5cf6", strength: 0.76, failed: false },
  { from: "math-transfer",to: "discovery",   label: "Optimal Transport→ADMET",color: "#d946ef", strength: 0.72, failed: false },
  { from: "gov-safety",  to: "math-transfer",label: "Governance Formalization",color: "#eab308", strength: 0.58, failed: true },
];

function FederationMapCanvas({ selectedFed }: { selectedFed: string | null }) {
  const W = 520; const H = 378;

  // Centers of each federation box
  const fedCenter = (fedId: string): [number, number] => {
    const f = FEDERATIONS.find(f => f.id === fedId);
    if (!f) return [W/2, H/2];
    return [f.x + f.w / 2, f.y + f.h / 2];
  };

  // City dot positions inside federation box
  const cityPos = (cities: typeof FEDERATIONS[0]["cities"], idx: number, fx: number, fy: number, fw: number, fh: number): [number, number] => {
    const cols = 3; const rows = 2;
    const col = idx % cols; const row = Math.floor(idx / cols);
    const padX = 22; const padY = 32;
    const stepX = (fw - padX * 2) / (cols - 1 || 1);
    const stepY = (fh - padY * 2) / (rows - 1 || 1);
    return [fx + padX + col * stepX, fy + padY + row * stepY];
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="metacity-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.04} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
        </radialGradient>
        {FEDERATIONS.map(f => (
          <radialGradient key={f.id} id={`grad-${f.id}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={f.color} stopOpacity={0.07} />
            <stop offset="100%" stopColor={f.color} stopOpacity={0.0} />
          </radialGradient>
        ))}
        <style>{`
          @keyframes fed-packet { 0%{stroke-dashoffset:60} 100%{stroke-dashoffset:0} }
          @keyframes fed-pulse { 0%,100%{r:3;opacity:0.8} 50%{r:5;opacity:0.4} }
          .fed-transfer { animation: fed-packet 2s linear infinite; }
          .fed-dot { animation: fed-pulse 1.8s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* MetaCity outer ring */}
      <ellipse cx={W/2} cy={H/2} rx={W/2 - 6} ry={H/2 - 6}
        fill="url(#metacity-glow)"
        stroke="#6366f1" strokeWidth={0.5} strokeOpacity={0.18} strokeDasharray="6 6" />
      <text x={W/2} y={8} textAnchor="middle" fontSize={7} fill="#6366f1" opacity={0.35} fontFamily="monospace" letterSpacing={2}>
        OMEGA METACITY
      </text>

      {/* Cross-federation transfer lines */}
      {FED_TRANSFERS.map((t, i) => {
        const [x1, y1] = fedCenter(t.from);
        const [x2, y2] = fedCenter(t.to);
        const isSelected = selectedFed === t.from || selectedFed === t.to;
        const opacity = t.failed ? 0.15 : isSelected ? 0.70 : 0.28;
        return (
          <g key={i}>
            {/* Animated glow for active transfers */}
            {!t.failed && (
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={t.color} strokeWidth={6} strokeOpacity={0.06} />
            )}
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={t.failed ? "#ef4444" : t.color}
              strokeWidth={t.failed ? 1 : Math.round(t.strength * 3)}
              strokeOpacity={opacity}
              strokeDasharray={t.failed ? "3 4" : "8 4"}
              className={t.failed ? "" : "fed-transfer"}
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            {/* Transfer label at midpoint */}
            <text x={(x1+x2)/2} y={(y1+y2)/2 - 5}
              textAnchor="middle" fontSize={6.5} fill={t.failed ? "#ef4444" : t.color}
              opacity={isSelected ? 0.9 : 0.45} fontFamily="monospace">
              {t.failed ? "✕ " : ""}{t.label}
            </text>
          </g>
        );
      })}

      {/* Federation boxes */}
      {FEDERATIONS.map(f => {
        const isSelected = selectedFed === f.id;
        return (
          <g key={f.id}>
            {/* Background fill */}
            <rect x={f.x} y={f.y} width={f.w} height={f.h}
              fill={`url(#grad-${f.id})`}
              stroke={f.color}
              strokeWidth={isSelected ? 1.5 : 0.5}
              strokeOpacity={isSelected ? 0.6 : 0.25}
              rx={8} />

            {/* Federation label */}
            <text x={f.x + 8} y={f.y + 13}
              fontSize={8} fontWeight="bold" fill={f.color}
              opacity={0.8} fontFamily="monospace">
              [{f.shortLabel}] {f.label}
            </text>

            {/* City dots */}
            {f.cities.map((city, idx) => {
              const [cx, cy] = cityPos(f.cities, idx, f.x, f.y, f.w, f.h);
              const calColor = city.cal > 0.75 ? "#22c55e" : city.cal > 0.55 ? "#eab308" : "#ef4444";
              return (
                <g key={city.id}>
                  <circle cx={cx} cy={cy} r={5} fill={city.color} opacity={0.75} />
                  <circle cx={cx} cy={cy} r={5} fill="none" stroke={city.color}
                    strokeWidth={1} strokeOpacity={0.4} />
                  {/* Calibration ring */}
                  <circle cx={cx} cy={cy} r={8} fill="none" stroke={calColor}
                    strokeWidth={1} strokeDasharray={`${city.cal * 50} 50`}
                    strokeOpacity={0.5} />
                  <text x={cx} y={cy + 14} textAnchor="middle"
                    fontSize={5.5} fill={city.color} opacity={0.65} fontFamily="monospace">
                    {city.label}
                  </text>
                </g>
              );
            })}

            {/* Domain count */}
            <text x={f.x + f.w - 6} y={f.y + 13}
              textAnchor="end" fontSize={7} fill={f.color} opacity={0.45} fontFamily="monospace">
              {f.cities.length} cities
            </text>
          </g>
        );
      })}

      {/* MetaCity label at bottom */}
      <text x={W/2} y={H - 4} textAnchor="middle" fontSize={6.5} fill="#6366f1" opacity={0.25} fontFamily="monospace">
        4 federations · 24 cities · ∞ lawful exchange
      </text>
    </svg>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function FabricLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {Object.entries(CHANNEL_COLORS).map(([key, val]) => (
        <div key={key} className="flex items-center gap-1.5">
          <div style={{ width: 16, height: 2, backgroundColor: val.main, opacity: 0.6 }} />
          <span className="text-[8px] text-slate-600">{val.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }} />
        <span className="text-[8px] text-slate-600">Full sovereignty</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f97316" }} />
        <span className="text-[8px] text-slate-600">Partial</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#8b5cf6" }} />
        <span className="text-[8px] text-slate-600">Federated</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CognitionFabricView({ className = "" }: { className?: string }) {
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<"intent" | "context" | "innovation" | null>(null);
  const [viewMode, setViewMode] = useState<"fabric" | "federation">("fabric");
  const [selectedFed, setSelectedFed] = useState<string | null>(null);
  const packets = usePackets();

  const leftVaults  = VAULTS.slice(0, 5);
  const rightVaults = VAULTS.slice(5);

  const vault = selectedVault ? VAULTS.find(v => v.id === selectedVault) : null;
  const engine = selectedEngine ? ENGINES.find(e => e.id === selectedEngine) : null;

  const activePackets = activeChannel ? packets.filter(p => p.channel === activeChannel) : packets;

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}
      style={{ background: "#020610", color: "#e2e8f0" }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-2">
              <span style={{ color: "#6366f1" }}>◈</span> Distributed Cognition Fabric
            </div>
            <div className="text-[9px] text-slate-600 mt-0.5">
              24 knowledge cities · 4 federations · 1 MetaCity · 3 shared channels · {ENGINES.length} cognition engines
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["fabric", "federation"] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  className="px-2 py-0.5 text-[8px] font-medium transition-all"
                  style={{
                    background: viewMode === m ? "rgba(99,102,241,0.18)" : "transparent",
                    color: viewMode === m ? "#818cf8" : "#334155",
                  }}>
                  {m === "fabric" ? "⇕ Fabric" : "◈ MetaCity"}
                </button>
              ))}
            </div>
            <span className="text-[8px] text-slate-700 px-1.5 py-0.5 rounded"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              demo
            </span>
          </div>
        </div>
      </div>

      {/* Cognition engines bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b overflow-x-auto" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[8px] text-slate-700 uppercase tracking-widest mr-1 flex-shrink-0">Cognition Engines</span>
          {ENGINES.map(eng => (
            <EngineCard key={eng.id} engine={eng}
              selected={selectedEngine === eng.id}
              onClick={() => setSelectedEngine(selectedEngine === eng.id ? null : eng.id)} />
          ))}
        </div>
      </div>

      {/* Engine detail */}
      {engine && (
        <div className="flex-shrink-0 mx-4 mt-2 px-3 py-2 rounded-lg text-[9px]"
          style={{ backgroundColor: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)" }}>
          <span className="font-semibold text-indigo-300">{engine.label}</span>
          <span className="text-slate-500 ml-2">{engine.role}</span>
          {engine.operatingOn && (
            <span className="ml-2 text-slate-600">→ operating on: <span className="text-slate-400">{engine.operatingOn}</span></span>
          )}
          <span className="ml-2 px-1 rounded text-[8px]"
            style={{ backgroundColor: engine.status === "active" ? "rgba(34,197,94,0.10)" : "rgba(51,65,85,0.3)", color: engine.status === "active" ? "#22c55e" : "#475569" }}>
            {engine.status}
          </span>
        </div>
      )}

      {/* Main fabric area */}
      <div className="flex-1 flex gap-3 px-4 py-3 overflow-hidden min-h-0">

        {viewMode === "federation" ? (
          /* ── MetaCity / Federation view ── */
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div style={{ maxWidth: 540, width: "100%" }}>
                <FederationMapCanvas selectedFed={selectedFed} />
              </div>
            </div>

            {/* Federation selector */}
            <div className="flex-shrink-0 flex gap-2 flex-wrap justify-center">
              {FEDERATIONS.map(f => (
                <button key={f.id} onClick={() => setSelectedFed(selectedFed === f.id ? null : f.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all"
                  style={{
                    background: selectedFed === f.id ? `${f.color}15` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedFed === f.id ? `${f.color}40` : "rgba(255,255,255,0.06)"}`,
                    color: selectedFed === f.id ? f.color : "#334155",
                  }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color, opacity: selectedFed === f.id ? 1 : 0.5 }} />
                  [{f.shortLabel}] {f.label}
                  <span className="text-[8px] opacity-60 font-mono">·{f.cities.length}</span>
                </button>
              ))}
            </div>

            {/* Federation detail */}
            {selectedFed && (() => {
              const f = FEDERATIONS.find(fd => fd.id === selectedFed);
              if (!f) return null;
              const transfers = FED_TRANSFERS.filter(t => t.from === selectedFed || t.to === selectedFed);
              return (
                <div className="flex-shrink-0 px-4 py-2 rounded-lg mx-2"
                  style={{ background: `${f.color}08`, border: `1px solid ${f.color}20` }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <div className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: f.color }}>
                        Federation [{f.shortLabel}] — {f.label}
                      </div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {f.cities.map(c => (
                          <span key={c.id} className="text-[8px] px-1.5 py-0.5 rounded-full"
                            style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}25` }}>
                            {c.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-widest mb-0.5 text-slate-600">Cross-federation transfers</div>
                      <div className="flex gap-1 flex-wrap">
                        {transfers.map((t, i) => (
                          <span key={i} className="text-[8px] px-1.5 py-0.5 rounded"
                            style={{ background: t.failed ? "rgba(239,68,68,0.08)" : `${t.color}0d`,
                                     color: t.failed ? "#ef4444" : t.color,
                                     border: `1px solid ${t.failed ? "rgba(239,68,68,0.2)" : `${t.color}25`}` }}>
                            {t.failed ? "✕ " : "⇕ "}{t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <>
            {/* Left vault column */}
            <div className="flex flex-col gap-2 justify-center flex-shrink-0" style={{ width: 155 }}>
              {leftVaults.map(v => (
                <VaultCard key={v.id} vault={v}
                  selected={selectedVault === v.id}
                  onClick={() => setSelectedVault(selectedVault === v.id ? null : v.id)} />
              ))}
            </div>

            {/* Central fabric canvas */}
            <div className="flex-1 flex flex-col justify-center items-center min-w-0 gap-2">
              <div className="overflow-hidden" style={{ maxWidth: 540 }}>
                <FabricCanvas
                  leftVaults={leftVaults}
                  rightVaults={rightVaults}
                  packets={activePackets}
                  selectedVault={selectedVault}
                />
              </div>

              {/* Channel filter tabs */}
              <div className="flex items-center gap-1">
                {(["intent", "context", "innovation"] as const).map(ch => {
                  const info = CHANNEL_COLORS[ch];
                  return (
                    <button key={ch} onClick={() => setActiveChannel(activeChannel === ch ? null : ch)}
                      className="px-2 py-0.5 text-[8px] rounded-full transition-all"
                      style={{
                        border: `1px solid ${activeChannel === ch ? info.main : "rgba(255,255,255,0.06)"}`,
                        color: activeChannel === ch ? info.main : "#334155",
                        background: activeChannel === ch ? info.bg : "transparent",
                      }}>
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right vault column */}
            <div className="flex flex-col gap-2 justify-center flex-shrink-0" style={{ width: 155 }}>
              {rightVaults.map(v => (
                <VaultCard key={v.id} vault={v}
                  selected={selectedVault === v.id}
                  onClick={() => setSelectedVault(selectedVault === v.id ? null : v.id)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Vault detail / context panel — only in fabric mode */}
      {viewMode === "fabric" && vault ? (
        <div className="flex-shrink-0 mx-4 mb-3 px-4 py-3 rounded-xl"
          style={{ border: `1px solid ${vault.color}25`, background: `${vault.color}08` }}>
          <div className="flex items-start gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: vault.color }} />
                <span className="text-[11px] font-bold text-slate-200">{vault.label}</span>
                <span className="text-[8px] px-1.5 rounded-full"
                  style={{ backgroundColor: `${vault.color}15`, color: vault.color, border: `1px solid ${vault.color}30` }}>
                  {vault.sovereignty} sovereignty
                </span>
              </div>
              <div className="text-[9px] text-slate-600">{vault.nodeCount} knowledge nodes</div>
            </div>
            <div>
              <div className="text-[8px] text-slate-700 uppercase tracking-widest mb-1">Calibration</div>
              <div className="text-[16px] font-bold font-mono" style={{ color: vault.calibration > 0.7 ? "#22c55e" : "#f97316" }}>
                {vault.calibration.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-slate-700 uppercase tracking-widest mb-1">Active intent channels</div>
              <div className="flex gap-1 flex-wrap">
                {vault.activeIntentChannels.map(id => {
                  const v2 = VAULTS.find(v => v.id === id);
                  if (!v2) return null;
                  return (
                    <span key={id} className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${v2.color}15`, color: v2.color, border: `1px solid ${v2.color}30` }}>
                      {v2.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-slate-700 uppercase tracking-widest mb-1">Shared context with</div>
              <div className="flex gap-1 flex-wrap">
                {vault.sharedContextWith.length === 0 ? (
                  <span className="text-[8px] text-slate-700">none (full isolation)</span>
                ) : vault.sharedContextWith.map(id => {
                  const v2 = VAULTS.find(v => v.id === id);
                  if (!v2) return null;
                  return (
                    <span key={id} className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${v2.color}15`, color: v2.color, border: `1px solid ${v2.color}30` }}>
                      {v2.label}
                    </span>
                  );
                })}
              </div>
            </div>
            {vault.innovations > 0 && (
              <div>
                <div className="text-[8px] text-slate-700 uppercase tracking-widest mb-1">Innovations contributed</div>
                <div className="text-[14px] font-bold text-emerald-400">{vault.innovations}</div>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === "fabric" ? (
        <div className="flex-shrink-0 mx-4 mb-3 px-4 py-2">
          <FabricLegend />
        </div>
      ) : null}

      {/* Active packets */}
      <div className="flex-shrink-0 px-4 pb-2 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto">
          <span className="text-[8px] text-slate-700 uppercase tracking-widest flex-shrink-0 mr-1">Active transfers</span>
          {packets.filter(p => p.status === "active").map(p => {
            const ch = CHANNEL_COLORS[p.channel as keyof typeof CHANNEL_COLORS];
            const fromV = VAULTS.find(v => v.id === p.from);
            const toV   = VAULTS.find(v => v.id === p.to);
            return (
              <div key={p.id} className="flex items-center gap-1 flex-shrink-0 px-1.5 py-0.5 rounded"
                style={{ border: `1px solid ${ch.main}30`, background: ch.bg }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: ch.main }} />
                <span className="text-[8px] text-slate-500">
                  {fromV?.label ?? p.from} → {toV?.label ?? p.to}:
                </span>
                <span className="text-[8px]" style={{ color: ch.main }}>{p.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

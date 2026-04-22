import { useState } from "react";

interface AgencyLevel {
  id: string;
  label: string;
  sublabel: string;
  radius: number;
  color: string;
  entities: AgencyEntity[];
  description: string;
  alife_note: string;
}

interface AgencyEntity {
  id: string;
  name: string;
  domain?: string;
  calibration?: number;
  goal?: string;
  constraint?: string;
}

const LEVELS: AgencyLevel[] = [
  {
    id: "evidence",
    label: "Atomic",
    sublabel: "Evidence Fragments",
    radius: 52,
    color: "#3b82f6",
    entities: [
      { id: "ev-1", name: "KRAS G12C binding data", domain: "drug_discovery" },
      { id: "ev-2", name: "BBB permeability assay (0.60)", domain: "drug_discovery" },
      { id: "ev-3", name: "Jogan earthquake 869AD deposit", domain: "fukushima_governance" },
      { id: "ev-4", name: "EUV pre-pulse field data", domain: "euv_lithography" },
    ],
    description: "Individual evidence fragments — the atomic units of the knowledge substrate. Each carries uncertainty, media type, and provenance.",
    alife_note: "Analogous to individual molecules: high speed, local interaction, no self-model.",
  },
  {
    id: "expert",
    label: "Expert",
    sublabel: "Individual Agent Twins",
    radius: 94,
    color: "#14b8a6",
    entities: [
      { id: "ag-1", name: "Dr. Sarah Chen", domain: "drug_discovery", calibration: 0.84, goal: "Patient safety" },
      { id: "ag-2", name: "TEPCO Civil Eng.", domain: "fukushima_governance", calibration: 0.76, goal: "Structural integrity" },
      { id: "ag-3", name: "ASML Systems Eng.", domain: "euv_lithography", calibration: 0.82, goal: "EUV uptime" },
      { id: "ag-4", name: "MolScreen-v2 (AI)", domain: "drug_discovery", calibration: 0.71, goal: "BBB prediction" },
    ],
    description: "Calibrated expert twins — individuals with competences, beliefs, calibration scores, and authority scopes. They have stable self-models.",
    alife_note: "Analogous to organisms: have goals, self-models, memory, and can dissent. Individuality is achieved through calibration history.",
  },
  {
    id: "institution",
    label: "Institution",
    sublabel: "Collective Agents",
    radius: 138,
    color: "#f97316",
    entities: [
      { id: "inst-1", name: "TEPCO Management", domain: "fukushima_governance", calibration: 0.31, constraint: "Cost minimization" },
      { id: "inst-2", name: "ASML + Zeiss + Cymer", domain: "euv_lithography", calibration: 0.83, goal: "EUV commercialization" },
      { id: "inst-3", name: "Trial Oversight Committee", domain: "drug_discovery", calibration: 0.80, goal: "Phase II integrity" },
    ],
    description: "Institutional agents — collective decision-makers with governance structures, mandates, and accountability. Their individuality is maintained by permission boundaries.",
    alife_note: "Analogous to superorganisms: internal specialization, external boundary (permission scope), and collective memory (decision history).",
  },
  {
    id: "domain",
    label: "Domain Pack",
    sublabel: "Knowledge Ecologies",
    radius: 182,
    color: "#a855f7",
    entities: [
      { id: "dom-1", name: "drug_discovery", goal: "Clinical trial pipeline" },
      { id: "dom-2", name: "fukushima_governance", goal: "Institutional failure analysis" },
      { id: "dom-3", name: "euv_lithography", goal: "Tacit knowledge preservation" },
    ],
    description: "Domain packs — versioned, governed knowledge ecologies. Each domain has its own ontology, agent roster, and evolution history.",
    alife_note: "Analogous to ecosystems: structured niches, competitive and symbiotic relations between entities, open-ended growth.",
  },
  {
    id: "substrate",
    label: "Substrate",
    sublabel: "Omega — Full Ecology",
    radius: 220,
    color: "#6366f1",
    entities: [
      { id: "sub-1", name: "Multi-domain alignment bridges" },
      { id: "sub-2", name: "Cross-domain novelty proposals" },
      { id: "sub-3", name: "Global calibration registry" },
    ],
    description: "The full Omega substrate — the multi-domain collective intelligence operating system. Governed evolution, cross-domain bridges, and compounding epistemic capital.",
    alife_note: "Analogous to the biosphere: all ecologies interact through shared atmospheric layer (alignment). Open-ended evolution without fixed fitness target.",
  },
];

export function NestedAgencyView({ className = "" }: { className?: string }) {
  const [selectedLevel, setSelectedLevel] = useState<AgencyLevel | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const center = 220;

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Nested Agency</div>
        <div className="text-xs font-semibold text-slate-200">ALife — Multiscale Intelligence Architecture</div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Concentric rings diagram */}
        <div className="flex-shrink-0 flex items-center justify-center py-4">
          <div className="relative" style={{ width: 460, height: 460 }}>
            <svg width="460" height="460" viewBox="0 0 460 460">
              {/* Background star dots */}
              {Array.from({ length: 60 }, (_, i) => {
                const angle = (i / 60) * Math.PI * 2 + i * 0.5;
                const r = 235 + (i % 5) * 4;
                return (
                  <circle
                    key={i}
                    cx={center + r * Math.cos(angle)}
                    cy={center + r * Math.sin(angle)}
                    r={0.8}
                    fill="#334155"
                    opacity={0.4}
                  />
                );
              })}

              {/* Rings from outside in */}
              {[...LEVELS].reverse().map((level) => {
                const isSelected = selectedLevel?.id === level.id;
                const isHovered = hoveredLevel === level.id;
                const active = isSelected || isHovered;
                return (
                  <circle
                    key={level.id}
                    cx={center}
                    cy={center}
                    r={level.radius}
                    fill={active ? `${level.color}12` : `${level.color}05`}
                    stroke={level.color}
                    strokeWidth={active ? 2 : 1}
                    strokeOpacity={active ? 0.8 : 0.25}
                    strokeDasharray={level.id === "substrate" ? "none" : "4 3"}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => setSelectedLevel(selectedLevel?.id === level.id ? null : level)}
                    onMouseEnter={() => setHoveredLevel(level.id)}
                    onMouseLeave={() => setHoveredLevel(null)}
                  />
                );
              })}

              {/* Ring labels (at the top of each ring) */}
              {LEVELS.map((level) => {
                const isActive = selectedLevel?.id === level.id || hoveredLevel === level.id;
                return (
                  <g key={`label-${level.id}`}>
                    <text
                      x={center}
                      y={center - level.radius + 14}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight="bold"
                      fill={level.color}
                      opacity={isActive ? 1 : 0.5}
                      style={{ fontFamily: "system-ui, sans-serif", cursor: "pointer", transition: "opacity 0.2s" }}
                      onClick={() => setSelectedLevel(selectedLevel?.id === level.id ? null : level)}
                    >
                      {level.label.toUpperCase()}
                    </text>
                    <text
                      x={center}
                      y={center - level.radius + 24}
                      textAnchor="middle"
                      fontSize={7}
                      fill={level.color}
                      opacity={isActive ? 0.7 : 0.3}
                      style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                      {level.sublabel}
                    </text>
                  </g>
                );
              })}

              {/* Entity dots */}
              {LEVELS.map((level) => {
                const isActive = selectedLevel?.id === level.id || hoveredLevel === level.id;
                return level.entities.map((entity, ei) => {
                  const angle = (ei / level.entities.length) * Math.PI * 2 - Math.PI / 2 + (level.entities.length * 0.3);
                  const r = level.radius - 12;
                  const x = center + r * Math.cos(angle);
                  const y = center + r * Math.sin(angle);
                  return (
                    <circle
                      key={entity.id}
                      cx={x}
                      cy={y}
                      r={isActive ? 4 : 2.5}
                      fill={level.color}
                      opacity={isActive ? 0.9 : 0.4}
                      style={{ transition: "all 0.2s" }}
                    />
                  );
                });
              })}

              {/* Center — Omega core */}
              <circle cx={center} cy={center} r={22} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth={1.5} />
              <circle cx={center} cy={center} r={14} fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth={1} />
              <circle cx={center} cy={center} r={6} fill="#6366f1" />
              <text x={center} y={center + 32} textAnchor="middle" fontSize={8} fill="#6366f1" fontWeight="bold" opacity={0.8}
                style={{ fontFamily: "system-ui, sans-serif" }}>
                OMEGA
              </text>
            </svg>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {selectedLevel ? (
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${selectedLevel.color}30`, backgroundColor: `${selectedLevel.color}05` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${selectedLevel.color}15` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold" style={{ color: selectedLevel.color }}>{selectedLevel.label} Level</div>
                    <div className="text-[10px] text-slate-500">{selectedLevel.sublabel}</div>
                  </div>
                  <button onClick={() => setSelectedLevel(null)} className="text-slate-600 hover:text-slate-400 text-sm">✕</button>
                </div>
              </div>

              <div className="px-4 py-3 space-y-3">
                <p className="text-[10px] text-slate-400 leading-relaxed">{selectedLevel.description}</p>

                <div className="rounded-lg p-2.5" style={{ backgroundColor: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1">ALife Analogy</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">{selectedLevel.alife_note}</p>
                </div>

                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">Entities at this scale ({selectedLevel.entities.length})</div>
                  <div className="space-y-1.5">
                    {selectedLevel.entities.map(e => (
                      <div key={e.id} className="flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedLevel.color }} />
                        <span className="text-slate-300">{e.name}</span>
                        {e.domain && <span className="text-slate-600">{e.domain.replace(/_/g, " ")}</span>}
                        {e.calibration !== undefined && (
                          <span className="font-mono ml-auto" style={{ color: e.calibration >= 0.75 ? "#22c55e" : "#f59e0b" }}>
                            {e.calibration.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Select a ring to explore</div>
              <div className="space-y-2">
                {LEVELS.map(level => (
                  <div
                    key={level.id}
                    className="flex items-center gap-3 cursor-pointer py-1"
                    onClick={() => setSelectedLevel(level)}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: level.color, opacity: 0.7 }} />
                    <div>
                      <span className="text-[10px] font-semibold text-slate-300">{level.label}</span>
                      <span className="text-[9px] text-slate-600 ml-2">{level.sublabel}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-600 mt-3 leading-relaxed">
                Agency emerges at every scale. Intelligence is not located at one level — it is a pattern across all of them.
                The substrate governs transitions between scales.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

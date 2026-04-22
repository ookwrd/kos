import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { useGraphStore, LAYER_COLORS, type LayerKey } from "../store/graphStore";

// ── Domain layout ─────────────────────────────────────────────────────────────

interface DomainCluster {
  domain: string;
  cx: number;
  cz: number;
  totalNodes: number;
  layers: LayerKey[];
}

const DOMAIN_POSITIONS: Record<string, [number, number]> = {
  drug_discovery:         [-14, -6],
  fukushima_governance:   [0,    9],
  euv_lithography:        [14,  -6],
  math_category_theory:   [-22,  2],
  surgical_robotics:      [-7,  18],
  semiconductor_hardware: [22,   4],
  extreme_environments:   [7,  -20],
};

const DOMAIN_COLORS: Record<string, string> = {
  drug_discovery:         "#3b82f6",
  fukushima_governance:   "#f97316",
  euv_lithography:        "#22c55e",
  math_category_theory:   "#8b5cf6",
  surgical_robotics:      "#ec4899",
  semiconductor_hardware: "#eab308",
  extreme_environments:   "#ef4444",
};

const DOMAIN_LABELS: Record<string, string> = {
  drug_discovery:         "Drug Discovery",
  fukushima_governance:   "Governance",
  euv_lithography:        "EUV Operations",
  math_category_theory:   "Category Theory",
  surgical_robotics:      "Surgical Robotics",
  semiconductor_hardware: "Semiconductor Fab",
  extreme_environments:   "Extreme Environments",
};

const DOMAIN_SUBLABELS: Record<string, string> = {
  drug_discovery:         "KRAS · clinical trials · calibration",
  fukushima_governance:   "TEPCO · seawall · expert dissent",
  euv_lithography:        "ASML · pre-pulse · tacit skill",
  math_category_theory:   "functors · natural transforms · limits",
  surgical_robotics:      "da Vinci · haptic · OR governance",
  semiconductor_hardware: "etch · yield · process window",
  extreme_environments:   "Challenger · O-ring · normalization",
};

const CROSS_DOMAIN_BRIDGES: Array<{ src: string; tgt: string; strength: number; label: string; color: string }> = [
  { src: "extreme_environments",   tgt: "fukushima_governance",   strength: 0.91, label: "Deviance Normalization", color: "#ef4444" },
  { src: "surgical_robotics",      tgt: "fukushima_governance",   strength: 0.87, label: "Authority Override",     color: "#f97316" },
  { src: "surgical_robotics",      tgt: "euv_lithography",        strength: 0.82, label: "Tacit Skill",           color: "#ec4899" },
  { src: "math_category_theory",   tgt: "fukushima_governance",   strength: 0.76, label: "Formal Grounding",      color: "#8b5cf6" },
  { src: "semiconductor_hardware", tgt: "drug_discovery",         strength: 0.74, label: "Calibration Drift",     color: "#eab308" },
];

// ── Demo building layout per domain ──────────────────────────────────────────

interface BuildingSpec { dx: number; dz: number; h: number; color: string; label: string }

function domainBuildings(domain: string): BuildingSpec[] {
  const c = DOMAIN_COLORS[domain] ?? "#6366f1";
  const alt = (s: string) => {
    // slightly desaturated variant
    const map: Record<string, string> = {
      "#3b82f6": "#60a5fa", "#f97316": "#fb923c", "#22c55e": "#4ade80",
      "#8b5cf6": "#a78bfa", "#ec4899": "#f472b6", "#eab308": "#fbbf24", "#ef4444": "#f87171",
    };
    return map[s] ?? s;
  };
  // Generates a small district grid: 5-7 buildings offset from center
  const specs: Array<[number, number, number, string]> = [
    [-1.8, -1.8, 2.5, c],
    [ 0,   -2.2, 3.8, alt(c)],
    [ 1.8, -1.4, 1.9, c],
    [-2.0,  0.2, 1.5, alt(c)],
    [ 0,    0.4, 4.4, c],
    [ 2.2,  0.6, 2.1, alt(c)],
    [-1.2,  2.0, 3.0, c],
    [ 1.0,  2.2, 1.7, alt(c)],
  ];
  return specs.map(([dx, dz, h, col], i) => ({
    dx, dz, h,
    color: col,
    label: ["knowledge", "context", "agents", "evidence", "mechanisms", "goals", "governance", "alignment"][i] ?? "",
  }));
}

// ── Three.js components ───────────────────────────────────────────────────────

function Building({ dx, dz, h, color, cx, cz, selected, onGroupClick }: {
  dx: number; dz: number; h: number; color: string;
  cx: number; cz: number; selected: boolean; onGroupClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetH = useRef(h);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const tgt = (hovered || selected) ? h * 1.3 : h;
    const cur = meshRef.current.scale.y;
    meshRef.current.scale.y += (tgt - cur) * Math.min(delta * 6, 1);
    meshRef.current.position.y = meshRef.current.scale.y * 0.5;
  });
  targetH.current = h;

  return (
    <group position={[cx + dx, 0, cz + dz]}>
      <mesh
        ref={meshRef}
        scale={[1, h, 1]}
        position={[0, h * 0.5, 0]}
        onClick={e => { e.stopPropagation(); onGroupClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[1.6, 1, 1.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={(hovered || selected) ? 0.5 : 0.10}
          transparent opacity={(hovered || selected) ? 0.98 : 0.72}
          roughness={0.35} metalness={0.45}
        />
      </mesh>

      {/* Rooftop glow when selected */}
      {selected && (
        <mesh position={[0, h + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>
      )}

      {/* Base slab */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.16, 1.7]} />
        <meshStandardMaterial color="#0a1628" roughness={0.9} />
      </mesh>
    </group>
  );
}

function DomainDistrict({ cluster, selected, onClick }: {
  cluster: DomainCluster; selected: boolean; onClick: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const color = DOMAIN_COLORS[cluster.domain] ?? "#6366f1";
  const label = DOMAIN_LABELS[cluster.domain] ?? cluster.domain;
  const sublabel = DOMAIN_SUBLABELS[cluster.domain] ?? "";
  const buildings = useMemo(() => domainBuildings(cluster.domain), [cluster.domain]);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer rotating ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[cluster.cx, -0.10, cluster.cz]}>
        <ringGeometry args={[5.8, 6.0, 64]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.30 : 0.08} />
      </mesh>

      {/* Ground platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cluster.cx, -0.15, cluster.cz]} onClick={onClick}>
        <circleGeometry args={[5.6, 48]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.07 : 0.025} />
      </mesh>

      {/* Inner border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cluster.cx, -0.12, cluster.cz]}>
        <ringGeometry args={[5.4, 5.6, 48]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.20 : 0.05} />
      </mesh>

      {/* Road cross within district */}
      <Line
        points={[[cluster.cx - 5, 0, cluster.cz], [cluster.cx + 5, 0, cluster.cz]]}
        color={color} lineWidth={0.4} opacity={0.08} transparent
      />
      <Line
        points={[[cluster.cx, 0, cluster.cz - 5], [cluster.cx, 0, cluster.cz + 5]]}
        color={color} lineWidth={0.4} opacity={0.08} transparent
      />

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} cx={cluster.cx} cz={cluster.cz}
          dx={b.dx} dz={b.dz} h={b.h}
          color={b.color} selected={selected} onGroupClick={onClick} />
      ))}

      {/* Domain label above district */}
      <Text
        position={[cluster.cx, 0.3, cluster.cz + 6.6]}
        fontSize={0.62}
        color={selected ? color : "#475569"}
        anchorX="center" anchorY="middle"
        outlineWidth={0.03} outlineColor="#020610"
      >
        {label}
      </Text>
      <Text
        position={[cluster.cx, -0.15, cluster.cz + 6.6]}
        fontSize={0.28}
        color={selected ? "#94a3b8" : "#1e293b"}
        anchorX="center" anchorY="middle"
      >
        {sublabel}
      </Text>

      {/* Node count badge */}
      {cluster.totalNodes > 0 && (
        <Text
          position={[cluster.cx + 5.8, 0.5, cluster.cz]}
          fontSize={0.32}
          color={selected ? color : "#334155"}
          anchorX="center" anchorY="middle"
        >
          {cluster.totalNodes}n
        </Text>
      )}
    </group>
  );
}

function BridgeArc({ src, tgt, strength, color }: {
  src: [number, number]; tgt: [number, number]; strength: number; color: string;
}) {
  const points = useMemo(() => {
    const numPts = 40;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= numPts; i++) {
      const t = i / numPts;
      const x = src[0] + (tgt[0] - src[0]) * t;
      const z = src[1] + (tgt[1] - src[1]) * t;
      const arcH = Math.sin(Math.PI * t) * 5 * strength;
      pts.push(new THREE.Vector3(x, arcH + 0.1, z));
    }
    return pts;
  }, [src, tgt, strength]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={strength > 0.85 ? 2.0 : 1.4}
      opacity={strength > 0.85 ? 0.55 : 0.32}
      transparent
      dashed
      dashScale={0.6}
      dashSize={1.0}
      gapSize={0.5}
    />
  );
}

function RoadNetwork({ clusters }: { clusters: DomainCluster[] }) {
  // Draw faint road lines between nearby cities
  const roads = useMemo(() => {
    const lines: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const a = clusters[i], b = clusters[j];
        const dist = Math.sqrt((a.cx - b.cx) ** 2 + (a.cz - b.cz) ** 2);
        if (dist < 20) {
          lines.push([
            new THREE.Vector3(a.cx, -0.05, a.cz),
            new THREE.Vector3(b.cx, -0.05, b.cz),
          ]);
        }
      }
    }
    return lines;
  }, [clusters]);

  return (
    <>
      {roads.map((pts, i) => (
        <Line key={i} points={pts} color="#1e293b" lineWidth={0.6} opacity={0.4} transparent />
      ))}
    </>
  );
}

function Particles({ clusters }: { clusters: DomainCluster[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 120;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const cluster = clusters[i % clusters.length];
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 6 + 2;
      return {
        x: (cluster?.cx ?? 0) + Math.cos(angle) * radius,
        y: Math.random() * 2,
        z: (cluster?.cz ?? 0) + Math.sin(angle) * radius,
        speed: Math.random() * 0.25 + 0.08,
        offset: Math.random() * Math.PI * 2,
        color: DOMAIN_COLORS[cluster?.domain ?? ""] ?? "#6366f1",
      };
    })
  , [clusters]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((p, i) => {
      dummy.position.set(p.x, p.y + Math.sin(t * p.speed + p.offset) * 0.35, p.z);
      dummy.scale.setScalar(0.09);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.45} vertexColors={false} />
    </instancedMesh>
  );
}

function CameraController({ targetDomain, clusters }: {
  targetDomain: string | null;
  clusters: DomainCluster[];
}) {
  const { camera } = useThree();
  const goalPos = useRef(new THREE.Vector3(0, 36, 32));
  const goalLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const cluster = targetDomain ? clusters.find(c => c.domain === targetDomain) : null;
    if (cluster) {
      goalPos.current.set(cluster.cx, 16, cluster.cz + 18);
      goalLook.current.set(cluster.cx, 0, cluster.cz);
    } else {
      goalPos.current.set(0, 36, 32);
      goalLook.current.set(0, 0, 0);
    }

    const ease = 0.045;
    camera.position.lerp(goalPos.current, ease);
    currentLook.current.lerp(goalLook.current, ease);
    camera.lookAt(currentLook.current);
  });

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

function useCityData(): { clusters: DomainCluster[] } {
  const { overview } = useGraphStore();
  return useMemo(() => {
    const demoClusters: DomainCluster[] = Object.entries(DOMAIN_POSITIONS).map(([domain, [cx, cz]]) => ({
      domain,
      cx,
      cz,
      totalNodes: { drug_discovery: 47, fukushima_governance: 38, euv_lithography: 29, math_category_theory: 18, surgical_robotics: 34, semiconductor_hardware: 31, extreme_environments: 28 }[domain] ?? 20,
      layers: ["knowledge", "context", "agents", "governance"] as LayerKey[],
    }));

    if (!overview) return { clusters: demoClusters };

    const clusterMap: Record<string, { nodes: number; layers: Set<LayerKey> }> = {};
    const domains = new Set<string>();
    for (const layerData of Object.values(overview.layers)) {
      for (const node of layerData.nodes) {
        const d = (node.data as Record<string, unknown>)?.domain as string | null;
        if (d) domains.add(d);
      }
    }

    const domainList = [...domains];
    const layerList = Object.keys(overview.layers) as LayerKey[];
    domainList.forEach(domain => {
      clusterMap[domain] = { nodes: 0, layers: new Set() };
      layerList.forEach(layer => {
        const layerData = overview.layers[layer];
        if (!layerData) return;
        const count = layerData.nodes.filter(n =>
          ((n.data as Record<string, unknown>)?.domain as string | null) === domain
        ).length;
        if (count > 0) {
          clusterMap[domain].nodes += count;
          clusterMap[domain].layers.add(layer);
        }
      });
    });

    const liveClusters: DomainCluster[] = domainList.map(domain => {
      const pos = DOMAIN_POSITIONS[domain] ?? [0, 0];
      const info = clusterMap[domain] ?? { nodes: 0, layers: new Set() };
      return { domain, cx: pos[0], cz: pos[1], totalNodes: info.nodes, layers: [...info.layers] };
    });

    // Always include all 7 demo domains even if backend only returns some
    for (const demo of demoClusters) {
      if (!liveClusters.find(c => c.domain === demo.domain)) {
        liveClusters.push(demo);
      }
    }

    return { clusters: liveClusters };
  }, [overview]);
}

interface Props { className?: string }

export function CityOverview({ className = "" }: Props) {
  const { overview, setDomainFilter } = useGraphStore();
  const [selected, setSelected] = useState<string | null>(null);
  const { clusters } = useCityData();

  const handleDomainClick = (domain: string) => {
    const next = selected === domain ? null : domain;
    setSelected(next);
    setDomainFilter(next);
  };

  const selectedCluster = clusters.find(c => c.domain === selected);

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ background: "#020610" }}>
      {/* Selected domain info panel */}
      {selected && selectedCluster && (
        <div className="absolute top-3 left-3 z-10 rounded-xl p-3 min-w-[180px]"
          style={{ background: "rgba(2,6,16,0.94)", backdropFilter: "blur(12px)", border: `1px solid ${DOMAIN_COLORS[selected] ?? "#6366f1"}30` }}>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Knowledge City</p>
          <p className="text-sm text-slate-100 font-semibold mb-0.5">{DOMAIN_LABELS[selected] ?? selected}</p>
          <p className="text-[10px] text-slate-500 italic">{DOMAIN_SUBLABELS[selected]}</p>
          <div className="flex gap-3 mt-2">
            <div>
              <div className="text-sm font-bold font-mono" style={{ color: DOMAIN_COLORS[selected] }}>{selectedCluster.totalNodes}</div>
              <div className="text-[9px] text-slate-600">nodes</div>
            </div>
            <div>
              <div className="text-sm font-bold font-mono" style={{ color: DOMAIN_COLORS[selected] }}>{selectedCluster.layers.length}</div>
              <div className="text-[9px] text-slate-600">layers</div>
            </div>
          </div>
          <button className="mt-2.5 text-[9px] text-slate-600 hover:text-slate-400 transition-colors"
            onClick={() => { setSelected(null); setDomainFilter(null); }}>
            ✕ deselect
          </button>
        </div>
      )}

      {/* Domain navigation chips — right panel */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1" style={{ maxHeight: "calc(100% - 24px)", overflowY: "auto" }}>
        {clusters.map(c => {
          const color = DOMAIN_COLORS[c.domain] ?? "#6366f1";
          const isActive = selected === c.domain;
          return (
            <button key={c.domain} onClick={() => handleDomainClick(c.domain)}
              className="flex items-center gap-2 rounded-lg text-[10px] font-medium transition-all text-left"
              style={{
                padding: "5px 10px",
                background: isActive ? `${color}18` : "rgba(2,6,16,0.88)",
                border: `1px solid ${isActive ? `${color}45` : "rgba(255,255,255,0.05)"}`,
                color: isActive ? color : "#475569",
                backdropFilter: "blur(8px)",
                boxShadow: isActive ? `0 0 12px ${color}20` : "none",
              }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, opacity: isActive ? 1 : 0.5 }} />
              <span className="flex-1">{DOMAIN_LABELS[c.domain] ?? c.domain}</span>
              <span className="font-mono text-[9px] opacity-60">{c.totalNodes}</span>
            </button>
          );
        })}
      </div>

      {/* Bridge legend — bottom */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
        {CROSS_DOMAIN_BRIDGES.map(b => (
          <div key={b.label} className="flex items-center gap-1.5 rounded px-2 py-1"
            style={{ background: "rgba(2,6,16,0.88)", border: `1px solid ${b.color}30`, backdropFilter: "blur(6px)" }}>
            <div className="w-4 border-t border-dashed" style={{ borderColor: b.color }} />
            <span className="text-[9px]" style={{ color: b.color }}>{b.label}</span>
            <span className="text-[8px] font-mono" style={{ color: "#475569" }}>{Math.round(b.strength * 100)}%</span>
          </div>
        ))}
      </div>

      {!overview && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[9px] text-slate-700 italic">
          Demo — 7 cities · 5 cross-domain bridges
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 36, 32], fov: 52, near: 0.5, far: 300 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.28} />
        <directionalLight position={[10, 30, 10]} intensity={0.9} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-20, 12, -20]} intensity={0.5} color="#6366f1" />
        <pointLight position={[20, 8, 20]} intensity={0.4} color="#14b8a6" />
        <hemisphereLight args={["#0f172a", "#020610", 0.45]} />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#040c1a" roughness={0.98} metalness={0.02} />
        </mesh>
        <gridHelper args={[120, 60, "#0f172a", "#080f1e"]} position={[0, -0.19, 0]} />

        {/* Road network between nearby cities */}
        <RoadNetwork clusters={clusters} />

        {/* Domain districts */}
        {clusters.map(cluster => (
          <DomainDistrict
            key={cluster.domain}
            cluster={cluster}
            selected={selected === cluster.domain}
            onClick={() => handleDomainClick(cluster.domain)}
          />
        ))}

        {/* Cross-domain bridge arcs */}
        {CROSS_DOMAIN_BRIDGES.map(bridge => {
          const src = clusters.find(c => c.domain === bridge.src);
          const tgt = clusters.find(c => c.domain === bridge.tgt);
          if (!src || !tgt) return null;
          return (
            <BridgeArc
              key={bridge.label}
              src={[src.cx, src.cz]}
              tgt={[tgt.cx, tgt.cz]}
              strength={bridge.strength}
              color={bridge.color}
            />
          );
        })}

        {/* Ambient particles */}
        <Particles clusters={clusters} />

        {/* Camera controller: smooth zoom-to-city */}
        <CameraController targetDomain={selected} clusters={clusters} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.15}
          minDistance={8}
          maxDistance={80}
          dampingFactor={0.10}
          enableDamping
          panSpeed={1.2}
          rotateSpeed={0.6}
          zoomSpeed={1.0}
        />
      </Canvas>
    </div>
  );
}

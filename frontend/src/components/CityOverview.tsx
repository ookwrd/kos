import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { useGraphStore, LAYER_COLORS, type LayerKey } from "../store/graphStore";

interface DistrictData {
  domain: string;
  layer: LayerKey;
  count: number;
  x: number;
  z: number;
  color: string;
  domainIdx: number;
}

interface DomainCluster {
  domain: string;
  cx: number;
  cz: number;
  totalNodes: number;
  layers: LayerKey[];
}

const DOMAIN_POSITIONS: Record<string, [number, number]> = {
  drug_discovery:         [-10, -5],
  fukushima_governance:   [0,    8],
  euv_lithography:        [10,  -5],
  math_category_theory:   [-18,  2],
  surgical_robotics:      [-6,  16],
  semiconductor_hardware: [18,   4],
  extreme_environments:   [6,  -18],
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
  semiconductor_hardware: "Semiconductor",
  extreme_environments:   "Extreme Envs.",
};

const DEMO_CLUSTERS: DomainCluster[] = Object.keys(DOMAIN_POSITIONS).map(domain => ({
  domain,
  cx: DOMAIN_POSITIONS[domain]![0],
  cz: DOMAIN_POSITIONS[domain]![1],
  totalNodes: Math.floor(Math.random() * 20 + 10),
  layers: ["knowledge", "context", "agents"] as LayerKey[],
}));

const CROSS_DOMAIN_BRIDGES: Array<[string, string, number]> = [
  ["extreme_environments",   "fukushima_governance",   0.91],
  ["surgical_robotics",      "fukushima_governance",   0.87],
  ["surgical_robotics",      "euv_lithography",        0.82],
  ["math_category_theory",   "fukushima_governance",   0.76],
  ["semiconductor_hardware", "drug_discovery",         0.74],
];

function useCityData(): { districts: DistrictData[]; clusters: DomainCluster[] } {
  const { overview } = useGraphStore();
  return useMemo(() => {
    if (!overview) return { districts: [], clusters: DEMO_CLUSTERS };

    const districts: DistrictData[] = [];
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

    domainList.forEach((domain, di) => {
      const pos = DOMAIN_POSITIONS[domain] ?? [di * 12 - 10, 0];
      clusterMap[domain] = { nodes: 0, layers: new Set() };

      layerList.forEach((layer, li) => {
        const layerData = overview.layers[layer];
        if (!layerData) return;
        const count = layerData.nodes.filter(n =>
          ((n.data as Record<string, unknown>)?.domain as string | null) === domain
        ).length;
        if (count === 0) return;

        clusterMap[domain].nodes += count;
        clusterMap[domain].layers.add(layer);

        const angle = (li / layerList.length) * Math.PI * 2;
        const spread = 3.5;
        districts.push({
          domain,
          layer,
          count,
          x: pos[0] + Math.cos(angle) * spread,
          z: pos[1] + Math.sin(angle) * spread,
          color: LAYER_COLORS[layer] ?? "#64748b",
          domainIdx: di,
        });
      });
    });

    const clusters: DomainCluster[] = domainList.map(domain => {
      const pos = DOMAIN_POSITIONS[domain] ?? [0, 0];
      const info = clusterMap[domain] ?? { nodes: 0, layers: new Set() };
      return {
        domain,
        cx: pos[0],
        cz: pos[1],
        totalNodes: info.nodes,
        layers: [...info.layers],
      };
    });

    return { districts, clusters };
  }, [overview]);
}

function District({ data, selected, onClick }: { data: DistrictData; selected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const height = Math.max(0.3, data.count * 0.2);
  const targetHeight = useRef(height);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const scale = meshRef.current.scale;
    const target = hovered || selected ? targetHeight.current * 1.2 : targetHeight.current;
    scale.y += (target - scale.y) * Math.min(delta * 5, 1);
  });

  return (
    <group position={[data.x, 0, data.z]}>
      {/* Main tower */}
      <mesh
        ref={meshRef}
        scale={[1, height, 1]}
        position={[0, height / 2, 0]}
        onClick={e => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[2.4, 1, 2.4]} />
        <meshStandardMaterial
          color={data.color}
          transparent
          opacity={hovered || selected ? 0.95 : 0.7}
          emissive={data.color}
          emissiveIntensity={hovered || selected ? 0.4 : 0.08}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Glow ring at base */}
      {(hovered || selected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.7, 32]} />
          <meshBasicMaterial color={data.color} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Base platform */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.12, 2.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Count label */}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.22}
        color={hovered || selected ? data.color : "#94a3b8"}
        anchorX="center" anchorY="middle"
      >
        {data.layer}
      </Text>
      <Text
        position={[0, height + 0.22, 0]}
        fontSize={0.16}
        color="#64748b"
        anchorX="center" anchorY="middle"
      >
        {data.count}
      </Text>
    </group>
  );
}

function DomainRing({ cluster, selected, onClick }: { cluster: DomainCluster; selected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = DOMAIN_COLORS[cluster.domain] ?? "#6366f1";
  const label = DOMAIN_LABELS[cluster.domain] ?? cluster.domain;

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    const opacity = selected ? 0.25 : 0.1;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

  return (
    <group position={[cluster.cx, 0, cluster.cz]}>
      {/* Domain platform ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} onClick={onClick}>
        <ringGeometry args={[4.5, 5.2, 48]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.2 : 0.06} />
      </mesh>

      {/* Inner platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]}>
        <circleGeometry args={[4.5, 48]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.06 : 0.02} />
      </mesh>

      {/* Rotating outer ring */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0]}>
        <ringGeometry args={[5.0, 5.1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Domain label */}
      <Text
        position={[0, 0.2, 5.8]}
        fontSize={0.55}
        color={selected ? color : "#64748b"}
        anchorX="center" anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
      <Text
        position={[0, -0.1, 5.8]}
        fontSize={0.3}
        color="#475569"
        anchorX="center" anchorY="middle"
      >
        {cluster.totalNodes} nodes
      </Text>
    </group>
  );
}

function BridgeArc({ from, to, strength = 0.5 }: { from: [number, number]; to: [number, number]; strength?: number }) {
  const points = useMemo(() => {
    const midX = (from[0] + to[0]) / 2;
    const midZ = (from[1] + to[1]) / 2;
    const pts: THREE.Vector3[] = [];
    const numPts = 32;
    for (let i = 0; i <= numPts; i++) {
      const t = i / numPts;
      const x = from[0] + (to[0] - from[0]) * t;
      const z = from[1] + (to[1] - from[1]) * t;
      const height = Math.sin(Math.PI * t) * 3 * strength;
      pts.push(new THREE.Vector3(x, height + 0.1, z));
    }
    return pts;
  }, [from, to, strength]);

  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={1.5}
      opacity={0.35}
      transparent
      dashed
      dashScale={0.5}
      dashSize={0.8}
      gapSize={0.4}
    />
  );
}

function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 80;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: Math.random() * 1.5,
      z: (Math.random() - 0.5) * 30,
      speed: Math.random() * 0.3 + 0.1,
      offset: Math.random() * Math.PI * 2,
    }))
  , []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    positions.forEach((p, i) => {
      dummy.position.set(p.x, p.y + Math.sin(t * p.speed + p.offset) * 0.3, p.z);
      dummy.scale.setScalar(0.08);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
    </instancedMesh>
  );
}

function CameraRig({ target }: { target: [number, number, number] | null }) {
  const { camera } = useThree();
  const targetRef = useRef<[number, number, number]>([0, 14, 18]);

  useEffect(() => {
    if (target) targetRef.current = [target[0], 10, target[2] + 12];
    else targetRef.current = [0, 14, 18];
  }, [target]);

  useFrame(() => {
    camera.position.x += (targetRef.current[0] - camera.position.x) * 0.04;
    camera.position.y += (targetRef.current[1] - camera.position.y) * 0.04;
    camera.position.z += (targetRef.current[2] - camera.position.z) * 0.04;
  });

  return null;
}

interface Props { className?: string }

export function CityOverview({ className = "" }: Props) {
  const { overview, setDomainFilter } = useGraphStore();
  const [selected, setSelected] = useState<string | null>(null);
  const { districts, clusters } = useCityData();

  const handleDomainClick = (domain: string) => {
    const next = selected === domain ? null : domain;
    setSelected(next);
    setDomainFilter(next);
  };

  const selectedCluster = clusters.find(c => c.domain === selected);
  const cameraTarget: [number, number, number] | null = selectedCluster
    ? [selectedCluster.cx, 0, selectedCluster.cz]
    : null;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ background: "#020610" }}>
      {/* Selected domain overlay */}
      {selected && (
        <div
          className="absolute top-3 left-3 z-10 rounded-xl p-3"
          style={{ background: "rgba(2,6,16,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Selected domain</p>
          <p className="text-sm text-slate-100 font-semibold">{DOMAIN_LABELS[selected] ?? selected}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {clusters.find(c => c.domain === selected)?.totalNodes ?? 0} nodes ·{" "}
            {clusters.find(c => c.domain === selected)?.layers.length ?? 0} layers
          </p>
          <button
            className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
            onClick={() => { setSelected(null); setDomainFilter(null); }}
          >
            ✕ clear filter
          </button>
        </div>
      )}

      {/* Domain selector chips */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {clusters.map(c => {
          const color = DOMAIN_COLORS[c.domain] ?? "#6366f1";
          const isSelected = selected === c.domain;
          return (
            <button
              key={c.domain}
              onClick={() => handleDomainClick(c.domain)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-all"
              style={{
                background: isSelected ? `${color}15` : "rgba(2,6,16,0.9)",
                border: `1px solid ${isSelected ? `${color}40` : "rgba(255,255,255,0.05)"}`,
                color: isSelected ? color : "#64748b",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              {DOMAIN_LABELS[c.domain] ?? c.domain}
              <span className="ml-auto font-mono" style={{ color: isSelected ? color : "#475569", fontSize: 9 }}>
                {c.totalNodes}
              </span>
            </button>
          );
        })}
      </div>

      {!overview && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 tracking-widest uppercase italic">
          Demo mode — 7 knowledge cities
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 14, 18], fov: 42 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[8, 20, 8]} intensity={1.0} castShadow />
        <pointLight position={[-12, 8, -12]} intensity={0.6} color="#6366f1" />
        <pointLight position={[12, 6, 12]} intensity={0.4} color="#14b8a6" />
        <hemisphereLight args={["#0f172a", "#020610", 0.5]} />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color="#050d1e" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Grid lines on ground */}
        <gridHelper args={[80, 40, "#1e293b", "#0f172a"]} position={[0, -0.18, 0]} />

        {/* Domain rings */}
        {clusters.map(cluster => (
          <DomainRing
            key={cluster.domain}
            cluster={cluster}
            selected={selected === cluster.domain}
            onClick={() => handleDomainClick(cluster.domain)}
          />
        ))}

        {/* Cross-domain bridge arcs */}
        {CROSS_DOMAIN_BRIDGES.map(([srcDomain, tgtDomain, strength]) => {
          const src = clusters.find(c => c.domain === srcDomain);
          const tgt = clusters.find(c => c.domain === tgtDomain);
          if (!src || !tgt) return null;
          return (
            <BridgeArc
              key={`${srcDomain}-${tgtDomain}`}
              from={[src.cx, src.cz]}
              to={[tgt.cx, tgt.cz]}
              strength={strength}
            />
          );
        })}

        {/* District towers */}
        {districts.map((d, i) => (
          <District
            key={i}
            data={d}
            selected={selected === d.domain}
            onClick={() => handleDomainClick(d.domain)}
          />
        ))}

        {/* Ambient particles */}
        <Particles />

        <CameraRig target={cameraTarget} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.1}
          minDistance={6}
          maxDistance={55}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
}

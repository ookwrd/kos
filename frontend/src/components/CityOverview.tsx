/**
 * CityOverview — Three.js 2.5D ecology view of the KOS graph.
 *
 * Renders domain subgraphs as "districts": flat coloured platforms whose
 * building height encodes node count in that domain+layer combination.
 * Hovering a district shows its layer and count. Clicking selects it and
 * filters the GraphCanvas to that domain.
 *
 * Visual metaphor: knowledge city. Dense, well-connected districts are
 * tall. Sparse neighbourhoods (open-endedness targets) are short.
 */

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useGraphStore, LAYER_COLORS, type LayerKey } from "../store/graphStore";

interface DistrictData {
  domain: string;
  layer: LayerKey;
  count: number;
  x: number;
  z: number;
  color: string;
}

function useCityData(): DistrictData[] {
  const { overview } = useGraphStore();
  return useMemo(() => {
    if (!overview) return [];
    const districts: DistrictData[] = [];
    const domains = new Set<string>();

    // Collect all domains
    for (const layerData of Object.values(overview.layers)) {
      for (const node of layerData.nodes) {
        const d = (node.data as Record<string, unknown>)?.domain as string | null;
        if (d) domains.add(d);
      }
    }

    const domainList = [...domains];
    const layerList = Object.keys(overview.layers) as LayerKey[];

    domainList.forEach((domain, di) => {
      layerList.forEach((layer, li) => {
        const layerData = overview.layers[layer];
        if (!layerData) return;
        const count = layerData.nodes.filter(n =>
          ((n.data as Record<string, unknown>)?.domain as string | null) === domain
        ).length;
        if (count === 0) return;

        districts.push({
          domain,
          layer,
          count,
          x: di * 4 - (domainList.length * 2),
          z: li * 4 - (layerList.length * 2),
          color: LAYER_COLORS[layer] ?? "#64748b",
        });
      });
    });

    return districts;
  }, [overview]);
}

function District({
  data,
  onClick,
}: {
  data: DistrictData;
  onClick: (d: DistrictData) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const height = Math.max(0.2, data.count * 0.15);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = hovered ? height + 0.15 : height;
    meshRef.current.scale.y += (target - meshRef.current.scale.y) * 0.1;
  });

  return (
    <group position={[data.x, 0, data.z]}>
      <mesh
        ref={meshRef}
        scale={[1, height, 1]}
        position={[0, height / 2, 0]}
        onClick={() => onClick(data)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[2.8, 1, 2.8]} />
        <meshStandardMaterial
          color={data.color}
          transparent
          opacity={hovered ? 1.0 : 0.75}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.3 : 0.05}
        />
      </mesh>
      {/* Base platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Label */}
      <Text
        position={[0, height + 0.4, 0]}
        fontSize={0.28}
        color="#f1f5f9"
        anchorX="center"
        anchorY="middle"
      >
        {data.layer}
      </Text>
      <Text
        position={[0, height + 0.1, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {data.domain} · {data.count}
      </Text>
    </group>
  );
}

interface Props {
  className?: string;
}

export function CityOverview({ className = "" }: Props) {
  const { overview, setDomainFilter } = useGraphStore();
  const [selected, setSelected] = useState<DistrictData | null>(null);
  const districts = useCityData();

  const handleClick = (d: DistrictData) => {
    const newDomain = selected?.domain === d.domain ? null : d.domain;
    setSelected(newDomain ? d : null);
    setDomainFilter(newDomain);
  };

  return (
    <div className={`relative bg-slate-950 rounded-lg overflow-hidden ${className}`}>
      {/* Info overlay */}
      {selected && (
        <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur rounded-lg p-3 text-xs">
          <p className="text-slate-400">Selected domain</p>
          <p className="text-slate-100 font-medium">{selected.domain}</p>
          <p className="text-slate-400 mt-1">{selected.layer} · {selected.count} nodes</p>
          <button
            className="mt-2 text-slate-400 hover:text-white"
            onClick={() => { setSelected(null); setDomainFilter(null); }}
          >
            ✕ clear
          </button>
        </div>
      )}

      {!overview && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
          Loading…
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 14, 18], fov: 45 }}
        style={{ background: "#020617" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#6366f1" />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Districts */}
        {districts.map((d, i) => (
          <District key={i} data={d} onClick={handleClick} />
        ))}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={60}
        />
      </Canvas>
    </div>
  );
}

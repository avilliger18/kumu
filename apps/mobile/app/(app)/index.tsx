import { useAuthActions } from "@convex-dev/auth/react";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as THREE from "three";

// ── helpers ──────────────────────────────────────────────────────────────────

function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function buildArcPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  lift = 1.35,
  segments = 80,
) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3().lerpVectors(start, end, t);
    p.normalize().multiplyScalar(lift);
    pts.push(p);
  }
  return pts;
}

// ── sub-components ───────────────────────────────────────────────────────────

function GlobeMesh({ rotRef }: { rotRef: React.MutableRefObject<THREE.Mesh | null> }) {
  return (
    <mesh ref={rotRef}>
      {/* atmosphere glow ring */}
      <mesh>
        <sphereGeometry args={[1.015, 64, 64]} />
        <meshStandardMaterial
          color="#0a2a6e"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>
      {/* globe body */}
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial
        color="#0d2b6b"
        emissive="#071433"
        specular="#4477cc"
        shininess={18}
      />
    </mesh>
  );
}

function Dot({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.022, 16, 16]} />
      <meshStandardMaterial color="#ff9500" emissive="#ff6000" emissiveIntensity={0.6} />
    </mesh>
  );
}

function AnimatedArc({
  start,
  end,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
}) {
  const lineRef = useRef<any>(null);
  const progress = useRef(0);
  const points = buildArcPoints(start, end);

  useFrame((_, delta) => {
    progress.current = Math.min(progress.current + delta * 0.4, 1);
    if (lineRef.current) {
      const drawn = Math.floor(progress.current * points.length);
      const geo = new THREE.BufferGeometry().setFromPoints(points.slice(0, drawn));
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geo;
    }
  });

  const initialGeo = new THREE.BufferGeometry().setFromPoints([points[0]]);

  return (
    <line ref={lineRef} geometry={initialGeo}>
      <lineBasicMaterial color="#ff453a" linewidth={2} />
    </line>
  );
}

function Scene() {
  const globeRef = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    if (globeRef.current) globeRef.current.rotation.y += 0.0015;
  });

  const brazil = latLngToVec3(-14.235, -51.925, 1);
  const switzerland = latLngToVec3(47.3769, 8.5417, 1);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-4, -2, -4]} intensity={0.4} color="#2244aa" />

      <GlobeMesh rotRef={globeRef} />
      <Dot position={brazil} />
      <Dot position={switzerland} />
      <AnimatedArc start={brazil} end={switzerland} />
    </>
  );
}

// ── screen ────────────────────────────────────────────────────────────────────

export default function GlobeScreen() {
  const { signOut } = useAuthActions();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <View style={styles.container}>
      <Canvas
        style={StyleSheet.absoluteFill}
        camera={{ position: [0, 0, 2.6], fov: 45 }}
      >
        <Scene />
      </Canvas>

      {/* header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>kumu</Text>
      </View>

      {/* legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "#ff9500" }]} />
          <Text style={styles.legendText}>Cocoa Plantation · Brazil</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "#ff9500" }]} />
          <Text style={styles.legendText}>Factory · Switzerland</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "#ff453a", borderRadius: 1 }]} />
          <Text style={styles.legendText}>Supply route</Text>
        </View>
      </View>

      {/* sign out */}
      <Pressable
        onPress={handleSignOut}
        disabled={signingOut}
        style={({ pressed }) => [
          styles.signOut,
          { opacity: pressed || signingOut ? 0.6 : 1 },
        ]}
      >
        <Text style={styles.signOutText}>
          {signingOut ? "Signing out…" : "Sign Out"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  wordmark: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    opacity: 0.9,
  },
  legend: {
    position: "absolute",
    bottom: 110,
    left: 24,
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: "#8E8E93",
    fontSize: 13,
  },
  signOut: {
    position: "absolute",
    bottom: 48,
    right: 24,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#38383A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  signOutText: {
    color: "#FF453A",
    fontSize: 14,
    fontWeight: "600",
  },
});

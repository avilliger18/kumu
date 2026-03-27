import React, { useRef } from "react";
import { View } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber/native";
import * as THREE from "three";

// 🌍 Lat/Lng → 3D Position
function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// 🌍 Erde (clean ohne Texture Bug)
function Earth() {
  const ref = useRef<any>();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.7, 64, 64]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
  );
}

// 🏭 Marker
function Marker({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshStandardMaterial color="#f97316" emissive="#f97316" />
    </mesh>
  );
}

// 💗 Pinke Route
function Arc({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const mid = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(0.9);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

  // ✅ Tube statt Line
  const geometry = new THREE.TubeGeometry(curve, 64, 0.005, 8, false);

  const material = new THREE.MeshBasicMaterial({
    color: "#ff2d95",
  });

  return <mesh geometry={geometry} material={material} />;
}

// 🌍 Scene
function GlobeScene() {
  const radius = 0.7;

  const brazil = latLngToVector3(-14.235, -51.925, radius);
  const switzerland = latLngToVector3(47.3769, 8.5417, radius);

  return (
    <>
      {/* Licht */}
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 2]} intensity={1} />

      {/* Globe */}
      <Earth />

      {/* Marker */}
      <Marker position={brazil} />
      <Marker position={switzerland} />

      {/* Route */}
      <Arc start={brazil} end={switzerland} />
    </>
  );
}

// 📱 App
export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Canvas
        camera={{
          position: [0, 0, 2.8],
          fov: 50,
        }}
      >
        <GlobeScene />
      </Canvas>
    </View>
  );
}

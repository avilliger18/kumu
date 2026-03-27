"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function SupplyChainGlobe() {
  const globeRef = useRef();
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  const points = [
    {
      lat: -14.235, // Brasilien
      lng: -51.925,
      name: "Kakao Plantage",
    },
    {
      lat: 47.3769, // Schweiz
      lng: 8.5417,
      name: "Fabrik Schweiz",
    },
  ];

  const arcs = [
    {
      startLat: -14.235,
      startLng: -51.925,
      endLat: 47.3769,
      endLng: 8.5417,
    },
  ];

  return (
    <>
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => signOut()}
            className="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-sm px-4 py-2 rounded-xl border border-zinc-700 transition-colors backdrop-blur-sm"
          >
            Sign out
          </button>
        </div>
      )}
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointLabel="name"
        pointAltitude={0.02}
        pointColor={() => "orange"}
        arcsData={arcs}
        arcColor={() => ["#ff459f", "#ff459f"]}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        onPointClick={(point) => {
          console.log("Clicked:", point.name);
        }}
      />
    </>
  );
}

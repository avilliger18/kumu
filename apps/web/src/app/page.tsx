"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function SupplyChainGlobe() {
  const globeRef = useRef();

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
  );
}

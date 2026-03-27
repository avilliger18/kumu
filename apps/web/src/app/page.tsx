"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@kumu/backend/convex/_generated/api";
import { DropdownMenu } from "radix-ui";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import herb from "../../public/herb.png";

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function SupplyChainGlobe() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const profile = useQuery(api.users.currentProfile);
  const initials = useMemo(
    () => getInitials(profile?.name, profile?.email),
    [profile?.name, profile?.email],
  );
  const [barcode, setBarcode] = useState("");
  const [viewport, setViewport] = useState({ width: 1200, height: 700 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: Math.round(window.innerHeight * 0.7),
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const cleanedBarcode = barcode.trim();
  const showInfoBox = cleanedBarcode.length > 0;
  const scanResult = useQuery(
    api.products.resolveProductByScan,
    showInfoBox ? { barcode: cleanedBarcode } : "skip",
  );
  const product =
    scanResult?.resolutionStatus === "found" ? scanResult.product : null;
  const producer =
    scanResult?.resolutionStatus === "found" ? scanResult.producer : null;
  const nutrition = product?.nutrition?.per100;

  const globeRef = useRef<any>(null);

  const steps = scanResult?.supplyChainSteps ?? [];

  // Build arc data: each origin step → the factory step
  const factoryStep = steps.find((s) => s.type === "factory");
  const distStep = steps.find((s) => s.type === "distribution");
  const supplyArcs = useMemo(() => {
    if (!factoryStep) return [];
    const origins = steps.filter(
      (s) => s.type !== "factory" && s.type !== "distribution",
    );
    const arcs = origins.map((o) => ({
      startLat: o.lat,
      startLng: o.lng,
      endLat: factoryStep.lat,
      endLng: factoryStep.lng,
    }));
    if (distStep) {
      arcs.push({
        startLat: factoryStep.lat,
        startLng: factoryStep.lng,
        endLat: distStep.lat,
        endLng: distStep.lng,
      });
    }
    return arcs;
  }, [steps, factoryStep, distStep]);

  const STEP_EMOJI: Record<string, string> = {
    plantation: "🌿",
    farm: "🌾",
    factory: "🏭",
    distribution: "📦",
    processing: "⚙️",
  };

  const supplyPoints = useMemo(
    () =>
      steps.map((s) => ({
        ...s,
        emoji: STEP_EMOJI[s.type] ?? "📍",
      })),
    [steps],
  );

  // Auto-fly globe to frame the supply chain when product loads
  useEffect(() => {
    if (!globeRef.current || steps.length === 0) return;
    const lats = steps.map((s) => s.lat);
    const lngs = steps.map((s) => s.lng);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    globeRef.current.pointOfView(
      { lat: centerLat, lng: centerLng, altitude: 2.2 },
      1800,
    );
  }, [steps.length]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white shadow-md ring-2 ring-white/20 transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                aria-label="Account menu"
              >
                {initials}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[160px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
              >
                <DropdownMenu.Item
                  onSelect={() => router.push("/profile")}
                  className="flex cursor-pointer select-none items-center px-4 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50"
                >
                  Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => router.push("/history")}
                  className="flex cursor-pointer select-none items-center px-4 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50"
                >
                  History
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                <DropdownMenu.Item
                  onSelect={() => signOut()}
                  className="flex cursor-pointer select-none items-center px-4 py-2.5 text-sm font-medium text-red-500 outline-none hover:bg-red-50 focus:bg-red-50"
                >
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}

      <div className="flex h-full w-full">
        <aside
          className={`h-full overflow-hidden border-r border-slate-200/70 transition-all duration-500 ease-out ${
            showInfoBox
              ? "w-[40%] p-6 opacity-100"
              : "w-0 p-0 opacity-0 pointer-events-none"
          }`}
        >
          <Card
            className={`h-[90%] rounded-3xl border-slate-300 bg-white p-0 transition-all duration-500 ease-out ${
              showInfoBox ? "translate-x-0" : "-translate-x-8"
            }`}
          >
            <CardContent className="p-6">
              {!scanResult && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Lade Testdaten fuer den Barcode...
                </div>
              )}

              {scanResult?.resolutionStatus !== "found" && scanResult && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Kein Produkt fuer diesen Barcode gefunden.
                </div>
              )}

              {product && (
                <div className="flex h-[calc(100%-3rem)] flex-col gap-5 overflow-y-auto pr-1 text-slate-700">
                  <div className="grid grid-cols-[40%_1fr] gap-5">
                    <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <Image
                        src={product.thumbnailUrl ?? "/globe.svg"}
                        alt={product.title}
                        fill
                        unoptimized
                        className="object-contain p-3"
                      />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold font-heading">
                        {product.title}
                      </h3>
                      <p className="text-sm">
                        {producer?.displayName ?? "Unbekannt"}
                      </p>
                      <p>
                        <span className="font-medium">Barcode:</span>{" "}
                        {cleanedBarcode}
                      </p>

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-medium">Kumu Score</span>
                          <span
                            className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-slate-300 text-xs"
                            title="Der Kumu Score bewertet die Gesamtqualitaet des Produkts auf einer Skala von 0 bis 100."
                          >
                            ?
                          </span>
                        </div>
                        <p className="mt-2 text-sm">
                          {product.qualityScores.overallFoodScore}/100
                        </p>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={product.qualityScores.overallFoodScore}
                          disabled
                          className="h-2 w-full cursor-not-allowed accent-[#FF459F]"
                        />
                      </div>

                      <div className="pt-1">
                        <h4 className="font-heading text-base">Labels</h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {product.labels.length > 0 ? (
                            product.labels.map((label) => (
                              <Badge key={label} variant="secondary">
                                {label}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs">
                              Keine Labels vorhanden
                            </span>
                          )}

                          <Button type="button" variant="outline" size="sm">
                            View certificates
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="relative overflow-hidden shadow-md">
                    <div
                      className="pointer-events-none absolute -bottom-8 -right-4 z-0 -rotate-20"
                      aria-hidden
                    >
                      <Image
                        src={herb}
                        alt=""
                        width={160}
                        height={160}
                        className="h-40 w-40"
                      />
                    </div>
                    <CardContent className="relative z-10 p-6 pb-12">
                      <h4 className="font-heading text-2xl">Ingredients</h4>
                      <ul className="list-disc pl-5 pr-32 pb-6">
                        {product.ingredients.length > 0 ? (
                          product.ingredients.map((ingredient, index) => (
                            <li key={`${ingredient.name}-${index}`}>
                              {ingredient.name}
                              {typeof ingredient.percent === "number"
                                ? ` (${ingredient.percent}%)`
                                : ""}
                            </li>
                          ))
                        ) : (
                          <li>Keine Zutaten verfuegbar</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-2">
                    <h4 className="font-heading text-lg">
                      Nutritional values (per 100g)
                    </h4>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm md:grid-cols-3">
                        <p>Energy: {nutrition?.energyKcal ?? "-"} kcal</p>
                        <p>Fat: {nutrition?.fat ?? "-"} g</p>
                        <p>Saturated fat: {nutrition?.saturatedFat ?? "-"} g</p>
                        <p>Carbs: {nutrition?.carbs ?? "-"} g</p>
                        <p>Sugars: {nutrition?.sugars ?? "-"} g</p>
                        <p>Fiber: {nutrition?.fiber ?? "-"} g</p>
                        <p>Protein: {nutrition?.protein ?? "-"} g</p>
                        <p>Salt: {nutrition?.salt ?? "-"} g</p>
                        <p>Iron: {nutrition?.iron ?? "-"} mg</p>
                      </div>
                    </div>
                  </div>

                  <Card className="rounded-2xl">
                    <CardContent className="p-5">
                      <h4 className="font-heading text-lg">
                        Ecological footprint
                      </h4>
                      <p className="mt-4 text-sm">Distance traveled</p>
                      <p className="mt-1 text-4xl font-heading leading-none">
                        1,240 km
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <section
          className={`relative h-full transition-all duration-500 ease-out ${
            showInfoBox ? "w-[60%]" : "w-full"
          }`}
        >
          <div className="absolute top-8 left-1/2 z-40 w-[min(92%,640px)] -translate-x-1/2">
            <label htmlFor="barcode-search" className="sr-only">
              Barcode eingeben
            </label>
            <Input
              id="barcode-search"
              type="text"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder="Barcode eingeben..."
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex h-[70vh] items-end justify-center">
            <Globe
              ref={globeRef}
              width={Math.round(viewport.width * (showInfoBox ? 0.6 : 1))}
              height={viewport.height}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              backgroundColor="rgba(0,0,0,0)"
              // supply chain arcs
              arcsData={supplyArcs}
              arcStartLat={(d: any) => d.startLat}
              arcStartLng={(d: any) => d.startLng}
              arcEndLat={(d: any) => d.endLat}
              arcEndLng={(d: any) => d.endLng}
              arcColor={() => "#ff459f"}
              arcAltitude={0.35}
              arcStroke={1.2}
              arcDashLength={0.4}
              arcDashGap={0.25}
              arcDashAnimateTime={2200}
              // supply chain markers
              htmlElementsData={supplyPoints}
              htmlLat={(d: any) => d.lat}
              htmlLng={(d: any) => d.lng}
              htmlAltitude={0.01}
              htmlElement={(d: any) => {
                const el = document.createElement("div");
                el.style.cssText = `
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 4px;
                  cursor: default;
                  user-select: none;
                `;
                const badge = document.createElement("div");
                badge.style.cssText = `
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  background: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 18px;
                  box-shadow: 0 4px 14px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2);
                  border: 2px solid ${d.type === "factory" ? "#ff459f" : d.type === "distribution" ? "#6366f1" : "#22c55e"};
                `;
                badge.textContent = d.emoji;
                const label = document.createElement("div");
                label.style.cssText = `
                  background: rgba(0,0,0,0.72);
                  color: white;
                  font-size: 10px;
                  font-weight: 600;
                  padding: 2px 6px;
                  border-radius: 6px;
                  white-space: nowrap;
                  letter-spacing: 0.02em;
                `;
                label.textContent = d.label;
                el.appendChild(badge);
                el.appendChild(label);
                return el;
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

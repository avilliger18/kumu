"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import type { GenericId } from "convex/values";
import { api } from "@kumu/backend/convex/_generated/api";
import { DropdownMenu } from "radix-ui";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import herb from "../../public/herb.png";
import apple from "../../public/apple.png";
import footstep from "../../public/footstep.png";
import globe from "../../public/globe.png";

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

// kg CO₂ per ton-km (same factors as supplier page)
const CO2_FACTOR: Record<string, number> = {
  ship: 0.010,
  plane: 0.602,
  truck: 0.062,
  train: 0.022,
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcFootprint(steps: { lat: number; lng: number; transportMode?: string }[]) {
  let totalKm = 0;
  let co2 = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    const km = haversineKm(steps[i].lat, steps[i].lng, steps[i + 1].lat, steps[i + 1].lng);
    totalKm += km;
    co2 += km * (CO2_FACTOR[steps[i].transportMode ?? "truck"] ?? CO2_FACTOR.truck);
  }
  return {
    totalKm: Math.round(totalKm),
    co2PerTon: Math.round(co2 * 10) / 10,
  };
}

const STEP_EMOJI: Record<string, string> = {
  plantation: "🌿",
  farm: "🌾",
  factory: "🏭",
  distribution: "📦",
  processing: "⚙️",
};

export default function SupplyChainGlobe() {
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const router = useRouter();
  const profile = useQuery(api.users.currentProfile);
  const initials = useMemo(
    () => getInitials(profile?.name, profile?.email),
    [profile?.name, profile?.email],
  );
  const [barcode, setBarcode] = useState("");
  const [viewport, setViewport] = useState({ width: 1200, height: 700 });
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(
    null,
  );
  const [scorePopoverOpen, setScorePopoverOpen] = useState(false);
  const [scorePopoverPos, setScorePopoverPos] = useState({ top: 0, left: 0 });
  const scoreButtonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
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

  const isRealProduct =
    product?._id &&
    typeof product._id === "string" &&
    !String(product._id).startsWith("mock");

  const alerts = useQuery(
    api.suppliers.getOpenAlertsForProduct,
    isRealProduct
      ? { productId: product!._id as unknown as GenericId<"products"> }
      : "skip",
  );

  const globeRef = useRef<any>(null);

  const steps = useMemo(
    () => scanResult?.supplyChainSteps ?? [],
    [scanResult?.supplyChainSteps],
  );

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

  const footprint = useMemo(() => calcFootprint(steps), [steps]);

  const supplyPoints = useMemo(
    () =>
      steps.map((s, i) => ({
        ...s,
        emoji: STEP_EMOJI[s.type] ?? "📍",
        isSelected: i === selectedStepIndex,
      })),
    [steps, selectedStepIndex],
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
      {!isAuthLoading && isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF459F] text-sm font-bold text-white shadow-md ring-2 ring-white/20 transition hover:bg-[#FF459F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF459F]"
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
                  onSelect={() => router.push("/supplier")}
                  className="flex cursor-pointer select-none items-center px-4 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50"
                >
                  Become a Supplier
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
          className={`h-full overflow-hidden transition-all duration-500 ease-out ${
            showInfoBox
              ? "w-[40%] p-6 opacity-100"
              : "w-0 p-0 opacity-0 pointer-events-none"
          }`}
        >
          <Card
            className={`h-full rounded-3xl border-slate-300 bg-white p-0 pt-6 transition-all duration-500 ease-out ${
              showInfoBox ? "translate-x-0" : "-translate-x-8"
            }`}
          >
            <CardContent className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                <div className="flex flex-col gap-5 text-slate-700">
                  {alerts && alerts.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {alerts.map((alert) => (
                        <div
                          key={alert._id}
                          className={`rounded-2xl border p-4 ${
                            alert.severity === "high"
                              ? "border-red-200 bg-red-50"
                              : alert.severity === "medium"
                              ? "border-orange-200 bg-orange-50"
                              : "border-yellow-200 bg-yellow-50"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-lg">⚠️</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold uppercase tracking-wide ${
                                alert.severity === "high" ? "text-red-700"
                                : alert.severity === "medium" ? "text-orange-700"
                                : "text-yellow-700"
                              }`}>
                                {alert.severity === "high" ? "High" : alert.severity === "medium" ? "Medium" : "Low"} severity alert
                                {alert.stepLabel && ` · ${alert.stepLabel}`}
                              </p>
                              <p className="mt-1 text-sm text-slate-700">{alert.faultDescription}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {alert.chargeNumber && <>Affected charge: <span className="font-semibold">{alert.chargeNumber}</span></>}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                            ref={scoreButtonRef}
                            className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-[#FF459F] text-[#FF459F] text-xs"
                            onMouseEnter={() => {
                              const rect = scoreButtonRef.current?.getBoundingClientRect();
                              if (rect) setScorePopoverPos({ top: rect.bottom + 8, left: rect.left });
                              setScorePopoverOpen(true);
                            }}
                            onMouseLeave={() => setScorePopoverOpen(false)}
                          >
                            ?
                          </span>
                          {scorePopoverOpen && typeof document !== "undefined" && createPortal(
                            <div
                              className="fixed z-9999 w-80 rounded-2xl bg-white shadow-xl border border-slate-100 p-5"
                              style={{ top: scorePopoverPos.top, left: scorePopoverPos.left }}
                              onMouseEnter={() => setScorePopoverOpen(true)}
                              onMouseLeave={() => setScorePopoverOpen(false)}
                            >
                              <p className="font-bold text-[#FF459F] text-base mb-3">Kumu Score</p>
                              <div className="flex flex-col gap-2">
                                {[
                                  { label: "Excellent", color: "#FF459F", range: "80–100" },
                                  { label: "Good",      color: "#FF7DBF", range: "60–79" },
                                  { label: "Average",   color: "#FFB5D9", range: "40–59" },
                                  { label: "Poor",      color: "#FFCCEB", range: "20–39" },
                                  { label: "Very Poor", color: "#FFE5F4", range: "0–19" },
                                ].map(({ label, color, range }) => (
                                  <div key={label} className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full shrink-0" style={{ background: color }} />
                                    <span className="text-sm text-slate-600">{label}</span>
                                    <span className="ml-auto text-xs text-slate-400">{range}</span>
                                  </div>
                                ))}
                              </div>
                              <hr className="my-3 border-[#FF459F]/20" />
                              {(() => {
                                const qs = product.qualityScores;
                                const n = nutrition;
                                const categories = [
                                  {
                                    label: "Macronutrients",
                                    pct: qs.nutriScore ? ({ A: 100, B: 80, C: 60, D: 40, E: 20 }[qs.nutriScore] ?? null) : null,
                                  },
                                  {
                                    label: "Micronutrients",
                                    pct: qs.overallFoodScore != null ? Math.round(qs.overallFoodScore * 1.1) : null,
                                  },
                                  {
                                    label: "Degree of processing",
                                    pct: qs.novaGroup != null ? Math.round(((5 - qs.novaGroup) / 4) * 100) : null,
                                  },
                                  {
                                    label: "Additives",
                                    pct: qs.additiveRiskScore != null ? Math.max(0, Math.round(100 - qs.additiveRiskScore * 10)) : null,
                                  },
                                  {
                                    label: "Fat quality",
                                    pct: n?.fat && n?.saturatedFat != null ? Math.max(0, Math.round((1 - n.saturatedFat / n.fat) * 100)) : null,
                                  },
                                  {
                                    label: "Carbohydrate quality",
                                    pct: n?.carbs && n?.sugars != null ? Math.max(0, Math.round((1 - n.sugars / n.carbs) * 100)) : null,
                                  },
                                  {
                                    label: "Ingredient quality",
                                    pct: qs.overallFoodScore ?? null,
                                  },
                                ];
                                return categories.map(({ label, pct }) => (
                                  <div key={label} className="flex items-center gap-2">
                                    <span className="w-36 shrink-0 text-xs text-slate-700">{label}</span>
                                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#ffd6ea" }}>
                                      {pct != null && (
                                        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: "#FF459F" }} />
                                      )}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>,
                            document.body
                          )}
                        </div>
                        <div className="mt-3 relative h-10 w-full rounded-full overflow-visible"
                          style={{ background: "linear-gradient(to right, #ffd6ea, #FF459F)" }}
                        >
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white shadow-md border-2 border-white"
                            style={{ left: `${product.qualityScores.overallFoodScore}%` }}
                          />
                          <span
                            className="absolute top-1/2 -translate-y-1/2 right-4 text-white text-sm font-semibold"
                          >
                            {product.qualityScores.overallFoodScore}/100
                          </span>
                        </div>
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
                      className="pointer-events-none absolute -bottom-8 -right-4 z-0 -rotate-15"
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
                    <CardContent className="relative z-10 p-6 ">
                      <h4 className="font-heading text-2xl">Ingredients</h4>
                      <ul className="list-disc pl-5 pr-32">
                        {(product.ingredients ?? []).length > 0 ? (
                          (product.ingredients ?? []).map((ingredient, index) => (
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

                  <Card className="relative overflow-hidden shadow-md">
                    <div
                      className="pointer-events-none absolute -bottom-8 -right-4 z-0 -rotate-15"
                      aria-hidden
                    >
                      <Image
                        src={apple}
                        alt=""
                        width={160}
                        height={160}
                        className="h-40 w-40"
                      />
                    </div>
                    <CardContent className="relative z-10 p-6">
                      <h4 className="font-heading text-2xl">
                        Nutritional values (per{" "}
                        {product.nutrition?.referenceBasis ?? "100g"})
                      </h4>
                      <ul className="list-disc pl-5 pr-32">
                        <li>Energy: {nutrition?.energyKcal ?? "-"} kcal</li>
                        <li>Sugar: {nutrition?.sugars ?? "-"} g</li>
                        <li>Fat: {nutrition?.fat ?? "-"} g</li>
                        <li>Carbohydrates: {nutrition?.carbs ?? "-"} g</li>
                        <li>Protein: {nutrition?.protein ?? "-"} g</li>
                        <li>Salt: {nutrition?.salt ?? "-"} g</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {steps.length > 0 && (
                    <Card className="relative overflow-hidden shadow-md">
                      <div
                        className="pointer-events-none absolute -bottom-8 -right-4 z-0 -rotate-15"
                        aria-hidden
                      >
                        <Image
                          src={globe}
                          alt=""
                          width={160}
                          height={160}
                          className="h-40 w-40"
                        />
                      </div>
                      <CardContent className="relative z-10 p-6">
                        <h4 className="font-heading text-2xl">Supply Chain</h4>
                        <div className="mt-3 flex flex-col gap-0 pr-32">
                          {steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className="h-4 w-4 rounded-full bg-blue-200 mt-0.5 shrink-0" />
                                {i < steps.length - 1 && (
                                  <div className="w-px flex-1 border-l-2 border-dashed border-blue-200 my-1 min-h-5" />
                                )}
                              </div>
                              <button
                                className="text-sm text-slate-700 pb-3 text-left hover:text-[#FF459F] transition-colors cursor-pointer"
                                onClick={() => {
                                  setSelectedStepIndex(i);
                                  globeRef.current?.pointOfView(
                                    {
                                      lat: step.lat,
                                      lng: step.lng,
                                      altitude: 1.2,
                                    },
                                    1000,
                                  );
                                }}
                              >
                                {step.label}
                              </button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="relative overflow-hidden shadow-md">
                    <div
                      className="pointer-events-none absolute -bottom-8 -right-4 z-0 -rotate-15"
                      aria-hidden
                    >
                      <Image
                        src={footstep}
                        alt=""
                        width={160}
                        height={160}
                        className="h-40 w-40"
                      />
                    </div>
                    <CardContent className="relative z-10 p-6">
                      <h4 className="font-heading text-2xl">
                        Ecological footprint
                      </h4>
                      <p className="mt-4 text-sm">Distance traveled</p>
                      <p className="mt-1 text-4xl font-heading leading-none">
                        {footprint.totalKm > 0 ? `${footprint.totalKm.toLocaleString()} km` : "—"}
                      </p>
                      {footprint.co2PerTon > 0 && (
                        <>
                          <p className="mt-3 text-sm">CO₂ per ton of product</p>
                          <p className="mt-1 text-4xl font-heading leading-none">
                            {footprint.co2PerTon.toLocaleString()} kg
                          </p>
                        </>
                      )}
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

          <div className="absolute inset-0 flex items-center justify-center">
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
              arcAltitude={0.2}
              arcStroke={0.8}
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
                if (d.isSelected) {
                  const popover = document.createElement("div");
                  popover.style.cssText = `
                    position: absolute;
                    bottom: calc(100% + 10px);
                    left: 18%;
                    transform: translateX(-50%);
                    background: white;
                    border-radius: 12px;
                    padding: 10px 14px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
                    min-width: 160px;
                    pointer-events: none;
                  `;
                  popover.innerHTML = `
                    <div style="font-weight:700;font-size:12px;color:#1e293b;margin-bottom:4px">${d.label}</div>
                    <div style="font-size:11px;color:#64748b">${d.location}</div>
                    <div style="font-size:11px;color:#64748b;margin-top:4px">${d.ingredient ?? ""}</div>
                    <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:12px;height:12px;background:white;clip-path:polygon(0 0,100% 0,50% 100%)"></div>
                  `;
                  el.style.position = "relative";
                  el.appendChild(popover);
                }
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

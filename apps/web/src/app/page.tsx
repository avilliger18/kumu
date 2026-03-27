"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@kumu/backend/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function SupplyChainGlobe() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
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

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => signOut()}
            variant="outline"
            // size="default"
          >
            Sign out
          </Button>
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
                <div className="flex h-[calc(100%-3rem)] flex-col gap-5 text-slate-700">
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
              width={Math.round(viewport.width * (showInfoBox ? 0.6 : 1))}
              height={viewport.height}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              backgroundColor="rgba(0,0,0,0)"
              pointsData={[]}
              arcsData={[]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

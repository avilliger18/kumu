import { describe, it, expect } from "vitest";
import { calcFootprint } from "./shared";
import type { SupplyStep } from "./shared";

function makeStep(
  overrides: Partial<SupplyStep> & { lat: number; lng: number }
): SupplyStep {
  return {
    step: 0,
    type: "factory",
    label: "Test",
    location: "Test",
    ...overrides,
  };
}

describe("calcFootprint", () => {
  it("returns zero for empty steps", () => {
    expect(calcFootprint([])).toEqual({ totalKm: 0, co2PerTon: 0 });
  });

  it("returns zero for a single step (no legs)", () => {
    const steps = [makeStep({ lat: 51.5, lng: -0.1 })];
    expect(calcFootprint(steps)).toEqual({ totalKm: 0, co2PerTon: 0 });
  });

  it("returns zero distance for two identical coordinates", () => {
    const steps = [
      makeStep({ lat: 48.8566, lng: 2.3522 }),
      makeStep({ lat: 48.8566, lng: 2.3522 }),
    ];
    expect(calcFootprint(steps)).toEqual({ totalKm: 0, co2PerTon: 0 });
  });

  it("calculates distance between two known cities (London → Paris ≈ 340 km)", () => {
    const steps = [
      makeStep({ lat: 51.5074, lng: -0.1278 }), // London
      makeStep({ lat: 48.8566, lng: 2.3522 }), // Paris
    ];
    const result = calcFootprint(steps);
    expect(result.totalKm).toBeGreaterThan(330);
    expect(result.totalKm).toBeLessThan(350);
  });

  it("defaults to truck CO2 factor when transportMode is undefined", () => {
    const withUndefined = [
      makeStep({ lat: 0, lng: 0, transportMode: undefined }),
      makeStep({ lat: 0, lng: 1 }),
    ];
    const withTruck = [
      makeStep({ lat: 0, lng: 0, transportMode: "truck" }),
      makeStep({ lat: 0, lng: 1 }),
    ];
    expect(calcFootprint(withUndefined)).toEqual(calcFootprint(withTruck));
  });

  it("plane emits far more CO2 per km than ship", () => {
    const byPlane = [
      makeStep({ lat: 0, lng: 0, transportMode: "plane" }),
      makeStep({ lat: 0, lng: 10 }),
    ];
    const byShip = [
      makeStep({ lat: 0, lng: 0, transportMode: "ship" }),
      makeStep({ lat: 0, lng: 10 }),
    ];
    expect(calcFootprint(byPlane).co2PerTon).toBeGreaterThan(
      calcFootprint(byShip).co2PerTon * 10
    );
  });

  it("sums distances and CO2 across multiple legs", () => {
    // Three equidistant points along the equator, all truck
    const twoLegs = [
      makeStep({ lat: 0, lng: 0, transportMode: "truck" }),
      makeStep({ lat: 0, lng: 1, transportMode: "truck" }),
      makeStep({ lat: 0, lng: 2 }),
    ];
    const oneLeg = [
      makeStep({ lat: 0, lng: 0, transportMode: "truck" }),
      makeStep({ lat: 0, lng: 1 }),
    ];
    const single = calcFootprint(oneLeg);
    const multi = calcFootprint(twoLegs);

    expect(multi.totalKm).toBe(single.totalKm * 2);
    expect(multi.co2PerTon).toBeCloseTo(single.co2PerTon * 2, 0);
  });

  it("co2PerTon is rounded to one decimal place", () => {
    const steps = [
      makeStep({ lat: 0, lng: 0, transportMode: "truck" }),
      makeStep({ lat: 0, lng: 1 }),
    ];
    const { co2PerTon } = calcFootprint(steps);
    expect(co2PerTon).toBe(Math.round(co2PerTon * 10) / 10);
  });
});

"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type StepType =
  | "plantation"
  | "farm"
  | "processing"
  | "factory"
  | "distribution";
export type TransportMode = "ship" | "plane" | "truck" | "train";

export interface SupplyStep {
  step: number;
  type: StepType;
  label: string;
  location: string;
  lat: number;
  lng: number;
  ingredient?: string;
  transportMode?: TransportMode;
}

export interface IngredientRow {
  name: string;
  percent: string;
}

export interface NutritionForm {
  energyKcal: string;
  fat: string;
  saturatedFat: string;
  carbs: string;
  sugars: string;
  fiber: string;
  protein: string;
  salt: string;
}

export type ExistingProduct = {
  _id: any;
  title: string;
  subtitle?: string;
  category?: string;
  description?: string;
  primaryCodeNormalized?: string;
  ingredients?: { name: string; percent?: number }[];
  nutrition?: { per100: Record<string, number | undefined> };
  supplyChainSteps?: SupplyStep[];
};

export const STEP_TYPES: { value: StepType; label: string; emoji: string }[] = [
  { value: "plantation", label: "Plantation", emoji: "🌿" },
  { value: "farm", label: "Farm", emoji: "🌾" },
  { value: "processing", label: "Processing Plant", emoji: "⚙️" },
  { value: "factory", label: "Factory", emoji: "🏭" },
  { value: "distribution", label: "Distribution Hub", emoji: "📦" },
];

export const TRANSPORT_MODES: {
  value: TransportMode;
  label: string;
  emoji: string;
}[] = [
  { value: "ship", label: "Ship", emoji: "🚢" },
  { value: "plane", label: "Plane", emoji: "✈️" },
  { value: "truck", label: "Truck", emoji: "🚛" },
  { value: "train", label: "Train", emoji: "🚂" },
];

const CO2_FACTOR: Record<TransportMode, number> = {
  ship: 0.01,
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

export function calcFootprint(steps: SupplyStep[]) {
  let totalKm = 0;
  let co2 = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    const km = haversineKm(
      steps[i].lat,
      steps[i].lng,
      steps[i + 1].lat,
      steps[i + 1].lng,
    );
    totalKm += km;
    co2 +=
      km * (CO2_FACTOR[steps[i].transportMode ?? "truck"] ?? CO2_FACTOR.truck);
  }
  return {
    totalKm: Math.round(totalKm),
    co2PerTon: Math.round(co2 * 10) / 10,
  };
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

const EMPTY_VALUE = "__empty__";

export function Sel({
  value,
  onChange,
  children,
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const options: { value: string; label: React.ReactNode }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === "option") {
      const p = child.props as { value?: string; children?: React.ReactNode };
      options.push({ value: p.value ?? "", label: p.children });
    }
  });

  const selectValue =
    (value as string) === "" ? EMPTY_VALUE : ((value as string) ?? EMPTY_VALUE);

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => {
        const real = v === EMPTY_VALUE ? "" : v;
        onChange?.({
          target: { value: real },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
    >
      <SelectTrigger className="h-10! w-full rounded-xl border-secondary">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt, i) => (
          <SelectItem
            key={i}
            value={opt.value === "" ? EMPTY_VALUE : opt.value}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SupplyStepCard({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: SupplyStep;
  index: number;
  onChange: (s: SupplyStep) => void;
  onRemove: () => void;
}) {
  const typeInfo = STEP_TYPES.find((t) => t.value === step.type);
  return (
    <div className="relative rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
      <Button
        variant="ghost"
        onClick={onRemove}
        className="absolute top-4 right-4 rounded-4xl p-2 text-slate-400 transition hover:bg-slate-100 "
      >
        <X className="h-5 w-5" />
      </Button>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold">
          {index + 1}
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {typeInfo?.emoji} {typeInfo?.label ?? "Step"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Sel
            value={step.type}
            onChange={(e) =>
              onChange({ ...step, type: e.target.value as StepType })
            }
          >
            {STEP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.emoji} {t.label}
              </option>
            ))}
          </Sel>
        </Field>
        <Field label="Label">
          <Input
            value={step.label}
            onChange={(e) => onChange({ ...step, label: e.target.value })}
            placeholder="e.g. Cocoa Plantation"
            className="h-10"
          />
        </Field>
        <Field label="Location">
          <Input
            value={step.location}
            onChange={(e) => onChange({ ...step, location: e.target.value })}
            placeholder="e.g. Abidjan, Ivory Coast"
            className="h-10"
          />
        </Field>
        <Field label="Ingredient (optional)">
          <Input
            value={step.ingredient ?? ""}
            onChange={(e) =>
              onChange({ ...step, ingredient: e.target.value || undefined })
            }
            placeholder="e.g. Cocoa (7.4%)"
            className="h-10"
          />
        </Field>
        <Field label="Latitude">
          <Input
            type="number"
            step="0.0001"
            value={step.lat}
            onChange={(e) =>
              onChange({ ...step, lat: parseFloat(e.target.value) || 0 })
            }
            placeholder="e.g. 5.3596"
            className="h-10"
          />
        </Field>
        <Field label="Longitude">
          <Input
            type="number"
            step="0.0001"
            value={step.lng}
            onChange={(e) =>
              onChange({ ...step, lng: parseFloat(e.target.value) || 0 })
            }
            placeholder="e.g. -4.0083"
            className="h-10"
          />
        </Field>
        <Field label="Transport to next step">
          <Sel
            value={step.transportMode ?? ""}
            onChange={(e) =>
              onChange({
                ...step,
                transportMode: (e.target.value as TransportMode) || undefined,
              })
            }
          >
            <option value="">— none —</option>
            {TRANSPORT_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.emoji} {m.label}
              </option>
            ))}
          </Sel>
        </Field>
      </div>
    </div>
  );
}

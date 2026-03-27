"use client";

import { api } from "@kumu/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Building2,
  ChevronRight,
  Home,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// ─── types ────────────────────────────────────────────────────────────────────

type StepType = "plantation" | "farm" | "processing" | "factory" | "distribution";
type TransportMode = "ship" | "plane" | "truck" | "train";

interface SupplyStep {
  step: number;
  type: StepType;
  label: string;
  location: string;
  lat: number;
  lng: number;
  ingredient?: string;
  transportMode?: TransportMode;
}

interface IngredientRow {
  name: string;
  percent: string;
}

interface NutritionForm {
  energyKcal: string;
  fat: string;
  saturatedFat: string;
  carbs: string;
  sugars: string;
  fiber: string;
  protein: string;
  salt: string;
}

const STEP_TYPES: { value: StepType; label: string; emoji: string }[] = [
  { value: "plantation", label: "Plantation", emoji: "🌿" },
  { value: "farm", label: "Farm", emoji: "🌾" },
  { value: "processing", label: "Processing Plant", emoji: "⚙️" },
  { value: "factory", label: "Factory", emoji: "🏭" },
  { value: "distribution", label: "Distribution Hub", emoji: "📦" },
];

const TRANSPORT_MODES: { value: TransportMode; label: string; emoji: string }[] = [
  { value: "ship", label: "Ship", emoji: "🚢" },
  { value: "plane", label: "Plane", emoji: "✈️" },
  { value: "truck", label: "Truck", emoji: "🚛" },
  { value: "train", label: "Train", emoji: "🚂" },
];

// kg CO2 per ton-km
const CO2_FACTOR: Record<TransportMode, number> = {
  ship: 0.010,
  plane: 0.602,
  truck: 0.062,
  train: 0.022,
};

// ─── ecological footprint ─────────────────────────────────────────────────────

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

function calcFootprint(steps: SupplyStep[]) {
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

// ─── shared components ────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#ff459f] focus:ring-2 focus:ring-[#ff459f]/20 disabled:opacity-50"
    />
  );
}

function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#ff459f] focus:ring-2 focus:ring-[#ff459f]/20"
    >
      {children}
    </select>
  );
}

function PinkButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl bg-[#ff459f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e83d8f] active:scale-[0.98] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SectionHeader({ children }: { children: string }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

// ─── supply chain step card ───────────────────────────────────────────────────

function SupplyStepCard({
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
    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff459f]/10 text-xs font-bold text-[#ff459f]">
          {index + 1}
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {typeInfo?.emoji} {typeInfo?.label ?? "Step"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Sel value={step.type} onChange={(e) => onChange({ ...step, type: e.target.value as StepType })}>
            {STEP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
            ))}
          </Sel>
        </Field>
        <Field label="Label">
          <Inp value={step.label} onChange={(e) => onChange({ ...step, label: e.target.value })} placeholder="e.g. Cocoa Plantation" />
        </Field>
        <Field label="Location">
          <Inp value={step.location} onChange={(e) => onChange({ ...step, location: e.target.value })} placeholder="e.g. Abidjan, Ivory Coast" />
        </Field>
        <Field label="Ingredient (optional)">
          <Inp value={step.ingredient ?? ""} onChange={(e) => onChange({ ...step, ingredient: e.target.value || undefined })} placeholder="e.g. Cocoa (7.4%)" />
        </Field>
        <Field label="Latitude">
          <Inp type="number" step="0.0001" value={step.lat} onChange={(e) => onChange({ ...step, lat: parseFloat(e.target.value) || 0 })} placeholder="e.g. 5.3596" />
        </Field>
        <Field label="Longitude">
          <Inp type="number" step="0.0001" value={step.lng} onChange={(e) => onChange({ ...step, lng: parseFloat(e.target.value) || 0 })} placeholder="e.g. -4.0083" />
        </Field>
        <Field label="Transport to next step">
          <Sel
            value={step.transportMode ?? ""}
            onChange={(e) => onChange({ ...step, transportMode: (e.target.value as TransportMode) || undefined })}
          >
            <option value="">— none —</option>
            {TRANSPORT_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>
            ))}
          </Sel>
        </Field>
      </div>
    </div>
  );
}

// ─── product form ─────────────────────────────────────────────────────────────

type ExistingProduct = {
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

function ProductForm({
  onClose,
  initialProduct,
}: {
  onClose: () => void;
  initialProduct?: ExistingProduct;
}) {
  const createProduct = useMutation(api.suppliers.createSupplierProduct);
  const updateProduct = useMutation(api.suppliers.updateSupplierProduct);
  const isEditing = !!initialProduct;

  const p100 = initialProduct?.nutrition?.per100 ?? {};

  const [title, setTitle] = useState(initialProduct?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialProduct?.subtitle ?? "");
  const [category, setCategory] = useState(initialProduct?.category ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [barcode, setBarcode] = useState(initialProduct?.primaryCodeNormalized ?? "");

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialProduct?.ingredients?.length
      ? initialProduct.ingredients.map((i) => ({
          name: i.name,
          percent: i.percent != null ? String(i.percent) : "",
        }))
      : [{ name: "", percent: "" }],
  );

  const [nutrition, setNutrition] = useState<NutritionForm>({
    energyKcal: p100.energyKcal != null ? String(p100.energyKcal) : "",
    fat: p100.fat != null ? String(p100.fat) : "",
    saturatedFat: p100.saturatedFat != null ? String(p100.saturatedFat) : "",
    carbs: p100.carbs != null ? String(p100.carbs) : "",
    sugars: p100.sugars != null ? String(p100.sugars) : "",
    fiber: p100.fiber != null ? String(p100.fiber) : "",
    protein: p100.protein != null ? String(p100.protein) : "",
    salt: p100.salt != null ? String(p100.salt) : "",
  });

  const [supplySteps, setSupplySteps] = useState<SupplyStep[]>(
    initialProduct?.supplyChainSteps?.length
      ? initialProduct.supplyChainSteps
      : [
          { step: 1, type: "farm", label: "", location: "", lat: 0, lng: 0 },
          { step: 2, type: "factory", label: "", location: "", lat: 0, lng: 0 },
        ],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const footprint = useMemo(() => calcFootprint(supplySteps), [supplySteps]);

  const addIngredient = () => setIngredients((p) => [...p, { name: "", percent: "" }]);
  const updateIngredient = (i: number, row: IngredientRow) =>
    setIngredients((p) => p.map((r, idx) => (idx === i ? row : r)));
  const removeIngredient = (i: number) =>
    setIngredients((p) => p.filter((_, idx) => idx !== i));

  const addStep = () =>
    setSupplySteps((p) => [...p, { step: p.length + 1, type: "processing", label: "", location: "", lat: 0, lng: 0 }]);
  const updateStep = (i: number, s: SupplyStep) =>
    setSupplySteps((p) => p.map((r, idx) => (idx === i ? s : r)));
  const removeStep = (i: number) =>
    setSupplySteps((p) =>
      p.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step: idx + 1 })),
    );

  const n = (v: string) => (v.trim() ? parseFloat(v) : undefined);

  const handleSave = async () => {
    if (!title.trim()) return setError("Product name is required.");
    if (supplySteps.some((s) => !s.label || !s.location))
      return setError("Each supply chain step needs a label and location.");

    setSaving(true);
    setError("");

    const payload = {
      title,
      subtitle: subtitle || undefined,
      category: category || undefined,
      description: description || undefined,
      barcode: barcode || undefined,
      ingredients: ingredients
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name.trim(), percent: n(r.percent), isOrganic: false })),
      nutrition: {
        energyKcal: n(nutrition.energyKcal),
        fat: n(nutrition.fat),
        saturatedFat: n(nutrition.saturatedFat),
        carbs: n(nutrition.carbs),
        sugars: n(nutrition.sugars),
        fiber: n(nutrition.fiber),
        protein: n(nutrition.protein),
        salt: n(nutrition.salt),
      },
      supplyChainSteps: supplySteps,
    };

    try {
      if (isEditing) {
        await updateProduct({ productId: initialProduct!._id, ...payload });
      } else {
        await createProduct(payload);
      }
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          {isEditing ? "Edit product" : "New product"}
        </h2>
        <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── basic info ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader>Product info</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Product name *">
            <Inp value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dark Chocolate 70%" />
          </Field>
          <Field label="Subtitle">
            <Inp value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Premium bar" />
          </Field>
          <Field label="Category">
            <Inp value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Confectionery" />
          </Field>
          <Field label="Barcode (EAN-8 / EAN-13)">
            <Inp value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="e.g. 4000539102283" maxLength={14} />
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <Inp value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </Field>
          </div>
        </div>
      </div>

      {/* ── ingredients ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader>Ingredients</SectionHeader>
        <div className="flex flex-col gap-2">
          {ingredients.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Inp
                value={row.name}
                onChange={(e) => updateIngredient(i, { ...row, name: e.target.value })}
                placeholder="Ingredient name"
                className="flex-1"
              />
              <Inp
                value={row.percent}
                onChange={(e) => updateIngredient(i, { ...row, percent: e.target.value })}
                placeholder="% (opt.)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                style={{ width: 96 }}
              />
              <button
                onClick={() => removeIngredient(i)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addIngredient}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#ff459f] transition hover:text-[#e83d8f]"
        >
          <Plus className="h-4 w-4" /> Add ingredient
        </button>
      </div>

      {/* ── nutritional values ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader>Nutritional values (per 100g)</SectionHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["energyKcal", "Energy (kcal)"],
              ["fat", "Fat (g)"],
              ["saturatedFat", "Saturated fat (g)"],
              ["carbs", "Carbs (g)"],
              ["sugars", "Sugars (g)"],
              ["fiber", "Fiber (g)"],
              ["protein", "Protein (g)"],
              ["salt", "Salt (g)"],
            ] as [keyof NutritionForm, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Inp
                type="number"
                min="0"
                step="0.1"
                value={nutrition[key]}
                onChange={(e) => setNutrition((n) => ({ ...n, [key]: e.target.value }))}
                placeholder="—"
              />
            </Field>
          ))}
        </div>
      </div>

      {/* ── supply chain ── */}
      <div>
        <SectionHeader>Supply chain journey</SectionHeader>
        <div className="flex flex-col gap-3">
          {supplySteps.map((s, i) => (
            <SupplyStepCard
              key={i}
              step={s}
              index={i}
              onChange={(updated) => updateStep(i, updated)}
              onRemove={() => removeStep(i)}
            />
          ))}
        </div>
        <button
          onClick={addStep}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-[#ff459f] hover:text-[#ff459f]"
        >
          <Plus className="h-4 w-4" /> Add step
        </button>
      </div>

      {/* ── ecological footprint preview ── */}
      {footprint.totalKm > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            Estimated ecological footprint
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-emerald-700">
                {footprint.totalKm.toLocaleString()} km
              </p>
              <p className="text-xs text-emerald-600">total distance traveled</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">
                {footprint.co2PerTon.toLocaleString()} kg
              </p>
              <p className="text-xs text-emerald-600">CO₂ per ton of product</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-2xl px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <PinkButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create product"}
        </PinkButton>
      </div>
    </div>
  );
}

// ─── onboarding ───────────────────────────────────────────────────────────────

function OnboardingForm() {
  const becomeSupplier = useMutation(api.suppliers.becomeSupplier);
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!companyName.trim() || !displayName.trim())
      return setError("Company name and display name are required.");
    setSaving(true);
    setError("");
    try {
      await becomeSupplier({ companyName, displayName, countryCode: countryCode || undefined, website: website || undefined });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-[#ff459f]/10 to-white px-6 py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ff459f] text-4xl shadow-lg">🏭</div>
          <h2 className="text-2xl font-bold text-slate-800">Become a supplier</h2>
          <p className="text-center text-sm text-slate-500">
            Register your company and add your products with their full supply chain — visible to every Kumu user who scans them.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <SectionHeader>Company details</SectionHeader>
        <div className="flex flex-col gap-4">
          <Field label="Legal company name *">
            <Inp value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Chocoladefabriken Lindt & Sprüngli AG" />
          </Field>
          <Field label="Brand / display name *">
            <Inp value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Lindt" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country code">
              <Inp value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))} placeholder="CH" maxLength={2} />
            </Field>
            <Field label="Website">
              <Inp value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://lindt.com" type="url" />
            </Field>
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>}
        <div className="mt-6">
          <PinkButton onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating account…" : "Create supplier account"}
            {!saving && <ChevronRight className="h-4 w-4" />}
          </PinkButton>
        </div>
      </div>
    </div>
  );
}

// ─── dashboard ────────────────────────────────────────────────────────────────

function SupplierDashboard({ producerName }: { producerName: string }) {
  const products = useQuery(api.suppliers.getMyProducts);
  const deleteProduct = useMutation(api.suppliers.deleteSupplierProduct);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ExistingProduct | null>(null);

  if (showForm || editingProduct) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <ProductForm
          initialProduct={editingProduct ?? undefined}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#ff459f]/10 to-indigo-50 px-6 py-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ff459f] text-2xl shadow">🏭</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff459f]">Supplier account</p>
            <h2 className="text-xl font-bold text-slate-800">{producerName}</h2>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Your products</h3>
        <PinkButton onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New product
        </PinkButton>
      </div>

      {products === undefined && <p className="text-sm text-slate-400">Loading…</p>}

      {products?.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <p className="text-slate-500">No products yet.</p>
          <PinkButton onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add your first product
          </PinkButton>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="flex flex-col gap-3">
          {products.map((p) => {
            const fp = calcFootprint(p.supplyChainSteps ?? []);
            return (
              <div key={p._id} className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">📦</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-slate-800">{p.title}</p>
                    {p.subtitle && <p className="truncate text-xs text-slate-400">{p.subtitle}</p>}
                    {p.primaryCodeNormalized && (
                      <p className="text-xs text-slate-400">Barcode: {p.primaryCodeNormalized}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProduct(p as ExistingProduct)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct({ productId: p._id })}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {fp.totalKm > 0 && (
                  <div className="mt-3 flex gap-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700">
                    <span>🌍 {fp.totalKm.toLocaleString()} km</span>
                    <span>💨 {fp.co2PerTon} kg CO₂/t</span>
                    <span>📦 {p.supplyChainSteps?.length ?? 0} steps</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function SupplierPage() {
  const router = useRouter();
  const producer = useQuery(api.suppliers.getMyProducer);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#ff459f]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10">
        {/* navigation */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-400">
            {producer ? "Supplier Dashboard" : "Become a Supplier"}
          </span>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-[#ff459f]" />
          <h1 className="text-2xl font-semibold text-slate-700">
            {producer ? "Supplier Dashboard" : "Become a Supplier"}
          </h1>
        </div>

        {producer === undefined ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : producer === null ? (
          <OnboardingForm />
        ) : (
          <SupplierDashboard producerName={producer.displayName} />
        )}
      </div>
    </main>
  );
}

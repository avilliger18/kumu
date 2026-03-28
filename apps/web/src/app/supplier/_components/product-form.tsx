"use client";

import { api } from "@kumu/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calcFootprint,
  ExistingProduct,
  Field,
  IngredientRow,
  NutritionForm,
  SupplyStep,
  SupplyStepCard,
} from "./shared";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { getErrorMessage } from "~/lib/error-message";

export function ProductForm({
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
  const [description, setDescription] = useState(
    initialProduct?.description ?? "",
  );
  const [barcode, setBarcode] = useState(
    initialProduct?.primaryCodeNormalized ?? "",
  );

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

  const addIngredient = () =>
    setIngredients((p) => [...p, { name: "", percent: "" }]);
  const updateIngredient = (i: number, row: IngredientRow) =>
    setIngredients((p) => p.map((r, idx) => (idx === i ? row : r)));
  const removeIngredient = (i: number) =>
    setIngredients((p) => p.filter((_, idx) => idx !== i));

  const addStep = () =>
    setSupplySteps((p) => [
      ...p,
      {
        step: p.length + 1,
        type: "processing",
        label: "",
        location: "",
        lat: 0,
        lng: 0,
      },
    ]);
  const updateStep = (i: number, s: SupplyStep) =>
    setSupplySteps((p) => p.map((r, idx) => (idx === i ? s : r)));
  const removeStep = (i: number) =>
    setSupplySteps((p) =>
      p
        .filter((_, idx) => idx !== i)
        .map((s, idx) => ({ ...s, step: idx + 1 })),
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
        .map((r) => ({
          name: r.name.trim(),
          percent: n(r.percent),
          isOrganic: false,
        })),
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
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Something went wrong."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold font-heading">
          {isEditing ? "Edit product" : "New product"}
        </h2>
        <Button
          variant="ghost"
          onClick={onClose}
          className="rounded-4xl p-2 text-slate-400 transition hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-lg font-semibold font-heading mb-2">
          Product info
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Product name *">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dark Chocolate 70%"
              className="h-10"
            />
          </Field>
          <Field label="Subtitle">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Premium bar"
              className="h-10"
            />
          </Field>
          <Field label="Category">
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Confectionery"
              className="h-10"
            />
          </Field>
          <Field label="Barcode (EAN-8 / EAN-13)">
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 4000539102283"
              maxLength={14}
              className="h-10"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className="h-10"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-lg font-semibold font-heading mb-2">Ingredients</h4>
        <div className="flex flex-col gap-2">
          {ingredients.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={row.name}
                onChange={(e) =>
                  updateIngredient(i, { ...row, name: e.target.value })
                }
                placeholder="Ingredient name"
                className="h-10"
              />
              <Input
                value={row.percent}
                onChange={(e) =>
                  updateIngredient(i, { ...row, percent: e.target.value })
                }
                placeholder="% (opt.)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                style={{ width: 96 }}
                className="h-10"
              />
              <Button
                variant="ghost"
                onClick={() => removeIngredient(i)}
                className="rounded-4xl p-2 text-slate-400 transition"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={addIngredient}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add ingredient
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-lg font-semibold font-heading mb-2">
          Nutritional values (per 100g)
        </h4>
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
              <Input
                type="number"
                min="0"
                step="0.1"
                value={nutrition[key]}
                onChange={(e) =>
                  setNutrition((n) => ({ ...n, [key]: e.target.value }))
                }
                placeholder="—"
                className="h-10"
              />
            </Field>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold font-heading mb-2">
          Supply chain journey
        </h4>
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
        <Button
          variant="outline"
          onClick={addStep}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add step
        </Button>
      </div>

      {footprint.totalKm > 0 && (
        <div className="rounded-2xl border border-secondary bg-secondary/20 p-5">
          <h4 className="text-lg font-semibold font-heading mb-2">
            Estimated ecological footprint
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold">
                {footprint.totalKm.toLocaleString()} km
              </p>
              <p className="text-xs">total distance traveled</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {footprint.co2PerTon.toLocaleString()} kg
              </p>
              <p className="text-xs ">CO₂ per ton of product</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-12 px-4 font-semibold"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className=" h-12 px-4 font-semibold"
        >
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create product"}
        </Button>
      </div>
    </div>
  );
}

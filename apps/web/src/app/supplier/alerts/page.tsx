"use client";

import { api } from "@kumu/backend/convex/_generated/api";
import type { GenericId } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, CheckCircle, Factory, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Field, Sel, SupplyStep } from "../_components/shared";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const SEVERITY_STYLE = {
  low: {
    label: "Low",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  medium: {
    label: "Medium",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  high: {
    label: "High",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

function AlertsContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get(
    "productId",
  ) as GenericId<"products"> | null;

  const producer = useQuery(api.suppliers.getMyProducer);
  const products = useQuery(api.suppliers.getMyProducts);

  const [selectedProductId, setSelectedProductId] = useState<
    GenericId<"products"> | ""
  >(preselectedId ?? "");

  const createAlert = useMutation(api.suppliers.createProductAlert);
  const resolveAlert = useMutation(api.suppliers.resolveProductAlert);

  const alerts = useQuery(
    api.suppliers.getAlertsForProduct,
    selectedProductId ? { productId: selectedProductId } : "skip",
  );

  const [showForm, setShowForm] = useState(false);
  const [stepIndex, setStepIndex] = useState("");
  const [chargeNumber, setChargeNumber] = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedProduct = products?.find((p) => p._id === selectedProductId);
  const steps = (selectedProduct?.supplyChainSteps ?? []) as SupplyStep[];

  const handleCreate = async () => {
    if (!selectedProductId) return setError("Select a product first.");
    if (!chargeNumber.trim()) return setError("Charge number is required.");
    if (!faultDescription.trim()) return setError("Please describe the fault.");
    setSaving(true);
    setError("");
    try {
      const idx = stepIndex !== "" ? parseInt(stepIndex) : undefined;
      await createAlert({
        productId: selectedProductId,
        stepIndex: idx,
        stepLabel: idx != null ? steps[idx]?.label : undefined,
        chargeNumber,
        faultDescription,
        severity,
      });
      setFaultDescription("");
      setStepIndex("");
      setChargeNumber("");
      setSeverity("medium");
      setShowForm(false);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (producer === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
          <Factory />
        </div>
        <h2 className="text-xl font-semibold font-heading">
          Set up your company first
        </h2>
        <p className="max-w-sm text-sm text-slate-500">
          Before adding products, you need to create your supplier profile.
        </p>
        <Link href="/supplier/company">
          <Button className="h-12 font-semibold px-4">
            Go to Company settings
          </Button>
        </Link>
      </div>
    );
  }

  if (producer === undefined || products === undefined) {
    return <div className="p-8 text-sm text-slate-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-heading">Alerts</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Create and manage product quality alerts
        </p>
      </div>

      {/* product selector */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-lg font-semibold font-heading mb-2">
          Select product
        </h4>
        <Sel
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value as GenericId<"products"> | "");
            setShowForm(false);
          }}
        >
          <option value="">— choose a product —</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
              {p.primaryCodeNormalized ? ` (${p.primaryCodeNormalized})` : ""}
            </option>
          ))}
        </Sel>
      </div>

      {selectedProductId && (
        <>
          {/* existing alerts */}
          <div className="mb-4 flex flex-col gap-3">
            {alerts === undefined && (
              <p className="text-sm text-slate-400">Loading alerts…</p>
            )}
            {alerts?.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-secondary py-10 text-center">
                <AlertTriangle className="h-8 w-8" />
                <p className="text-sm text-slate-400">
                  No alerts for this product.
                </p>
              </div>
            )}
            {alerts?.map((alert) => {
              const s = SEVERITY_STYLE[alert.severity];
              return (
                <div
                  key={alert._id}
                  className={`rounded-2xl border ${s.border} ${s.bg} p-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${s.text}`}
                        >
                          {s.label} severity
                        </span>
                        {alert.stepLabel && (
                          <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-xs text-slate-600">
                            Step: {alert.stepLabel}
                          </span>
                        )}
                        {alert.status === "resolved" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="h-3 w-3" /> Resolved
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm text-slate-700">
                        {alert.faultDescription}
                      </p>
                      {alert.chargeNumber && (
                        <p className="mt-1 text-xs text-slate-500">
                          Charge:{" "}
                          <span className="font-medium">
                            {alert.chargeNumber}
                          </span>
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {alert.status === "open" && (
                      <button
                        onClick={() => resolveAlert({ alertId: alert._id })}
                        className="shrink-0 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* create form */}
          {showForm ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold font-heading mb-2">
                New alert
              </h4>
              <div className="flex flex-col gap-3">
                <Field label="Charge / Lot number *">
                  <Input
                    value={chargeNumber}
                    onChange={(e) => setChargeNumber(e.target.value)}
                    placeholder="e.g. L240901B"
                    className="h-10"
                  />
                </Field>
                <Field label="Affected supply chain step (optional)">
                  <Sel
                    value={stepIndex}
                    onChange={(e) => setStepIndex(e.target.value)}
                  >
                    <option value="">— general / no specific step —</option>
                    {steps.map((s, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {s.label} ({s.location})
                      </option>
                    ))}
                  </Sel>
                </Field>
                <Field label="Severity">
                  <Sel
                    value={severity}
                    onChange={(e) =>
                      setSeverity(e.target.value as "low" | "medium" | "high")
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Sel>
                </Field>
                <Field label="Fault description *">
                  <Textarea
                    value={faultDescription}
                    onChange={(e) => setFaultDescription(e.target.value)}
                    placeholder="Describe the issue…"
                    rows={3}
                  />
                </Field>
              </div>
              {error && (
                <p className="mt-2 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-500">
                  {error}
                </p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="h-10 px-4"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={saving}
                  className="h-10 px-4"
                >
                  {saving ? "Saving…" : "Create alert"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowForm(true)} className="h-10 px-4">
              <Plus className="h-4 w-4" /> New alert
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-sm text-slate-400">Loading…</div>}
    >
      <AlertsContent />
    </Suspense>
  );
}

"use client";

import { api } from "@kumu/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle, ChevronRight, Factory } from "lucide-react";
import { useEffect, useState } from "react";
import { Field } from "../_components/shared";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

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
      await becomeSupplier({
        companyName,
        displayName,
        countryCode: countryCode || undefined,
        website: website || undefined,
      });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3 bg-secondary/30 px-6 py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-4xl shadow-lg">
            <Factory />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Become a supplier
          </h2>
          <p className="text-center text-sm text-slate-500">
            Register your company to add products with full supply chain —
            visible to every Kumu user who scans them.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 border border-secondary shadow-sm">
        <h4 className="text-lg font-semibold font-heading mb-2">
          Company details
        </h4>
        <div className="flex flex-col gap-4">
          <Field label="Legal company name *">
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Chocoladefabriken Lindt & Sprüngli AG"
              className="h-10"
            />
          </Field>
          <Field label="Brand / display name *">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Lindt"
              className="h-10"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country code">
              <Input
                value={countryCode}
                onChange={(e) =>
                  setCountryCode(e.target.value.toUpperCase().slice(0, 2))
                }
                placeholder="CH"
                maxLength={2}
                className="h-10"
              />
            </Field>
            <Field label="Website">
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://lindt.com"
                type="url"
                className="h-10"
              />
            </Field>
          </div>
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-12 font-semibold"
          >
            {saving ? "Creating account…" : "Create supplier account"}
            {!saving && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditCompanyForm({
  producer,
}: {
  producer: {
    name: string;
    displayName: string;
    countryCode?: string;
    website?: string;
    verificationStatus: string;
  };
}) {
  const updateProducer = useMutation(api.suppliers.updateProducer);

  const [companyName, setCompanyName] = useState(producer.name);
  const [displayName, setDisplayName] = useState(producer.displayName);
  const [countryCode, setCountryCode] = useState(producer.countryCode ?? "");
  const [website, setWebsite] = useState(producer.website ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCompanyName(producer.name);
    setDisplayName(producer.displayName);
    setCountryCode(producer.countryCode ?? "");
    setWebsite(producer.website ?? "");
  }, [producer]);

  const handleSave = async () => {
    if (!companyName.trim() || !displayName.trim())
      return setError("Company name and display name are required.");
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateProducer({
        companyName,
        displayName,
        countryCode: countryCode || undefined,
        website: website || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-secondary bg-white p-5 shadow-sm">
        <h4 className="text-lg font-semibold font-heading mb-2">
          Company details
        </h4>
        <div className="flex flex-col gap-4">
          <Field label="Legal company name *">
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Chocoladefabriken Lindt & Sprüngli AG"
              className="h-10"
            />
          </Field>
          <Field label="Brand / display name *">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Lindt"
              className="h-10"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country code">
              <Input
                value={countryCode}
                onChange={(e) =>
                  setCountryCode(e.target.value.toUpperCase().slice(0, 2))
                }
                placeholder="CH"
                maxLength={2}
                className="h-10"
              />
            </Field>
            <Field label="Website">
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://lindt.com"
                type="url"
                className="h-10"
              />
            </Field>
          </div>
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 font-semibold"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-secondary bg-white p-5 shadow-sm">
        <h4 className="text-lg font-semibold font-heading mb-2">
          Verification status
        </h4>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              producer.verificationStatus === "verified"
                ? "bg-emerald-100 text-emerald-700"
                : producer.verificationStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {producer.verificationStatus.charAt(0).toUpperCase() +
              producer.verificationStatus.slice(1)}
          </span>
          {producer.verificationStatus !== "verified" && (
            <p className="text-sm text-slate-500">
              Contact us to get your account verified.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompanyPage() {
  const producer = useQuery(api.suppliers.getMyProducer);

  if (producer === undefined) {
    return <div className="p-8 text-sm text-slate-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-heading">Company</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {producer
            ? "Manage your supplier profile"
            : "Create your supplier account"}
        </p>
      </div>

      {producer === null ? (
        <OnboardingForm />
      ) : (
        <EditCompanyForm producer={producer} />
      )}
    </div>
  );
}

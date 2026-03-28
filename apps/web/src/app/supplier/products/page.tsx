"use client";

import { api } from "@kumu/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Factory,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductForm } from "../_components/product-form";
import {
  calcFootprint,
  ExistingProduct,
  SupplyStep,
} from "../_components/shared";
import { Button } from "~/components/ui/button";

export default function ProductsPage() {
  const producer = useQuery(api.suppliers.getMyProducer);
  const products = useQuery(api.suppliers.getMyProducts);
  const deleteProduct = useMutation(api.suppliers.deleteSupplierProduct);

  const [editingProduct, setEditingProduct] = useState<ExistingProduct | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);

  // Not yet a supplier — prompt to set up company first
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

  // Show create/edit form
  if (showForm || editingProduct) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <ProductForm
          initialProduct={editingProduct ?? undefined}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-heading">Products</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="h-10 px-4">
          <Plus className="h-4 w-4" /> New product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-secondary bg-white py-16 text-center">
          <Package className="h-10 w-10" />
          <p className="text-slate-500">No products yet.</p>
          <Button onClick={() => setShowForm(true)} className="h-10 px-4">
            <Plus className="h-4 w-4" /> Add your first product
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => {
            const fp = calcFootprint(
              (p.supplyChainSteps ?? []) as SupplyStep[],
            );
            return (
              <div
                key={p._id}
                className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4xl bg-secondary">
                    <Package />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold font-heading">
                      {p.title}
                    </p>
                    {p.subtitle && (
                      <p className="truncate text-xs text-slate-400 mb-1">
                        {p.subtitle}
                      </p>
                    )}
                    {p.primaryCodeNormalized && (
                      <p className="text-xs text-slate-400">
                        Barcode: {p.primaryCodeNormalized}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setEditingProduct(p as unknown as ExistingProduct)
                      }
                      className="rounded-4xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct({ productId: p._id })}
                      className="rounded-4xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

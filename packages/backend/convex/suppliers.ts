import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { supplyChainStep } from "./schema";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const getMyProducer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});

export const becomeSupplier = mutation({
  args: {
    companyName: v.string(),
    displayName: v.string(),
    countryCode: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (existing) return existing._id;

    const baseSlug = slugify(args.companyName);
    let slug = baseSlug;
    let attempt = 1;
    while (
      await ctx.db
        .query("producers")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      slug = `${baseSlug}-${attempt++}`;
    }

    const now = Date.now();
    return await ctx.db.insert("producers", {
      ownerTokenIdentifier: identity.tokenIdentifier,
      name: args.companyName.trim(),
      displayName: args.displayName.trim(),
      slug,
      roles: ["manufacturer"],
      website: args.website?.trim() || undefined,
      countryCode: args.countryCode?.trim() || undefined,
      verificationStatus: "unverified",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createSupplierProduct = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    barcode: v.optional(v.string()),
    ingredients: v.optional(
      v.array(
        v.object({
          name: v.string(),
          percent: v.optional(v.number()),
          isOrganic: v.optional(v.boolean()),
        }),
      ),
    ),
    nutrition: v.optional(
      v.object({
        energyKcal: v.optional(v.number()),
        fat: v.optional(v.number()),
        saturatedFat: v.optional(v.number()),
        carbs: v.optional(v.number()),
        sugars: v.optional(v.number()),
        fiber: v.optional(v.number()),
        protein: v.optional(v.number()),
        salt: v.optional(v.number()),
      }),
    ),
    supplyChainSteps: v.array(supplyChainStep),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const producer = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!producer) throw new Error("Not a supplier");

    const now = Date.now();
    const barcodeNorm = args.barcode
      ? args.barcode.replace(/\D/g, "")
      : undefined;

    const productId = await ctx.db.insert("products", {
      producerId: producer._id,
      title: args.title.trim(),
      subtitle: args.subtitle?.trim(),
      category: args.category?.trim(),
      description: args.description?.trim(),
      primaryCodeNormalized: barcodeNorm,
      ingredients: args.ingredients,
      supplyChainSteps: args.supplyChainSteps,
      status: "active",
      dataSource: "producer",
      dataQuality: "high",
      nutrition: {
        referenceBasis: "100g",
        per100: args.nutrition ?? {},
      },
      labels: [],
      createdAt: now,
      updatedAt: now,
    });

    if (barcodeNorm) {
      await ctx.db.insert("productCodes", {
        productId,
        codeType: barcodeNorm.length <= 8 ? "ean8" : "ean13",
        codeRaw: args.barcode!,
        codeNormalized: barcodeNorm,
        isPrimary: true,
        source: "producer",
        createdAt: now,
        updatedAt: now,
      });
    }

    return productId;
  },
});

export const updateSupplierProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.string(),
    subtitle: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    barcode: v.optional(v.string()),
    ingredients: v.optional(
      v.array(
        v.object({
          name: v.string(),
          percent: v.optional(v.number()),
          isOrganic: v.optional(v.boolean()),
        }),
      ),
    ),
    nutrition: v.optional(
      v.object({
        energyKcal: v.optional(v.number()),
        fat: v.optional(v.number()),
        saturatedFat: v.optional(v.number()),
        carbs: v.optional(v.number()),
        sugars: v.optional(v.number()),
        fiber: v.optional(v.number()),
        protein: v.optional(v.number()),
        salt: v.optional(v.number()),
      }),
    ),
    supplyChainSteps: v.array(supplyChainStep),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const producer = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!producer) throw new Error("Not a supplier");

    const product = await ctx.db.get(args.productId);
    if (!product || product.producerId.toString() !== producer._id.toString())
      throw new Error("Not your product");

    const barcodeNorm = args.barcode
      ? args.barcode.replace(/\D/g, "")
      : undefined;

    await ctx.db.patch(args.productId, {
      title: args.title.trim(),
      subtitle: args.subtitle?.trim(),
      category: args.category?.trim(),
      description: args.description?.trim(),
      primaryCodeNormalized: barcodeNorm,
      ingredients: args.ingredients,
      supplyChainSteps: args.supplyChainSteps,
      nutrition: { referenceBasis: "100g", per100: args.nutrition ?? {} },
      updatedAt: Date.now(),
    });

    // sync productCodes: remove old primary, insert new if barcode changed
    const oldCodes = await ctx.db
      .query("productCodes")
      .withIndex("by_product_and_primary", (q) =>
        q.eq("productId", args.productId).eq("isPrimary", true),
      )
      .collect();
    for (const code of oldCodes) await ctx.db.delete(code._id);

    if (barcodeNorm) {
      const now = Date.now();
      await ctx.db.insert("productCodes", {
        productId: args.productId,
        codeType: barcodeNorm.length <= 8 ? "ean8" : "ean13",
        codeRaw: args.barcode!,
        codeNormalized: barcodeNorm,
        isPrimary: true,
        source: "producer",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const getMyProducts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const producer = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!producer) return [];

    return await ctx.db
      .query("products")
      .withIndex("by_producer", (q) => q.eq("producerId", producer._id))
      .order("desc")
      .collect();
  },
});

export const createProductAlert = mutation({
  args: {
    productId: v.id("products"),
    stepIndex: v.optional(v.number()),
    stepLabel: v.optional(v.string()),
    chargeNumber: v.optional(v.string()),
    faultDescription: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const producer = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!producer) throw new Error("Not a supplier");

    const product = await ctx.db.get(args.productId);
    if (!product || product.producerId.toString() !== producer._id.toString())
      throw new Error("Not your product");

    const now = Date.now();
    const alertId = await ctx.db.insert("productAlerts", {
      productId: args.productId,
      producerId: producer._id,
      stepIndex: args.stepIndex,
      stepLabel: args.stepLabel,
      chargeNumber: args.chargeNumber?.trim(),
      faultDescription: args.faultDescription.trim(),
      severity: args.severity,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    // Fan out email notifications to users who scanned this product + batch
    await ctx.scheduler.runAfter(0, internal.notifications.fanOutAlertEmails, {
      alertId,
      productId: args.productId,
      faultDescription: args.faultDescription.trim(),
      severity: args.severity,
      chargeNumber: args.chargeNumber?.trim(),
    });

    return alertId;
  },
});

export const resolveProductAlert = mutation({
  args: { alertId: v.id("productAlerts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const producer = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!producer) throw new Error("Not a supplier");

    const alert = await ctx.db.get(args.alertId);
    if (!alert || alert.producerId.toString() !== producer._id.toString())
      throw new Error("Not your alert");

    await ctx.db.patch(args.alertId, {
      status: "resolved",
      updatedAt: Date.now(),
    });
  },
});

export const getAlertsForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("productAlerts")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});

// Public — no auth required, only returns open alerts for consumer display
export const getOpenAlertsForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productAlerts")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("status"), "open"))
      .order("desc")
      .collect();
  },
});

export const updateProducer = mutation({
  args: {
    companyName: v.string(),
    displayName: v.string(),
    countryCode: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const producer = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!producer) throw new Error("No producer profile found.");

    await ctx.db.patch(producer._id, {
      name: args.companyName.trim(),
      displayName: args.displayName.trim(),
      countryCode: args.countryCode?.trim() || undefined,
      website: args.website?.trim() || undefined,
      updatedAt: Date.now(),
    });
  },
});

export const deleteSupplierProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const producer = await ctx.db
      .query("producers")
      .withIndex("by_owner", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!producer) throw new Error("Not a supplier");

    const product = await ctx.db.get(args.productId);
    if (!product || product.producerId.toString() !== producer._id.toString())
      throw new Error("Not your product");

    await ctx.db.delete(args.productId);
  },
});

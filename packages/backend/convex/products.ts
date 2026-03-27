import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function normalizeBarcode(raw: string): string {
  return raw.replace(/\D/g, "");
}

function normalizeBatchCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export const resolveProductByScan = query({
  args: {
    barcode: v.string(),
    batchCode: v.optional(v.string()),
  },
  handler: async (_ctx, { barcode }) => {
    // MOCK — always return Nutella regardless of scanned barcode
    // TODO: swap in real DB lookup when catalog is populated
    // const barcodeNorm = normalizeBarcode(barcode);
    // const codeEntry = await ctx.db.query("productCodes")
    //   .withIndex("by_code", q => q.eq("codeNormalized", barcodeNorm)).first();
    // if (!codeEntry) return { resolutionStatus: "not_found" as const, barcode: barcodeNorm };
    // ...

    void barcode;

    return {
      resolutionStatus: "found" as const,
      product: {
        _id: "mock_nutella" as any,
        producerId: "mock_ferrero" as any,
        title: "Nutella",
        subtitle: "Hazelnut & Cocoa Spread",
        brandLabel: "Ferrero",
        thumbnailUrl:
          "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.820.400.jpg",
        imageUrls: [
          "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.820.400.jpg",
        ],
        category: "Spreads",
        subcategories: ["Chocolate Spreads", "Hazelnut Spreads"],
        description:
          "The original hazelnut cocoa spread. Made with quality ingredients since 1964.",
        netContent: { value: 400, unit: "g" },
        originCountries: ["IT"],
        marketCountries: ["IT", "DE", "FR", "GB", "US", "CH"],
        status: "active" as const,
        dataSource: "barcode_api" as const,
        dataQuality: "high" as const,
        primaryCodeNormalized: "3017620422003",
        ingredientsText:
          "Sugar, palm oil, hazelnuts 13%, fat-reduced cocoa 7.4%, skimmed milk powder 6.6%, whey powder, emulsifier: lecithins (soya), vanillin.",
        ingredients: [
          { name: "Sugar", percent: 56.3, isOrganic: false },
          { name: "Palm oil", isOrganic: false, isPalmOil: true },
          { name: "Hazelnuts", percent: 13, isOrganic: false },
          { name: "Fat-reduced cocoa", percent: 7.4, isOrganic: false },
          { name: "Skimmed milk powder", percent: 6.6, isOrganic: false },
          { name: "Whey powder", isOrganic: false },
          { name: "Lecithins (soya)", isOrganic: false },
          { name: "Vanillin", isOrganic: false },
        ],
        allergens: {
          contains: ["milk", "nuts", "soya"],
          mayContain: [],
          freeFrom: ["gluten"],
        },
        additives: [
          { code: "E322", name: "Lecithins", riskLevel: "low" as const },
        ],
        labels: ["vegetarian"],
        qualityScores: {
          nutriScore: "E" as const,
          novaGroup: 4 as const,
          processingLevel: "Ultra-processed",
          additiveRiskScore: 1,
          overallFoodScore: 28,
        },
        nutrition: {
          referenceBasis: "100g" as const,
          per100: {
            energyKcal: 539,
            energyKj: 2252,
            fat: 30.9,
            saturatedFat: 10.6,
            carbs: 57.5,
            sugars: 56.3,
            fiber: 1.4,
            protein: 6.3,
            salt: 0.107,
            calcium: 80,
            iron: 2.4,
          },
        },
        packaging: {
          type: "Jar",
          material: "Glass",
          recyclable: true,
          weightG: 400,
        },
        lastVerifiedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      producer: {
        _id: "mock_ferrero" as any,
        name: "Ferrero SpA",
        displayName: "Ferrero",
        slug: "ferrero",
        roles: ["manufacturer", "brand_owner"] as any,
        website: "https://www.ferrero.com",
        countryCode: "IT",
        gs1CompanyPrefix: "3017620",
        verificationStatus: "verified" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      batch: {
        _id: "mock_batch_1" as any,
        productId: "mock_nutella" as any,
        producerId: "mock_ferrero" as any,
        batchCodeRaw: "L240901B",
        batchCodeNormalized: "L240901B",
        manufacturedAt: new Date("2024-09-01").getTime(),
        bestBeforeAt: new Date("2025-09-01").getTime(),
        originCountry: "IT",
        destinationMarket: "EU",
        facilityCode: "FERRERO-ALBA-01",
        status: "active" as const,
        recallStatus: "none" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
  },
});

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get(productId);
    if (!product) return null;
    const producer = await ctx.db.get(product.producerId);
    const codes = await ctx.db
      .query("productCodes")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    return { product, producer, codes };
  },
});

export const recordScan = mutation({
  args: {
    sessionId: v.string(),
    barcodeRaw: v.string(),
    batchCodeRaw: v.optional(v.string()),
    productId: v.optional(v.id("products")),
    batchId: v.optional(v.id("productBatches")),
    producerId: v.optional(v.id("producers")),
    productTitle: v.optional(v.string()),
    productSubtitle: v.optional(v.string()),
    productImageUrl: v.optional(v.string()),
    producerDisplayName: v.optional(v.string()),
    resolutionStatus: v.union(
      v.literal("found"),
      v.literal("found_no_batch"),
      v.literal("not_found"),
    ),
    clientPlatform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    await ctx.db.insert("productScans", {
      sessionId: args.sessionId,
      userTokenIdentifier: identity?.tokenIdentifier,
      barcodeRaw: args.barcodeRaw,
      barcodeNormalized: normalizeBarcode(args.barcodeRaw),
      batchCodeRaw: args.batchCodeRaw,
      batchCodeNormalized: args.batchCodeRaw
        ? normalizeBatchCode(args.batchCodeRaw)
        : undefined,
      productId: args.productId,
      batchId: args.batchId,
      producerId: args.producerId,
      productTitle: args.productTitle,
      productSubtitle: args.productSubtitle,
      productImageUrl: args.productImageUrl,
      producerDisplayName: args.producerDisplayName,
      resolutionStatus: args.resolutionStatus,
      clientPlatform: args.clientPlatform,
      scannedAt: Date.now(),
    });
  },
});

export const recentUserScans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("productScans")
      .withIndex("by_user_scannedAt", (q) =>
        q.eq("userTokenIdentifier", identity.tokenIdentifier),
      )
      .order("desc")
      .take(20);
  },
});

export const seedSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("producers")
      .withIndex("by_slug", (q) => q.eq("slug", "lindt-spruengli"))
      .first();
    if (existing) return { skipped: true };

    const now = Date.now();

    const producerId = await ctx.db.insert("producers", {
      name: "Chocoladefabriken Lindt & Sprüngli AG",
      displayName: "Lindt",
      slug: "lindt-spruengli",
      roles: ["manufacturer", "brand_owner"],
      website: "https://www.lindt.com",
      countryCode: "CH",
      gs1CompanyPrefix: "7610400",
      verificationStatus: "verified",
      createdAt: now,
      updatedAt: now,
    });

    const productId = await ctx.db.insert("products", {
      producerId,
      title: "Lindt Excellence 70% Cacao",
      subtitle: "Dark Chocolate Bar",
      brandLabel: "Lindt",
      thumbnailUrl:
        "https://images.openfoodfacts.org/images/products/761/040/094/9028/front_en.3.400.jpg",
      imageUrls: [
        "https://images.openfoodfacts.org/images/products/761/040/094/9028/front_en.3.400.jpg",
      ],
      category: "Confectionery",
      subcategories: ["Chocolate", "Dark Chocolate"],
      description:
        "Intense dark chocolate with 70% cocoa for a rich, complex flavour.",
      netContent: { value: 100, unit: "g" },
      originCountries: ["CH"],
      marketCountries: ["CH", "DE", "FR", "GB", "US"],
      status: "active",
      dataSource: "manual",
      dataQuality: "verified",
      primaryCodeNormalized: "3046920029759",
      ingredientsText: "Cocoa mass, sugar, cocoa butter, vanilla extract.",
      ingredients: [
        { name: "Cocoa mass", percent: 70, isOrganic: false },
        { name: "Sugar", percent: 24, isOrganic: false },
        { name: "Cocoa butter", percent: 5, isOrganic: false },
        { name: "Vanilla extract", isOrganic: false },
      ],
      allergens: {
        contains: ["milk"],
        mayContain: ["nuts", "gluten"],
        freeFrom: [],
      },
      additives: [],
      labels: ["no-artificial-colours", "no-artificial-flavours"],
      qualityScores: {
        nutriScore: "C",
        novaGroup: 1,
        processingLevel: "Minimally processed",
        additiveRiskScore: 0,
        overallFoodScore: 62,
      },
      nutrition: {
        referenceBasis: "100g",
        per100: {
          energyKcal: 598,
          energyKj: 2506,
          fat: 43.7,
          saturatedFat: 26.5,
          carbs: 28.5,
          sugars: 24.5,
          fiber: 12.1,
          protein: 7.9,
          salt: 0.01,
          sodium: 0.004,
          iron: 10.9,
          magnesium: 165,
        },
      },
      packaging: {
        type: "Bar",
        material: "Aluminium foil + cardboard",
        recyclable: true,
        weightG: 100,
      },
      lastVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("productCodes", {
      productId,
      codeType: "ean13",
      codeRaw: "3046920029759",
      codeNormalized: "3046920029759",
      isPrimary: true,
      marketCountry: "FR",
      source: "manual",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("productCodes", {
      productId,
      codeType: "upca",
      codeRaw: "037466085602",
      codeNormalized: "037466085602",
      isPrimary: false,
      marketCountry: "US",
      source: "manual",
      createdAt: now,
      updatedAt: now,
    });

    const batchId = await ctx.db.insert("productBatches", {
      productId,
      producerId,
      batchCodeRaw: "L240315A",
      batchCodeNormalized: "L240315A",
      manufacturedAt: new Date("2024-03-15").getTime(),
      bestBeforeAt: new Date("2025-09-15").getTime(),
      originCountry: "CH",
      destinationMarket: "EU",
      facilityCode: "LINDT-KILCHBERG-01",
      status: "active",
      recallStatus: "none",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("trackingEvents", {
      productId,
      batchId,
      producerId,
      eventType: "batch_created",
      occurredAt: new Date("2024-03-15").getTime(),
      actorType: "system",
      note: "Batch created from production line data.",
    });

    return { skipped: false, producerId, productId };
  },
});

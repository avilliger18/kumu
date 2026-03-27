import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const nutrientPanel = v.object({
  energyKcal: v.optional(v.number()),
  energyKj: v.optional(v.number()),
  fat: v.optional(v.number()),
  saturatedFat: v.optional(v.number()),
  monounsaturatedFat: v.optional(v.number()),
  polyunsaturatedFat: v.optional(v.number()),
  transFat: v.optional(v.number()),
  cholesterol: v.optional(v.number()),
  carbs: v.optional(v.number()),
  sugars: v.optional(v.number()),
  addedSugars: v.optional(v.number()),
  starch: v.optional(v.number()),
  polyols: v.optional(v.number()),
  fiber: v.optional(v.number()),
  protein: v.optional(v.number()),
  salt: v.optional(v.number()),
  sodium: v.optional(v.number()),
  alcohol: v.optional(v.number()),
  caffeine: v.optional(v.number()),
  vitaminA: v.optional(v.number()),
  vitaminB1: v.optional(v.number()),
  vitaminB2: v.optional(v.number()),
  vitaminB3: v.optional(v.number()),
  vitaminB5: v.optional(v.number()),
  vitaminB6: v.optional(v.number()),
  vitaminB9: v.optional(v.number()),
  vitaminB12: v.optional(v.number()),
  vitaminC: v.optional(v.number()),
  vitaminD: v.optional(v.number()),
  vitaminE: v.optional(v.number()),
  vitaminK: v.optional(v.number()),
  calcium: v.optional(v.number()),
  iron: v.optional(v.number()),
  magnesium: v.optional(v.number()),
  phosphorus: v.optional(v.number()),
  potassium: v.optional(v.number()),
  zinc: v.optional(v.number()),
  iodine: v.optional(v.number()),
  selenium: v.optional(v.number()),
  additionalNutrients: v.optional(
    v.array(
      v.object({
        name: v.string(),
        value: v.number(),
        unit: v.string(),
      }),
    ),
  ),
});

export const ingredient = v.object({
  name: v.string(),
  percent: v.optional(v.number()),
  isOrganic: v.optional(v.boolean()),
  isPalmOil: v.optional(v.boolean()),
  originCountry: v.optional(v.string()),
});

export const allergenSet = v.object({
  contains: v.array(v.string()),
  mayContain: v.array(v.string()),
  freeFrom: v.array(v.string()),
});

export const additive = v.object({
  code: v.string(),
  name: v.optional(v.string()),
  riskLevel: v.union(
    v.literal("low"),
    v.literal("moderate"),
    v.literal("high"),
    v.literal("unknown"),
  ),
  notes: v.optional(v.string()),
});

export const qualityScores = v.object({
  nutriScore: v.optional(
    v.union(
      v.literal("A"),
      v.literal("B"),
      v.literal("C"),
      v.literal("D"),
      v.literal("E"),
    ),
  ),
  novaGroup: v.optional(
    v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
  ),
  processingLevel: v.optional(v.string()),
  additiveRiskScore: v.optional(v.number()),
  overallFoodScore: v.optional(v.number()),
});

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    tokenIdentifier: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  producers: defineTable({
    name: v.string(),
    displayName: v.string(),
    slug: v.string(),
    roles: v.array(
      v.union(
        v.literal("manufacturer"),
        v.literal("brand_owner"),
        v.literal("distributor"),
        v.literal("importer"),
      ),
    ),
    website: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    gs1CompanyPrefix: v.optional(v.string()),
    contact: v.optional(
      v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
      }),
    ),
    verificationStatus: v.union(
      v.literal("unverified"),
      v.literal("pending"),
      v.literal("verified"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"])
    .index("by_gs1_prefix", ["gs1CompanyPrefix"]),

  products: defineTable({
    producerId: v.id("producers"),
    title: v.string(),
    subtitle: v.optional(v.string()),
    brandLabel: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    subcategories: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    netContent: v.optional(v.object({ value: v.number(), unit: v.string() })),
    originCountries: v.optional(v.array(v.string())),
    marketCountries: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived"),
    ),
    dataSource: v.union(
      v.literal("manual"),
      v.literal("producer"),
      v.literal("barcode_api"),
      v.literal("imported"),
    ),
    dataQuality: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("verified"),
    ),
    primaryCodeNormalized: v.optional(v.string()),
    ingredientsText: v.optional(v.string()),
    ingredients: v.optional(v.array(ingredient)),
    allergens: v.optional(allergenSet),
    additives: v.optional(v.array(additive)),
    labels: v.optional(v.array(v.string())),
    qualityScores: v.optional(qualityScores),
    nutrition: v.object({
      referenceBasis: v.union(v.literal("100g"), v.literal("100ml")),
      per100: nutrientPanel,
      perServing: v.optional(nutrientPanel),
      serving: v.optional(v.object({ value: v.number(), unit: v.string() })),
    }),
    packaging: v.optional(
      v.object({
        type: v.optional(v.string()),
        material: v.optional(v.string()),
        recyclable: v.optional(v.boolean()),
        weightG: v.optional(v.number()),
      }),
    ),
    lastVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_producer", ["producerId"])
    .index("by_primaryCode", ["primaryCodeNormalized"])
    .index("by_status", ["status"]),

  productCodes: defineTable({
    productId: v.id("products"),
    codeType: v.union(
      v.literal("ean13"),
      v.literal("ean8"),
      v.literal("upca"),
      v.literal("upce"),
      v.literal("gtin14"),
      v.literal("sku"),
      v.literal("qr"),
    ),
    codeRaw: v.string(),
    codeNormalized: v.string(),
    isPrimary: v.boolean(),
    marketCountry: v.optional(v.string()),
    source: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["codeNormalized"])
    .index("by_product", ["productId"])
    .index("by_product_and_primary", ["productId", "isPrimary"]),

  productBatches: defineTable({
    productId: v.id("products"),
    producerId: v.id("producers"),
    batchCodeRaw: v.string(),
    batchCodeNormalized: v.string(),
    manufacturedAt: v.optional(v.number()),
    packagedAt: v.optional(v.number()),
    bestBeforeAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    originCountry: v.optional(v.string()),
    destinationMarket: v.optional(v.string()),
    facilityCode: v.optional(v.string()),
    lineCode: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("hold"),
      v.literal("recalled"),
      v.literal("expired"),
      v.literal("unknown"),
    ),
    recallStatus: v.union(
      v.literal("none"),
      v.literal("active"),
      v.literal("resolved"),
    ),
    recallReason: v.optional(v.string()),
    supplierReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_product_and_batch", ["productId", "batchCodeNormalized"])
    .index("by_batch", ["batchCodeNormalized"])
    .index("by_recallStatus", ["recallStatus"])
    .index("by_expiry", ["expiresAt"]),

  productScans: defineTable({
    sessionId: v.string(),
    barcodeRaw: v.string(),
    barcodeNormalized: v.string(),
    batchCodeRaw: v.optional(v.string()),
    batchCodeNormalized: v.optional(v.string()),
    productId: v.optional(v.id("products")),
    batchId: v.optional(v.id("productBatches")),
    producerId: v.optional(v.id("producers")),
    resolutionStatus: v.union(
      v.literal("found"),
      v.literal("found_no_batch"),
      v.literal("not_found"),
    ),
    clientPlatform: v.optional(v.string()),
    scannedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_product", ["productId"])
    .index("by_batch", ["batchId"])
    .index("by_scannedAt", ["scannedAt"]),

  trackingEvents: defineTable({
    productId: v.id("products"),
    batchId: v.optional(v.id("productBatches")),
    producerId: v.id("producers"),
    eventType: v.union(
      v.literal("batch_created"),
      v.literal("verified"),
      v.literal("quality_flag"),
      v.literal("status_changed"),
      v.literal("recall_opened"),
      v.literal("recall_closed"),
    ),
    occurredAt: v.number(),
    actorType: v.union(
      v.literal("system"),
      v.literal("producer"),
      v.literal("admin"),
    ),
    actorRef: v.optional(v.string()),
    previousStatus: v.optional(v.string()),
    nextStatus: v.optional(v.string()),
    reasonCode: v.optional(v.string()),
    note: v.optional(v.string()),
    sourceRef: v.optional(v.string()),
  })
    .index("by_batch_and_time", ["batchId", "occurredAt"])
    .index("by_product_and_time", ["productId", "occurredAt"])
    .index("by_eventType", ["eventType"]),
});

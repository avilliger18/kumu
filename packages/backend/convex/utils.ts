/**
 * Pure utility functions shared across Convex backend modules.
 * Kept in a separate file so they can be unit-tested without any Convex runtime.
 */

export function normalizeBarcode(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function normalizeBatchCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function splitName(identity: {
  name?: string;
  givenName?: string;
  familyName?: string;
  nickname?: string;
  email?: string;
}) {
  const fallback =
    identity.email?.split("@")[0] || identity.nickname || "Profile";
  const firstName =
    identity.givenName?.trim() ||
    identity.nickname?.trim() ||
    (identity.name && identity.name.trim().split(/\s+/)[0]) ||
    fallback;
  const lastName =
    identity.familyName?.trim() ||
    (identity.name && identity.name.trim().split(/\s+/).slice(1).join(" ")) ||
    "";
  return {
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ").trim() || fallback,
  };
}

export function greetingMessage(title: string, productBarcode?: string): string {
  return productBarcode
    ? `How can I assist you today? I can answer questions about ${title} — ingredients, nutrition, allergens, and more.`
    : "Hi! Ask me anything about food, nutrition, or product ingredients.";
}

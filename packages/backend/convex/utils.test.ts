import { describe, it, expect } from "vitest";
import {
  normalizeBarcode,
  normalizeBatchCode,
  slugify,
  splitName,
  greetingMessage,
} from "./utils";

// ── normalizeBarcode ──────────────────────────────────────────────────────────
describe("normalizeBarcode", () => {
  it("strips all non-digit characters", () => {
    expect(normalizeBarcode("3017-620-422-003")).toBe("3017620422003");
  });

  it("leaves a purely numeric string unchanged", () => {
    expect(normalizeBarcode("3017620422003")).toBe("3017620422003");
  });

  it("strips spaces and dashes", () => {
    expect(normalizeBarcode("301 762 042 2003")).toBe("3017620422003");
  });

  it("strips letters mixed in", () => {
    expect(normalizeBarcode("abc123def456")).toBe("123456");
  });

  it("returns empty string for all-letter input", () => {
    expect(normalizeBarcode("ABCDEF")).toBe("");
  });

  it("handles empty string", () => {
    expect(normalizeBarcode("")).toBe("");
  });

  it("handles barcode with leading/trailing whitespace and special chars", () => {
    expect(normalizeBarcode(" 7610400 949028 ")).toBe("7610400949028");
  });
});

// ── normalizeBatchCode ────────────────────────────────────────────────────────
describe("normalizeBatchCode", () => {
  it("uppercases the batch code", () => {
    expect(normalizeBatchCode("l240901b")).toBe("L240901B");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeBatchCode("  L240901B  ")).toBe("L240901B");
  });

  it("leaves already-uppercase code unchanged", () => {
    expect(normalizeBatchCode("L240901B")).toBe("L240901B");
  });

  it("handles mixed case with spaces", () => {
    expect(normalizeBatchCode("  l240 ")).toBe("L240");
  });

  it("handles empty string", () => {
    expect(normalizeBatchCode("")).toBe("");
  });
});

// ── slugify ───────────────────────────────────────────────────────────────────
describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Lindt Sprüngli")).toBe("lindt-spr-ngli");
  });

  it("collapses multiple spaces/special chars into one hyphen", () => {
    expect(slugify("Hello   World!!!")).toBe("hello-world");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  -hello-  ")).toBe("hello");
  });

  it("handles purely numeric input", () => {
    expect(slugify("123")).toBe("123");
  });

  it("handles already-valid slug", () => {
    expect(slugify("my-company")).toBe("my-company");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("removes special characters", () => {
    expect(slugify("Coca-Cola & Co.")).toBe("coca-cola-co");
  });

  it("handles accented characters by removing them (non-ascii → hyphen)", () => {
    const result = slugify("Müller GmbH");
    expect(result).not.toContain(" ");
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });
});

// ── splitName ─────────────────────────────────────────────────────────────────
describe("splitName", () => {
  it("uses givenName and familyName when provided", () => {
    const result = splitName({ givenName: "Jane", familyName: "Doe" });
    expect(result.firstName).toBe("Jane");
    expect(result.lastName).toBe("Doe");
    expect(result.name).toBe("Jane Doe");
  });

  it("splits full name from name field", () => {
    const result = splitName({ name: "John Smith" });
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Smith");
    expect(result.name).toBe("John Smith");
  });

  it("handles multi-word last names", () => {
    const result = splitName({ name: "Maria van den Berg" });
    expect(result.firstName).toBe("Maria");
    expect(result.lastName).toBe("van den Berg");
    expect(result.name).toBe("Maria van den Berg");
  });

  it("falls back to email prefix when no name fields", () => {
    const result = splitName({ email: "alice@example.com" });
    expect(result.firstName).toBe("alice");
    expect(result.lastName).toBe("");
    expect(result.name).toBe("alice");
  });

  it("falls back to nickname when no name or email", () => {
    const result = splitName({ nickname: "coolguy" });
    expect(result.firstName).toBe("coolguy");
  });

  it("falls back to 'Profile' when everything is empty", () => {
    const result = splitName({});
    expect(result.firstName).toBe("Profile");
    expect(result.name).toBe("Profile");
  });

  it("givenName takes precedence over name field", () => {
    const result = splitName({ givenName: "Alice", name: "Bob Smith" });
    expect(result.firstName).toBe("Alice");
  });

  it("familyName takes precedence over name field for last name", () => {
    const result = splitName({
      familyName: "Doe",
      name: "John Smith",
    });
    expect(result.lastName).toBe("Doe");
  });

  it("trims whitespace from names", () => {
    const result = splitName({ givenName: "  Anna  ", familyName: "  K  " });
    expect(result.firstName).toBe("Anna");
    expect(result.lastName).toBe("K");
  });

  it("produces correct combined name for single-word name field", () => {
    const result = splitName({ name: "Cher" });
    expect(result.firstName).toBe("Cher");
    expect(result.lastName).toBe("");
    expect(result.name).toBe("Cher");
  });
});

// ── greetingMessage ───────────────────────────────────────────────────────────
describe("greetingMessage", () => {
  it("returns product-specific greeting when barcode is provided", () => {
    const msg = greetingMessage("Nutella", "3017620422003");
    expect(msg).toContain("Nutella");
    expect(msg).toContain("ingredients");
  });

  it("returns generic greeting when barcode is undefined", () => {
    const msg = greetingMessage("General", undefined);
    expect(msg).toBe(
      "Hi! Ask me anything about food, nutrition, or product ingredients.",
    );
  });

  it("returns generic greeting when barcode is empty string (falsy)", () => {
    const msg = greetingMessage("General", "");
    expect(msg).toBe(
      "Hi! Ask me anything about food, nutrition, or product ingredients.",
    );
  });
});

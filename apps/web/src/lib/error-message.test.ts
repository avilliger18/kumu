import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./error-message";

describe("getErrorMessage", () => {
  it("returns the error message when given an Error instance", () => {
    const err = new Error("something went wrong");
    expect(getErrorMessage(err, "fallback")).toBe("something went wrong");
  });

  it("returns fallback when given a plain string", () => {
    expect(getErrorMessage("oops", "fallback")).toBe("fallback");
  });

  it("returns fallback when given null", () => {
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
  });

  it("returns fallback when given undefined", () => {
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });

  it("returns fallback when given a number", () => {
    expect(getErrorMessage(42, "fallback")).toBe("fallback");
  });

  it("returns fallback when given an object", () => {
    expect(getErrorMessage({ code: 404 }, "fallback")).toBe("fallback");
  });

  it("returns fallback when Error has empty message", () => {
    const err = new Error("");
    expect(getErrorMessage(err, "fallback")).toBe("fallback");
  });

  it("uses the specific fallback string provided", () => {
    expect(getErrorMessage(null, "Custom error text")).toBe("Custom error text");
  });
});

import { describe, expect, it } from "vitest";
import { isAnswerCorrect, normalizeAnswer } from "./normalize";

describe("normalizeAnswer", () => {
  it("normalizes casing and spaces", () => {
    expect(normalizeAnswer("  Barev   ")) .toBe("barev");
  });

  it("removes diacritics", () => {
    expect(normalizeAnswer("école")).toBe("ecole");
  });
});

describe("isAnswerCorrect", () => {
  it("matches normalized values", () => {
    expect(isAnswerCorrect("HELLO", ["hello"])).toBe(true);
    expect(isAnswerCorrect("  shnorhakalutyun ", ["Shnorhakalutyun"])) .toBe(true);
  });

  it("rejects wrong answer", () => {
    expect(isAnswerCorrect("goodbye", ["hello"])).toBe(false);
  });
});

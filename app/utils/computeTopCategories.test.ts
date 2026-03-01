import { describe, expect, it } from "vitest";
import { computeTopCategories } from "./computeTopCategories";

describe("computeTopCategories", () => {
  it("returns {} for an empty array", () => {
    expect(computeTopCategories([])).toEqual({});
  });

  it("returns {} when all rows have null category", () => {
    expect(
      computeTopCategories([
        { category: null, amount: 10 },
        { category: null, amount: 20 },
      ]),
    ).toEqual({});
  });

  it("marks the single category as true", () => {
    expect(
      computeTopCategories([
        { category: "Food", amount: 15 },
        { category: "Food", amount: 10 },
      ]),
    ).toEqual({ Food: true });
  });

  it("marks only the winner true when there is a clear winner", () => {
    expect(
      computeTopCategories([
        { category: "Food", amount: 50 },
        { category: "Furniture", amount: 30 },
        { category: "Accessory", amount: 20 },
      ]),
    ).toEqual({ Food: true, Furniture: false, Accessory: false });
  });

  it("marks all tied top categories as true", () => {
    expect(
      computeTopCategories([
        { category: "Food", amount: 40 },
        { category: "Furniture", amount: 40 },
        { category: "Accessory", amount: 20 },
      ]),
    ).toEqual({ Food: true, Furniture: true, Accessory: false });
  });

  it("ignores null-category rows when computing totals", () => {
    expect(
      computeTopCategories([
        { category: "Food", amount: 30 },
        { category: null, amount: 999 },
        { category: "Accessory", amount: 10 },
      ]),
    ).toEqual({ Food: true, Accessory: false });
  });

  it("accumulates amounts across multiple rows for the same category", () => {
    expect(
      computeTopCategories([
        { category: "Food", amount: 10 },
        { category: "Furniture", amount: 25 },
        { category: "Food", amount: 20 },
      ]),
    ).toEqual({ Food: true, Furniture: false });
  });
});

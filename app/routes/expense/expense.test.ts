import { beforeEach, describe, expect, it, vi } from "vitest";
import { action, loader } from "./expense";

vi.mock("./db/expense", () => ({
  getAllExpenses: vi.fn(),
  deleteExpensesByIds: vi.fn(),
  createExpense: vi.fn(),
}));

import {
  createExpense,
  deleteExpensesByIds,
  getAllExpenses,
} from "./db/expense";

const mockGetAllExpenses = vi.mocked(getAllExpenses);
const mockDeleteExpensesByIds = vi.mocked(deleteExpensesByIds);
const mockCreateExpense = vi.mocked(createExpense);

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(
  method: string,
  fields: Record<string, string | string[]> = {},
) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  }
  return new Request("http://localhost/expense", { method, body: formData });
}

function callAction(request: Request) {
  return action({ request } as Parameters<typeof action>[0]);
}

describe("expense loader", () => {
  it("returns expenses from getAllExpenses", async () => {
    const rows = [
      {
        id: 1,
        item: "Cat Food",
        category: "Food" as const,
        amount: 25,
        createdAt: new Date("2026-02-01"),
      },
      {
        id: 2,
        item: "Cat Tree",
        category: "Furniture" as const,
        amount: 80,
        createdAt: new Date("2026-02-02"),
      },
    ];
    mockGetAllExpenses.mockResolvedValueOnce(rows);

    const response = await loader();
    const body = response.data;

    expect(body.expenses).toEqual(rows);
  });

  it("returns an empty expenses array when there are no expenses", async () => {
    mockGetAllExpenses.mockResolvedValueOnce([]);

    const response = await loader();
    const body = response.data;

    expect(body.expenses).toEqual([]);
    expect(body.topCategories).toEqual({});
  });

  it("computes topCategories from the returned expenses", async () => {
    const rows = [
      {
        id: 1,
        item: "Cat Food",
        category: "Food" as const,
        amount: 50,
        createdAt: new Date(),
      },
      {
        id: 2,
        item: "More Food",
        category: "Food" as const,
        amount: 30,
        createdAt: new Date(),
      },
      {
        id: 3,
        item: "Cat Tree",
        category: "Furniture" as const,
        amount: 40,
        createdAt: new Date(),
      },
    ];
    mockGetAllExpenses.mockResolvedValueOnce(rows);

    const response = await loader();
    const body = response.data;

    // Food total = 80, Furniture total = 40 → Food is the top category
    expect(body.topCategories).toEqual({ Food: true, Furniture: false });
  });

  it("marks all tied categories as top", async () => {
    const rows = [
      {
        id: 1,
        item: "Cat Food",
        category: "Food" as const,
        amount: 40,
        createdAt: new Date(),
      },
      {
        id: 2,
        item: "Cat Tree",
        category: "Furniture" as const,
        amount: 40,
        createdAt: new Date(),
      },
      {
        id: 3,
        item: "Collar",
        category: "Accessory" as const,
        amount: 10,
        createdAt: new Date(),
      },
    ];
    mockGetAllExpenses.mockResolvedValueOnce(rows);

    const response = await loader();
    const body = response.data;

    expect(body.topCategories).toEqual({
      Food: true,
      Furniture: true,
      Accessory: false,
    });
  });

  it("excludes null-category rows from topCategories computation", async () => {
    const rows = [
      {
        id: 1,
        item: "Cat Food",
        category: "Food" as const,
        amount: 30,
        createdAt: new Date(),
      },
      {
        id: 2,
        item: "Unknown",
        category: null,
        amount: 999,
        createdAt: new Date(),
      },
    ];
    mockGetAllExpenses.mockResolvedValueOnce(rows);

    const response = await loader();
    const body = response.data;

    expect(body.topCategories).toEqual({ Food: true });
  });
});

describe("expense action", () => {
  describe("DELETE", () => {
    it("calls deleteExpensesByIds with the provided ids and returns null", async () => {
      mockDeleteExpensesByIds.mockResolvedValueOnce(undefined);
      const request = makeRequest("DELETE", { ids: ["1", "2", "3"] });

      const result = await callAction(request);

      expect(mockDeleteExpensesByIds).toHaveBeenCalledOnce();
      expect(mockDeleteExpensesByIds).toHaveBeenCalledWith([1, 2, 3]);
      expect(result).toBeNull();
    });

    it("returns 400 when no ids are provided", async () => {
      const request = makeRequest("DELETE");

      const result = await callAction(request);

      expect(mockDeleteExpensesByIds).not.toHaveBeenCalled();
      expect(result!.init?.status).toBe(400);
      expect(result!.data).toEqual({ error: "No ids provided" });
    });

    it("filters out non-numeric and zero ids", async () => {
      mockDeleteExpensesByIds.mockResolvedValueOnce(undefined);
      const request = makeRequest("DELETE", {
        ids: ["1", "abc", "0", "-5", "3"],
      });

      await callAction(request);

      expect(mockDeleteExpensesByIds).toHaveBeenCalledWith([1, 3]);
    });
  });

  describe("POST", () => {
    it("calls createExpense with valid data and returns null", async () => {
      mockCreateExpense.mockResolvedValueOnce(undefined);
      const request = makeRequest("POST", {
        item: "Cat Food",
        category: "Food",
        amount: "25.00",
      });

      const result = await callAction(request);

      expect(mockCreateExpense).toHaveBeenCalledOnce();
      expect(mockCreateExpense).toHaveBeenCalledWith({
        item: "Cat Food",
        category: "Food",
        amount: 25,
      });
      expect(result).toBeNull();
    });

    it("stores category as null when category is not in CATEGORIES", async () => {
      mockCreateExpense.mockResolvedValueOnce(undefined);
      const request = makeRequest("POST", {
        item: "Mystery Item",
        category: "InvalidCategory",
        amount: "10",
      });

      await callAction(request);

      expect(mockCreateExpense).toHaveBeenCalledWith({
        item: "Mystery Item",
        category: null,
        amount: 10,
      });
    });

    it("stores category as null when category is omitted", async () => {
      mockCreateExpense.mockResolvedValueOnce(undefined);
      const request = makeRequest("POST", { item: "Collar", amount: "12" });

      await callAction(request);

      expect(mockCreateExpense).toHaveBeenCalledWith({
        item: "Collar",
        category: null,
        amount: 12,
      });
    });

    it("returns 400 when item is empty", async () => {
      const request = makeRequest("POST", { item: "  ", amount: "10" });

      const result = await callAction(request);

      expect(mockCreateExpense).not.toHaveBeenCalled();
      expect(result!.init?.status).toBe(400);
      expect(result!.data).toEqual({ error: "Invalid input" });
    });

    it("returns 400 when amount is zero", async () => {
      const request = makeRequest("POST", { item: "Cat Food", amount: "0" });

      const result = await callAction(request);

      expect(mockCreateExpense).not.toHaveBeenCalled();
      expect(result!.init?.status).toBe(400);
    });

    it("returns 400 when amount is negative", async () => {
      const request = makeRequest("POST", { item: "Cat Food", amount: "-5" });

      const result = await callAction(request);

      expect(mockCreateExpense).not.toHaveBeenCalled();
      expect(result!.init?.status).toBe(400);
    });

    it("returns 400 when amount is not a number", async () => {
      const request = makeRequest("POST", { item: "Cat Food", amount: "abc" });

      const result = await callAction(request);

      expect(mockCreateExpense).not.toHaveBeenCalled();
      expect(result!.init?.status).toBe(400);
    });
  });

  describe("unsupported methods", () => {
    it("returns 405 for PATCH", async () => {
      const request = makeRequest("PATCH");

      const result = await callAction(request);

      expect(result!.init?.status).toBe(405);
      expect(result!.data).toEqual({ error: "Method not allowed" });
    });
  });
});

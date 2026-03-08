import type { UNSAFE_DataWithResponseInit as DataWithResponseInit } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { action } from "./create";

vi.mock("./db/expense", () => ({
  createExpense: vi.fn(),
}));

import { createExpense } from "./db/expense";

const mockCreateExpense = vi.mocked(createExpense);

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(fields: Record<string, string | string[]> = {}) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  }
  return new Request("http://localhost/create", {
    method: "POST",
    body: formData,
  });
}

function callAction(request: Request) {
  return action({ request } as Parameters<typeof action>[0]);
}

describe("create expense action", () => {
  it("calls createExpense with valid data and redirects to /", async () => {
    mockCreateExpense.mockResolvedValueOnce(undefined);
    const request = makeRequest({
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
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get("Location")).toBe("/");
  });

  it("returns 400 with errors when item is empty", async () => {
    const request = makeRequest({
      item: "  ",
      category: "Food",
      amount: "10",
    });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(result).not.toBeInstanceOf(Response);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: { item: "Item is required" },
    });
  });

  it("returns 400 with errors when category is not in CATEGORIES", async () => {
    mockCreateExpense.mockResolvedValueOnce(undefined);
    const request = makeRequest({
      item: "Mystery Item",
      category: "InvalidCategory",
      amount: "10",
    });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(result).not.toBeInstanceOf(Response);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: { category: "Category is required" },
    });
  });

  it("returns 400 with errors when category is empty", async () => {
    const request = makeRequest({
      item: "Cat Food",
      category: "",
      amount: "10",
    });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: { category: "Category is required" },
    });
  });

  it("returns 400 with errors when category is omitted", async () => {
    const request = makeRequest({ item: "Collar", amount: "12" });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: { category: "Category is required" },
    });
  });

  it("returns 400 with errors when amount is zero", async () => {
    const request = makeRequest({
      item: "Cat Food",
      category: "Food",
      amount: "0",
    });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: { amount: "Amount must be more than 0" },
    });
  });

  it("returns 400 with errors when amount is negative", async () => {
    const request = makeRequest({
      item: "Cat Food",
      category: "Food",
      amount: "-5",
    });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: { amount: "Amount must be more than 0" },
    });
  });

  it("returns 400 with errors when amount is not a number", async () => {
    const request = makeRequest({
      item: "Cat Food",
      category: "Food",
      amount: "abc",
    });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: { amount: "Amount must be more than 0" },
    });
  });

  it("returns 400 with multiple errors when multiple fields are invalid", async () => {
    const request = makeRequest({
      item: "",
      category: "",
      amount: "0",
    });

    const result = await callAction(request);

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).init
        ?.status,
    ).toBe(400);
    expect(
      (result as DataWithResponseInit<{ errors: Record<string, string> }>).data,
    ).toEqual({
      errors: {
        item: "Item is required",
        category: "Category is required",
        amount: "Amount must be more than 0",
      },
    });
  });
});

import { desc, inArray } from "drizzle-orm";
import { useState } from "react";
import { data, useLoaderData } from "react-router";
import { ExpenseTable } from "../components/ExpenseTable";
import { ExpenseTableController } from "../components/ExpenseTableController";
import { db } from "../db";
import type { Category } from "../db/schema";
import { CATEGORIES, expenses } from "../db/schema";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Cat Expense Tracker" },
    { name: "description", content: "Track your cat expenses" },
  ];
}

export async function loader() {
  const rows = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.createdAt));

  const totals = new Map<string, number>();
  for (const e of rows) {
    if (!e.category) continue;
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  let topCategories: Record<string, boolean> = {};
  if (totals.size > 0) {
    const max = Math.max(...totals.values());
    topCategories = Object.fromEntries(
      [...totals.entries()].map(([k, v]) => [k, v === max]),
    );
  }

  return data({ expenses: rows, topCategories });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "DELETE") {
    const formData = await request.formData();
    const ids = formData
      .getAll("ids")
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0);

    if (ids.length === 0) {
      return data({ error: "No ids provided" }, { status: 400 });
    }

    await db.delete(expenses).where(inArray(expenses.id, ids));
    return null;
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const item = String(formData.get("item") ?? "").trim();
    const rawCategory = String(formData.get("category") ?? "").trim();
    const category: Category | null = (
      CATEGORIES as readonly string[]
    ).includes(rawCategory)
      ? (rawCategory as Category)
      : null;
    const amount = parseFloat(String(formData.get("amount") ?? "0"));

    if (!item || isNaN(amount) || amount <= 0) {
      return data({ error: "Invalid input" }, { status: 400 });
    }

    await db
      .insert(expenses)
      .values({ item, category: category ?? undefined, amount });
    return null;
  }

  return data({ error: "Method not allowed" }, { status: 405 });
}

export default function Home() {
  const { expenses, topCategories } = useLoaderData<typeof loader>();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(expenses.map((e) => e.id)) : new Set());
  }

  function toggleOne(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cat Expenses
      </h1>
      <div className="space-y-4">
        <ExpenseTableController
          selectedIds={selectedIds}
          onDeleteCompleted={() => setSelectedIds(new Set())}
        />
        <ExpenseTable
          expenses={expenses}
          topCategories={topCategories}
          selectedIds={selectedIds}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
        />
      </div>
    </main>
  );
}

import { data } from "react-router";
import type { Category } from "../../db/schema";
import { CATEGORIES } from "../../db/schema";
import { computeTopCategories } from "../../utils/computeTopCategories";
import type { Route } from "./+types/expense";
import { ExpenseList } from "./components/ExpenseList";
import {
  createExpense,
  deleteExpensesByIds,
  getAllExpenses,
} from "./db/expense";

export function meta() {
  return [
    { title: "Cat Expense Tracker" },
    { name: "description", content: "Track your cat expenses" },
  ];
}

export async function loader() {
  const rows = await getAllExpenses();
  const topCategories = computeTopCategories(rows);

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

    await deleteExpensesByIds(ids);
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

    await createExpense({ item, category, amount });
    return null;
  }

  return data({ error: "Method not allowed" }, { status: 405 });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { expenses, topCategories } = loaderData;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <ExpenseList expenses={expenses} topCategories={topCategories} />
    </main>
  );
}

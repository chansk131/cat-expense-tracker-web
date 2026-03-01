import { desc } from "drizzle-orm";
import { data, useLoaderData } from "react-router";
import { ExpenseTable } from "../components/ExpenseTable";
import { db } from "../db";
import { expenses } from "../db/schema";
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
  return data({ expenses: rows });
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const item = String(formData.get("item") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const amount = parseFloat(String(formData.get("amount") ?? "0"));

  if (!item || isNaN(amount) || amount <= 0) {
    return data({ error: "Invalid input" }, { status: 400 });
  }

  await db
    .insert(expenses)
    .values({ item, category: category ?? undefined, amount });
  return null;
}

export default function Home() {
  const { expenses } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cat Expenses
      </h1>
      <ExpenseTable expenses={expenses} />
    </main>
  );
}

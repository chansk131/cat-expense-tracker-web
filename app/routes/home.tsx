import { ExpenseTable } from "../components/ExpenseTable";

export function meta() {
  return [
    { title: "Cat Expense Tracker" },
    { name: "description", content: "Track your cat expenses" },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Cat Expenses
      </h1>
      <ExpenseTable />
    </main>
  );
}

import { useState } from "react";
import type { Expense } from "../../../db/schema";
import { ExpenseTable } from "./ExpenseTable";
import { ExpenseTableController } from "./ExpenseTableController";

type Props = {
  expenses: Expense[];
  topCategories: Record<string, boolean>;
};

export function ExpenseList({ expenses, topCategories }: Props) {
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
    <div className="bg-white p-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Recent Expenses
        </h1>
        <ExpenseTableController
          selectedIds={selectedIds}
          onDeleteCompleted={() => setSelectedIds(new Set())}
        />
      </div>
      <ExpenseTable
        expenses={expenses}
        topCategories={topCategories}
        selectedIds={selectedIds}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
      />
    </div>
  );
}

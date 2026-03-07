import type { Expense } from "../../../db/schema";
import { CategoryChip } from "./CategoryChip";

type Props = {
  expenses: Expense[];
  topCategories: Record<string, boolean>;
  selectedIds: Set<number>;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
};

export function ExpenseTable({
  expenses,
  topCategories,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: Props) {
  const allSelected =
    expenses.length > 0 && selectedIds.size === expenses.length;

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-white text-xs uppercase tracking-wider text-gray-600 dark:bg-gray-900 dark:text-gray-300">
        <tr>
          <th className="w-10 px-4 py-3">
            <input
              type="checkbox"
              className="rounded"
              checked={allSelected}
              onChange={(e) => onToggleAll(e.target.checked)}
            />
          </th>
          <th className="px-4 py-3">Item</th>
          <th className="px-4 py-3">Category</th>
          <th className="px-4 py-3 text-right">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {expenses.map((expense) => {
          const isTop =
            !!expense.category && topCategories[expense.category] === true;
          return (
            <tr
              key={expense.id}
              className={
                isTop
                  ? "bg-amber-50 transition-colors hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40"
                  : "bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
              }
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={selectedIds.has(expense.id)}
                  onChange={(e) => onToggleOne(expense.id, e.target.checked)}
                />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {expense.item}
              </td>
              <td className="px-4 py-3">
                <CategoryChip category={expense.category} />
              </td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                ${expense.amount.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

type Expense = {
  id: number;
  item: string;
  category: string;
  amount: number;
};

const expenses: Expense[] = [
  { id: 1, item: "Cat Food", category: "Food", amount: 10 },
];

export function ExpenseTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <tr>
            <th className="w-10 px-4 py-3">
              <input type="checkbox" className="rounded" />
            </th>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <td className="px-4 py-3">
                <input type="checkbox" className="rounded" />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {expense.item}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {expense.category ?? "—"}
              </td>
              <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                ${expense.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

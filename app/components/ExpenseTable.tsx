import { useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Expense } from "../db/schema";

type Props = {
  expenses: Expense[];
};

export function ExpenseTable({ expenses }: Props) {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <fetcher.Form
              onSubmit={() => setOpen(false)}
              method="post"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="item">
                  Item <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item"
                  name="item"
                  required
                  placeholder="e.g. Cat Food"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g. Food" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={fetcher.state === "submitting"}>
                  {fetcher.state === "submitting" ? "Adding…" : "Add"}
                </Button>
              </DialogFooter>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
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
    </div>
  );
}

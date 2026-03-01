import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import type { Expense } from "../db/schema";
import { CATEGORIES } from "../db/schema";

const catFactQueryOptions = {
  queryKey: ["catFact"],
  queryFn: () =>
    axios
      .get<{ fact: string }>("https://catfact.ninja/fact")
      .then((r) => r.data.fact),
  staleTime: 0,
};

type Props = {
  expenses: Expense[];
  topCategories: Record<string, boolean>;
};

export function ExpenseTable({ expenses, topCategories }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher();

  const { data: catFact, isLoading: catFactLoading } = useQuery({
    ...catFactQueryOptions,
    enabled: false,
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      void queryClient.invalidateQueries({ queryKey: ["catFact"] });
    }
    setOpen(nextOpen);
  }

  const allSelected =
    expenses.length > 0 && selectedIds.size === expenses.length;
  const someSelected = selectedIds.size > 0;

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

  function handleDelete() {
    const form = new FormData();
    selectedIds.forEach((id) => form.append("ids", String(id)));
    deleteFetcher.submit(form, { method: "delete" });
    setSelectedIds(new Set());
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger
            asChild
            onMouseEnter={() => {
              const state = queryClient.getQueryState(
                catFactQueryOptions.queryKey,
              );
              if (!state?.data || state.isInvalidated) {
                void queryClient.prefetchQuery(catFactQueryOptions);
              }
            }}
          >
            <Button>Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="flex flex-row gap-4">
              <fetcher.Form
                onSubmit={() => setOpen(false)}
                method="post"
                className="flex flex-col gap-4 w-full"
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
                  <Select name="category">
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Button
                    type="submit"
                    disabled={fetcher.state === "submitting"}
                  >
                    {fetcher.state === "submitting" ? "Adding…" : "Add"}
                  </Button>
                </DialogFooter>
              </fetcher.Form>
              <div className="flex flex-col w-full h-fit rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                <h2 className="font-bold">Random cat fact:</h2>
                {catFactLoading ? (
                  <div className="mt-1 space-y-2">
                    <Skeleton className="h-3 w-full bg-amber-100" />
                    <Skeleton className="h-3 w-full bg-amber-100" />
                    <Skeleton className="h-3 w-4/5 bg-amber-100" />
                  </div>
                ) : (
                  <p>{catFact}</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteFetcher.state === "submitting" || !someSelected}
        >
          {deleteFetcher.state === "submitting"
            ? "Deleting…"
            : "Delete Expense"}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
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
                      onChange={(e) => toggleOne(expense.id, e.target.checked)}
                    />
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

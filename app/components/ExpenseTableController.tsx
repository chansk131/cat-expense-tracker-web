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
  selectedIds: Set<number>;
  onDeleteCompleted: () => void;
};

export function ExpenseTableController({
  selectedIds,
  onDeleteCompleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher();

  const someSelected = selectedIds.size > 0;

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

  function handleDelete() {
    const form = new FormData();
    selectedIds.forEach((id) => form.append("ids", String(id)));
    deleteFetcher.submit(form, { method: "delete" });
    onDeleteCompleted();
  }

  function prefetchCatFactIfNecessary() {
    const state = queryClient.getQueryState(catFactQueryOptions.queryKey);
    if (!state?.data || state.isInvalidated) {
      void queryClient.prefetchQuery(catFactQueryOptions);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild onMouseEnter={prefetchCatFactIfNecessary}>
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
                <Button type="submit" disabled={fetcher.state === "submitting"}>
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
        {deleteFetcher.state === "submitting" ? "Deleting…" : "Delete Expense"}
      </Button>
    </div>
  );
}

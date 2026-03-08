import { useQueryClient } from "@tanstack/react-query";
import { Link, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { catFactQueryOptions } from "../queries/catFactQuery";

type Props = {
  selectedIds: Set<number>;
  onDeleteCompleted: () => void;
};

export function ExpenseTableController({
  selectedIds,
  onDeleteCompleted,
}: Props) {
  const queryClient = useQueryClient();
  const deleteFetcher = useFetcher();

  const someSelected = selectedIds.size > 0;

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
      <Button asChild onMouseEnter={prefetchCatFactIfNecessary}>
        <Link to="/create">Add Expense</Link>
      </Button>
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

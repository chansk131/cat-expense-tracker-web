import { useQueryClient } from "@tanstack/react-query";
import {
  data,
  Form,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Category } from "../../db/schema";
import { CATEGORIES } from "../../db/schema";
import type { Route } from "./+types/create";
import CatFactCard from "./components/CatFactCard";
import { createExpense } from "./db/expense";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const item = String(formData.get("item") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "").trim();
  const category: Category | null = (CATEGORIES as readonly string[]).includes(
    rawCategory,
  )
    ? (rawCategory as Category)
    : null;
  const amount = parseFloat(String(formData.get("amount") ?? "0"));

  const errors: Record<string, string> = {};

  if (!item) {
    errors.item = "Item is required";
  }

  if (!category) {
    errors.category = "Category is required";
  }

  if (isNaN(amount) || amount <= 0) {
    errors.amount = "Amount must be more than 0";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  await createExpense({ item, category, amount });
  return redirect("/");
}

export default function CreateExpense() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const actionData = useActionData<typeof action>();

  const isSubmitting = navigation.state === "submitting";

  function handleOpenChange(open: boolean) {
    if (!open) {
      void queryClient.invalidateQueries({ queryKey: ["catFact"] });
      navigate("/");
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        {actionData?.errors && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300">
            {Object.values(actionData.errors).join(" ")}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <CatFactCard />
          <Form method="post" className="flex flex-col gap-4 w-full sm:order-1">
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
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select name="category" required>
                <SelectTrigger id="category" className="w-full">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add"}
              </Button>
            </DialogFooter>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

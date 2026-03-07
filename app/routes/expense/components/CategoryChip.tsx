import type { LucideIcon } from "lucide-react";
import { Armchair, Sparkles, UtensilsCrossed } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { Category } from "~/db/schema";

type CategoryChipProps = {
  category: Category | null;
  isTopCategory?: boolean;
};

const categoryConfig: Record<
  NonNullable<Category>,
  { icon: LucideIcon; color: "orange" | "blue" | "purple" }
> = {
  Food: { icon: UtensilsCrossed, color: "orange" },
  Furniture: { icon: Armchair, color: "blue" },
  Accessory: { icon: Sparkles, color: "purple" },
};

export function CategoryChip({ category }: CategoryChipProps) {
  if (!category) {
    return <span className="text-gray-500 dark:text-gray-400">—</span>;
  }

  const config = categoryConfig[category];
  const Icon = config.icon;
  const variant = config.color;

  return (
    <Badge variant={variant}>
      <Icon className="size-3" />
      {category}
    </Badge>
  );
}

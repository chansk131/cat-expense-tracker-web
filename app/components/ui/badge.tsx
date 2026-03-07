import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        orange:
          "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
        blue: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
        purple:
          "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
        amber:
          "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

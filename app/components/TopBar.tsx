import { Cat } from "lucide-react";
import { Link } from "react-router";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/60 dark:border-gray-800 dark:bg-gray-900 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100"
        >
          <Cat className="h-6 w-6" />
          <span>Cat Expense Tracker</span>
        </Link>
      </div>
    </header>
  );
}

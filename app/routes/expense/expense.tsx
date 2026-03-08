import {
  data,
  isRouteErrorResponse,
  Outlet,
  useRevalidator,
} from "react-router";
import { computeTopCategories } from "../../utils/computeTopCategories";
import type { Route } from "./+types/expense";
import { ExpenseList } from "./components/ExpenseList";
import { deleteExpensesByIds, getAllExpenses } from "./db/expense";

export function meta() {
  return [
    { title: "Cat Expense Tracker" },
    { name: "description", content: "Track your cat expenses" },
  ];
}

export async function loader() {
  const rows = await getAllExpenses();
  const topCategories = computeTopCategories(rows);

  return data({ expenses: rows, topCategories });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "DELETE") {
    const formData = await request.formData();
    const ids = formData
      .getAll("ids")
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0);

    if (ids.length === 0) {
      return data({ error: "No ids provided" }, { status: 400 });
    }

    await deleteExpensesByIds(ids);
    return null;
  }

  return data({ error: "Method not allowed" }, { status: 405 });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { expenses, topCategories } = loaderData;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <ExpenseList expenses={expenses} topCategories={topCategories} />
      <Outlet />
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const revalidator = useRevalidator();

  console.log(error);

  const handleRetry = () => {
    revalidator.revalidate();
  };

  if (isRouteErrorResponse(error)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">
            {error.status} {error.statusText}
          </h1>
          <p className="mt-2 text-red-700 dark:text-red-300">
            {typeof error.data === "string" ? error.data : "An error occurred"}
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (error instanceof Error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">
            Error
          </h1>
          <p className="mt-2 text-red-700 dark:text-red-300">{error.message}</p>
          <button
            onClick={handleRetry}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
        <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">
          Unknown Error
        </h1>
        <p className="mt-2 text-red-700 dark:text-red-300">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={handleRetry}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    </main>
  );
}

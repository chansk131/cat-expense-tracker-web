import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { catFactQueryOptions } from "../queries/catFactQuery";

export default function CatFactCard() {
  const {
    data: catFact,
    isLoading: catFactLoading,
    isError: catFactError,
    refetch: refetchCatFact,
  } = useQuery({
    ...catFactQueryOptions,
    enabled: false,
  });

  return (
    <div
      className={`flex flex-col w-full h-fit rounded-md px-3 py-2 text-sm sm:order-2 ${
        catFactError
          ? "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300"
          : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
      }`}
    >
      <h2 className="font-bold">Random cat fact:</h2>
      {catFactLoading ? (
        <div className="mt-1 space-y-2">
          <Skeleton className="h-3 w-full bg-amber-100" />
          <Skeleton className="h-3 w-full bg-amber-100" />
          <Skeleton className="h-3 w-4/5 bg-amber-100" />
        </div>
      ) : catFactError ? (
        <div className="mt-2 space-y-2">
          <p>Failed to load cat fact</p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => refetchCatFact()}
            disabled={catFactLoading}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <p className="max-h-18 overflow-y-auto sm:max-h-none sm:overflow-y-visible">
          {catFact}
        </p>
      )}
    </div>
  );
}

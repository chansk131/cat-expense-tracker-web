import axios from "axios";

export const catFactQueryOptions = {
  queryKey: ["catFact"],
  queryFn: () =>
    axios
      .get<{ fact: string }>("https://catfact.ninja/fact")
      .then((r) => r.data.fact),
  staleTime: 0,
  retry: false,
};

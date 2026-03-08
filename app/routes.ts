import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    route("/", "routes/expense/expense.tsx", [
      route("create", "routes/expense/create.tsx"),
    ]),
  ]),
] satisfies RouteConfig;

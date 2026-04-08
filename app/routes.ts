import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "contact", file: "routes/contact.tsx" },
] satisfies RouteConfig;

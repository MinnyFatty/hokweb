import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "contact", file: "routes/contact.tsx" },
  { path: "admin/migrate-contacts", file: "routes/migrate-contacts.tsx" },
  { path: "admin/list-contacts", file: "routes/list-contacts.tsx" },
] satisfies RouteConfig;

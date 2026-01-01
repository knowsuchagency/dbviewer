import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("viewer", "routes/viewer/index.tsx"),
  route("viewer/:id", "routes/viewer/[id].tsx"),
  route("diagrams", "routes/diagrams/index.tsx"),
] satisfies RouteConfig;

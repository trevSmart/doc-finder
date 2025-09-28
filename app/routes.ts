import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/open-document", "routes/api.open-document.ts"),
  route("api/preview-document", "routes/api.preview-document.ts"),
  route("api/preview-image", "routes/api.preview-image.ts"),
  route("api/preview-markdown", "routes/api.preview-markdown.ts")
] satisfies RouteConfig;

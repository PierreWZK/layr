import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Chromium (captures de l'admin) reste hors du bundle serveur
  serverExternalPackages: ["playwright", "playwright-core"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

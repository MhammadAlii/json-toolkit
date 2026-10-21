import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The other direction of each two-way converter lives on its JSON to … page.
  async redirects() {
    return [
      { source: "/string-to-json", destination: "/json-to-string", permanent: true },
      { source: "/xml-to-json", destination: "/json-to-xml", permanent: true },
      { source: "/yaml-to-json", destination: "/json-to-yaml", permanent: true },
      { source: "/yml-to-json", destination: "/json-to-yaml", permanent: true },
      { source: "/csv-to-json", destination: "/json-to-csv", permanent: true },
      { source: "/excel-to-json", destination: "/json-to-excel", permanent: true },
      { source: "/xlsx-to-json", destination: "/json-to-excel", permanent: true },
      { source: "/sql-to-json", destination: "/json-to-sql", permanent: true },
    ];
  },
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

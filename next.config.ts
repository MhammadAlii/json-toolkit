import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // String to JSON and XML to JSON are the other directions of the JSON to String and JSON to XML pages.
  async redirects() {
    return [
      { source: "/string-to-json", destination: "/json-to-string", permanent: true },
      { source: "/xml-to-json", destination: "/json-to-xml", permanent: true },
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

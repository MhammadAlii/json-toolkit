import type { ToolMeta } from "@/core/tool/types";

export const jsonToYamlTool: ToolMeta = {
  slug: "json-to-yaml",
  name: "JSON to YAML",
  h1: "JSON to YAML Converter",
  title: "JSON to YAML Converter Online – Free & Instant",
  description:
    "Convert JSON to YAML online for Kubernetes, Docker Compose, GitHub Actions and other config files. Free and instant, and nothing leaves your browser.",
  keywords: ["json to yaml", "convert json to yaml", "json to yml", "json yaml converter"],
  category: "converters",
  tagline: "Convert to YAML config files",
  tint: "green",
  intro:
    "Convert JSON into clean, human-readable YAML. Strings that YAML could misinterpret, such as yes, no, on or values with special characters, are safely quoted.",
  steps: ["Paste your JSON or upload a file.", "The YAML appears instantly.", "Copy it or download it as a .yaml file."],
  faqs: [
    {
      q: "Is all JSON valid YAML?",
      a: "YAML 1.2 is a superset of JSON, so any JSON document is technically valid YAML. Converting gives you YAML's cleaner indentation-based style.",
    },
    {
      q: "Why are some strings quoted?",
      a: "Values like yes, no, on, off or strings with colons could be read as booleans or structure by YAML parsers. Quoting keeps them as plain strings.",
    },
  ],
  related: ["json-to-xml", "json-to-typescript", "json-formatter"],
};

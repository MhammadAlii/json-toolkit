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
  summary: "Convert JSON to clean YAML for Kubernetes, Docker Compose and CI config files.",
  icon: "file-code",
  tint: "blue",
  intro:
    "Convert JSON into clean, human-readable YAML. Strings that YAML could misinterpret, such as yes, no, on or values with special characters, are safely quoted.",
  steps: [
    "Paste your JSON or drop a file into the input.",
    "The YAML appears as you type; use Options for indentation, inline (flow) style, sorted keys or quoted strings.",
    "Copy it or download it as a .yaml file.",
  ],
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

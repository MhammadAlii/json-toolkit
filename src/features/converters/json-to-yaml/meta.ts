import type { ToolMeta } from "@/core/tool/types";

export const jsonToYamlTool: ToolMeta = {
  slug: "json-to-yaml",
  name: "JSON ⇄ YAML",
  h1: "JSON to YAML & YAML to JSON Converter",
  title: "JSON to YAML & YAML to JSON Converter Online – Free & Instant",
  description:
    "Convert JSON to YAML for Kubernetes, Docker Compose and GitHub Actions, or YAML back to JSON with anchors, multi-line strings and multiple documents. Free and private.",
  keywords: ["json to yaml", "yaml to json", "convert json to yaml", "convert yaml to json", "json to yml", "yml to json", "json yaml converter"],
  category: "converters",
  tagline: "Convert JSON to YAML and YAML to JSON",
  summary: "Convert JSON to clean YAML for config files, or YAML from Kubernetes, Compose and CI back to JSON.",
  icon: "file-code",
  tint: "blue",
  intro:
    "Convert JSON into clean, human-readable YAML, or swap direction to turn YAML into JSON. Strings that YAML could misinterpret, such as yes, no, on or values with special characters, are safely quoted, and YAML errors are reported with their line and column.",
  steps: [
    "Paste JSON to convert it to YAML, or press Swap and paste YAML to convert it to JSON.",
    "The result appears as you type; Swap moves it into the input so you can convert it back.",
    "Use Options for indentation, inline (flow) style, sorted keys or quoted strings (or, for YAML to JSON, indentation and the YAML version), then copy or download the file.",
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
    {
      q: "Which YAML features does YAML to JSON support?",
      a: "Block and inline mappings and lists, plain, quoted and multi-line (| and >) strings, comments, anchors and aliases, << merge keys, !!str and other standard tags, and several documents separated by ---, which become an array. CloudFormation tags such as !Ref and !Sub are expanded to their full form.",
    },
    {
      q: "Is yes a boolean or a string?",
      a: "In YAML 1.2, the current version, yes, no, on and off are strings and only true and false are booleans. Choose YAML 1.1 under Options to read them as booleans, the way older parsers such as PyYAML do.",
    },
  ],
  related: ["json-to-xml", "json-to-typescript", "json-formatter"],
};

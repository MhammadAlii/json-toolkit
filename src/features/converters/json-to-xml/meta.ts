import type { ToolMeta } from "@/core/tool/types";

export const jsonToXmlTool: ToolMeta = {
  slug: "json-to-xml",
  name: "JSON to XML",
  h1: "JSON to XML Converter",
  title: "JSON to XML Converter Online – Free & Instant",
  description:
    "Convert JSON to well-formed, indented XML with a configurable root element. Arrays become repeated elements. Free, instant and private.",
  keywords: ["json to xml", "convert json to xml", "json xml converter", "json to xml online"],
  category: "converters",
  tagline: "Convert JSON to well-formed XML",
  icon: "code",
  tint: "blue",
  intro:
    "Convert JSON into clean, indented XML for legacy APIs, SOAP services and config files. Keys that aren't valid XML names are made safe automatically.",
  steps: ["Paste your JSON.", "Set the root element name.", "Copy or download the XML."],
  faqs: [
    {
      q: "How are arrays converted?",
      a: "Each array item becomes a repeated element with the array's key as its tag name.",
    },
    {
      q: "What happens to invalid tag names?",
      a: "Characters that aren't allowed in XML names are replaced with underscores, and names that start with a digit are prefixed.",
    },
  ],
  related: ["json-to-yaml", "json-formatter", "json-to-csv"],
};

import type { ToolMeta } from "@/core/tool/types";

export const jsonToXmlTool: ToolMeta = {
  slug: "json-to-xml",
  name: "JSON ⇄ XML",
  h1: "JSON to XML & XML to JSON Converter",
  title: "JSON to XML & XML to JSON Converter Online – Free & Instant",
  description:
    "Convert JSON to well-formed XML, or XML back to JSON with attributes, repeated elements as arrays, CDATA and entities handled. Free, instant and private.",
  keywords: ["json to xml", "xml to json", "convert json to xml", "convert xml to json", "json xml converter", "xml to json online", "json to xml online"],
  category: "converters",
  tagline: "Convert JSON to XML and XML to JSON",
  summary: "Convert JSON into well-formed XML, or XML with attributes, CDATA and entities back into JSON.",
  icon: "file-lines",
  tint: "blue",
  intro:
    "Convert JSON into clean, indented XML for legacy APIs, SOAP services and config files, or swap direction to turn XML into JSON. Keys that aren't valid XML names are made safe automatically, and XML is checked for well-formedness as it's read, with the line and column of any error.",
  steps: [
    "Paste JSON to convert it to XML, or press Swap and paste XML to convert it to JSON.",
    "The result appears as you type; Swap moves it into the input so you can convert it back.",
    "Use Options for the root element, attributes, arrays, nulls and declaration (or, for XML to JSON, attributes, arrays, value types, CDATA and namespaces), then copy or download the file.",
  ],
  faqs: [
    {
      q: "How are arrays converted?",
      a: "From JSON, each array item becomes a repeated element with the array's key as its tag name. From XML, elements that repeat under the same parent become an array; choose Arrays → Always to get an array for every element, so the shape doesn't depend on how many there are.",
    },
    {
      q: "What happens to invalid tag names?",
      a: "Characters that aren't allowed in XML names are replaced with underscores, and names that start with a digit are prefixed.",
    },
    {
      q: "How are XML attributes, text and CDATA represented in JSON?",
      a: "Attributes become keys starting with @ (for example \"@id\"), and an element's text sits under #text when it also has attributes or children. CDATA is kept exactly as written and merged into the text, or kept apart under #cdata. That's the same layout JSON to XML reads with the @keys option, so a document converts back.",
    },
    {
      q: "Are numbers and entities converted?",
      a: "Text that reads back unchanged as a number or true/false becomes one, so 42 is a number while 007 and 1.10 stay strings. Entities such as &amp;, &#169; and ones declared in the DOCTYPE are decoded; external entities are never fetched.",
    },
  ],
  related: ["json-to-yaml", "json-formatter", "json-to-csv"],
};

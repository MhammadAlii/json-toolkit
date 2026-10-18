import type { GuideMeta } from "../guide";

export const jsonVsXmlGuide: GuideMeta = {
  slug: "json-vs-xml",
  title: "JSON vs XML: Key Differences and When to Use Each",
  h1: "JSON vs XML: differences and when to use each",
  description:
    "JSON and XML compared side by side: syntax, data types, attributes, size, parsing and tooling, with clear advice on when each one is the right choice.",
  keywords: ["json vs xml", "xml vs json", "difference between json and xml", "json or xml", "convert json to xml", "is json better than xml"],
  summary: "How JSON and XML differ in syntax, types, size and tooling, why most APIs moved to JSON, and where XML is still the better fit.",
  published: "2026-10-18",
  updated: "2026-10-18",
  readingMinutes: 5,
  tools: ["json-to-xml", "json-formatter", "json-validator"],
  faqs: [
    {
      q: "Is JSON faster than XML?",
      a: "Usually, yes. JSON is smaller for the same data and maps directly onto the objects and arrays of most languages, so it's quicker to parse and use. XML parsers do more work: namespaces, attributes and mixed content.",
    },
    {
      q: "Can XML be converted to JSON without losing anything?",
      a: "Not always. Attributes, namespaces, comments, the order of mixed text and elements, and the difference between one child and a list of one have no direct JSON equivalent, so converters have to choose a convention.",
    },
    {
      q: "Is XML obsolete?",
      a: "No. It's less common for new web APIs, but it remains the standard for documents and many enterprise formats: SOAP services, RSS and Atom feeds, SVG, Office files (.docx, .xlsx), Android layouts and Maven builds.",
    },
  ],
};

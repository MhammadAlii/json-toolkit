import { compareJson, type DiffOptions } from "./diff";

// Generous enough for 20k-line documents with scattered edits; beyond it the diff is simplified.
const budgetMs = 4000;

addEventListener("message", (e: MessageEvent<{ id: number; input: { left: string; right: string; options: DiffOptions } }>) => {
  const { id, input } = e.data;
  postMessage({ id, output: compareJson(input.left, input.right, input.options, Date.now() + budgetMs) });
});

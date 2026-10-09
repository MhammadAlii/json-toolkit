import type { RepairRule } from "./repair";

export const ruleDot: Record<RepairRule, string> = {
  quotes: "bg-tint-blue",
  commas: "bg-success",
  brackets: "bg-tint-violet",
  comments: "bg-tint-amber",
  literals: "bg-tint-pink",
};

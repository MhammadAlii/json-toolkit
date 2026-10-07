import { AlignLeftIcon } from "@/components/icons/align-left";
import { BarcodeIcon } from "@/components/icons/barcode";
import { ClockIcon } from "@/components/icons/clock";
import { CodeIcon } from "@/components/icons/code";
import { CompressIcon } from "@/components/icons/compress";
import { DatabaseIcon } from "@/components/icons/database";
import { FileCodeIcon } from "@/components/icons/file-code";
import { FileCsvIcon } from "@/components/icons/file-csv";
import { FileExcelIcon } from "@/components/icons/file-excel";
import { FileLinesIcon } from "@/components/icons/file-lines";
import { FileShieldIcon } from "@/components/icons/file-shield";
import { FolderTreeIcon } from "@/components/icons/folder-tree";
import type { IconProps } from "@/components/icons/icon-props";
import { KeyIcon } from "@/components/icons/key";
import { LinkIcon } from "@/components/icons/link";
import { QuestionIcon } from "@/components/icons/question";
import { SearchIcon } from "@/components/icons/search";
import { TableIcon } from "@/components/icons/table";
import { TableColumnsIcon } from "@/components/icons/table-columns";
import { WandIcon } from "@/components/icons/wand";
import { WrenchIcon } from "@/components/icons/wrench";
import type { ToolIcon, ToolTint } from "@/core/tool/types";

export const toolIcons: Record<ToolIcon, React.ComponentType<IconProps>> = {
  "align-left": AlignLeftIcon,
  question: QuestionIcon,
  wrench: WrenchIcon,
  compress: CompressIcon,
  "folder-tree": FolderTreeIcon,
  table: TableIcon,
  search: SearchIcon,
  "table-columns": TableColumnsIcon,
  "file-shield": FileShieldIcon,
  wand: WandIcon,
  "file-code": FileCodeIcon,
  csv: FileCsvIcon,
  code: CodeIcon,
  "file-excel": FileExcelIcon,
  "file-lines": FileLinesIcon,
  database: DatabaseIcon,
  key: KeyIcon,
  link: LinkIcon,
  barcode: BarcodeIcon,
  clock: ClockIcon,
};

// Full class names so Tailwind can detect them.
export const tintText: Record<ToolTint, string> = {
  purple: "text-tint-purple",
  green: "text-tint-green",
  amber: "text-tint-amber",
  blue: "text-tint-blue",
  indigo: "text-tint-indigo",
  pink: "text-tint-pink",
};

export const tintTile: Record<ToolTint, string> = {
  purple: "bg-tint-purple/20 text-tint-purple",
  green: "bg-tint-green/20 text-tint-green",
  amber: "bg-tint-amber/20 text-tint-amber",
  blue: "bg-tint-blue/20 text-tint-blue",
  indigo: "bg-tint-indigo/20 text-tint-indigo",
  pink: "bg-tint-pink/20 text-tint-pink",
};

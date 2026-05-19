import { Link2Icon } from "lucide-react";

import { SEMANTIC_ACCENTS } from "~/core/lib/semantic-style";

/** Visual accent for memory-recall similarity rows (preview / future live data). */
export const MEMORY_RECALL_ACCENT = {
  ...SEMANTIC_ACCENTS.recall,
  icon: Link2Icon,
} as const;

import { WorldBook, WorldEntry, ChatMessage } from "../types";

export interface LoreMatchResult {
  activeEntries: WorldEntry[];
  matchedKeys: string[];
}

/**
 * Scans recent chat messages for keywords in bound World Books.
 */
export function findActiveLoreEntries(
  recentMessages: ChatMessage[],
  worldBooks: WorldBook[],
  boundBookIds: string[],
  contextDepth: number = 5
): LoreMatchResult {
  // Extract text from the last N messages
  const targetMessages = recentMessages.slice(-contextDepth);
  const combinedText = targetMessages.map((m) => m.content).join("\n").toLowerCase();

  const activeEntries: WorldEntry[] = [];
  const matchedKeysSet = new Set<string>();

  // Filter books bound to character or global
  const activeBooks = worldBooks.filter((wb) => boundBookIds.includes(wb.id));

  for (const book of activeBooks) {
    for (const entry of book.entries) {
      if (!entry.enabled) continue;

      // Check if any key matches
      const matchedKeysInEntry = entry.keys.filter((key) => {
        const trimmed = key.trim().toLowerCase();
        return trimmed.length > 0 && combinedText.includes(trimmed);
      });

      if (matchedKeysInEntry.length > 0) {
        activeEntries.push({
          ...entry,
          matchCount: entry.matchCount + 1,
        });
        matchedKeysInEntry.forEach((k) => matchedKeysSet.add(k));
      }
    }
  }

  return {
    activeEntries,
    matchedKeys: Array.from(matchedKeysSet),
  };
}

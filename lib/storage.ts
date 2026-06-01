export interface SaveState {
  coins: number;
  totalCorrect: number;
  bestStreak: number;
  owned: Record<string, number>; // cardId -> level
  selected: string | null; // selected companion card id
  table: number | null; // practice table or null = mixed
}

const KEY = "anime-math-save-v1";

export const DEFAULT_STATE: SaveState = {
  coins: 0,
  totalCorrect: 0,
  bestStreak: 0,
  owned: {},
  selected: null,
  table: null,
};

export function loadState(): SaveState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed, owned: { ...parsed.owned } };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: SaveState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function resetState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

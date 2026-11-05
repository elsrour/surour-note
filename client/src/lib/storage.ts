import type { NoteData, SavedNote, Store } from "./types";
import { createEmptyNote } from "./types";

const STORAGE_KEY = "surour-notes-v1";

const emptyStore = (): Store => ({ current: createEmptyNote(), saved: [] });

export function loadStore(): Store {
  if (typeof window === "undefined") return emptyStore();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();

    const parsed = JSON.parse(raw) as Partial<Store>;
    const base = createEmptyNote();

    return {
      current: { ...base, ...(parsed.current ?? {}) },
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
    };
  } catch {
    return emptyStore();
  }
}

export function persistStore(store: Store): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function makeId(): string {
  return `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** يبني عنوانًا مقروءًا للمسودة من بياناتها */
export function describeNote(data: NoteData): string {
  const name = data.payerName.trim() || "بدون اسم";
  const amount = data.amount.trim();
  return amount ? `${name} — ${amount} ${data.currency}` : name;
}

/** يعيد رقم السند التالي بحسب آخر رقم محفوظ */
export function nextDocNumber(data: NoteData, saved: SavedNote[]): string {
  const numbers = [data.docNumber, ...saved.map((note) => note.data.docNumber)]
    .map((value) => Number(String(value).replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);

  const highest = numbers.length ? Math.max(...numbers) : 48201;
  return String(highest + 1);
}

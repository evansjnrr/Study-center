import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Flashcard, Note, ReviewLog, SavedDiagram, Settings } from "./types";

interface StudyDB extends DBSchema {
  settings: {
    key: string;
    value: Settings;
  };
  diagrams: {
    key: string; // diagram template id
    value: SavedDiagram;
  };
  cards: {
    key: string;
    value: Flashcard;
    indexes: { "by-due": number; "by-subject": string };
  };
  notes: {
    key: string; // e.g. "explain:phy-waves"
    value: Note;
  };
  reviews: {
    key: string;
    value: ReviewLog;
    indexes: { "by-at": number };
  };
}

// Internal IndexedDB name — kept as "claw" so any economics graphs already
// saved under the old name are not orphaned by the rename.
const DB_NAME = "claw";
const DB_VERSION = 5;

let dbPromise: Promise<IDBPDatabase<StudyDB>> | null = null;

export function db(): Promise<IDBPDatabase<StudyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StudyDB>(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains("settings")) {
          d.createObjectStore("settings", { keyPath: "id" });
        }
        if (!d.objectStoreNames.contains("diagrams")) {
          d.createObjectStore("diagrams", { keyPath: "id" });
        }
        if (!d.objectStoreNames.contains("cards")) {
          const c = d.createObjectStore("cards", { keyPath: "id" });
          c.createIndex("by-due", "due");
          c.createIndex("by-subject", "subject");
        }
        if (!d.objectStoreNames.contains("notes")) {
          d.createObjectStore("notes", { keyPath: "id" });
        }
        if (!d.objectStoreNames.contains("reviews")) {
          const rv = d.createObjectStore("reviews", { keyPath: "id" });
          rv.createIndex("by-at", "at");
        }
        // Drop legacy stores from the paper/question era, if present.
        for (const name of ["questions", "attempts", "progress", "retest", "blocks"]) {
          if (d.objectStoreNames.contains(name as any)) {
            d.deleteObjectStore(name as any);
          }
        }
      },
    });
  }
  return dbPromise;
}

// -------------------- Saved econ diagrams --------------------
export async function getDiagram(id: string): Promise<SavedDiagram | undefined> {
  return (await db()).get("diagrams", id);
}

export async function putDiagram(d: SavedDiagram) {
  await (await db()).put("diagrams", d);
}

export async function allDiagrams(): Promise<SavedDiagram[]> {
  return (await db()).getAll("diagrams");
}

export async function deleteDiagram(id: string) {
  await (await db()).delete("diagrams", id);
}

// -------------------- Flashcards --------------------
export async function putCards(cards: Flashcard[]) {
  const d = await db();
  const tx = d.transaction("cards", "readwrite");
  await Promise.all(cards.map((c) => tx.store.put(c)));
  await tx.done;
}

export async function putCard(c: Flashcard) {
  await (await db()).put("cards", c);
}

export async function allCards(): Promise<Flashcard[]> {
  return (await db()).getAll("cards");
}

export async function cardsBySubject(subject: string): Promise<Flashcard[]> {
  return (await db()).getAllFromIndex("cards", "by-subject", subject);
}

export async function deleteCard(id: string) {
  await (await db()).delete("cards", id);
}

export async function countCards(): Promise<number> {
  return (await db()).count("cards");
}

// -------------------- Review log (stats) --------------------
export async function logReview(r: ReviewLog) {
  await (await db()).put("reviews", r);
}

export async function allReviews(): Promise<ReviewLog[]> {
  return (await db()).getAll("reviews");
}

// -------------------- Notes (Feynman "explain it back") --------------------
export async function getNote(id: string): Promise<Note | undefined> {
  return (await db()).get("notes", id);
}

export async function putNote(n: Note) {
  await (await db()).put("notes", n);
}

// -------------------- Backup / restore / reset --------------------
export async function exportAll(): Promise<Record<string, any>> {
  const d = await db();
  return {
    _app: "personal-study-center",
    _version: DB_VERSION,
    exportedAt: Date.now(),
    cards: await d.getAll("cards"),
    notes: await d.getAll("notes"),
    diagrams: await d.getAll("diagrams"),
    reviews: await d.getAll("reviews"),
    settings: await d.getAll("settings"),
  };
}

export async function importAll(data: Record<string, any>) {
  const d = await db();
  const stores = ["cards", "notes", "diagrams", "reviews", "settings"] as const;
  for (const store of stores) {
    const rows = data[store];
    if (!Array.isArray(rows)) continue;
    const tx = d.transaction(store, "readwrite");
    await Promise.all(rows.map((r: any) => tx.store.put(r)));
    await tx.done;
  }
}

export async function clearData(stores: ("cards" | "notes" | "diagrams" | "reviews")[]) {
  const d = await db();
  for (const s of stores) await d.clear(s);
}

// -------------------- Settings --------------------
export async function getSettings(): Promise<Settings | undefined> {
  return (await db()).get("settings", "settings");
}

export async function putSettings(s: Settings) {
  await (await db()).put("settings", s);
}

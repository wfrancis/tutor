import { readFileSync, writeFileSync, existsSync } from "fs";
import {
  vocabularyWords,
  literaryDevices,
  readingPassages,
  VocabWord,
  LiteraryDevice,
  ReadingPassage,
} from "@/data/lessons";

export interface LessonData {
  vocabWords: (VocabWord & { id: number })[];
  literaryDevices: (LiteraryDevice & { id: number })[];
  readingPassages: (ReadingPassage & { id: number })[];
  nextId: number;
}

const DATA_PATH =
  process.env.NODE_ENV === "production"
    ? "/data/lessons.json"
    : `${process.cwd()}/lessons-dev.json`;

function getDefaultData(): LessonData {
  let nextId = 1;
  return {
    vocabWords: vocabularyWords.map((w) => ({ ...w, id: nextId++ })),
    literaryDevices: literaryDevices.map((d) => ({ ...d, id: nextId++ })),
    readingPassages: readingPassages.map((p) => ({ ...p, id: nextId++ })),
    nextId,
  };
}

export function loadData(): LessonData {
  try {
    if (existsSync(DATA_PATH)) {
      const raw = readFileSync(DATA_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read lesson data, using defaults:", e);
  }
  // Seed with hardcoded data on first run
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function saveData(data: LessonData): void {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save lesson data:", e);
  }
}

export function addVocabWords(words: Omit<VocabWord, "id">[]): void {
  const data = loadData();
  for (const w of words) {
    data.vocabWords.push({ ...w, id: data.nextId++ });
  }
  saveData(data);
}

export function addLiteraryDevices(
  devices: Omit<LiteraryDevice, "id">[]
): void {
  const data = loadData();
  for (const d of devices) {
    data.literaryDevices.push({ ...d, id: data.nextId++ });
  }
  saveData(data);
}

export function addReadingPassages(
  passages: Omit<ReadingPassage, "id">[]
): void {
  const data = loadData();
  for (const p of passages) {
    data.readingPassages.push({ ...p, id: data.nextId++ });
  }
  saveData(data);
}

export function deleteItem(
  type: "vocab" | "device" | "passage",
  id: number
): boolean {
  const data = loadData();
  let found = false;
  if (type === "vocab") {
    const before = data.vocabWords.length;
    data.vocabWords = data.vocabWords.filter((w) => w.id !== id);
    found = data.vocabWords.length < before;
  } else if (type === "device") {
    const before = data.literaryDevices.length;
    data.literaryDevices = data.literaryDevices.filter((d) => d.id !== id);
    found = data.literaryDevices.length < before;
  } else if (type === "passage") {
    const before = data.readingPassages.length;
    data.readingPassages = data.readingPassages.filter((p) => p.id !== id);
    found = data.readingPassages.length < before;
  }
  if (found) saveData(data);
  return found;
}

import type { Category, Urgency } from "./types";

const BASE: Record<Category, number> = {
  pothole: 3,
  waterlogging: 3,
  "open-manhole": 4,
  other: 2,
};

interface Clue {
  label: string;
  pattern: RegExp;
  points: number;
}

/** Words that make a report more or less urgent, in English, Bangla, and Banglish. */
const CLUES: Clue[] = [
  {
    label: "children are mentioned",
    pattern: /child|kid|school|student|baccha|bacha|শিশু|স্কুল|ছাত্র|বাচ্চা/i,
    points: 1,
  },
  {
    label: "life-threatening or fatal hazard mentioned",
    pattern:
      /khola\s*manhole|open\s*manhole|mara\s*(geche|gese|gel[oa])|mora\s*(geche|gese|gel[oa])|died|dead|fatal|current\s*(lag|mar)|shock|live\s*wire|খোলা\s*ম্যানহোল|মারা\s*গেছে|মরে\s*গেছে|বিদ্যুৎ\s*তার/i,
    points: 2,
  },
  {
    label: "a hospital is mentioned",
    pattern: /hospital|clinic|ambulance|হাসপাতাল|ক্লিনিক|অ্যাম্বুলেন্স/i,
    points: 1,
  },
  {
    label: "someone was hurt or nearly hurt",
    pattern: /accident|injur|crash|fell|fall|hurt|dughotona|durghotona|por(e|o)|দুর্ঘটনা|আহত|পড়ে|পড়ে/i,
    points: 1,
  },
  {
    label: "it is deep or large",
    pattern: /deep|huge|very big|large|gobhir|boro|bishaal|গভীর|বিশাল|অনেক বড়|অনেক বড়/i,
    points: 1,
  },
  {
    label: "it is on a main road",
    pattern: /main road|highway|junction|flyover|main\s*road|mor|rasta|মূল সড়ক|বড় রাস্তা|বড় রাস্তা|মোড়|মোড়/i,
    points: 1,
  },
  {
    label: "it is dark there at night",
    pattern: /night|dark|raat|andhokar|রাত|অন্ধকার/i,
    points: 1,
  },
  {
    label: "severe electrical or life-safety hazard is mentioned",
    pattern: /electric|live\s*wire|shock|wire|current|drown|submerged|tar\s*chira|বিদ্যুৎ|তার\s*ছিঁড়ে|তার\s*ছিড়ে|শক|ডুবে/i,
    points: 2,
  },
  {
    label: "it is described as small",
    pattern: /\bsmall\b|\bminor\b|\bchoto\b|ছোট/i,
    points: -1,
  },
];

export interface UrgencyEstimate {
  urgency: Urgency;
  reasons: string[];
}

/** Estimate urgency from the kind of hazard and the words in the description. */
export function estimateUrgency(text: string, category: Category): UrgencyEstimate {
  const normalizedText = text.normalize("NFC");
  const matched = CLUES.filter((clue) => clue.pattern.test(normalizedText));
  const score = matched.reduce((sum, clue) => sum + clue.points, BASE[category]);
  const urgency = Math.min(5, Math.max(1, score)) as Urgency;
  return { urgency, reasons: matched.map((clue) => clue.label) };
}
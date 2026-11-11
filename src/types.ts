export type Category = "war" | "politics" | "diplomacy" | "disaster" | "discovery" | "civilization" | "religion";
export type Continent = "europe" | "asia" | "africa" | "americas" | "oceania" | "other";

export interface HistoryEvent {
  id: string; // Wikidata QID
  title: string;
  wiki: string; // English Wikipedia article title
  start: number;
  end?: number;
  sitelinks: number;
  category: Category;
  lat: number;
  lon: number;
  approx: boolean; // location derived from a related place/country
  continent: Continent;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  war: "#ef4444",
  politics: "#f59e0b",
  diplomacy: "#22c55e",
  disaster: "#a855f7",
  discovery: "#38bdf8",
  civilization: "#f472b6",
  religion: "#fde047",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  war: "War & conflict",
  politics: "Revolution & politics",
  diplomacy: "Treaties & diplomacy",
  disaster: "Disasters & epidemics",
  discovery: "Discovery & monuments",
  civilization: "States & civilizations",
  religion: "Religion",
};

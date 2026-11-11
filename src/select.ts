import type { Continent, HistoryEvent } from "./types";

export const SLOTS_PER_BUCKET = 100;
export const MAX_PER_CONTINENT = 25;
const CAPPED: Continent[] = ["europe", "asia", "africa", "americas", "oceania"];

export function continentOf(lat: number, lon: number): Continent {
  if (lat < -60) return "other";
  if (lon >= -170 && lon <= -30 && !(lat > 60 && lon > -60)) return "americas";
  if ((lat < -10 && lon > 110) || (lat < 25 && (lon > 160 || lon < -150))) return "oceania";
  if (lat < 36 && lat > -36 && lon >= -20 && lon <= 52 && !(lat > 12 && lon > 34 && lat > 28)) return "africa";
  if (lat < -10 && lon >= -20 && lon <= 52) return "africa";
  if (lat > 35 && lon >= -25 && lon < 40 && !(lat < 42 && lon > 26)) return "europe";
  if (lat > 60 && lon >= -25 && lon < 60) return "europe";
  return "asia";
}

/**
 * Takes the top events by sitelinks with an even per-continent base share, never more than
 * `cap` per continent; slots a continent cannot fill are redistributed proportionally to
 * continents with spare events (and spare room under the cap).
 */
export function selectBalanced(candidates: HistoryEvent[], slots = SLOTS_PER_BUCKET, cap = MAX_PER_CONTINENT): HistoryEvent[] {
  const byContinent = new Map<Continent, HistoryEvent[]>();
  for (const e of [...candidates].sort((a, b) => b.sitelinks - a.sitelinks)) {
    const list = byContinent.get(e.continent) ?? [];
    list.push(e);
    byContinent.set(e.continent, list);
  }
  const base = Math.floor(slots / CAPPED.length);
  const taken = new Map<Continent, number>();
  let used = 0;
  for (const c of CAPPED) {
    const n = Math.min(base, cap, byContinent.get(c)?.length ?? 0);
    taken.set(c, n);
    used += n;
  }
  const room = (c: Continent) => Math.min(cap, byContinent.get(c)?.length ?? 0) - (taken.get(c) ?? 0);
  const capacity = CAPPED.reduce((a, c) => a + Math.min(cap, byContinent.get(c)?.length ?? 0), 0);
  let remaining = Math.min(slots, capacity) - used;
  while (remaining > 0) {
    const spare = CAPPED.map((c) => ({ c, spare: room(c) })).filter((s) => s.spare > 0);
    if (spare.length === 0) break;
    const totalSpare = spare.reduce((a, s) => a + s.spare, 0);
    const shares = spare
      .map((s) => {
        const exact = (remaining * s.spare) / totalSpare;
        return { c: s.c, spare: s.spare, whole: Math.min(s.spare, Math.floor(exact)), frac: exact - Math.floor(exact) };
      })
      .sort((a, b) => b.frac - a.frac);
    let given = 0;
    for (const s of shares) {
      taken.set(s.c, (taken.get(s.c) ?? 0) + s.whole);
      given += s.whole;
    }
    let left = remaining - given;
    for (const s of shares) {
      if (left <= 0) break;
      if (s.whole < s.spare) {
        taken.set(s.c, (taken.get(s.c) ?? 0) + 1);
        left--;
        given++;
      }
    }
    remaining -= given;
    if (given === 0) break;
  }
  const out: HistoryEvent[] = [];
  for (const c of CAPPED) out.push(...(byContinent.get(c) ?? []).slice(0, taken.get(c) ?? 0));
  return out.sort((a, b) => b.sitelinks - a.sitelinks);
}

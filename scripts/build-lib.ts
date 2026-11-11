import { BUCKETS, eventInBucket } from "../src/buckets";
import { continentOf, selectBalanced } from "../src/select";
import type { Category, HistoryEvent } from "../src/types";

export interface RawEvent {
  id: string;
  type: string;
  start: number;
  end?: number;
  sitelinks: number;
}

export interface Place {
  title: string;
  wiki: string;
  lat: number;
  lon: number;
  approx: boolean;
}

export function yearFromXsd(v: string): number | null {
  const m = v.match(/^([+-]?)(\d+)-/);
  if (!m) return null;
  const y = parseInt(m[2], 10);
  return m[1] === "-" ? -y : y;
}

export function parseWkt(v: string): { lat: number; lon: number } | null {
  const m = v.match(/Point\(\s*(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s*\)/);
  if (!m) return null;
  const lon = parseFloat(m[1]);
  const lat = parseFloat(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

export function minSitelinks(year: number): number {
  if (year < -2000) return 3;
  if (year < 1000) return 8;
  if (year < 1700) return 15;
  if (year < 1900) return 20;
  return 30;
}

export function mergeRaw(rows: RawEvent[]): RawEvent[] {
  const byId = new Map<string, RawEvent>();
  for (const r of rows) {
    const prev = byId.get(r.id);
    if (!prev) {
      byId.set(r.id, { ...r });
      continue;
    }
    if (r.end !== undefined && (prev.end === undefined || r.end > prev.end)) prev.end = r.end;
    prev.sitelinks = Math.max(prev.sitelinks, r.sitelinks);
  }
  return [...byId.values()];
}

export function toEvents(raw: RawEvent[], places: Map<string, Place>, classes: Record<string, Category>): HistoryEvent[] {
  const out: HistoryEvent[] = [];
  for (const r of raw) {
    const p = places.get(r.id);
    const category = classes[r.type];
    if (!p || !category) continue;
    out.push({
      id: r.id,
      title: p.title,
      wiki: p.wiki,
      start: r.start,
      ...(r.end !== undefined && r.end >= r.start ? { end: r.end } : {}),
      sitelinks: r.sitelinks,
      category,
      lat: Math.round(p.lat * 1000) / 1000,
      lon: Math.round(p.lon * 1000) / 1000,
      approx: p.approx,
      continent: continentOf(p.lat, p.lon),
    });
  }
  return out;
}

export function buildBuckets(events: HistoryEvent[]): HistoryEvent[][] {
  return BUCKETS.map((b) => selectBalanced(events.filter((e) => eventInBucket(e, b))));
}

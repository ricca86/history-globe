import type { HistoryEvent } from "./types";

const cache = new Map<number, Promise<HistoryEvent[]>>();
const base = import.meta.env.BASE_URL;

export function loadBucket(index: number): Promise<HistoryEvent[]> {
  let p = cache.get(index);
  if (!p) {
    p = fetch(`${base}data/buckets/${index}.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<HistoryEvent[]>;
    });
    p.catch(() => cache.delete(index));
    cache.set(index, p);
  }
  return p;
}

export function prefetch(index: number, count: number): void {
  for (let i = index - 1; i <= index + 1; i++) if (i >= 0 && i < count) void loadBucket(i).catch(() => {});
}

export const END_YEAR = 2026;
export const MAX_SPAN_YEARS = 50;

interface Segment {
  from: number;
  to: number;
  step: number;
}

// Years are signed integers; BCE years are negative (no year 0 adjustment).
const SEGMENTS: Segment[] = [
  { from: -100000, to: -4000, step: 1000 },
  { from: -4000, to: -2000, step: 500 },
  { from: -2000, to: -200, step: 100 },
  { from: -200, to: 1000, step: 50 },
  { from: 1000, to: 1900, step: 10 },
  { from: 1900, to: END_YEAR + 1, step: 1 },
];

export interface Bucket {
  index: number;
  start: number;
  end: number; // exclusive
}

export const BUCKETS: Bucket[] = (() => {
  const out: Bucket[] = [];
  for (const s of SEGMENTS) {
    for (let y = s.from; y < s.to; y += s.step) {
      out.push({ index: out.length, start: y, end: y + s.step });
    }
  }
  return out;
})();

export function bucketForYear(year: number): Bucket {
  if (year <= BUCKETS[0].start) return BUCKETS[0];
  const last = BUCKETS[BUCKETS.length - 1];
  if (year >= last.end) return last;
  let lo = 0;
  let hi = BUCKETS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (BUCKETS[mid].start <= year) lo = mid;
    else hi = mid - 1;
  }
  return BUCKETS[lo];
}

export function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year).toLocaleString("en-US")} BCE` : `${year} CE`;
}

export function formatBucket(b: Bucket): string {
  const span = b.end - b.start;
  if (span <= 1) return formatYear(b.start);
  return `${formatYear(b.start)} – ${formatYear(b.end - 1)}`;
}

/** Parses "1453", "1453 CE", "44 BCE", "-44", "10,000 BCE" into a signed year. */
export function parseYear(input: string): number | null {
  const m = input.trim().replace(/,/g, "").match(/^(-?\d+)\s*(bce|bc|ce|ad)?$/i);
  if (!m) return null;
  let y = parseInt(m[1], 10);
  const era = m[2]?.toLowerCase();
  if (era === "bce" || era === "bc") y = -Math.abs(y);
  return y;
}

export interface Span {
  start: number;
  end?: number;
}

/** Overlap rule: long spans (> MAX_SPAN_YEARS) or open ones count by start year only. */
export function eventInBucket(e: Span, b: Bucket): boolean {
  const end = e.end;
  if (end === undefined || end < e.start || end - e.start > MAX_SPAN_YEARS) {
    return e.start >= b.start && e.start < b.end;
  }
  return e.start < b.end && end >= b.start;
}

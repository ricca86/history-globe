import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { END_YEAR } from "../src/buckets";
import { EVENT_CLASSES, INCEPTION_CLASSES } from "./classes";
import { buildBuckets, mergeRaw, minSitelinks, parseWkt, toEvents, yearFromXsd, type Place, type RawEvent } from "./build-lib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "scripts", ".cache");
const OUT = join(ROOT, "public", "data");
const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = "history-globe/0.1 (static educational app; https://github.com/)";
mkdirSync(CACHE, { recursive: true });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sparql(query: string, attempt = 0): Promise<any[]> {
  const key = createHash("sha1").update(query).digest("hex");
  const file = join(CACHE, `${key}.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  try {
    const res = await fetch(`${ENDPOINT}?format=json&query=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/sparql-results+json", "User-Agent": UA },
      signal: AbortSignal.timeout(70000),
    });
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!res.ok || text.startsWith("upstream") || text.includes("TimeoutException")) throw new Error(`failed: ${text.slice(0, 120)}`);
    const rows = JSON.parse(text).results.bindings;
    writeFileSync(file, JSON.stringify(rows));
    await sleep(800);
    return rows;
  } catch (err) {
    if (attempt >= 3) throw err;
    await sleep(5000 * (attempt + 1));
    return sparql(query, attempt + 1);
  }
}

const iso = (y: number) => `"${y < 0 ? "-" : ""}${String(Math.abs(y)).padStart(4, "0")}-01-01T00:00:00Z"^^xsd:dateTime`;

async function fetchChunk(prop: string, from: number, to: number, types: string[], depth = 0): Promise<RawEvent[]> {
  const q = `SELECT ?e ?type ?start ?end ?sl WHERE {
  VALUES ?type { ${types.map((t) => `wd:${t}`).join(" ")} }
  ?e wdt:${prop} ?start. FILTER(?start >= ${iso(from)} && ?start < ${iso(to)})
  ?e wikibase:sitelinks ?sl. FILTER(?sl >= ${minSitelinks(from)})
  ?e wdt:P31 ?type.
  OPTIONAL { ?e wdt:P582|wdt:P576 ?end }
}`;
  try {
    const rows = await sparql(q);
    return rows.flatMap((r) => {
      const start = yearFromXsd(r.start.value);
      if (start === null) return [];
      const end = r.end ? yearFromXsd(r.end.value) : null;
      return [{ id: r.e.value.split("/").pop()!, type: r.type.value.split("/").pop()!, start, end: end ?? undefined, sitelinks: +r.sl.value }];
    });
  } catch (err) {
    if (to - from <= 1 || depth > 6) {
      console.warn(`skip ${prop} ${from}..${to}: ${err}`);
      return [];
    }
    const mid = Math.floor((from + to) / 2);
    return [...(await fetchChunk(prop, from, mid, types, depth + 1)), ...(await fetchChunk(prop, mid, to, types, depth + 1))];
  }
}

function chunks(): Array<[number, number]> {
  const plan: Array<[number, number, number]> = [
    [-100000, -4000, 96000], [-4000, -1000, 1500], [-1000, 1000, 500], [1000, 1500, 250], [1500, 1800, 100], [1800, 1900, 25], [1900, END_YEAR + 1, 10],
  ];
  const out: Array<[number, number]> = [];
  for (const [a, b, step] of plan) for (let y = a; y < b; y += step) out.push([y, Math.min(b, y + step)]);
  return out;
}

async function fetchPlaces(ids: string[]): Promise<Map<string, Place>> {
  const places = new Map<string, Place>();
  const rank = (p: Place) => (p.approx ? 1 : 0);
  for (let i = 0; i < ids.length; i += 80) {
    const batch = ids.slice(i, i + 80);
    const q = `SELECT ?e ?art ?name ?c0 ?c1 ?c3 ?c2 WHERE {
  VALUES ?e { ${batch.map((x) => `wd:${x}`).join(" ")} }
  ?art schema:about ?e; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?name.
  OPTIONAL { ?e wdt:P625 ?c0 }
  OPTIONAL { ?e wdt:P276/wdt:P625 ?c1 }
  OPTIONAL { ?e wdt:P131/wdt:P625 ?c3 }
  OPTIONAL { ?e wdt:P17/wdt:P625 ?c2 }
}`;
    const rows = await sparql(q);
    for (const r of rows) {
      const coord = [r.c0, r.c1, r.c3, r.c2].find((c) => c && parseWkt(c.value));
      if (!coord) continue;
      const { lat, lon } = parseWkt(coord.value)!;
      const id = r.e.value.split("/").pop()!;
      const place: Place = {
        title: r.name.value,
        wiki: decodeURIComponent(r.art.value.split("/wiki/")[1] ?? r.name.value).replace(/_/g, " "),
        lat, lon, approx: coord !== r.c0,
      };
      const prev = places.get(id);
      if (!prev || rank(place) < rank(prev)) places.set(id, place);
    }
    process.stdout.write(`\rplaces ${Math.min(i + 80, ids.length)}/${ids.length}`);
  }
  process.stdout.write("\n");
  return places;
}

async function main() {
  const all = Object.keys(EVENT_CLASSES);
  const raw: RawEvent[] = [];
  for (const [from, to] of chunks()) {
    for (const prop of ["P585", "P580", "P571"]) {
      const types = prop === "P571" ? INCEPTION_CLASSES : all;
      raw.push(...(await fetchChunk(prop, from, to, types)));
    }
    console.log(`chunk ${from}..${to}: ${raw.length} raw rows`);
  }
  const merged = mergeRaw(raw);
  console.log(`unique candidates: ${merged.length}`);
  const places = await fetchPlaces(merged.map((m) => m.id));
  const events = toEvents(merged, places, EVENT_CLASSES);
  console.log(`events with article+location: ${events.length}`);
  const buckets = buildBuckets(events);
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "buckets"), { recursive: true });
  const counts = buckets.map((b, i) => {
    writeFileSync(join(OUT, "buckets", `${i}.json`), JSON.stringify(b));
    return b.length;
  });
  writeFileSync(join(OUT, "index.json"), JSON.stringify({ generatedAt: new Date().toISOString(), counts }));
  console.log(`wrote ${counts.length} buckets, ${counts.reduce((a, b) => a + b, 0)} entries, ${counts.filter((c) => c === 0).length} empty`);
}

main().catch((e) => { console.error(e); process.exit(1); });

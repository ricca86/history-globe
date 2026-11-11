import { describe, expect, it } from "vitest";
import { continentOf, selectBalanced } from "../src/select";
import type { Continent, HistoryEvent } from "../src/types";

const ev = (i: number, continent: Continent, sitelinks: number): HistoryEvent => ({
  id: `Q${i}`, title: `E${i}`, wiki: `E${i}`, start: 0, sitelinks, category: "war", lat: 0, lon: 0, approx: false, continent,
});

describe("continentOf", () => {
  it("classifies sample places", () => {
    expect(continentOf(48.85, 2.35)).toBe("europe");
    expect(continentOf(30.04, 31.23)).toBe("africa");
    expect(continentOf(35.68, 139.69)).toBe("asia");
    expect(continentOf(40.7, -74)).toBe("americas");
    expect(continentOf(-33.87, 151.2)).toBe("oceania");
    expect(continentOf(-1.29, 36.82)).toBe("africa");
  });
});

describe("selectBalanced", () => {
  it("caps each continent at its base share when all have plenty", () => {
    const c: HistoryEvent[] = [];
    (["europe", "asia", "africa", "americas", "oceania"] as Continent[]).forEach((k, ki) => {
      for (let i = 0; i < 20; i++) c.push(ev(ki * 100 + i, k, 100 - i));
    });
    const out = selectBalanced(c, 25, 25);
    expect(out).toHaveLength(25);
    for (const k of ["europe", "asia", "africa", "americas", "oceania"]) {
      expect(out.filter((e) => e.continent === k)).toHaveLength(5);
    }
  });
  it("redistributes unused slots to continents with more events", () => {
    const c: HistoryEvent[] = [];
    for (let i = 0; i < 30; i++) c.push(ev(i, "europe", 100 - i));
    for (let i = 0; i < 10; i++) c.push(ev(100 + i, "asia", 90 - i));
    c.push(ev(200, "africa", 50));
    const out = selectBalanced(c, 25, 25);
    expect(out).toHaveLength(25);
    expect(out.filter((e) => e.continent === "africa")).toHaveLength(1);
    const eu = out.filter((e) => e.continent === "europe").length;
    const as = out.filter((e) => e.continent === "asia").length;
    expect(eu).toBeGreaterThan(as);
    expect(eu + as).toBe(24);
  });
  it("never exceeds the per-continent cap", () => {
    const c: HistoryEvent[] = [];
    for (let i = 0; i < 200; i++) c.push(ev(i, "europe", 500 - i));
    for (let i = 0; i < 40; i++) c.push(ev(1000 + i, "asia", 300 - i));
    const out = selectBalanced(c, 100, 25);
    expect(out.filter((e) => e.continent === "europe")).toHaveLength(25);
    expect(out.filter((e) => e.continent === "asia")).toHaveLength(25);
    expect(out).toHaveLength(50);
  });
  it("fills 100 slots with a 25 cap when continents are plentiful", () => {
    const c: HistoryEvent[] = [];
    (["europe", "asia", "africa", "americas"] as Continent[]).forEach((k, ki) => {
      for (let i = 0; i < 60; i++) c.push(ev(ki * 100 + i, k, 100 - i));
    });
    c.push(ev(900, "oceania", 5));
    const out = selectBalanced(c);
    expect(out).toHaveLength(100);
    expect(Math.max(...["europe", "asia", "africa", "americas"].map((k) => out.filter((e) => e.continent === k).length))).toBeLessThanOrEqual(25);
  });
  it("returns everything when fewer candidates than slots", () => {
    expect(selectBalanced([ev(1, "europe", 5), ev(2, "other", 4)], 25).map((e) => e.id)).toEqual(["Q1"]);
  });
});

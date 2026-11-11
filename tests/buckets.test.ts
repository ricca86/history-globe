import { describe, expect, it } from "vitest";
import { BUCKETS, bucketForYear, eventInBucket, formatYear, parseYear, END_YEAR } from "../src/buckets";

describe("buckets", () => {
  it("is contiguous and covers 100,000 BCE to the end year", () => {
    expect(BUCKETS[0].start).toBe(-100000);
    for (let i = 1; i < BUCKETS.length; i++) expect(BUCKETS[i].start).toBe(BUCKETS[i - 1].end);
    expect(BUCKETS.at(-1)!.end).toBe(END_YEAR + 1);
  });
  it("uses the requested granularity", () => {
    expect(bucketForYear(-50000)).toMatchObject({ start: -50000, end: -49000 });
    expect(bucketForYear(-3200)).toMatchObject({ start: -3500, end: -3000 });
    expect(bucketForYear(-1234)).toMatchObject({ start: -1300, end: -1200 });
    expect(bucketForYear(480)).toMatchObject({ start: 450, end: 500 });
    expect(bucketForYear(1453)).toMatchObject({ start: 1450, end: 1460 });
    expect(bucketForYear(1969)).toMatchObject({ start: 1969, end: 1970 });
  });
  it("clamps out of range years", () => {
    expect(bucketForYear(-999999).index).toBe(0);
    expect(bucketForYear(9999).index).toBe(BUCKETS.length - 1);
  });
  it("formats and parses years", () => {
    expect(formatYear(-4000)).toBe("4,000 BCE");
    expect(formatYear(1453)).toBe("1453 CE");
    expect(parseYear("44 BCE")).toBe(-44);
    expect(parseYear("1,453")).toBe(1453);
    expect(parseYear("abc")).toBeNull();
  });
  it("applies the overlap rule with the long-span cap", () => {
    const b = bucketForYear(1914);
    expect(eventInBucket({ start: 1914, end: 1918 }, bucketForYear(1916))).toBe(true);
    expect(eventInBucket({ start: 1914, end: 1918 }, bucketForYear(1919))).toBe(false);
    expect(eventInBucket({ start: 1000, end: 1500 }, bucketForYear(1200))).toBe(false);
    expect(eventInBucket({ start: 1000, end: 1500 }, bucketForYear(1000))).toBe(true);
    expect(eventInBucket({ start: 1914 }, b)).toBe(true);
  });
});

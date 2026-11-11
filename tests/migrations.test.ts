import { describe, expect, it } from "vitest";
import { bucketForYear } from "../src/buckets";
import { MIGRATIONS, migrationsInBucket, toArcs } from "../src/migrations";

describe("migrations data", () => {
  it("is well formed", () => {
    expect(new Set(MIGRATIONS.map((m) => m.id)).size).toBe(MIGRATIONS.length);
    for (const m of MIGRATIONS) {
      expect(m.start).toBeLessThanOrEqual(m.end);
      expect(m.routes.length).toBeGreaterThan(0);
      for (const r of m.routes) {
        expect(r.length).toBeGreaterThanOrEqual(2);
        for (const [lat, lon] of r) {
          expect(Math.abs(lat)).toBeLessThanOrEqual(90);
          expect(Math.abs(lon)).toBeLessThanOrEqual(180);
        }
      }
    }
  });
  it("has migrations in the ancient eras", () => {
    expect(MIGRATIONS.filter((m) => m.end < -1000).length).toBeGreaterThanOrEqual(8);
  });
});

describe("migrationsInBucket", () => {
  it("selects by overlap", () => {
    const ids = (y: number) => migrationsInBucket(bucketForYear(y)).map((m) => m.id);
    expect(ids(-60000)).toContain("out-of-africa");
    expect(ids(-60000)).toContain("australia");
    expect(ids(-60000)).not.toContain("americas");
    expect(ids(-15000)).toContain("americas");
    expect(ids(1000)).toContain("vikings");
    expect(ids(1950)).toContain("great-migration");
  });
  it("splits routes into arc segments", () => {
    const m = MIGRATIONS.find((x) => x.id === "hijra")!;
    expect(toArcs([m])).toHaveLength(1);
  });
});

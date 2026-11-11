// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, expect, it, vi } from "vitest";

const chain: any = new Proxy(function () {}, {
  get: (_t, prop) => (prop === "controls" ? () => ({}) : (...args: unknown[]) => {
    if (prop === "pointsData") (globalThis as any).__points = args[0];
    return chain;
  }),
});
vi.mock("globe.gl", () => ({ default: function () { return chain; } }));

const root = join(__dirname, "..");
beforeAll(async () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  document.body.innerHTML = html.match(/<body>([\s\S]*)<\/body>/)![1].replace(/<script[\s\S]*?<\/script>/g, "");
  vi.stubGlobal("fetch", async (url: string) => {
    if (url.includes("/data/buckets/")) {
      return { ok: true, json: async () => JSON.parse(readFileSync(join(root, "public", url.replace(/^\/?/, "")), "utf8")) };
    }
    return { ok: true, json: async () => ({ extract: "Summary text", content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/X" } } }) };
  });
  await import("../src/main");
});

const settle = () => new Promise((r) => setTimeout(r, 50));

it("renders the initial bucket and lists events", async () => {
  await settle();
  expect(document.getElementById("era")!.textContent).toBe("1900 CE");
  expect(document.querySelectorAll("#panel li button").length).toBeGreaterThan(0);
  expect((globalThis as any).__points.length).toBeGreaterThan(0);
});

it("jumps to a year and opens an event summary", async () => {
  const input = document.getElementById("jump-input") as HTMLInputElement;
  input.value = "1453";
  document.getElementById("jump")!.dispatchEvent(new Event("submit", { cancelable: true }));
  await settle();
  expect(document.getElementById("era")!.textContent).toContain("1450 CE");
  (document.querySelector("#panel li button") as HTMLButtonElement).click();
  await settle();
  expect(document.getElementById("panel-body")!.textContent).toContain("Summary text");
  expect(document.getElementById("panel-body")!.textContent).toContain("CC BY-SA");
});

it("rejects invalid years", async () => {
  const input = document.getElementById("jump-input") as HTMLInputElement;
  input.value = "nonsense";
  document.getElementById("jump")!.dispatchEvent(new Event("submit", { cancelable: true }));
  expect(input.classList.contains("invalid")).toBe(true);
});

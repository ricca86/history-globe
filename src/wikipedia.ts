export interface Summary {
  extract: string;
  thumbnail?: string;
  url: string;
}

const cache = new Map<string, Promise<Summary>>();

export function fetchSummary(title: string): Promise<Summary> {
  let p = cache.get(title);
  if (!p) {
    const api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
    p = fetch(api).then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      return {
        extract: j.extract ?? "",
        thumbnail: j.thumbnail?.source,
        url: j.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      };
    });
    p.catch(() => cache.delete(title));
    cache.set(title, p);
  }
  return p;
}

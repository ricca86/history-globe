const en = {
  title: "History Globe",
  go: "Go",
  play: "Play",
  pause: "Pause",
  loading: "Loading events…",
  loadError: "Could not load events for this period.",
  noEvents: "No major events recorded for this period.",
  eventsHeading: "Events in this period",
  approxLocation: "Approximate location",
  readMore: "Read on Wikipedia",
  attribution: "Source: Wikipedia (CC BY-SA)",
  summaryError: "Summary unavailable.",
  badYear: "Enter a year such as 1453 or 480 BCE.",
  eventsCount: (n: number) => `${n} event${n === 1 ? "" : "s"}`,
};

type Strings = typeof en;
const locales: Record<string, Strings> = { en };

export const t: Strings = locales[navigator.language?.slice(0, 2)] ?? en;

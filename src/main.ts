import Globe from "globe.gl";
import { BUCKETS, bucketForYear, formatBucket, formatYear, parseYear } from "./buckets";
import { loadBucket, prefetch } from "./data";
import { t } from "./i18n";
import { CATEGORY_COLORS, CATEGORY_LABELS, type Category, type HistoryEvent } from "./types";
import { migrationsInBucket, toArcs, type ArcSegment, type Migration } from "./migrations";
import { fetchSummary } from "./wikipedia";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const base = import.meta.env.BASE_URL;
const MIGRATION_COLOR = "#2dd4bf";
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const slider = $<HTMLInputElement>("slider");
const era = $("era");
const status = $("status");
const panelTitle = $("panel-title");
const panelBody = $("panel-body");
const playBtn = $<HTMLButtonElement>("play");
const jumpForm = $<HTMLFormElement>("jump");
const jumpInput = $<HTMLInputElement>("jump-input");

slider.max = String(BUCKETS.length - 1);
slider.value = String(bucketForYear(1900).index);

document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => (el.textContent = (t as any)[el.dataset.i18n!]));
playBtn.setAttribute("aria-label", t.play);

$("legend").innerHTML =
  (Object.keys(CATEGORY_COLORS) as Category[])
    .map((c) => `<li><i style="background:${CATEGORY_COLORS[c]}"></i>${esc(CATEGORY_LABELS[c])}</li>`)
    .join("") + `<li><i class="line" style="background:${MIGRATION_COLOR}"></i>${esc(t.migrations)}</li>`;

const globe = new Globe($("globe"))
  .globeImageUrl(`${base}img/earth-blue-marble.jpg`)
  .bumpImageUrl(`${base}img/earth-topology.png`)
  .backgroundImageUrl(`${base}img/night-sky.png`)
  .pointLat("lat")
  .pointLng("lon")
  .pointColor((e) => CATEGORY_COLORS[(e as HistoryEvent).category])
  .pointAltitude((e) => 0.01 + Math.min(0.12, Math.log2((e as HistoryEvent).sitelinks) * 0.012))
  .pointRadius((e) => 0.25 + Math.min(0.6, (e as HistoryEvent).sitelinks / 150))
  .pointLabel((e) => {
    const ev = e as HistoryEvent;
    return `<div style="padding:4px 8px;background:#0c1124e6;border-radius:6px"><b>${esc(ev.title)}</b><br><small>${esc(eventDate(ev))}</small></div>`;
  })
  .arcStartLat("startLat")
  .arcStartLng("startLng")
  .arcEndLat("endLat")
  .arcEndLng("endLng")
  .arcColor(() => [MIGRATION_COLOR, "#ffffff"])
  .arcStroke(0.5)
  .arcAltitudeAutoScale(0.35)
  .arcDashLength(0.45)
  .arcDashGap(0.15)
  .arcDashAnimateTime(2500)
  .arcLabel((a) => {
    const m = (a as ArcSegment).migration;
    return `<div style="padding:4px 8px;background:#0c1124e6;border-radius:6px"><b>${esc(m.title)}</b><br><small>${esc(migrationDate(m))}</small></div>`;
  })
  .onArcClick((a) => selectMigration((a as ArcSegment).migration))
  .pointsTransitionDuration(600)
  .onPointClick((e) => select(e as HistoryEvent))
  .ringColor(() => (x: number) => `rgba(255,255,255,${1 - x})`)
  .ringMaxRadius(3)
  .ringPropagationSpeed(2)
  .ringRepeatPeriod(900);
globe.controls().autoRotate = false;
const fit = () => globe.width(window.innerWidth).height(window.innerHeight);
fit();
window.addEventListener("resize", fit);

let current: HistoryEvent[] = [];
let currentMigrations: Migration[] = [];
let loadToken = 0;
let debounce: ReturnType<typeof setTimeout> | undefined;

function eventDate(e: HistoryEvent): string {
  return e.end !== undefined && e.end !== e.start ? `${formatYear(e.start)} – ${formatYear(e.end)}` : formatYear(e.start);
}

function migrationDate(m: Migration): string {
  return m.end !== m.start ? `${formatYear(m.start)} – ${formatYear(m.end)}` : formatYear(m.start);
}

function showStatus(text: string) {
  status.textContent = text;
  status.classList.toggle("visible", text !== "");
}

function renderList() {
  panelTitle.textContent = t.eventsHeading;
  if (current.length === 0 && currentMigrations.length === 0) {
    panelBody.innerHTML = `<p class="meta">${esc(t.noEvents)}</p>`;
    return;
  }
  const migList = currentMigrations.length
    ? `<h3>${esc(t.migrations)}</h3><ul>${currentMigrations
        .map(
          (m, i) =>
            `<li><button type="button" data-m="${i}"><i class="line" style="background:${MIGRATION_COLOR}"></i>${esc(m.title)}<small>${esc(formatYear(m.start))}</small></button></li>`,
        )
        .join("")}</ul>`
    : "";
  panelBody.innerHTML = `${migList}${current.length ? `<h3>${esc(t.eventsHeading)} · ${esc(t.eventsCount(current.length))}</h3>` : ""}<ul>${current
    .map(
      (e, i) =>
        `<li><button type="button" data-i="${i}"><i style="background:${CATEGORY_COLORS[e.category]}"></i>${esc(e.title)}<small>${esc(formatYear(e.start))}</small></button></li>`,
    )
    .join("")}</ul>`;
  panelBody.querySelectorAll<HTMLButtonElement>("button[data-i]").forEach((b) => (b.onclick = () => select(current[+b.dataset.i!])));
  panelBody.querySelectorAll<HTMLButtonElement>("button[data-m]").forEach((b) => (b.onclick = () => selectMigration(currentMigrations[+b.dataset.m!])));
}

interface Detail {
  title: string;
  wiki: string;
  date: string;
  note?: string;
}

function select(e: HistoryEvent) {
  globe.pointOfView({ lat: e.lat, lng: e.lon, altitude: 1.6 }, 1000);
  globe.ringsData([e]).ringLat("lat").ringLng("lon");
  return showDetail({ title: e.title, wiki: e.wiki, date: eventDate(e), note: e.approx ? t.approxLocation : undefined });
}

function selectMigration(m: Migration) {
  const pts = m.routes.flat();
  const lat = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const lng = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  globe.pointOfView({ lat, lng, altitude: 2.4 }, 1000);
  globe.ringsData([]);
  return showDetail({ title: m.title, wiki: m.wiki, date: migrationDate(m), note: t.approxMigration });
}

async function showDetail(d: Detail) {
  panelTitle.textContent = d.title;
  panelBody.innerHTML = `<button class="back" type="button">← ${esc(t.eventsHeading)}</button>
    <p class="meta">${esc(d.date)}${d.note ? ` · ${esc(d.note)}` : ""}</p><div id="summary">${esc(t.loading)}</div>`;
  panelBody.querySelector<HTMLButtonElement>(".back")!.onclick = () => {
    globe.ringsData([]);
    renderList();
  };
  const summaryEl = panelBody.querySelector("#summary")!;
  try {
    const s = await fetchSummary(d.wiki);
    if (panelTitle.textContent !== d.title) return;
    summaryEl.innerHTML = `${s.thumbnail ? `<img src="${esc(s.thumbnail)}" alt="">` : ""}<p>${esc(s.extract)}</p>
      <p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t.readMore)}</a></p><p class="credit">${esc(t.attribution)}</p>`;
  } catch {
    if (panelTitle.textContent !== d.title) return;
    summaryEl.innerHTML = `<p>${esc(t.summaryError)}</p><p><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(d.wiki.replace(/ /g, "_"))}" target="_blank" rel="noopener">${esc(t.readMore)}</a></p>`;
  }
}

async function show(index: number) {
  const b = BUCKETS[index];
  era.textContent = formatBucket(b);
  currentMigrations = migrationsInBucket(b);
  globe.arcsData(toArcs(currentMigrations));
  const token = ++loadToken;
  showStatus(t.loading);
  try {
    const events = await loadBucket(index);
    if (token !== loadToken) return;
    current = events;
    globe.pointsData(events);
    globe.ringsData([]);
    renderList();
    showStatus("");
    prefetch(index, BUCKETS.length);
  } catch {
    if (token === loadToken) showStatus(t.loadError);
  }
}

function setIndex(i: number, immediate = false) {
  i = Math.max(0, Math.min(BUCKETS.length - 1, i));
  slider.value = String(i);
  era.textContent = formatBucket(BUCKETS[i]);
  clearTimeout(debounce);
  if (immediate) void show(i);
  else debounce = setTimeout(() => void show(i), 150);
}

slider.addEventListener("input", () => setIndex(+slider.value));

jumpForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const y = parseYear(jumpInput.value);
  jumpInput.classList.toggle("invalid", y === null);
  if (y === null) return showStatus(t.badYear), void setTimeout(() => showStatus(""), 2500);
  setIndex(bucketForYear(y).index, true);
});

document.addEventListener("keydown", (ev) => {
  if ((ev.target as HTMLElement).tagName === "INPUT") return;
  if (ev.key === "ArrowLeft") setIndex(+slider.value - 1);
  else if (ev.key === "ArrowRight") setIndex(+slider.value + 1);
  else if (ev.key === " ") {
    ev.preventDefault();
    togglePlay();
  }
});

let timer: ReturnType<typeof setInterval> | undefined;
function togglePlay() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  } else {
    if (+slider.value >= BUCKETS.length - 1) setIndex(0, true);
    timer = setInterval(() => {
      if (+slider.value >= BUCKETS.length - 1) return togglePlay();
      setIndex(+slider.value + 1, true);
    }, 1200);
  }
  playBtn.textContent = timer ? "⏸" : "▶";
  playBtn.setAttribute("aria-label", timer ? t.pause : t.play);
}
playBtn.addEventListener("click", togglePlay);
slider.addEventListener("pointerdown", () => timer && togglePlay());

setIndex(+slider.value, true);

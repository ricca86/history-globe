import type { Bucket } from "./buckets";

export type LatLon = [lat: number, lon: number];

export interface Migration {
  id: string;
  title: string;
  wiki: string; // English Wikipedia article title
  start: number;
  end: number;
  routes: LatLon[][]; // each route is a polyline from origin to destination
  note?: string;
}

// Hand-curated: Wikidata has almost no dates or routes for prehistoric migrations.
// Dates and routes are approximate and follow the mainstream reading of each Wikipedia article.
export const MIGRATIONS: Migration[] = [
  { id: "early-levant", title: "Early dispersal to the Levant", wiki: "Skhul and Qafzeh hominins", start: -120000, end: -90000,
    routes: [[[9, 38], [15, 38], [27, 33], [32.7, 35.2]]] },
  { id: "out-of-africa", title: "Southern dispersal out of Africa", wiki: "Recent African origin of modern humans", start: -70000, end: -50000,
    routes: [[[11, 43], [18, 50], [24, 58], [21, 78], [10, 100], [-2, 112]], [[24, 58], [38, 68], [48, 85]]] },
  { id: "australia", title: "Peopling of Australia", wiki: "Prehistory of Australia", start: -65000, end: -50000,
    routes: [[[-2, 112], [-8, 125], [-15, 131], [-26, 135]]] },
  { id: "europe", title: "Modern humans enter Europe", wiki: "Early European modern humans", start: -45000, end: -35000,
    routes: [[[33, 36], [40, 30], [45, 20], [48, 8], [45, 1]]] },
  { id: "americas", title: "Peopling of the Americas", wiki: "Settlement of the Americas", start: -23000, end: -13000,
    routes: [[[65, 175], [64, -165], [58, -130], [45, -105], [15, -90], [-5, -78], [-30, -70], [-50, -72]]] },
  { id: "neolithic-europe", title: "Neolithic farmers spread across Europe", wiki: "Early European Farmers", start: -7000, end: -4000,
    routes: [[[38, 32], [41, 24], [47, 17], [50, 8], [48, -2]], [[38, 32], [38, 16], [41, 2], [39, -5]]] },
  { id: "indo-european", title: "Indo-European migrations", wiki: "Indo-European migrations", start: -3300, end: -1000,
    routes: [[[48, 40], [48, 25], [50, 12], [52, 0]], [[48, 40], [40, 35], [39, 35]], [[48, 40], [42, 60], [38, 68], [31, 74]], [[48, 40], [47, 70], [41, 85]]] },
  { id: "bantu", title: "Bantu expansion", wiki: "Bantu expansion", start: -3000, end: 500,
    routes: [[[5, 10], [-2, 22], [-3, 33], [-14, 33], [-26, 28]], [[-2, 22], [-12, 17], [-18, 20]]] },
  { id: "austronesian", title: "Austronesian expansion", wiki: "Austronesian peoples", start: -3000, end: -500,
    routes: [[[23.7, 121], [13, 122], [-2, 115], [-19, 47]], [[13, 122], [-4, 152]]] },
  { id: "indo-aryan", title: "Indo-Aryan migrations", wiki: "Indo-Aryan migrations", start: -2000, end: -1200,
    routes: [[[40, 65], [34, 70], [31, 74], [26, 82]]] },
  { id: "lapita", title: "Lapita expansion into Remote Oceania", wiki: "Lapita culture", start: -1600, end: -800,
    routes: [[[-4, 152], [-10, 162], [-18, 178], [-21, -175], [-14, -172]]] },
  { id: "sea-peoples", title: "Sea Peoples", wiki: "Sea Peoples", start: -1200, end: -1150,
    routes: [[[38, 25], [36, 30], [34, 36], [31, 32]]] },
  { id: "dorian", title: "Dorian migration", wiki: "Dorian invasion", start: -1100, end: -1000,
    routes: [[[40, 22], [38.5, 22], [37, 22.4]]] },
  { id: "polynesia", title: "Polynesian voyages", wiki: "Polynesians", start: -800, end: 1300,
    routes: [[[-14, -172], [-17.5, -149.5], [20, -156]], [[-17.5, -149.5], [-27, -109]], [[-17.5, -149.5], [-21, -160], [-41, 174]]] },
  { id: "phoenician", title: "Phoenician expansion", wiki: "Phoenicia", start: -900, end: -600,
    routes: [[[33.3, 35.2], [35, 33], [37, 15], [36.8, 10.3], [36.5, -6.3]]] },
  { id: "greek-colonisation", title: "Greek colonisation", wiki: "Greek colonisation", start: -750, end: -550,
    routes: [[[38, 25], [38, 16], [43.3, 5.4]], [[38, 25], [41, 29], [43, 35]]] },
  { id: "babylonian-captivity", title: "Babylonian captivity", wiki: "Babylonian captivity", start: -597, end: -538,
    routes: [[[31.8, 35.2], [34, 38], [32.5, 44.4]]] },
  { id: "yuezhi", title: "Yuezhi migration", wiki: "Yuezhi", start: -176, end: -130,
    routes: [[[40, 98], [43, 80], [37, 67]]] },
  { id: "migration-period", title: "Migration Period", wiki: "Migration Period", start: 375, end: 568,
    routes: [[[48, 70], [47, 40], [47, 19], [46, 2], [40, -4], [36.8, 10.3]]] },
  { id: "anglo-saxon", title: "Anglo-Saxon settlement of Britain", wiki: "Anglo-Saxon settlement of Britain", start: 450, end: 600,
    routes: [[[55, 9], [53, 3], [52, 0]]] },
  { id: "slavs", title: "Slavic expansion", wiki: "Early Slavs", start: 500, end: 700,
    routes: [[[51, 30], [47, 22], [43, 22]], [[51, 30], [54, 20]]] },
  { id: "turkic", title: "Turkic migrations", wiki: "Turkic migration", start: 500, end: 1100,
    routes: [[[50, 90], [42, 65], [39, 45], [39, 35]]] },
  { id: "hijra", title: "Hijra", wiki: "Hijrah", start: 622, end: 622,
    routes: [[[21.4, 39.8], [24.5, 39.6]]] },
  { id: "magyars", title: "Magyar migration", wiki: "Hungarian conquest of the Carpathian Basin", start: 830, end: 900,
    routes: [[[55, 60], [48, 40], [47, 19]]] },
  { id: "vikings", title: "Viking expansion", wiki: "Viking Age", start: 793, end: 1066,
    routes: [[[60, 10], [64.5, -20], [64, -51], [51.6, -55.5]], [[58, 18], [58, 30], [50.4, 30.5], [41, 29]], [[60, 10], [57, -4], [53, -6]]] },
  { id: "norse-america", title: "Norse settlement of North America", wiki: "Norse colonisation of North America", start: 985, end: 1020,
    routes: [[[64, -51], [60, -48], [51.6, -55.5]]] },
  { id: "european-colonisation", title: "European colonisation of the Americas", wiki: "European colonization of the Americas", start: 1492, end: 1900,
    routes: [[[40, -4], [28, -30], [18, -70], [19, -99]], [[51, 0], [45, -50], [42, -70]], [[38.7, -9.1], [0, -30], [-23, -43]]] },
  { id: "slave-trade", title: "Atlantic slave trade", wiki: "Atlantic slave trade", start: 1501, end: 1866,
    routes: [[[8, -1], [5, -30], [18, -70]], [[-8, 13], [-10, -15], [-12, -38]], [[6, 2], [20, -40], [33, -80]]] },
  { id: "indian-removal", title: "Trail of Tears", wiki: "Trail of Tears", start: 1830, end: 1850,
    routes: [[[34.5, -85], [36, -90], [35.5, -96]]] },
  { id: "great-trek", title: "Great Trek", wiki: "Great Trek", start: 1835, end: 1846,
    routes: [[[-33.9, 18.4], [-31, 26], [-29, 30]], [[-31, 26], [-26, 28]]] },
  { id: "irish-famine", title: "Irish emigration", wiki: "Irish diaspora", start: 1845, end: 1855,
    routes: [[[53, -8], [50, -35], [41, -74]]] },
  { id: "great-migration", title: "Great Migration (African American)", wiki: "Great Migration (African American)", start: 1916, end: 1970,
    routes: [[[33, -90], [41.9, -87.6]], [[33, -85], [40.7, -74]], [[32, -95], [34, -118]]] },
];

export function migrationsInBucket(b: Bucket, all: Migration[] = MIGRATIONS): Migration[] {
  return all.filter((m) => b.start < m.end + 1 && b.end > m.start);
}

export interface ArcSegment {
  migration: Migration;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

export function toArcs(list: Migration[]): ArcSegment[] {
  return list.flatMap((migration) =>
    migration.routes.flatMap((r) =>
      r.slice(1).map((p, i) => ({ migration, startLat: r[i][0], startLng: r[i][1], endLat: p[0], endLng: p[1] })),
    ),
  );
}


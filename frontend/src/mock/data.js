// Mock data layer for Hamburg Scanner (frontend-only demo).
// All apartment data is MOCKED. In a real deployment these come from the
// backend scanner that monitors Immomio / immo Hamburg listings.

export const APARTMENT_IMAGES = [
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92",
  "https://images.pexels.com/photos/6980724/pexels-photo-6980724.jpeg",
  "https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0",
];

export const HERO_IMAGE = "https://images.unsplash.com/photo-1551353471-1975b91e445b";
export const CITY_IMAGE = "https://images.pexels.com/photos/35059169/pexels-photo-35059169.jpeg";
export const BUILDING_IMAGE = "https://images.unsplash.com/photo-1756586903977-02a92bc10e36";

const DISTRICTS = [
  "Altona", "Eimsbüttel", "St. Pauli", "Winterhude", "Barmbek",
  "Wandsbek", "Harburg", "Ottensen", "Eppendorf", "HafenCity",
];

const STREETS = [
  "Reeperbahn", "Mönckebergstraße", "Osterstraße", "Grindelallee",
  "Mühlenkamp", "Fuhlsbüttler Straße", "Große Bergstraße", "Eppendorfer Weg",
];

const TITLES = [
  "Helle 2-Zimmer-Wohnung mit Balkon",
  "Moderne 3-Zimmer-Wohnung, Neubau",
  "Gemütliches Zimmer in WG",
  "Sanierte Altbauwohnung mit Stuck",
  "1-Zimmer-Apartment, zentral gelegen",
  "Familienfreundliche 4-Zimmer-Wohnung",
  "WG-Zimmer nahe Universität",
  "Ruhige Wohnung mit Einbauküche",
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

function makeApartment(i, minutesAgo) {
  const rooms = rand(1, 4);
  const area = rand(28, 110);
  const price = rand(480, 1850);
  const district = pick(DISTRICTS);
  const isWG = rooms === 1 && Math.random() > 0.5;
  return {
    id: `apt-${i}`,
    title: isWG ? "WG-Zimmer, möbliert" : pick(TITLES),
    price,
    warm_price: price + rand(90, 260),
    rooms,
    area,
    district,
    address: `${pick(STREETS)} ${rand(1, 180)}, 2${rand(0, 2)}${rand(100, 999)} Hamburg`,
    image_url: APARTMENT_IMAGES[i % APARTMENT_IMAGES.length],
    url: "https://www.immomio.com/",
    source: pick(["Immomio", "Immo Hamburg", "WG-Gesucht", "SAGA"]),
    wbs: Math.random() > 0.78,
    is_new: minutesAgo < 60,
    found_at: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
  };
}

let seed = 0;
export const NEW_APARTMENTS = Array.from({ length: 8 }, () =>
  makeApartment(seed++, rand(1, 55))
).sort((a, b) => new Date(b.found_at) - new Date(a.found_at));

export const HISTORY_APARTMENTS = Array.from({ length: 14 }, () =>
  makeApartment(seed++, rand(70, 5000))
).sort((a, b) => new Date(b.found_at) - new Date(a.found_at));

export const SCAN_STATUS = {
  is_running: true,
  last_scan: new Date(Date.now() - 42 * 1000).toISOString(),
  next_scan_in: 30,
  total_found_today: 37,
  sources_online: 4,
  sources_total: 4,
};

export const MOCK_STATS = {
  today: 37,
  week: 214,
  month: 892,
  avg_price: 1180,
  by_day: [
    { label: "Пн", value: 28 },
    { label: "Вт", value: 41 },
    { label: "Ср", value: 33 },
    { label: "Чт", value: 52 },
    { label: "Пт", value: 47 },
    { label: "Сб", value: 19 },
    { label: "Нд", value: 37 },
  ],
  by_district: [
    { label: "Altona", value: 142 },
    { label: "Eimsbüttel", value: 118 },
    { label: "Barmbek", value: 97 },
    { label: "Wandsbek", value: 84 },
    { label: "Harburg", value: 63 },
    { label: "HafenCity", value: 41 },
  ],
  by_rooms: [
    { label: "1 Zi.", value: 210 },
    { label: "2 Zi.", value: 312 },
    { label: "3 Zi.", value: 248 },
    { label: "4+ Zi.", value: 122 },
  ],
};

export const MOCK_USERS = [
  { id: "u1", email: "admin@hamburg-scanner.com", role: "admin", access_active: true, created_at: "2025-05-01", subscription_until: "2026-12-31" },
  { id: "u2", email: "olena.k@gmail.com", role: "user", access_active: true, created_at: "2025-06-12", subscription_until: "2025-09-12" },
  { id: "u3", email: "dmytro.p@ukr.net", role: "user", access_active: true, created_at: "2025-06-20", subscription_until: "2025-08-20" },
  { id: "u4", email: "maria.sh@gmail.com", role: "user", access_active: false, created_at: "2025-04-02", subscription_until: "2025-07-02" },
];

// Demo credentials shown on login page.
export const DEMO_ACCOUNTS = {
  "admin@hamburg-scanner.com": { password: "admin123", role: "admin", access_active: true },
  "user@hamburg-scanner.com": { password: "user123", role: "user", access_active: true },
};

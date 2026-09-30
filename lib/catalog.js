import { getLocal, setLocal } from "./utils";

export const COLORS = [
  "from-blue-400 to-blue-500",
  "from-violet-400 to-violet-500",
  "from-orange-400 to-orange-500",
  "from-teal-400 to-teal-500",
  "from-amber-400 to-amber-500",
  "from-sky-400 to-sky-500",
];

/** Canonical seed catalog — used by public menu, booking wizard, and admin */
export const SEED_TESTS = [
  {
    id: 1,
    code: "CBC",
    name: "Full Blood Count",
    desc: "Red & white blood cells, hemoglobin, platelets, WBC differential",
    price: 120,
    time: "30 min",
    sample: "Blood",
    fasting: true,
    hours: "8–12 hrs",
    color: COLORS[0],
    active: true,
  },
  {
    id: 2,
    code: "MAL",
    name: "Malaria Test",
    desc: "Rapid diagnostic test for malaria parasites",
    price: 45,
    time: "15 min",
    sample: "Blood",
    fasting: false,
    color: COLORS[4],
    active: true,
  },
  {
    id: 3,
    code: "LFT",
    name: "Liver Function Test (LFT)",
    desc: "ALT, AST, ALP, Bilirubin, Total Protein, Albumin",
    price: 150,
    time: "45 min",
    sample: "Blood",
    fasting: true,
    hours: "8–10 hrs",
    color: COLORS[5],
    active: true,
  },
  {
    id: 4,
    code: "KFT",
    name: "Kidney Function Test (KFT)",
    desc: "Creatinine, Urea, Electrolytes, eGFR",
    price: 130,
    time: "45 min",
    sample: "Blood",
    fasting: true,
    hours: "8–10 hrs",
    color: COLORS[1],
    active: true,
  },
  {
    id: 5,
    code: "DIAB",
    name: "Diabetes Panel",
    desc: "Comprehensive diabetes screening — Fasting Glucose + HbA1c",
    price: 200,
    time: "40 min",
    sample: "Blood",
    fasting: true,
    hours: "8–12 hrs",
    popular: true,
    color: COLORS[3],
    active: true,
  },
  {
    id: 6,
    code: "LIPID",
    name: "Lipid Panel",
    desc: "Cholesterol & Triglycerides screening",
    price: 120,
    time: "45 min",
    sample: "Blood",
    fasting: true,
    hours: "9–12 hrs",
    color: COLORS[1],
    active: true,
  },
];

export function getCatalog() {
  if (typeof window === "undefined") return SEED_TESTS;
  const saved = getLocal("adminCatalog", null);
  if (saved?.length) return saved;
  setLocal("adminCatalog", SEED_TESTS);
  syncPrices(SEED_TESTS);
  return SEED_TESTS;
}

export function getActiveCatalog() {
  return getCatalog().filter((t) => t.active !== false);
}

export function saveCatalog(list) {
  setLocal("adminCatalog", list);
  syncPrices(list);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("catalogUpdated"));
  }
}

function syncPrices(list) {
  const priceMap = {};
  list.forEach((t) => {
    priceMap[t.code] = t.price;
    priceMap[t.name] = t.price;
  });
  setLocal("testPrices", priceMap);
}

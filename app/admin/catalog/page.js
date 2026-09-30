"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Bell,
  Plus,
  ClipboardList,
  CheckCircle2,
  FolderOpen,
  Clock,
  TestTube2,
  X,
} from "lucide-react";
import { getLocal, setLocal } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

const COLORS = [
  "from-blue-400 to-blue-500",
  "from-violet-400 to-violet-500",
  "from-orange-400 to-orange-500",
  "from-teal-400 to-teal-500",
  "from-amber-400 to-amber-500",
  "from-sky-400 to-sky-500",
];

const SEED_TESTS = [
  { id: 1, code: "CBC", name: "Full Blood Count", desc: "Red & white blood cells, hemoglobin, platelets", price: 120, time: "30 min", sample: "Blood", color: COLORS[0], active: true, fasting: true, hours: "8-12 hrs" },
  { id: 2, code: "MAL", name: "Malaria Test", desc: "Rapid diagnostic test for malaria parasites", price: 45, time: "15 min", sample: "Blood", color: COLORS[4], active: true, fasting: false },
  { id: 3, code: "LFT", name: "Liver Function Test (LFT)", desc: "ALT, AST, ALP, Bilirubin, Total Protein", price: 150, time: "45 min", sample: "Blood", color: COLORS[5], active: true, fasting: true, hours: "8-10 hrs" },
  { id: 4, code: "KFT", name: "Kidney Function Test (KFT)", desc: "Creatinine, Urea, Electrolytes, eGFR", price: 130, time: "45 min", sample: "Blood", color: COLORS[1], active: true, fasting: true, hours: "8-10 hrs" },
  { id: 5, code: "DIAB", name: "Diabetes Panel", desc: "Fasting Glucose + HbA1c", price: 200, time: "40 min", sample: "Blood", color: COLORS[3], active: true, fasting: true, hours: "8-12 hrs", popular: true },
  { id: 6, code: "LIPID", name: "Lipid Panel", desc: "Cholesterol & Triglycerides", price: 120, time: "45 min", sample: "Blood", color: COLORS[1], active: true, fasting: true, hours: "9-12 hrs" },
];

const EMPTY = { code: "", name: "", price: "", time: "30 min", sample: "Blood", desc: "" };

export default function AdminCatalogPage() {
  const { showToast } = useToast();
  const [tests, setTests] = useState(SEED_TESTS);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    const saved = getLocal("adminCatalog", null);
    if (saved?.length) setTests(saved);
    else {
      setLocal("adminCatalog", SEED_TESTS);
      syncPrices(SEED_TESTS);
    }
  }, []);

  function syncPrices(list) {
    const priceMap = {};
    list.forEach((t) => {
      priceMap[t.code] = t.price;
      priceMap[t.name] = t.price;
    });
    setLocal("testPrices", priceMap);
  }

  function persist(list) {
    setTests(list);
    setLocal("adminCatalog", list);
    syncPrices(list);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("catalogUpdated"));
    }
  }

  const filtered = useMemo(() => {
    if (!q) return tests;
    const s = q.toLowerCase();
    return tests.filter(
      (t) =>
        t.code?.toLowerCase().includes(s) ||
        t.name?.toLowerCase().includes(s) ||
        t.sample?.toLowerCase().includes(s)
    );
  }, [tests, q]);

  function savePrice(id, price) {
    const updated = tests.map((t) =>
      t.id === id ? { ...t, price: Number(price) || 0 } : t
    );
    persist(updated);
    showToast("Price updated — live on test menu");
  }

  function addTest(e) {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      showToast("Code and name required", "error");
      return;
    }
    const next = {
      id: Date.now(),
      code: form.code.trim(),
      name: form.name.trim(),
      desc: form.desc.trim() || form.name.trim(),
      price: Number(form.price) || 0,
      time: form.time || "30 min",
      sample: form.sample || "Blood",
      color: COLORS[tests.length % COLORS.length],
      active: true,
      fasting: false,
    };
    persist([next, ...tests]);
    showToast(`${next.code} added — now on Tests & Book pages`);
    setShowModal(false);
    setForm(EMPTY);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Test Catalog</h1>
          <p className="text-sm text-slate-500">
            Add tests and set prices — clients see them on Tests & Book
          </p>
        </div>
        <button type="button" className="rounded-xl border border-slate-200 bg-white p-2.5 hidden sm:block">
          <Bell className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <ClipboardList className="h-5 w-5" />
            <span className="text-sm font-medium">Total Tests</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[#0F172A]">{tests.length}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Active Tests</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[#0F172A]">{tests.filter((t) => t.active !== false).length}</p>
        </div>
        <div className="rounded-2xl bg-violet-50 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2 text-violet-600">
            <FolderOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Sample types</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[#0F172A]">{new Set(tests.map((t) => t.sample)).size}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tests..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add Test
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <div key={t.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className={`h-1.5 bg-gradient-to-r ${t.color || COLORS[0]}`} />
            <div className="p-4 sm:p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="rounded-lg bg-slate-50 p-2 shrink-0">
                    <TestTube2 className="h-4 w-4 text-[#2563EB]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#0F172A] truncate">{t.code}</h3>
                    <p className="text-xs text-slate-500 truncate">{t.name}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 shrink-0">
                  Active
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <input
                  type="number"
                  value={t.price}
                  onChange={(e) => savePrice(t.id, e.target.value)}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-lg font-bold text-[#2563EB] outline-none focus:border-[#2563EB]"
                />
                <span className="text-sm font-semibold text-[#2563EB]">GHC</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {t.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <TestTube2 className="h-3.5 w-3.5" /> {t.sample}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form onSubmit={addTest} className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Add New Test</h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Test Code *</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="e.g. KFT" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Full Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="e.g. Kidney Function Test" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Description</label>
                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Shown on Tests page" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Price (GHC)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="130" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Turnaround</label>
                  <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="45 min" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Sample Type</label>
                  <select value={form.sample} onChange={(e) => setForm({ ...form, sample: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm">
                    <option>Blood</option>
                    <option>Urine</option>
                    <option>Nasopharyngeal Swab</option>
                    <option>Stool</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">Add Test</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

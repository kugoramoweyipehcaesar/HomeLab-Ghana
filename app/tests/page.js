"use client";

import { useState, useEffect } from "react";
import TestCard from "@/components/TestCard";
import { Search, Shield } from "lucide-react";
import { getLocal, setLocal } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

const DEFAULT_TESTS = [
  { id: 1, name: "Full Blood Count", desc: "Red & white blood cells, hemoglobin, platelets, WBC differential", price: 120, fasting: true, hours: "8–12 hrs" },
  { id: 2, name: "Malaria Test", desc: "Rapid diagnostic test for malaria parasites", price: 45, fasting: false },
  { id: 3, name: "Liver Function Test (LFT)", desc: "ALT, AST, ALP, Bilirubin, Total Protein, Albumin", price: 150, fasting: true, hours: "8–10 hrs" },
  { id: 4, name: "Kidney Function Test (KFT)", desc: "Creatinine, Urea, Electrolytes, eGFR", price: 130, fasting: true, hours: "8–10 hrs" },
  { id: 5, name: "Diabetes Panel", desc: "Comprehensive diabetes screening — Fasting Glucose + HbA1c", price: 200, fasting: true, hours: "8–12 hrs", popular: true },
];

export default function TestsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [prices, setPrices] = useState({});
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setCart(getLocal("cart", []));
    const saved = getLocal("testPrices", {});
    setPrices(saved);
    if (!localStorage.getItem("testPrices")) {
      const defaults = {
        "Full Blood Count": 120, "Malaria Test": 45,
        "Liver Function Test (LFT)": 150, "Kidney Function Test (KFT)": 130,
        "Diabetes Panel": 200, CBC: 50, "Lipid Panel": 80,
        "COVID-19 PCR": 120, HbA1c: 60,
      };
      setLocal("testPrices", defaults);
      setPrices(defaults);
    }
  }, []);

  const tests = DEFAULT_TESTS.map((t) => ({ ...t, price: prices[t.name] || t.price }));
  const filtered = tests.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    if (filter === "Routine Tests") return matchSearch && !t.popular;
    if (filter === "Wellness Packages") return matchSearch && t.popular;
    return matchSearch;
  });

  const toggleCart = (test) => {
    let newCart;
    if (cart.find((c) => c.id === test.id)) {
      newCart = cart.filter((c) => c.id !== test.id);
      showToast(`${test.name} removed from cart`);
    } else {
      newCart = [...cart, test];
      showToast(`${test.name} added to cart`);
    }
    setCart(newCart);
    setLocal("cart", newCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="bg-[#f0f7ff] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1931]">Lab Test Menu</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Browse and book lab tests & wellness packages across Ghana • Fast results • Certified laboratories • Doorstep sample collection
            </p>
          </div>
          <div className="bg-[#0E9F9A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shrink-0">
            <Shield size={16} /> Ghana Health Service • Certified
            <span className="text-teal-100 text-xs font-normal ml-1">Safe • Reliable • 24-48hr results</span>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tests, panels, or health concerns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] bg-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Routine Tests", "Wellness Packages"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-[#0D6EFD] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((test) =>
            test.popular ? (
              <div key={test.id} className="bg-gradient-to-br from-[#0E9F9A] to-teal-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-white/20 text-xs px-2 py-0.5 rounded-full font-medium">⭐ Popular</div>
                <p className="text-teal-100 text-xs font-medium mb-1">Wellness Package</p>
                <h3 className="font-bold text-xl">{test.name}</h3>
                <p className="text-sm text-teal-50 mt-1 mb-3 opacity-90">{test.desc}</p>
                <div className="flex items-center gap-3 text-xs text-teal-100 mb-4">
                  <span>Fasting Required • 8–12 hrs</span>
                  <span>Venous Blood Sample</span>
                  <span>Results in 24–48 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">GH₵ {test.price}</span>
                  <button
                    onClick={() => toggleCart(test)}
                    className="bg-white text-[#0E9F9A] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-50 transition"
                  >
                    {cart.find((c) => c.id === test.id) ? "✓ In Cart" : "+ Add to Cart"}
                  </button>
                </div>
              </div>
            ) : (
              <TestCard
                key={test.id}
                test={test}
                isSelected={!!cart.find((c) => c.id === test.id)}
                onToggle={toggleCart}
              />
            )
          )}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-16">No tests match your search.</p>
        )}
      </div>
    </div>
  );
}
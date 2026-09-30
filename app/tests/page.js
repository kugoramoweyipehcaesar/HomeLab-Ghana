"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TestCard from "@/components/TestCard";
import { Search, Shield, ShoppingCart } from "lucide-react";
import { getLocal, setLocal } from "@/lib/utils";
import { getActiveCatalog } from "@/lib/catalog";
import { useToast } from "@/components/ToastProvider";

export default function TestsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState("All");

  const load = () => {
    setCart(getLocal("cart", []));
    setTests(getActiveCatalog());
  };

  useEffect(() => {
    load();
    window.addEventListener("catalogUpdated", load);
    window.addEventListener("cartUpdated", load);
    return () => {
      window.removeEventListener("catalogUpdated", load);
      window.removeEventListener("cartUpdated", load);
    };
  }, []);

  const filtered = tests.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.name?.toLowerCase().includes(q) ||
      t.desc?.toLowerCase().includes(q) ||
      t.code?.toLowerCase().includes(q);
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
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1931]">Lab Test Menu</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Browse and book lab tests across Ghana • Fast results • Doorstep collection
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="bg-[#0E9F9A] text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
              <Shield size={16} /> Ghana Health Service Certified
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => router.push("/book-test")}
                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
              >
                <ShoppingCart size={16} /> Book ({cart.length})
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tests, panels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] bg-white text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["All", "Routine Tests", "Wellness Packages"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
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

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="font-medium">No tests match your search</p>
            <p className="text-sm mt-1">Try a different keyword or clear filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                isSelected={!!cart.find((c) => c.id === test.id)}
                onToggle={toggleCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

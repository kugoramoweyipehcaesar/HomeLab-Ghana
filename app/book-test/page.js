"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocal, setLocal } from "@/lib/utils";
import { getActiveCatalog } from "@/lib/catalog";
import { useToast } from "@/components/ToastProvider";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const STEPS = ["Select Tests", "Date & Time", "Address", "Payment"];

export default function BookTestPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("Accra");
  const [momo, setMomo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const catalog = getActiveCatalog();
    setAllTests(catalog);
    const cart = getLocal("cart", []);
    if (cart.length) {
      const byId = new Map(catalog.map((t) => [t.id, t]));
      const merged = cart.map((c) => byId.get(c.id) || c).filter(Boolean);
      setSelected(merged.length ? merged : cart);
    }
  }, []);

  const total = selected.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const commitment = 20;

  const toggle = (test) => {
    const next = selected.find((s) => s.id === test.id)
      ? selected.filter((s) => s.id !== test.id)
      : [...selected, test];
    setSelected(next);
    setLocal("cart", next);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const canNext = () => {
    if (step === 0) return selected.length > 0;
    if (step === 1) return !!date && !!time;
    if (step === 2) return !!address.trim();
    if (step === 3) return !!momo.trim();
    return true;
  };

  const confirm = () => {
    if (!canNext()) {
      showToast("Please complete all fields", "error");
      return;
    }
    const currentUser = getLocal("currentUser", {}) || {};
    const booking = {
      id: Date.now(),
      tests: selected.map((t) => t.name),
      testIds: selected.map((t) => t.id),
      date,
      time,
      address: address.trim(),
      region,
      momo: momo.trim(),
      notes: notes.trim(),
      total: total + commitment,
      subtotal: total,
      commitment,
      status: "Pending",
      createdAt: new Date().toISOString(),
      userEmail: currentUser.email || "",
      userPhone: currentUser.phone || "",
      clientName: currentUser.fullName || "Guest",
    };
    const bookings = getLocal("bookings", []);
    bookings.unshift(booking);
    setLocal("bookings", bookings);
    setLocal("cart", []);
    window.dispatchEvent(new Event("cartUpdated"));
    showToast("Booking confirmed! We will contact you soon.");
    router.push(currentUser.email || currentUser.phone ? "/dashboard" : "/login");
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-navy mb-2">Book a Lab Test</h1>
      <p className="text-sm text-gray-500 mb-6">Home sample collection across Accra, Kumasi and Tema</p>

      <div className="flex mb-8 gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 text-center min-w-0">
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? <Check size={16} /> : i + 1}
            </div>
            <p className="text-[10px] sm:text-xs mt-1 truncate">{s}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6">
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-2">Select one or more tests</p>
            {allTests.map((t) => {
              const on = !!selected.find((s) => s.id === t.id);
              return (
                <label
                  key={t.id}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${
                    on ? "border-[#0D6EFD] bg-blue-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  <input type="checkbox" checked={on} onChange={() => toggle(t)} className="w-4 h-4 accent-[#0D6EFD]" />
                  <span className="flex-grow text-sm sm:text-base font-medium text-[#0A1931]">{t.name}</span>
                  <span className="font-semibold text-[#0D6EFD] text-sm whitespace-nowrap">GH₵ {t.price}</span>
                </label>
              );
            })}
            {selected.length > 0 && (
              <p className="text-sm font-medium text-gray-700 pt-2 border-t">
                {selected.length} selected · Subtotal GH₵ {total}
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Preferred Date</label>
              <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0D6EFD] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Preferred Time</label>
              <select value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0D6EFD] outline-none">
                <option value="">Select time</option>
                {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Home / Office Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street, landmark"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0D6EFD] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">City / Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0D6EFD] outline-none">
                {["Accra","Kumasi","Tema","Cape Coast","Takoradi","Other"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder="Gate code, preferred entrance..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0D6EFD] outline-none resize-none" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#E8F0FE] p-4 text-sm">
              <p className="font-semibold text-[#0A1931] mb-2">Order summary</p>
              <ul className="space-y-1 text-gray-600">
                {selected.map((t) => (
                  <li key={t.id} className="flex justify-between gap-2">
                    <span className="truncate">{t.name}</span>
                    <span className="shrink-0">GH₵ {t.price}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-blue-100 pt-2 mt-2">
                  <span>Home visit commitment</span>
                  <span>GH₵ {commitment}</span>
                </li>
                <li className="flex justify-between font-bold text-[#0A1931] pt-1">
                  <span>Total</span>
                  <span className="text-[#0D6EFD]">GH₵ {total + commitment}</span>
                </li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">MoMo / Phone for payment</label>
              <input type="tel" value={momo} onChange={(e) => setMomo(e.target.value)}
                placeholder="+233 24 000 0000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0D6EFD] outline-none" />
              <p className="text-xs text-gray-500 mt-1.5">
                Pay commitment via MTN / Vodafone / AirtelTigo MoMo. Balance at collection.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)}
            className="btn-outline px-4 py-3 text-sm flex items-center gap-1">
            <ChevronLeft size={18} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}
            className="btn-primary flex-1 px-4 py-3 text-sm flex items-center justify-center gap-1 disabled:opacity-50">
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" disabled={!canNext()} onClick={confirm}
            className="btn-primary flex-1 px-4 py-3 text-sm disabled:opacity-50">
            Confirm Booking · GH₵ {total + commitment}
          </button>
        )}
      </div>
    </div>
  );
}

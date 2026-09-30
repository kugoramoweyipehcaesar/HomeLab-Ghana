"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocal, setLocal } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

const STEPS = ["Select Tests", "Date & Time", "Address", "Payment"];

export default function BookTestPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("Accra");
  const [momo, setMomo] = useState("");
  const [prices, setPrices] = useState({});

  useEffect(() => {
    setSelected(getLocal("cart", []));
    setPrices(getLocal("testPrices", {}));
  }, []);

  const total = selected.reduce((sum, t) => sum + (prices[t.name] || t.price || 0), 0);
  const commitment = 20;

  const toggle = (test) => {
    if (selected.find((s) => s.id === test.id)) {
      setSelected(selected.filter((s) => s.id !== test.id));
    } else {
      setSelected([...selected, test]);
    }
  };

  const confirm = () => {
    if (!selected.length || !date || !time || !address || !momo) {
      showToast("Please complete all fields", "error");
      return;
    }
    const currentUser = getLocal("currentUser", {});
    const booking = {
      id: Date.now(),
      tests: selected.map((t) => t.name),
      date,
      time,
      address,
      region,
      momo,
      total: total + commitment,
      status: "Pending",
      createdAt: new Date().toLocaleDateString(),
      userEmail: currentUser.email,
      userPhone: currentUser.phone,
      clientName: currentUser.fullName || "Guest",
    };
    const bookings = getLocal("bookings", []);
    bookings.unshift(booking);
    setLocal("bookings", bookings);
    setLocal("cart", []);
    window.dispatchEvent(new Event("cartUpdated"));
    showToast("Booking Confirmed!");
    router.push("/dashboard");
  };

  const allTests = [
    { id: 1, name: "Full Blood Count", price: 120 },
    { id: 2, name: "Malaria Test", price: 45 },
    { id: 3, name: "Liver Function Test (LFT)", price: 150 },
    { id: 4, name: "Kidney Function Test (KFT)", price: 130 },
    { id: 5, name: "Diabetes Panel", price: 200 },
  ].map((t) => ({ ...t, price: prices[t.name] || t.price }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-navy mb-6">Book a Lab Test</h1>

      <div className="flex mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                i <= step ? "bg-primary text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </div>
            <p className="text-xs mt-1">{s}</p>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          {allTests.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={!!selected.find((s) => s.id === t.id)}
                onChange={() => toggle(t)}
              />
              <span className="flex-grow">{t.name}</span>
              <span className="font-medium">GH₵ {t.price}</span>
            </label>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select time</option>
              <option>08:00 AM</option>
              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>02:00 PM</option>
              <option>03:00 PM</option>
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Home Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House number, street, landmark"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option>Accra</option>
              <option>Tema</option>
              <option>Kumasi</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Money Number</label>
            <input
              type="tel"
              value={momo}
              onChange={(e) => setMomo(e.target.value)}
              placeholder="+233 24 000 0000"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm">Tests total: <strong>GH₵ {total}</strong></p>
            <p className="text-sm">Commitment fee: <strong>GH₵ {commitment}</strong></p>
            <p className="text-lg font-bold mt-2">Pay now: GH₵ {commitment}</p>
            <p className="text-xs text-gray-500 mt-1">Remaining balance collected after sample collection</p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="px-5 py-2 border rounded-lg">
            Back
          </button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && !selected.length}
            className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button onClick={confirm} className="bg-primary text-white px-6 py-2 rounded-lg">
            Confirm & Pay GH₵ {commitment}
          </button>
        )}
      </div>
    </div>
  );
}
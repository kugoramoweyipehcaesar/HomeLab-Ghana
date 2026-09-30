"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { setLocal } from "@/lib/utils";

const RESET_KEYS = [
  "bookings",
  "homelab_bookings",
  "homelab_clients",
  "adminStaff",
  "homelab_staff",
  "homelab_roles",
  "homelab_results",
  "homelab_payments",
  "homelab_payment_methods",
  "adminCatalog",
  "testPrices",
  "cart",
  "adminSettings",
  "paymentOptions",
];

export default function AdminMaintenancePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  function resetAll() {
    if (confirmText !== "RESET") {
      showToast("Type RESET to confirm", "error");
      return;
    }
    if (
      !window.confirm(
        "This will erase bookings, clients, staff, tests catalog data, results, payments, and cart in this browser. Continue?"
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      RESET_KEYS.forEach((k) => localStorage.removeItem(k));
      setLocal("bookings", []);
      setLocal("homelab_bookings", []);
      setLocal("homelab_clients", []);
      setLocal("homelab_staff", []);
      setLocal("adminStaff", []);
      setLocal("homelab_results", []);
      setLocal("homelab_payments", []);
      setLocal("cart", []);
      window.dispatchEvent(new Event("catalogUpdated"));
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new CustomEvent("homelab-data-changed", { detail: { key: "reset" } }));
      showToast("All website data reset successfully");
      setConfirmText("");
      setTimeout(() => router.push("/admin"), 800);
    } catch {
      showToast("Reset failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Maintenance</h1>
        <p className="text-sm text-slate-500">
          System tools — reset site data stored in this browser
        </p>
      </div>

      <div className="max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-red-50 p-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Reset everything</h2>
            <p className="mt-1 text-sm text-slate-600">
              Clears bookings, clients, staff, test catalog (local), results, payments, payment
              methods, cart, and related settings stored in this browser.
            </p>
          </div>
        </div>

        <ul className="mb-4 list-inside list-disc space-y-1 text-xs text-slate-500">
          <li>Bookings & public bookings</li>
          <li>Clients</li>
          <li>Staff & roles</li>
          <li>Catalog / test prices</li>
          <li>Results uploads</li>
          <li>Payments & payment methods</li>
          <li>Cart</li>
        </ul>

        <label className="mb-1 block text-xs font-medium text-slate-700">
          Type <span className="font-bold text-red-600">RESET</span> to confirm
        </label>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400"
          placeholder="RESET"
        />

        <button
          type="button"
          disabled={busy || confirmText !== "RESET"}
          onClick={resetAll}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {busy ? "Resetting…" : "Reset all website data"}
        </button>
      </div>
    </div>
  );
}

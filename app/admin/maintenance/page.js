"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { setLocal } from "@/lib/utils";
import { KEYS } from "@/lib/store";

/** Every localStorage key used across admin + public site */
const ALL_DATA_KEYS = [
  KEYS.bookings,
  KEYS.bookingsAlt,
  KEYS.clients,
  KEYS.results,
  KEYS.payments,
  KEYS.paymentMethods,
  "homelab_staff",
  "adminStaff",
  "homelab_roles",
  "adminCatalog",
  "testPrices",
  "cart",
  "adminSettings",
  "paymentOptions",
  "admin_notifications",
];

const SECTIONS = [
  {
    id: "bookings",
    label: "Bookings & public bookings",
    keys: [KEYS.bookings, KEYS.bookingsAlt, "bookings", "homelab_bookings"],
    empty: { [KEYS.bookings]: [], [KEYS.bookingsAlt]: [] },
  },
  {
    id: "clients",
    label: "Clients",
    keys: [KEYS.clients, "homelab_clients"],
    empty: { [KEYS.clients]: [] },
  },
  {
    id: "staff",
    label: "Staff & roles",
    keys: ["homelab_staff", "adminStaff", "homelab_roles"],
    empty: {
      homelab_staff: [],
      adminStaff: [],
      homelab_roles: ["Super Admin", "Admin", "Doctor", "Nurse", "Lab Scientist"],
    },
  },
  {
    id: "catalog",
    label: "Catalog / test prices",
    keys: ["adminCatalog", "testPrices"],
    empty: {},
  },
  {
    id: "results",
    label: "Results uploads",
    keys: [KEYS.results, "homelab_results"],
    empty: { [KEYS.results]: [] },
  },
  {
    id: "payments",
    label: "Payments & payment methods",
    keys: [KEYS.payments, KEYS.paymentMethods, "homelab_payments", "homelab_payment_methods", "paymentOptions"],
    empty: {
      [KEYS.payments]: [],
      [KEYS.paymentMethods]: null,
      paymentOptions: {},
    },
  },
  {
    id: "cart",
    label: "Cart",
    keys: ["cart"],
    empty: { cart: [] },
  },
];

function broadcastSiteWide(sectionId) {
  if (typeof window === "undefined") return;
  const events = [
    "bookingsUpdated",
    "catalogUpdated",
    "homelab:adminCatalog",
    "homelab:homelab_payment_methods",
    "homelab:homelab_bookings",
    "homelab:bookings",
    "homelab:homelab_clients",
    "homelab:homelab_results",
    "homelab:homelab_payments",
    "homelab:homelab_staff",
    "storage",
  ];
  events.forEach((n) => {
    try {
      window.dispatchEvent(new Event(n));
    } catch {
      /* ignore */
    }
  });
  window.dispatchEvent(
    new CustomEvent("homelab-data-changed", {
      detail: { key: sectionId || "reset", source: "maintenance" },
    })
  );
  // Force same-tab listeners that only watch storage via a synthetic storage event
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: sectionId || "homelab_reset",
        newValue: null,
        storageArea: localStorage,
      })
    );
  } catch {
    /* ignore */
  }
}

function resetSection(section) {
  const keys = [...new Set(section.keys || [])];
  keys.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
  Object.entries(section.empty || {}).forEach(([k, v]) => {
    if (v === null) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    } else {
      setLocal(k, v);
    }
  });
  broadcastSiteWide(section.id);
}

export default function AdminMaintenancePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [resettingId, setResettingId] = useState(null);

  function handleSectionReset(section) {
    if (!window.confirm(`Reset “${section.label}” only? This updates the whole site for this browser.`)) {
      return;
    }
    setResettingId(section.id);
    try {
      resetSection(section);
      showToast(`Reset: ${section.label} — site updated`);
    } catch {
      showToast("Reset failed", "error");
    } finally {
      setResettingId(null);
    }
  }

  function resetAll() {
    if (confirmText !== "RESET") {
      showToast("Type RESET to confirm", "error");
      return;
    }
    if (!window.confirm("Erase ALL listed data site-wide in this browser?")) return;
    setBusy(true);
    try {
      SECTIONS.forEach((s) => resetSection(s));
      ALL_DATA_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      });
      // Re-seed empty structures so pages don't crash
      setLocal(KEYS.bookings, []);
      setLocal(KEYS.bookingsAlt, []);
      setLocal(KEYS.clients, []);
      setLocal(KEYS.results, []);
      setLocal(KEYS.payments, []);
      setLocal("cart", []);
      setLocal("homelab_staff", []);
      setLocal("adminStaff", []);
      broadcastSiteWide("all");
      showToast("All website data reset — site updated");
      setConfirmText("");
      setTimeout(() => router.push("/admin"), 600);
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
          Each reset clears data for the whole site (admin + public) in this browser
        </p>
      </div>

      <div className="mb-8 max-w-xl rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-[#0F172A]">Reset by section</h2>
        <p className="mb-4 text-xs text-slate-500">
          Wired to localStorage keys used by Bookings, Clients, Staff, Catalog, Results, Payments, and
          public booking/cart pages.
        </p>
        <ul className="divide-y divide-slate-100">
          {SECTIONS.map((section) => (
            <li key={section.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="text-sm font-medium text-[#0F172A]">{section.label}</span>
              <button
                type="button"
                disabled={resettingId === section.id}
                onClick={() => handleSectionReset(section)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {resettingId === section.id ? "Resetting…" : "Reset"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-red-50 p-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Reset everything</h2>
            <p className="mt-1 text-sm text-slate-600">
              Clears all sections above and related keys across the website.
            </p>
          </div>
        </div>

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

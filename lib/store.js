import { getLocal, setLocal } from "./utils";

/** Canonical localStorage keys used across admin + public site */
export const KEYS = {
  bookings: "bookings",
  bookingsAlt: "homelab_bookings",
  clients: "homelab_clients",
  results: "homelab_results",
  payments: "homelab_payments",
  paymentMethods: "homelab_payment_methods",
  catalog: "adminCatalog",
  cart: "cart",
};

/** Merge bookings from both legacy keys (public used `bookings`, admin used `homelab_bookings`) */
export function getAllBookings() {
  const a = getLocal(KEYS.bookings, []) || [];
  const b = getLocal(KEYS.bookingsAlt, []) || [];
  const map = new Map();
  [...b, ...a].forEach((item) => {
    if (item?.id != null) map.set(item.id, item);
  });
  // newest first
  return Array.from(map.values()).sort((x, y) => {
    const tx = new Date(x.createdAt || x.date || 0).getTime();
    const ty = new Date(y.createdAt || y.date || 0).getTime();
    return ty - tx;
  });
}

/** Persist bookings to BOTH keys so admin + public stay in sync */
export function saveBookings(list) {
  setLocal(KEYS.bookings, list);
  setLocal(KEYS.bookingsAlt, list);
  syncClientsFromBookings(list);
  syncPaymentsFromBookings(list);
  syncResultsFromBookings(list);
}

function initials(name) {
  return (name || "G")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-orange-500", "bg-violet-500", "bg-cyan-500"];

/** When bookings change, keep clients list up to date */
export function syncClientsFromBookings(bookings) {
  const existing = getLocal(KEYS.clients, []) || [];
  const byName = new Map(existing.map((c) => [c.name?.toLowerCase(), c]));

  bookings.forEach((b) => {
    const name = b.clientName || b.client || "Guest";
    const key = name.toLowerCase();
    const prev = byName.get(key);
    const tests = Array.isArray(b.tests) ? b.tests : b.tests ? [b.tests] : [];
    const historyItem = {
      test: tests.join(", ") || "Lab test",
      date: b.date || "—",
      status: b.status || "Pending",
    };

    if (prev) {
      byName.set(key, {
        ...prev,
        phone: b.phone || b.userPhone || prev.phone,
        email: b.email || b.userEmail || prev.email,
        address: b.address || prev.address,
        location: b.region || b.location || prev.location,
        bookings: (prev.bookings || 0) + (prev._seenBookingIds?.includes(b.id) ? 0 : 1),
        lastVisit: b.date || prev.lastVisit,
        history: prev._seenBookingIds?.includes(b.id)
          ? prev.history
          : [historyItem, ...(prev.history || [])].slice(0, 20),
        _seenBookingIds: [...new Set([...(prev._seenBookingIds || []), b.id])],
      });
    } else {
      byName.set(key, {
        id: Date.now() + Math.random(),
        name,
        email: b.email || b.userEmail || "",
        phone: b.phone || b.userPhone || "",
        address: b.address || "",
        location: b.region || "Accra",
        bookings: 1,
        lastVisit: b.date || "—",
        avatar: initials(name),
        color: COLORS[byName.size % COLORS.length],
        status: "Active",
        totalSpent: Number(b.total) || 0,
        history: [historyItem],
        _seenBookingIds: [b.id],
      });
    }
  });

  const next = Array.from(byName.values());
  setLocal(KEYS.clients, next);
}

/** Mirror unpaid/paid rows into payments from bookings */
export function syncPaymentsFromBookings(bookings) {
  const existing = getLocal(KEYS.payments, []) || [];
  const byId = new Map(existing.map((t) => [t.bookingId || t.id, t]));

  bookings.forEach((b) => {
    const id = b.id;
    const amount = Number(b.total) || 0;
    if (!amount) return;
    const status =
      b.paymentStatus === "Paid" || b.status === "Completed"
        ? "Paid"
        : "Unpaid";
    const prev = byId.get(id);
    byId.set(id, {
      id: prev?.id || id,
      bookingId: id,
      client: b.clientName || b.client || "Guest",
      test: Array.isArray(b.tests) ? b.tests.join(", ") : b.tests || "Lab test",
      amount: amount || prev?.amount || 0,
      status: prev?.status === "Paid" ? "Paid" : status,
      date: b.date || prev?.date || new Date().toISOString().slice(0, 10),
      method: b.method || b.momo ? "MTN MoMo" : prev?.method || "MTN MoMo",
    });
  });

  setLocal(KEYS.payments, Array.from(byId.values()));
}

/** Ensure each booking test has a results row */
export function syncResultsFromBookings(bookings) {
  const existing = getLocal(KEYS.results, []) || [];
  const keys = new Set(existing.map((r) => `${r.client}|${r.test}|${r.date}`));
  const next = [...existing];

  bookings.forEach((b) => {
    const client = b.clientName || b.client || "Guest";
    const date = b.date || "—";
    const tests = Array.isArray(b.tests) ? b.tests : b.tests ? [b.tests] : [];
    tests.forEach((test) => {
      const k = `${client}|${test}|${date}`;
      if (keys.has(k)) return;
      keys.add(k);
      next.push({
        id: Date.now() + Math.random(),
        client,
        test,
        date,
        status: "pending_upload",
        file: null,
        notes: "",
        uploadedBy: null,
        uploadDate: null,
        lastUpdated: null,
        approvedBy: null,
        approvedAt: null,
        rejectReason: null,
        bookingId: b.id,
      });
    });
  });

  if (next.length !== existing.length) {
    setLocal(KEYS.results, next);
  }
}

export function getPaymentMethods() {
  return getLocal(KEYS.paymentMethods, null);
}

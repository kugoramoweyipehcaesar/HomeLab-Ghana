"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Search, Plus, Calendar, Clock, CheckCircle2, FlaskConical, Download,
  Edit2, Eye, MoreHorizontal, X, Phone, MapPin, Mail, Trash2, Check,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getAllBookings, saveBookings } from "@/lib/store";
import { getActiveCatalog } from "@/lib/catalog";

const FALLBACK_TESTS = [
  { name: "PCR Test", price: 250 }, { name: "Blood Panel", price: 150 },
  { name: "COVID Test", price: 200 }, { name: "Full Blood Count", price: 120 },
  { name: "Malaria Test", price: 45 }, { name: "Lipid Panel", price: 120 },
  { name: "HbA1c", price: 90 }, { name: "Liver Function Test", price: 150 },
];
const REGIONS = ["Accra", "Kumasi", "Tema", "Cape Coast", "Tamale"];
const STATUSES = ["Pending", "Awaiting Sample", "Confirmed", "Completed"];
const STATUS_FLOW = [
  { key: "Pending", label: "Pending", desc: "Awaiting confirmation" },
  { key: "Awaiting Sample", label: "Awaiting Sample", desc: "Pending sample collection" },
  { key: "Confirmed", label: "Confirmed", desc: "Scheduled" },
  { key: "Completed", label: "Completed", desc: "Sample collected / Result ready" },
];
const INITIAL = [
  { id: 1, clientName: "Ama Boateng", phone: "+233 24 567 8901", email: "ama.boateng@email.com", address: "12 Spintex Road, Accra", region: "Accra", tests: ["PCR Test", "Blood Panel"], date: "2024-10-14", time: "09:30 AM", status: "Pending", notes: "", paymentStatus: "Unpaid", createdAt: "2024-10-13T08:00:00.000Z" },
  { id: 2, clientName: "Kwame Asamoah", phone: "+233 20 444 3321", email: "kwame.a@email.com", address: "45 Oxford St, Kumasi", region: "Kumasi", tests: ["COVID Test"], date: "2024-10-13", time: "11:00 AM", status: "Confirmed", notes: "", paymentStatus: "Paid", createdAt: "2024-10-12T10:00:00.000Z" },
  { id: 3, clientName: "Esi Mensah", phone: "+233 55 789 1123", email: "esi.mensah@email.com", address: "22 Ringway Rd, Tema", region: "Tema", tests: ["Full Blood Count"], date: "2024-10-13", time: "02:45 PM", status: "Awaiting Sample", notes: "", paymentStatus: "Partial", createdAt: "2024-10-12T14:00:00.000Z" },
  { id: 4, clientName: "John Opoku", phone: "+233 24 909 7745", email: "john.opoku@email.com", address: "9 Liberation Rd, Accra", region: "Accra", tests: ["Malaria Test"], date: "2024-10-12", time: "10:15 AM", status: "Confirmed", notes: "", paymentStatus: "Paid", createdAt: "2024-10-11T09:00:00.000Z" },
  { id: 5, clientName: "Fatima Alhassan", phone: "+233 50 332 6690", email: "fatima.a@email.com", address: "7 Dansoman Rd, Accra", region: "Accra", tests: ["Liver Function Test"], date: "2024-10-12", time: "08:30 AM", status: "Pending", notes: "", paymentStatus: "Unpaid", createdAt: "2024-10-11T07:00:00.000Z" },
];
const EMPTY = { clientName: "", phone: "", email: "", address: "", region: "Accra", tests: [], date: "", time: "09:30 AM", status: "Pending", notes: "", paymentStatus: "Unpaid" };
const AVATAR = ["bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-orange-500", "bg-violet-500"];

function initials(n) {
  return (n || "G").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
}
function testPrice(name, catalog) {
  const c = catalog.find((t) => t.name === name);
  if (c) return Number(c.price) || 0;
  return FALLBACK_TESTS.find((t) => t.name === name)?.price || 0;
}
function fmtDate(d) {
  if (!d) return "—";
  try {
    const x = new Date(d + "T12:00:00");
    if (Number.isNaN(x.getTime())) return d;
    return x.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}
function sameJson(a, b) {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
}

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [detailId, setDetailId] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const skipSave = useRef(true);

  useEffect(() => {
    const list = getAllBookings();
    if (list.length) setBookings(list);
    else {
      setBookings(INITIAL);
      try {
        if (!localStorage.getItem("bookings") && !localStorage.getItem("homelab_bookings")) {
          saveBookings(INITIAL);
        }
      } catch { /* ignore */ }
    }
    setCatalog(getActiveCatalog());
    setLoaded(true);
    skipSave.current = true;
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1") openNew();

    const refresh = () => {
      const n = getAllBookings();
      setBookings((prev) => (n.length && !sameJson(prev, n) ? n : prev));
      setCatalog(getActiveCatalog());
    };
    window.addEventListener("bookingsUpdated", refresh);
    window.addEventListener("catalogUpdated", () => setCatalog(getActiveCatalog()));
    return () => {
      window.removeEventListener("bookingsUpdated", refresh);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    saveBookings(bookings);
  }, [bookings, loaded]);

  useEffect(() => {
    if (menuId == null) return;
    const close = () => setMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuId]);

  const testOptions = catalog.length
    ? catalog.map((t) => ({ name: t.name, price: t.price }))
    : FALLBACK_TESTS;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const mq = !q || b.clientName?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q);
      const ms = statusFilter === "All" || b.status === statusFilter;
      return mq && ms;
    });
  }, [bookings, searchQuery, statusFilter]);

  const stats = useMemo(() => [
    { label: "Total Bookings", value: bookings.length, sub: "All appointments", icon: Calendar, tone: "text-blue-600 bg-blue-50" },
    { label: "Pending", value: bookings.filter((b) => b.status === "Pending").length, sub: "Awaiting confirmation", icon: Clock, tone: "text-amber-600 bg-amber-50" },
    { label: "Confirmed", value: bookings.filter((b) => b.status === "Confirmed").length, sub: "Scheduled", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Awaiting Sample", value: bookings.filter((b) => b.status === "Awaiting Sample").length, sub: "Pending sample", icon: FlaskConical, tone: "text-sky-600 bg-sky-50" },
  ], [bookings]);

  function statusClass(s) {
    if (s === "Confirmed") return "bg-emerald-100 text-emerald-700";
    if (s === "Pending") return "bg-amber-100 text-amber-700";
    if (s === "Awaiting Sample") return "bg-blue-100 text-blue-700";
    if (s === "Completed") return "bg-slate-200 text-slate-700";
    return "bg-slate-100 text-slate-600";
  }

  function openNew() {
    setEditingId(null);
    setForm({ ...EMPTY, date: new Date().toISOString().split("T")[0] });
    setShowForm(true);
  }
  function openEdit(b) {
    setEditingId(b.id);
    setForm({
      clientName: b.clientName || "", phone: b.phone || "", email: b.email || "",
      address: b.address || "", region: b.region || "Accra",
      tests: Array.isArray(b.tests) ? [...b.tests] : [], date: b.date || "",
      time: b.time || "09:30 AM", status: b.status || "Pending",
      notes: b.notes || "", paymentStatus: b.paymentStatus || "Unpaid",
    });
    setShowForm(true); setMenuId(null); setDetailId(null);
  }
  function toggleTest(name) {
    setForm((f) => ({ ...f, tests: f.tests.includes(name) ? f.tests.filter((t) => t !== name) : [...f.tests, name] }));
  }
  function submitForm(e) {
    e.preventDefault();
    if (!form.clientName.trim() || !form.phone.trim() || !form.address.trim() || !form.tests.length || !form.date) {
      showToast("Fill all required fields", "error"); return;
    }
    if (editingId != null) {
      setBookings((prev) => prev.map((b) => b.id === editingId ? {
        ...b, clientName: form.clientName.trim(), phone: form.phone.trim(), email: form.email.trim(),
        address: form.address.trim(), region: form.region, tests: form.tests, date: form.date,
        time: form.time, status: form.status, notes: form.notes.trim(), paymentStatus: form.paymentStatus,
      } : b));
      showToast("Booking updated");
    } else {
      const booking = {
        id: Date.now(), clientName: form.clientName.trim(), phone: form.phone.trim(), email: form.email.trim(),
        address: form.address.trim(), region: form.region, tests: form.tests, date: form.date, time: form.time,
        status: form.status || "Pending", notes: form.notes.trim(), paymentStatus: form.paymentStatus || "Unpaid",
        createdAt: new Date().toISOString(),
        total: form.tests.reduce((s, n) => s + testPrice(n, catalog), 0) + 20,
      };
      setBookings((prev) => [booking, ...prev]);
      showToast(`Booking added for ${booking.clientName}`);
    }
    setShowForm(false); setEditingId(null); setForm(EMPTY);
  }
  function changeStatus(id, status) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    showToast(`Status set to ${status}`); setMenuId(null);
  }
  function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    setBookings((prev) => prev.filter((b) => b.id !== id));
    showToast("Booking deleted"); setMenuId(null); setDetailId(null);
  }

  const detail = bookings.find((b) => b.id === detailId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Bookings Management</h1>
          <p className="text-sm text-slate-500">Manage appointments</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600">
          <Plus className="h-4 w-4" /> New Booking
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className={`rounded-lg p-2 ${s.tone}`}><s.icon className="h-4 w-4" /></div>
              <span className="text-sm text-slate-500">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{s.value}</p>
            <p className="mt-1 text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or location..." className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="All">Status: All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-3 font-medium">Client Name</th>
                <th className="pb-3 pr-3 font-medium">Address</th>
                <th className="pb-3 pr-3 font-medium">Tests</th>
                <th className="pb-3 pr-3 font-medium">Date</th>
                <th className="pb-3 pr-3 font-medium">Time</th>
                <th className="pb-3 pr-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5 pr-3">
                    <button type="button" onClick={() => setDetailId(b.id)} className="flex items-center gap-2.5 text-left hover:opacity-80">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${AVATAR[i % AVATAR.length]}`}>{initials(b.clientName)}</div>
                      <span className="font-medium text-[#2563EB] hover:underline">{b.clientName}</span>
                    </button>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-500">{b.address}</td>
                  <td className="py-3.5 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(b.tests) ? b.tests : [b.tests]).map((t) => (
                        <span key={String(t)} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-[#2563EB]">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600">{fmtDate(b.date)}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{b.time}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(b.status)}`}>● {b.status}</span>
                  </td>
                  <td className="py-3.5">
                    <div className="relative flex items-center gap-1 text-slate-400">
                      <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={() => openEdit(b)}><Edit2 className="h-4 w-4" /></button>
                      <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={() => setDetailId(b.id)}><Eye className="h-4 w-4" /></button>
                      <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={(e) => { e.stopPropagation(); setMenuId(menuId === b.id ? null : b.id); }}><MoreHorizontal className="h-4 w-4" /></button>
                      {menuId === b.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border bg-white py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
                          {STATUSES.map((s) => (
                            <button key={s} type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50" onClick={() => changeStatus(b.id, s)}>
                              {b.status === s ? <Check className="h-3 w-3 text-[#2563EB]" /> : <span className="w-3" />}{s}
                            </button>
                          ))}
                          <button type="button" className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => deleteBooking(b.id)}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400">Showing {filtered.length} of {bookings.length} bookings</p>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form onSubmit={submitForm} className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingId ? "Edit Booking" : "New Booking"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium">Client Name *</label><input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium">Phone *</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
                <div><label className="mb-1 block text-xs font-medium">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium">Address *</label><input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium">Region</label><select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm">{REGIONS.map((r) => <option key={r}>{r}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium">Date *</label><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
                <div><label className="mb-1 block text-xs font-medium">Time</label><input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Tests *</label>
                <div className="flex flex-wrap gap-2">
                  {testOptions.map((t) => (
                    <label key={t.name} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${form.tests.includes(t.name) ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-slate-200"}`}>
                      <input type="checkbox" className="sr-only" checked={form.tests.includes(t.name)} onChange={() => toggleTest(t.name)} />{t.name}
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="mb-1 block text-xs font-medium">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">Save</button>
            </div>
          </form>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setDetailId(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex justify-between"><h2 className="text-lg font-bold">{detail.clientName}</h2><button type="button" onClick={() => setDetailId(null)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{detail.phone}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{detail.email || "—"}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{detail.address}</p>
              <p>Status: {detail.status}</p>
              <p>Date: {fmtDate(detail.date)} · {detail.time}</p>
              <p>Tests: {(Array.isArray(detail.tests) ? detail.tests : []).join(", ")}</p>
            </div>
            <button type="button" onClick={() => openEdit(detail)} className="mt-6 w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}

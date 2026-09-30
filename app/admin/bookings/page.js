"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  FlaskConical,
  Download,
  Edit2,
  Eye,
  MoreHorizontal,
  X,
  Phone,
  MapPin,
  Mail,
  Trash2,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const STORAGE_KEY = "homelab_bookings";

const TEST_OPTIONS = [
  { name: "PCR Test", price: 250 },
  { name: "Blood Panel", price: 150 },
  { name: "COVID Test", price: 200 },
  { name: "Full Blood Count", price: 120 },
  { name: "Malaria Test", price: 45 },
  { name: "Lipid Panel", price: 120 },
  { name: "HbA1c", price: 90 },
  { name: "Liver Function Test", price: 150 },
];

const REGIONS = ["Accra", "Kumasi", "Tema", "Cape Coast", "Tamale"];

const STATUSES = ["Pending", "Awaiting Sample", "Confirmed", "Completed"];

const STATUS_FLOW = [
  { key: "Pending", label: "Pending", desc: "Awaiting confirmation" },
  { key: "Awaiting Sample", label: "Awaiting Sample", desc: "Pending sample collection" },
  { key: "Confirmed", label: "Confirmed", desc: "Scheduled" },
  { key: "Completed", label: "Completed", desc: "Sample collected / Result ready" },
];

const INITIAL_BOOKINGS = [
  {
    id: 1,
    clientName: "Ama Boateng",
    phone: "+233 24 567 8901",
    email: "ama.boateng@email.com",
    address: "12 Spintex Road, Accra",
    region: "Accra",
    tests: ["PCR Test", "Blood Panel"],
    date: "2024-10-14",
    time: "09:30 AM",
    status: "Pending",
    notes: "",
    paymentStatus: "Unpaid",
    createdAt: "2024-10-13T08:00:00.000Z",
  },
  {
    id: 2,
    clientName: "Kwame Asamoah",
    phone: "+233 20 444 3321",
    email: "kwame.a@email.com",
    address: "45 Oxford St, Kumasi",
    region: "Kumasi",
    tests: ["COVID Test"],
    date: "2024-10-13",
    time: "11:00 AM",
    status: "Confirmed",
    notes: "",
    paymentStatus: "Paid",
    createdAt: "2024-10-12T10:00:00.000Z",
  },
  {
    id: 3,
    clientName: "Esi Mensah",
    phone: "+233 55 789 1123",
    email: "esi.mensah@email.com",
    address: "22 Ringway Rd, Tema",
    region: "Tema",
    tests: ["Full Blood Count"],
    date: "2024-10-13",
    time: "02:45 PM",
    status: "Awaiting Sample",
    notes: "",
    paymentStatus: "Partial",
    createdAt: "2024-10-12T14:00:00.000Z",
  },
  {
    id: 4,
    clientName: "John Opoku",
    phone: "+233 24 909 7745",
    email: "john.opoku@email.com",
    address: "9 Liberation Rd, Accra",
    region: "Accra",
    tests: ["Malaria Test"],
    date: "2024-10-12",
    time: "10:15 AM",
    status: "Confirmed",
    notes: "",
    paymentStatus: "Paid",
    createdAt: "2024-10-11T09:00:00.000Z",
  },
  {
    id: 5,
    clientName: "Fatima Alhassan",
    phone: "+233 50 332 6690",
    email: "fatima.a@email.com",
    address: "7 Dansoman Rd, Accra",
    region: "Accra",
    tests: ["Liver Function Test"],
    date: "2024-10-12",
    time: "08:30 AM",
    status: "Pending",
    notes: "",
    paymentStatus: "Unpaid",
    createdAt: "2024-10-11T07:00:00.000Z",
  },
];

const EMPTY_FORM = {
  clientName: "",
  phone: "",
  email: "",
  address: "",
  region: "Accra",
  tests: [],
  date: "",
  time: "09:30 AM",
  status: "Pending",
  notes: "",
  paymentStatus: "Unpaid",
};

function initials(name) {
  return (name || "G")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function testPrice(name) {
  return TEST_OPTIONS.find((t) => t.name === name)?.price || 0;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + "T12:00:00");
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const AVATAR = ["bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-orange-500", "bg-violet-500"];

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [detailId, setDetailId] = useState(null);
  const [menuId, setMenuId] = useState(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setBookings(parsed);
      }
    } catch {
      /* keep initial */
    }
    setLoaded(true);
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1") {
      openNew();
    }
  }, []);

  // Persist
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      /* ignore */
    }
  }, [bookings, loaded]);

  // Close menu on outside click
  useEffect(() => {
    function close() {
      setMenuId(null);
    }
    if (menuId != null) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [menuId]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchQ =
        !q ||
        b.clientName?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q);
      const matchS = statusFilter === "All" || b.status === statusFilter;
      return matchQ && matchS;
    });
  }, [bookings, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
    const awaiting = bookings.filter((b) => b.status === "Awaiting Sample").length;
    return [
      { label: "Total Bookings", value: total, sub: "All appointments", icon: Calendar, tone: "text-blue-600 bg-blue-50" },
      { label: "Pending", value: pending, sub: "Awaiting confirmation", icon: Clock, tone: "text-amber-600 bg-amber-50" },
      { label: "Confirmed", value: confirmed, sub: "Scheduled", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
      { label: "Awaiting Sample", value: awaiting, sub: "Pending sample", icon: FlaskConical, tone: "text-sky-600 bg-sky-50" },
    ];
  }, [bookings]);

  function statusClass(s) {
    if (s === "Confirmed") return "bg-emerald-100 text-emerald-700";
    if (s === "Pending") return "bg-amber-100 text-amber-700";
    if (s === "Awaiting Sample") return "bg-blue-100 text-blue-700";
    if (s === "Completed") return "bg-slate-200 text-slate-700";
    return "bg-slate-100 text-slate-600";
  }

  function openNew() {
    const today = new Date().toISOString().split("T")[0];
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: today, status: "Pending" });
    setShowForm(true);
  }

  function openEdit(b) {
    setEditingId(b.id);
    setForm({
      clientName: b.clientName || "",
      phone: b.phone || "",
      email: b.email || "",
      address: b.address || "",
      region: b.region || "Accra",
      tests: Array.isArray(b.tests) ? [...b.tests] : [],
      date: b.date || "",
      time: b.time || "09:30 AM",
      status: b.status || "Pending",
      notes: b.notes || "",
      paymentStatus: b.paymentStatus || "Unpaid",
    });
    setShowForm(true);
    setMenuId(null);
    setDetailId(null);
  }

  function toggleTest(name) {
    setForm((f) => ({
      ...f,
      tests: f.tests.includes(name) ? f.tests.filter((t) => t !== name) : [...f.tests, name],
    }));
  }

  function submitForm(e) {
    e.preventDefault();
    if (!form.clientName.trim()) {
      showToast("Client name is required", "error");
      return;
    }
    if (!form.phone.trim()) {
      showToast("Phone number is required", "error");
      return;
    }
    if (!form.address.trim()) {
      showToast("Address is required", "error");
      return;
    }
    if (!form.tests.length) {
      showToast("Select at least one test", "error");
      return;
    }
    if (!form.date) {
      showToast("Date is required", "error");
      return;
    }

    if (editingId != null) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? {
                ...b,
                clientName: form.clientName.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim(),
                region: form.region,
                tests: form.tests,
                date: form.date,
                time: form.time,
                status: form.status,
                notes: form.notes.trim(),
                paymentStatus: form.paymentStatus,
              }
            : b
        )
      );
      showToast("Booking updated");
    } else {
      const booking = {
        id: Date.now(),
        clientName: form.clientName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        region: form.region,
        tests: form.tests,
        date: form.date,
        time: form.time,
        status: form.status || "Pending",
        notes: form.notes.trim(),
        paymentStatus: form.paymentStatus || "Unpaid",
        createdAt: new Date().toISOString(),
      };
      setBookings((prev) => [booking, ...prev]);
      showToast(`Booking added for ${booking.clientName}`);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function changeStatus(id, status) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    showToast(`Status set to ${status}`);
    setMenuId(null);
  }

  function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;
    setBookings((prev) => prev.filter((b) => b.id !== id));
    showToast("Booking deleted");
    setMenuId(null);
    setDetailId(null);
  }

  const detail = bookings.find((b) => b.id === detailId);
  const statusIndex = (status) => {
    const i = STATUS_FLOW.findIndex((s) => s.key === status);
    return i >= 0 ? i : 0;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Bookings Management</h1>
          <p className="text-sm text-slate-500">Manage and track all customer bookings and appointments</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" /> New Booking
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className={`rounded-lg p-2 ${s.tone}`}>
                <s.icon className="h-4 w-4" />
              </div>
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
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="All">Status: All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => showToast("CSV export started")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
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
                    <button
                      type="button"
                      onClick={() => setDetailId(b.id)}
                      className="flex items-center gap-2.5 text-left hover:opacity-80"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${AVATAR[i % AVATAR.length]}`}
                      >
                        {initials(b.clientName)}
                      </div>
                      <span className="font-medium text-[#2563EB] hover:underline">{b.clientName}</span>
                    </button>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-500">{b.address}</td>
                  <td className="py-3.5 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(b.tests) ? b.tests : [b.tests]).map((t) => (
                        <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-[#2563EB]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600">{formatDisplayDate(b.date)}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{b.time}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(b.status)}`}>
                      ● {b.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="relative flex items-center gap-1 text-slate-400">
                      <button
                        type="button"
                        className="rounded p-1.5 hover:bg-slate-100 hover:text-[#2563EB]"
                        title="Edit"
                        onClick={() => openEdit(b)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 hover:bg-slate-100 hover:text-[#2563EB]"
                        title="View"
                        onClick={() => setDetailId(b.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 hover:bg-slate-100"
                        title="More"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === b.id ? null : b.id);
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuId === b.id && (
                        <div
                          className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                            onClick={() => {
                              setDetailId(b.id);
                              setMenuId(null);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                            onClick={() => openEdit(b)}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <div className="border-t border-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400">
                            Change Status
                          </div>
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50"
                              onClick={() => changeStatus(b.id, s)}
                            >
                              {b.status === s ? <Check className="h-3 w-3 text-[#2563EB]" /> : <span className="w-3" />}
                              {s}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 border-t border-slate-50 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            onClick={() => deleteBooking(b.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Showing {filtered.length} of {bookings.length} bookings
          {searchQuery ? ` · filter: “${searchQuery}”` : ""}
        </p>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form
            onSubmit={submitForm}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">{editingId ? "Edit Booking" : "New Booking"}</h2>
                <p className="text-xs text-slate-500">Client details and appointment</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Client Name *</label>
                <input
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="e.g. Ama Boateng"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Phone Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-600">
                      +233
                    </span>
                    <input
                      required
                      value={form.phone.replace(/^\+233\s?/, "")}
                      onChange={(e) => setForm({ ...form, phone: "+233 " + e.target.value.replace(/^\+233\s?/, "") })}
                      className="w-full rounded-r-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                      placeholder="24 000 0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                    placeholder="client@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Address / Location *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  list="region-suggestions"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="e.g. 12 Spintex Road, Accra"
                />
                <datalist id="region-suggestions">
                  {REGIONS.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          region: r,
                          address: form.address.includes(r) ? form.address : form.address ? `${form.address}, ${r}` : r,
                        })
                      }
                      className={`rounded-full border px-2.5 py-0.5 text-xs ${
                        form.region === r || form.address.includes(r)
                          ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Tests *</label>
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-slate-200 p-2">
                  {TEST_OPTIONS.map((t) => (
                    <label
                      key={t.name}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50 ${
                        form.tests.includes(t.name) ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.tests.includes(t.name)}
                        onChange={() => toggleTest(t.name)}
                        className="accent-[#2563EB]"
                      />
                      <span className="flex-1 font-medium text-[#0F172A]">{t.name}</span>
                      <span className="text-xs text-slate-500">GH₵ {t.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Time</label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  >
                    {["08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none"
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
              >
                {editingId ? "Save Changes" : "Create Booking"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client Detail Drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setDetailId(null)}>
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                  {initials(detail.clientName)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">{detail.clientName}</h2>
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(detail.status)}`}>
                    {detail.status}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setDetailId(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" /> {detail.phone || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" /> {detail.address || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" /> {detail.email || "—"}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Appointment Timeline</h3>
                <div className="relative space-y-0 pl-1">
                  {STATUS_FLOW.map((step, idx) => {
                    const current = statusIndex(detail.status);
                    const done = idx < current;
                    const active = idx === current;
                    return (
                      <div key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
                        {idx < STATUS_FLOW.length - 1 && (
                          <div
                            className={`absolute left-[11px] top-6 h-[calc(100%-8px)] w-0.5 ${
                              done ? "bg-emerald-400" : "bg-slate-200"
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            done
                              ? "bg-emerald-500 text-white"
                              : active
                              ? "bg-orange-500 text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${active ? "text-orange-600" : done ? "text-emerald-700" : "text-slate-400"}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-slate-500">{step.desc}</p>
                          {(done || active) && detail.createdAt && (
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {new Date(detail.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Tests Ordered</h3>
                <ul className="space-y-2">
                  {(Array.isArray(detail.tests) ? detail.tests : []).map((t) => (
                    <li key={t} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                      <span className="font-medium text-[#0F172A]">{t}</span>
                      <span className="text-[#2563EB] font-semibold">GH₵ {testPrice(t)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right text-sm font-bold text-[#0F172A]">
                  Total GH₵{" "}
                  {(Array.isArray(detail.tests) ? detail.tests : []).reduce((s, t) => s + testPrice(t), 0)}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</h3>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    detail.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : detail.paymentStatus === "Partial"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {detail.paymentStatus || "Unpaid"}
                </span>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDisplayDate(detail.date)} · {detail.time}
                </p>
                {detail.notes && <p className="mt-2 text-sm text-slate-600">Notes: {detail.notes}</p>}
              </section>
            </div>

            <div className="flex gap-2 border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => openEdit(detail)}
                className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white"
              >
                Edit Booking
              </button>
              <button
                type="button"
                onClick={() => deleteBooking(detail.id)}
                className="flex-1 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { getLocal, setLocal } from "@/lib/utils";
import { getActiveCatalog } from "@/lib/catalog";
import { useToast } from "@/components/ToastProvider";

const SEED = [
  {
    id: 1,
    clientName: "Ama Boateng",
    address: "12 Spintex Road, Accra",
    tests: ["PCR Test", "Blood Panel"],
    date: "Oct 14, 2024",
    time: "09:30 AM",
    status: "Pending",
  },
  {
    id: 2,
    clientName: "Kwame Asamoah",
    address: "45 Oxford St, Kumasi",
    tests: ["COVID Test"],
    date: "Oct 13, 2024",
    time: "11:00 AM",
    status: "Confirmed",
  },
  {
    id: 3,
    clientName: "Esi Mensah",
    address: "22 Ringway Rd, Tema",
    tests: ["Full Blood Count"],
    date: "Oct 13, 2024",
    time: "02:45 PM",
    status: "Awaiting Sample",
  },
  {
    id: 4,
    clientName: "John Opoku",
    address: "9 Liberation Rd, Accra",
    tests: ["Malaria Test"],
    date: "Oct 12, 2024",
    time: "10:15 AM",
    status: "Confirmed",
  },
  {
    id: 5,
    clientName: "Fatima Alhassan",
    address: "7 Dansoman Rd, Accra",
    tests: ["Liver Function Test"],
    date: "Oct 12, 2024",
    time: "08:30 AM",
    status: "Pending",
  },
];

const EMPTY_FORM = {
  clientName: "",
  phone: "",
  email: "",
  address: "",
  region: "Accra",
  date: "",
  time: "09:00 AM",
  notes: "",
  tests: [],
};

function initials(name) {
  return (name || "G")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR = ["bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-orange-500", "bg-violet-500"];

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    const b = getLocal("bookings", []);
    setBookings(b.length ? b : SEED);
    setCatalog(getActiveCatalog());
  }, []);

  // Open form when arriving from Dashboard "New Booking" with ?new=1
  useEffect(() => {
    if (searchParams?.get("new") === "1") {
      setShowModal(true);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchQ =
        !query ||
        b.clientName?.toLowerCase().includes(query) ||
        b.address?.toLowerCase().includes(query);
      const matchS = statusFilter === "All" || b.status === statusFilter;
      return matchQ && matchS;
    });
  }, [bookings, searchQuery, statusFilter]);

  function persist(list) {
    setBookings(list);
    setLocal("bookings", list);
  }

  function updateStatus(id, status) {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    persist(updated);
    showToast(`Booking marked ${status}`);
  }

  function toggleTest(name) {
    setForm((f) => ({
      ...f,
      tests: f.tests.includes(name)
        ? f.tests.filter((t) => t !== name)
        : [...f.tests, name],
    }));
  }

  function createBooking(e) {
    e.preventDefault();
    if (!form.clientName.trim()) {
      showToast("Client name is required", "error");
      return;
    }
    if (!form.address.trim()) {
      showToast("Address is required", "error");
      return;
    }
    if (!form.date) {
      showToast("Date is required", "error");
      return;
    }
    if (!form.tests.length) {
      showToast("Select at least one test", "error");
      return;
    }

    const total =
      form.tests.reduce((sum, name) => {
        const t = catalog.find((c) => c.name === name);
        return sum + (Number(t?.price) || 0);
      }, 0) + 20;

    const booking = {
      id: Date.now(),
      clientName: form.clientName.trim(),
      userPhone: form.phone.trim(),
      userEmail: form.email.trim(),
      address: form.address.trim(),
      region: form.region,
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
      tests: form.tests,
      status: "Pending",
      total,
      createdAt: new Date().toISOString(),
    };

    persist([booking, ...bookings]);
    showToast(`Booking created for ${booking.clientName}`);
    setShowModal(false);
    setForm(EMPTY_FORM);
  }

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length || 128,
      sub: "+12 this month",
      icon: Calendar,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "Pending").length || 18,
      sub: "Awaiting confirmation",
      icon: Clock,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "Confirmed",
      value: bookings.filter((b) => b.status === "Confirmed").length || 92,
      sub: "Scheduled",
      icon: CheckCircle2,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Awaiting Sample",
      value: bookings.filter((b) => b.status === "Awaiting Sample").length || 18,
      sub: "Pending sample",
      icon: FlaskConical,
      tone: "text-sky-600 bg-sky-50",
    },
  ];

  function statusClass(s) {
    if (s === "Confirmed") return "bg-emerald-100 text-emerald-700";
    if (s === "Pending") return "bg-amber-100 text-amber-700";
    if (s === "Awaiting Sample") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Bookings Management</h1>
          <p className="text-sm text-slate-500">
            Manage and track all customer bookings and appointments
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCatalog(getActiveCatalog());
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white"
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
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Awaiting Sample">Awaiting Sample</option>
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
          <table className="w-full text-left text-sm min-w-[640px]">
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
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${AVATAR[i % AVATAR.length]}`}
                      >
                        {initials(b.clientName)}
                      </div>
                      <span className="font-medium text-[#0F172A]">{b.clientName}</span>
                    </div>
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
                  <td className="py-3.5 pr-3 text-slate-600">{b.date}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{b.time}</td>
                  <td className="py-3.5 pr-3">
                    <button
                      type="button"
                      onClick={() => {
                        const next =
                          b.status === "Pending"
                            ? "Confirmed"
                            : b.status === "Confirmed"
                            ? "Awaiting Sample"
                            : "Pending";
                        updateStatus(b.id, next);
                      }}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(b.status)}`}
                    >
                      ● {b.status}
                    </button>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1 text-slate-400">
                      <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={() => showToast("Edit booking")}>
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={() => showToast("View booking")}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded p-1.5 hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Showing {filtered.length} of {bookings.length || SEED.length} bookings
          {searchQuery ? ` · filter: “${searchQuery}”` : ""}
        </p>
      </div>

      {/* New Booking modal — client details + tests */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form
            onSubmit={createBooking}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">New Booking</h2>
                <p className="text-xs text-slate-500">Client details and lab tests</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Client name *</label>
                <input
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="Full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                    placeholder="+233 24 000 0000"
                  />
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
                <label className="mb-1 block text-xs font-medium text-slate-700">Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="House number, street, landmark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Region</label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  >
                    <option>Accra</option>
                    <option>Kumasi</option>
                    <option>Tema</option>
                    <option>Cape Coast</option>
                    <option>Takoradi</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Date *</label>
                  <input
                    type="date"
                    required
                    min={minDate}
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
                    {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Select tests * <span className="text-slate-400 font-normal">(from catalog)</span>
                </label>
                <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-slate-200 p-2">
                  {catalog.length === 0 && (
                    <p className="text-xs text-amber-600 px-2 py-2">
                      No tests in catalog. Add tests under Test Catalog first.
                    </p>
                  )}
                  {catalog.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-slate-50 ${
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
                {form.tests.length > 0 && (
                  <p className="mt-1.5 text-xs text-slate-500">{form.tests.length} test(s) selected</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none"
                  placeholder="Gate code, preferred entrance..."
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setForm(EMPTY_FORM);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Create Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

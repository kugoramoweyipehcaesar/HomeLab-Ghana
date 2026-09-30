"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserPlus,
  MapPin,
  X,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const STORAGE_KEY = "homelab_clients";

const LOCATIONS = ["Accra", "Kumasi", "Tema", "Cape Coast", "Tamale", "Sunyani", "Takoradi"];

const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-orange-500", "bg-violet-500", "bg-cyan-500"];

const INITIAL_CLIENTS = [
  {
    id: 1,
    name: "Ama Boateng",
    email: "ama.boateng@email.com",
    address: "12 Spintex Road, Accra",
    phone: "+233 24 567 8901",
    location: "Accra",
    bookings: 12,
    lastVisit: "Oct 14, 2024",
    avatar: "AB",
    color: "bg-blue-500",
    status: "Active",
    gender: "Female",
    dob: "",
    notes: "",
    totalSpent: 1850,
    history: [
      { test: "PCR Test", date: "Oct 14, 2024", status: "Pending" },
      { test: "Blood Panel", date: "Sep 20, 2024", status: "Completed" },
      { test: "Full Blood Count", date: "Aug 5, 2024", status: "Completed" },
    ],
  },
  {
    id: 2,
    name: "Kwame Asamoah",
    email: "kwame.asamoah@email.com",
    address: "45 Oxford St, Kumasi",
    phone: "+233 20 444 3321",
    location: "Kumasi",
    bookings: 7,
    lastVisit: "Oct 13, 2024",
    avatar: "KA",
    color: "bg-emerald-500",
    status: "Active",
    gender: "Male",
    dob: "",
    notes: "",
    totalSpent: 980,
    history: [
      { test: "COVID Test", date: "Oct 13, 2024", status: "Confirmed" },
      { test: "Malaria Test", date: "Sep 1, 2024", status: "Completed" },
    ],
  },
  {
    id: 3,
    name: "Esi Mensah",
    email: "esi.mensah@email.com",
    address: "22 Ringway Rd, Tema",
    phone: "+233 55 789 1123",
    location: "Tema",
    bookings: 18,
    lastVisit: "Oct 13, 2024",
    avatar: "EM",
    color: "bg-pink-500",
    status: "Active",
    gender: "Female",
    dob: "",
    notes: "",
    totalSpent: 3200,
    history: [
      { test: "Full Blood Count", date: "Oct 13, 2024", status: "Awaiting Sample" },
      { test: "Lipid Panel", date: "Sep 28, 2024", status: "Completed" },
      { test: "HbA1c", date: "Aug 15, 2024", status: "Completed" },
    ],
  },
  {
    id: 4,
    name: "John Opoku",
    email: "john.opoku@email.com",
    address: "9 Liberation Rd, Accra",
    phone: "+233 24 909 7745",
    location: "Accra",
    bookings: 5,
    lastVisit: "Oct 12, 2024",
    avatar: "JO",
    color: "bg-orange-500",
    status: "Active",
    gender: "Male",
    dob: "",
    notes: "",
    totalSpent: 540,
    history: [{ test: "Malaria Test", date: "Oct 12, 2024", status: "Confirmed" }],
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  location: "Accra",
  status: "Active",
  gender: "",
  dob: "",
  notes: "",
};

const LOC_COLOR = {
  Accra: "text-blue-600",
  Kumasi: "text-emerald-600",
  Tema: "text-violet-600",
  "Cape Coast": "text-orange-600",
  Tamale: "text-amber-600",
  Sunyani: "text-teal-600",
  Takoradi: "text-cyan-600",
};

function makeAvatar(name) {
  return (name || "G")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function statusBadge(status) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "Confirmed") return "bg-blue-100 text-blue-700";
  if (status === "Pending") return "bg-amber-100 text-amber-700";
  if (status === "Awaiting Sample") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-600";
}

export default function AdminClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [newThisWeek, setNewThisWeek] = useState(15);

  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setClients(parsed);
      }
      const n = localStorage.getItem("homelab_clients_new_week");
      if (n) setNewThisWeek(Number(n) || 15);
    } catch {
      /* keep initial */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
      localStorage.setItem("homelab_clients_new_week", String(newThisWeek));
    } catch {
      /* ignore */
    }
  }, [clients, loaded, newThisWeek]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const totalClients = clients.length;
  const activeCount = clients.filter((c) => c.status !== "Inactive").length;

  function openView(c) {
    setSelectedClient(c);
    setIsViewOpen(true);
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEdit(c) {
    setEditingId(c.id);
    setForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      location: c.location || "Accra",
      status: c.status || "Active",
      gender: c.gender || "",
      dob: c.dob || "",
      notes: c.notes || "",
    });
    setShowForm(true);
    setIsViewOpen(false);
  }

  function submitForm(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Client name is required", "error");
      return;
    }
    if (!form.email.trim()) {
      showToast("Email is required", "error");
      return;
    }
    if (!form.phone.trim()) {
      showToast("Phone is required", "error");
      return;
    }
    if (!form.address.trim()) {
      showToast("Address is required", "error");
      return;
    }
    if (!form.location) {
      showToast("Location is required", "error");
      return;
    }

    if (editingId != null) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim().startsWith("+") ? form.phone.trim() : `+233 ${form.phone.trim()}`,
                address: form.address.trim(),
                location: form.location,
                status: form.status,
                gender: form.gender,
                dob: form.dob,
                notes: form.notes.trim(),
                avatar: makeAvatar(form.name),
              }
            : c
        )
      );
      showToast("Client updated");
    } else {
      const newClient = {
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim().startsWith("+") ? form.phone.trim() : `+233 ${form.phone.trim()}`,
        address: form.address.trim(),
        location: form.location,
        status: form.status || "Active",
        gender: form.gender,
        dob: form.dob,
        notes: form.notes.trim(),
        avatar: makeAvatar(form.name),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        bookings: 0,
        lastVisit: todayLabel(),
        totalSpent: 0,
        history: [],
      };
      setClients((prev) => [newClient, ...prev]);
      setNewThisWeek((n) => n + 1);
      showToast("Client added");
    }

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Clients Management</h1>
          <p className="text-sm text-slate-500">Manage your clients and their laboratory service history</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Total Clients</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{totalClients}</p>
          <p className="mt-1 text-xs text-emerald-600">↑ live count</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <UserCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{activeCount}</p>
          <p className="mt-1 text-xs text-emerald-600">Active accounts</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <UserPlus className="h-5 w-5" />
            <span className="text-sm font-medium">New this week</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{newThisWeek}</p>
          <p className="mt-1 text-xs text-emerald-600">Includes new adds</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0F172A]">All Clients</h2>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              className="sm:hidden rounded-xl border border-slate-200 p-2.5"
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
              <Search className="h-4 w-4 text-slate-600" />
            </button>
            <div className={`relative w-full sm:w-72 ${mobileSearchOpen ? "block" : "hidden sm:block"}`}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-8 text-sm outline-none focus:border-[#2563EB]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 lg:hidden">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-100 p-4">
              <button type="button" onClick={() => openView(c)} className="flex w-full items-center gap-3 text-left">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${c.color}`}>
                  {c.avatar || makeAvatar(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#2563EB]">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.address}</p>
                  <p className="text-xs text-slate-400">{c.phone}</p>
                </div>
              </button>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => openView(c)}
                  className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-[#2563EB]"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No clients found</p>
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-3 font-medium">Client Name</th>
                <th className="pb-3 pr-3 font-medium">Address</th>
                <th className="pb-3 pr-3 font-medium">Phone</th>
                <th className="pb-3 pr-3 font-medium">Location</th>
                <th className="pb-3 pr-3 font-medium">Bookings</th>
                <th className="pb-3 pr-3 font-medium">Last Visit</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5 pr-3">
                    <button type="button" onClick={() => openView(c)} className="flex items-center gap-2.5 text-left hover:opacity-80">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${c.color}`}>
                        {c.avatar || makeAvatar(c.name)}
                      </div>
                      <div>
                        <p className="font-medium text-[#2563EB] hover:underline">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600 max-w-[180px]">{c.address}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{c.phone}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${LOC_COLOR[c.location] || "text-slate-600"}`}>
                      <MapPin className="h-3.5 w-3.5" /> {c.location}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-medium text-[#0F172A]">{c.bookings}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{c.lastVisit}</td>
                  <td className="py-3.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openView(c)}
                        className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No clients found</p>
          )}
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Showing {filtered.length} of {clients.length} clients
          {searchQuery ? ` · filter: “${searchQuery}”` : ""}
        </div>
      </div>

      {/* View drawer */}
      {isViewOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setIsViewOpen(false)}>
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${selectedClient.color}`}>
                  {selectedClient.avatar || makeAvatar(selectedClient.name)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">{selectedClient.name}</h2>
                  <p className="text-xs text-slate-500">{selectedClient.email}</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      selectedClient.status === "Inactive"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {selectedClient.status || "Active"}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</h3>
                <div className="space-y-2.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" /> {selectedClient.address}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" /> {selectedClient.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" /> {selectedClient.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#2563EB]" />
                    <span className={LOC_COLOR[selectedClient.location] || "text-slate-600"}>
                      {selectedClient.location}
                    </span>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <p className="text-xl font-bold text-[#0F172A]">{selectedClient.bookings || 0}</p>
                  <p className="text-[10px] text-slate-500">Bookings</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-xl font-bold text-[#0F172A]">{selectedClient.totalSpent || 0}</p>
                  <p className="text-[10px] text-slate-500">Spent GHC</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-center">
                  <p className="text-sm font-bold text-[#0F172A] leading-tight">{selectedClient.lastVisit || "—"}</p>
                  <p className="text-[10px] text-slate-500">Last Visit</p>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Booking History</h3>
                {(selectedClient.history || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No bookings yet</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedClient.history.map((h, i) => (
                      <li key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">{h.test}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {h.date}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(h.status)}`}>
                          {h.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {selectedClient.notes && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</h3>
                  <p className="text-sm text-slate-600">{selectedClient.notes}</p>
                </section>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => openEdit(selectedClient)}
                className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white"
              >
                Edit Client
              </button>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form
            onSubmit={submitForm}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">{editingId ? "Edit Client" : "Add Client"}</h2>
                <p className="text-xs text-slate-500">Client profile details</p>
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
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="e.g. Ama Boateng"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="client@email.com"
                />
              </div>

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
                <label className="mb-1 block text-xs font-medium text-slate-700">Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="e.g. 12 Spintex Road, Accra"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Location *</label>
                  <select
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  >
                    <option value="">—</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                  />
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
                {editingId ? "Save Changes" : "Add Client"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

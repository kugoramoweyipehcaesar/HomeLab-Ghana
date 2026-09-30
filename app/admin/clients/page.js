"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Users,
  UserCheck,
  UserPlus,
  MapPin,
  X,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const CLIENTS = [
  {
    id: 1,
    name: "Ama Boateng",
    address: "12 Spintex Road, Accra",
    phone: "+233 24 567 8901",
    email: "ama.boateng@email.com",
    location: "Accra",
    bookings: 12,
    lastVisit: "Oct 14, 2024",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Kwame Asamoah",
    address: "45 Oxford St, Kumasi",
    phone: "+233 20 444 3321",
    email: "kwame.asamoah@email.com",
    location: "Kumasi",
    bookings: 7,
    lastVisit: "Oct 13, 2024",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Esi Mensah",
    address: "22 Ringway Rd, Tema",
    phone: "+233 55 789 1123",
    email: "esi.mensah@email.com",
    location: "Tema",
    bookings: 18,
    lastVisit: "Oct 13, 2024",
    color: "bg-violet-500",
  },
  {
    id: 4,
    name: "John Opoku",
    address: "9 Liberation Rd, Accra",
    phone: "+233 24 909 7745",
    email: "john.opoku@email.com",
    location: "Accra",
    bookings: 5,
    lastVisit: "Oct 12, 2024",
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Fatima Alhassan",
    address: "7 Dansoman Rd, Accra",
    phone: "+233 50 332 6690",
    email: "fatima.a@email.com",
    location: "Accra",
    bookings: 9,
    lastVisit: "Oct 12, 2024",
    color: "bg-cyan-500",
  },
];

const LOC_COLOR = {
  Accra: "text-blue-600",
  Kumasi: "text-emerald-600",
  Tema: "text-violet-600",
};

export default function AdminClientsPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return CLIENTS;
    return CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Clients Management</h1>
          <p className="text-sm text-slate-500">
            Manage your clients and their laboratory service history
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast("Add client form")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white"
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
          <p className="text-4xl font-bold text-[#0F172A]">248</p>
          <p className="mt-1 text-xs text-emerald-600">↑ 12% vs last month</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <UserCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">198</p>
          <p className="mt-1 text-xs text-emerald-600">↑ 8% vs last month</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <UserPlus className="h-5 w-5" />
            <span className="text-sm font-medium">New this week</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">15</p>
          <p className="mt-1 text-xs text-emerald-600">↑ 5 vs last week</p>
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
            <div
              className={`relative w-full sm:w-72 ${
                mobileSearchOpen ? "block" : "hidden sm:block"
              }`}
            >
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
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${c.color}`}
                >
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#0F172A]">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.address}</p>
                  <p className="text-xs text-slate-400">{c.phone}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No clients match “{searchQuery}”</p>
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
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${c.color}`}
                      >
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600 max-w-[180px]">{c.address}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{c.phone}</td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        LOC_COLOR[c.location] || "text-slate-600"
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" /> {c.location}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-medium text-[#0F172A]">{c.bookings}</td>
                  <td className="py-3.5 pr-3 text-slate-600">{c.lastVisit}</td>
                  <td className="py-3.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => showToast(`View ${c.name}`)}
                        className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Edit ${c.name}`)}
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
            <p className="py-8 text-center text-sm text-slate-500">No clients match “{searchQuery}”</p>
          )}
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Showing {filtered.length} of {CLIENTS.length} clients
          {searchQuery ? ` · filter: “${searchQuery}”` : ""}
        </div>
      </div>
    </div>
  );
}

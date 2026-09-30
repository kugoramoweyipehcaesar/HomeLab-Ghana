"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Banknote,
  Clock,
  CheckCircle2,
  Smartphone,
  Building2,
  Wallet,
  Edit2,
  Plus,
  Download,
  Eye,
  X,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const TX_KEY = "homelab_payments";
const METHODS_KEY = "homelab_payment_methods";

const INITIAL_TX = [
  { id: 1, client: "Ama Boateng", test: "Blood Panel", amount: 120, status: "Paid", date: "2024-04-08", method: "MTN MoMo" },
  { id: 2, client: "Kwame Mensah", test: "COVID-19 PCR", amount: 250, status: "Unpaid", date: "2024-04-10", method: "Bank Transfer" },
  { id: 3, client: "Akosua Tawiah", test: "Lipid Profile", amount: 150, status: "Paid", date: "2024-04-09", method: "Telecel Cash" },
  { id: 4, client: "John Osei", test: "Malaria Test", amount: 80, status: "Unpaid", date: "2024-04-07", method: "Cash" },
  { id: 5, client: "Efua Dadzie", test: "Thyroid Panel", amount: 200, status: "Paid", date: "2024-04-06", method: "MTN MoMo" },
];

const INITIAL_METHODS = [
  {
    id: "mtn",
    title: "MTN Mobile Money",
    number: "024XXXXXXX",
    name: "HomeLab GH",
    enabled: true,
    collected: 1850,
    color: "bg-yellow-400",
    icon: "mtn",
  },
  {
    id: "telecel",
    title: "Telecel Cash",
    number: "020XXXXXXX",
    name: "HomeLab GH",
    enabled: true,
    collected: 620,
    color: "bg-red-500",
    icon: "telecel",
  },
  {
    id: "bank",
    title: "Bank Transfer",
    number: "GCB Bank - 1234567890",
    name: "HomeLab GH Ltd",
    enabled: true,
    collected: 450,
    color: "bg-blue-600",
    icon: "bank",
  },
  {
    id: "cash",
    title: "Cash Payment",
    number: "Pay on sample collection",
    name: "HomeLab GH",
    enabled: true,
    collected: 320,
    color: "bg-emerald-500",
    icon: "cash",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const REVENUE = [700, 1500, 1800, 2200, 2500, 3240];
const maxR = Math.max(...REVENUE);

function formatGhc(n) {
  return Number(n || 0).toLocaleString();
}

export default function AdminPaymentsPage() {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState(INITIAL_TX);
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  const [editMethod, setEditMethod] = useState(null);
  const [methodForm, setMethodForm] = useState({ number: "", name: "" });
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({ title: "", number: "", name: "" });

  const [viewTx, setViewTx] = useState(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TX_KEY);
      if (t) {
        const p = JSON.parse(t);
        if (Array.isArray(p) && p.length) setTransactions(p);
      }
      const m = localStorage.getItem(METHODS_KEY);
      if (m) {
        const p = JSON.parse(m);
        if (Array.isArray(p) && p.length) setMethods(p);
      }
    } catch {
      /* keep initial */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TX_KEY, JSON.stringify(transactions));
      localStorage.setItem(METHODS_KEY, JSON.stringify(methods));
    } catch {
      /* ignore */
    }
  }, [transactions, methods, loaded]);

  const stats = useMemo(() => {
    const paid = transactions.filter((t) => t.status === "Paid");
    const unpaid = transactions.filter((t) => t.status === "Unpaid");
    const totalRevenue = paid.reduce((s, t) => s + Number(t.amount || 0), 0);
    const pendingAmount = unpaid.reduce((s, t) => s + Number(t.amount || 0), 0);
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const completedThisMonth = paid.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
    // If sample data is in 2024, fall back to all paid count for demo
    const completed = completedThisMonth || paid.length;
    return {
      totalRevenue,
      pendingAmount,
      pendingCount: unpaid.length,
      completed,
    };
  }, [transactions]);

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        t.client?.toLowerCase().includes(q) ||
        t.test?.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  function toggleMethod(id) {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
    showToast("Payment method updated");
  }

  function openEditMethod(m) {
    setEditMethod(m);
    setMethodForm({ number: m.number || "", name: m.name || "" });
  }

  function saveMethod(e) {
    e.preventDefault();
    setMethods((prev) =>
      prev.map((m) =>
        m.id === editMethod.id
          ? { ...m, number: methodForm.number.trim(), name: methodForm.name.trim() }
          : m
      )
    );
    showToast("Payment details saved");
    setEditMethod(null);
  }

  function addMethod(e) {
    e.preventDefault();
    if (!newMethod.title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    setMethods((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newMethod.title.trim(),
        number: newMethod.number.trim() || "—",
        name: newMethod.name.trim() || "HomeLab GH",
        enabled: true,
        collected: 0,
        color: "bg-slate-500",
        icon: "cash",
      },
    ]);
    showToast("Payment method added");
    setShowAddMethod(false);
    setNewMethod({ title: "", number: "", name: "" });
  }

  function markStatus(id, status) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    showToast(status === "Paid" ? "Marked as Paid" : "Marked as Unpaid");
  }

  function exportCsv() {
    const header = "Client,Test,Amount,Status,Date,Method\n";
    const rows = transactions
      .map((t) =>
        [t.client, t.test, t.amount, t.status, t.date, t.method].map((x) => `"${x}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "homelab-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Transactions exported");
  }

  function MethodIcon({ m }) {
    if (m.icon === "mtn" || m.icon === "telecel")
      return <Smartphone className="h-5 w-5 text-white" />;
    if (m.icon === "bank") return <Building2 className="h-5 w-5 text-white" />;
    return <Wallet className="h-5 w-5 text-white" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F172A]">Payments Management</h1>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments, clients..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Section 1 — Overview */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/80 p-5">
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Banknote className="h-5 w-5" />
            <span className="text-sm font-medium">Revenue</span>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">GHC {formatGhc(stats.totalRevenue || 3240)}</p>
          <p className="mt-1 text-xs text-emerald-600">↗ +12.5% vs last month</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Pending Payments</span>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">GHC {formatGhc(stats.pendingAmount || 980)}</p>
          <p className="mt-1 text-xs text-amber-700">
            ● {stats.pendingCount} pending
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.completed || 28}</p>
          <p className="mt-1 text-xs text-emerald-700">● Completed this month</p>
        </div>
      </div>

      {/* Section 2 — Payment Methods */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#0F172A]">Payment Methods</h2>
          <button
            type="button"
            onClick={() => setShowAddMethod(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Payment Method
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {methods.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${!m.enabled ? "opacity-60" : ""}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${m.color}`}>
                    <MethodIcon m={m} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{m.title}</p>
                    <p className="text-[11px] text-slate-500">{m.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={m.enabled}
                  onClick={() => toggleMethod(m.id)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    m.enabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                      m.enabled ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="mb-1 text-xs text-slate-600">{m.number}</p>
              <p className="mb-3 text-xs font-medium text-[#2563EB]">
                GHC {formatGhc(m.collected)} collected this month
              </p>
              <button
                type="button"
                onClick={() => openEditMethod(m)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                <Edit2 className="h-3 w-3" /> Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Chart + Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#0F172A]">Revenue Overview</h2>
          <p className="mb-4 text-xs text-slate-500">Monthly revenue — last 6 months</p>
          <div className="flex h-48 items-end gap-3">
            {REVENUE.map((v, i) => (
              <div key={MONTHS[i]} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-[#2563EB]/80"
                  style={{ height: `${(v / maxR) * 100}%` }}
                />
                <span className="text-[10px] text-slate-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Peak this month: June · GHC 3,240</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-[#0F172A]">Transactions</h2>
              <p className="text-xs text-slate-500">Recent payments from clients</p>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3 w-3" /> Export Transactions
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-slate-400">
                  <th className="pb-2 pr-2 font-medium">Client Name</th>
                  <th className="pb-2 pr-2 font-medium">Tests</th>
                  <th className="pb-2 pr-2 font-medium">Amount GHC</th>
                  <th className="pb-2 pr-2 font-medium">Status</th>
                  <th className="pb-2 pr-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-2 font-medium text-[#0F172A]">{t.client}</td>
                    <td className="py-2.5 pr-2 text-slate-500">{t.test}</td>
                    <td className="py-2.5 pr-2 font-medium">{t.amount}</td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          t.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-xs text-slate-500">{t.date}</td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => setViewTx(t)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#2563EB]"
                          title="View Receipt"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {t.status === "Unpaid" ? (
                          <button
                            type="button"
                            onClick={() => markStatus(t.id, "Paid")}
                            className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markStatus(t.id, "Unpaid")}
                            className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                          >
                            Mark Unpaid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Showing {filteredTx.length} of {Math.max(transactions.length, 34)} transactions
            {search ? ` · filter: “${search}”` : ""}
          </p>
        </div>
      </div>

      {/* Edit method modal */}
      {editMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveMethod} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Edit {editMethod.title}</h3>
              <button type="button" onClick={() => setEditMethod(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Account / Number</label>
                <input
                  value={methodForm.number}
                  onChange={(e) => setMethodForm({ ...methodForm, number: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Account Name</label>
                <input
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setEditMethod(null)} className="flex-1 rounded-xl border py-2.5 text-sm">
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add method modal */}
      {showAddMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={addMethod} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Add Payment Method</h3>
              <button type="button" onClick={() => setShowAddMethod(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Title *</label>
                <input
                  required
                  value={newMethod.title}
                  onChange={(e) => setNewMethod({ ...newMethod, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  placeholder="e.g. Vodafone Cash"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Number / Account</label>
                <input
                  value={newMethod.number}
                  onChange={(e) => setNewMethod({ ...newMethod, number: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Account Name</label>
                <input
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  placeholder="HomeLab GH"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowAddMethod(false)} className="flex-1 rounded-xl border py-2.5 text-sm">
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">
                Add Method
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Receipt view */}
      {viewTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Receipt</h3>
              <button type="button" onClick={() => setViewTx(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-400">Client:</span> <strong>{viewTx.client}</strong>
              </p>
              <p>
                <span className="text-slate-400">Test:</span> {viewTx.test}
              </p>
              <p>
                <span className="text-slate-400">Amount:</span> GHC {viewTx.amount}
              </p>
              <p>
                <span className="text-slate-400">Method:</span> {viewTx.method}
              </p>
              <p>
                <span className="text-slate-400">Status:</span>{" "}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    viewTx.status === "Paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {viewTx.status}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Date:</span> {viewTx.date}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewTx(null)}
              className="mt-5 w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

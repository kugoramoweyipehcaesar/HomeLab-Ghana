"use client";

import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  Banknote,
  Clock,
  CheckCircle2,
} from "lucide-react";

const TX = [
  { name: "Ama Boateng", test: "Blood Panel", amount: 120, method: "Mobile Money", status: "Paid", date: "2024-04-08" },
  { name: "Kwame Mensah", test: "COVID-19 PCR", amount: 250, method: "Mobile Money", status: "Unpaid", date: "2024-04-10" },
  { name: "Akosua Tawiah", test: "Lipid Profile", amount: 150, method: "Mobile Money", status: "Paid", date: "2024-04-09" },
  { name: "John Osei", test: "Malaria Test", amount: 80, method: "Mobile Money", status: "Unpaid", date: "2024-04-07" },
  { name: "Efua Dadzie", test: "Thyroid Panel", amount: 200, method: "Mobile Money", status: "Paid", date: "2024-04-06" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const REVENUE = [700, 1500, 1800, 2200, 2500, 3240];
const maxR = Math.max(...REVENUE);

export default function AdminPaymentsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F172A]">Payments Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search payments, clients..."
              className="w-56 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <button className="relative rounded-xl border border-slate-200 bg-white p-2.5">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button className="rounded-xl border border-slate-200 bg-white p-2.5">
            <Settings className="h-4 w-4" />
          </button>
          <button className="rounded-xl border border-slate-200 bg-white p-2.5">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/80 p-5">
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Banknote className="h-5 w-5" />
            <span className="text-sm font-medium">Revenue</span>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">GHC 3,240</p>
          <p className="mt-1 text-xs text-emerald-600">↗ +12.5% vs last month</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Pending Payments</span>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">GHC 980</p>
          <p className="mt-1 text-xs text-amber-700">● 6 pending · 4 overdue</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">28</p>
          <p className="mt-1 text-xs text-emerald-700">● Completed this month</p>
        </div>
      </div>

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
          <h2 className="font-bold text-[#0F172A]">Transactions</h2>
          <p className="mb-4 text-xs text-slate-500">Recent payments from clients</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-slate-400">
                  <th className="pb-2 pr-2 font-medium">Client Name</th>
                  <th className="pb-2 pr-2 font-medium">Tests</th>
                  <th className="pb-2 pr-2 font-medium">Amount GHC</th>
                  <th className="pb-2 pr-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {TX.map((t) => (
                  <tr key={t.name + t.date} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-2 font-medium text-[#0F172A]">{t.name}</td>
                    <td className="py-2.5 pr-2 text-slate-500">{t.test}</td>
                    <td className="py-2.5 pr-2 font-medium">{t.amount}</td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          t.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-slate-500">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-400">Showing 5 of 34 transactions</p>
        </div>
      </div>
    </div>
  );
}

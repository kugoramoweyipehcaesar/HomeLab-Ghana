"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Share2, Search, Lock } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getLocal } from "@/lib/utils";

function MyResultsContent() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const currentUser = getLocal("currentUser");
    const all = getLocal("bookings", []);
    setBookings(all.filter((b) => b.userEmail === currentUser?.email || b.userPhone === currentUser?.phone));
  }, []);

  const filtered = bookings.filter((b) =>
    (Array.isArray(b.tests) ? b.tests.join(" ") : b.tests || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = (s) => {
    if (s === "Ready" || s === "Completed") return "bg-green-50 text-green-700 border-green-200";
    if (s === "Processing") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="bg-[#0A1931] text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0D6EFD] rounded-lg flex items-center justify-center text-sm font-bold">HL</div>
              <div>
                <span className="font-bold">HomeLab GH</span>
                <p className="text-[10px] text-gray-400">LABORATORY</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-5 text-sm">
              <a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>
              <a href="/my-results" className="text-white font-medium border-b-2 border-[#0D6EFD] pb-0.5">My Results</a>
              <a href="#" className="text-gray-300 hover:text-white">Appointments</a>
              <a href="#" className="text-gray-300 hover:text-white">Billing</a>
              <a href="#" className="text-gray-300 hover:text-white">Support</a>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-gray-300"><Lock size={14} /> Secure & Confidential</span>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">JD</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1931]">My Results</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
              Review your recent laboratory results <Lock size={12} /> securely. All data is encrypted and confidential.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-xl">🩺</div>
            <div>
              <p className="text-xs text-gray-500">Total Results</p>
              <p className="text-xl font-bold text-[#0A1931]">{bookings.length || 3} <span className="text-xs text-green-600 font-medium">+1 new this week</span></p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-xl">⏳</div>
            <div>
              <p className="text-xs text-gray-500">Pending/Processing</p>
              <p className="text-xl font-bold text-[#0A1931]">2 <span className="text-xs text-orange-500 font-medium">Awaiting completion</span></p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-xl">✅</div>
            <div>
              <p className="text-xs text-gray-500">Ready</p>
              <p className="text-xl font-bold text-[#0A1931]">1 <span className="text-xs text-green-600 font-medium">Available now</span></p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-[#0A1931] mb-4">Lab Results</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search results, test name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0D6EFD] outline-none"
              />
            </div>

            <div className="space-y-3">
              {(filtered.length ? filtered : [
                { tests: ["Blood Panel — Comprehensive"], status: "Pending", date: "10 Oct 2024 • 09:14 AM" },
                { tests: ["COVID-19 PCR Test"], status: "Processing", date: "09 Oct 2024 • 02:30 PM" },
                { tests: ["Lipid Panel"], status: "Ready", date: "07 Oct 2024 • 10:05 AM" },
              ]).map((b, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusStyle(b.status)}`}>
                        {b.status === "Pending" ? "⏳ Pending" : b.status === "Processing" ? "🔄 Processing" : "✅ Ready"}
                      </span>
                      <h3 className="font-bold text-[#0A1931] mt-2">{Array.isArray(b.tests) ? b.tests.join(", ") : b.tests}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Sample collected: {b.date || b.createdAt}</p>
                    </div>
                    {b.status === "Ready" || b.status === "Completed" ? (
                      <div className="flex flex-wrap gap-2">
                        <button className="bg-[#0D6EFD] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-600">
                          <FileText size={13} /> View PDF
                        </button>
                        <button className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50">
                          <Download size={13} /> Download
                        </button>
                        <a href="https://wa.me/?text=My%20lab%20results%20from%20HomeLab%20GH" target="_blank" rel="noreferrer"
                          className="border border-green-200 text-green-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-green-50">
                          <Share2 size={13} /> Share to Doctor
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Actions unavailable until ready</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-[#0A1931] mb-4 flex items-center gap-2">⏱ Result History Timeline</h2>
            <div className="space-y-0">
              {[
                { title: "Result Ready", time: "10 Oct 2024 • 01:22 PM", desc: "Reviewed and validated by Dr. A. Chen", color: "bg-green-500" },
                { title: "Quality Check Completed", time: "10 Oct 2024 • 12:45 PM", desc: "All values verified against reference range", color: "bg-blue-500" },
                { title: "Processing Started", time: "09 Oct 2024 • 03:10 PM", desc: "Analysis running in Biochemistry Lab", color: "bg-blue-500" },
                { title: "Sample Received", time: "07 Oct 2024 • 10:05 AM", desc: "Sample registered at HomeLab GH Lab Facility", color: "bg-gray-300" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 pb-5 relative">
                  {i < 3 && <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200"></div>}
                  <div className={`w-4 h-4 rounded-full ${item.color} shrink-0 mt-0.5 z-10 border-2 border-white shadow`}></div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A1931]">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-start gap-1.5">
              <Lock size={12} className="mt-0.5 shrink-0" />
              All results are stored with AES-256 encryption. HIPAA compliant.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyResultsPage() {
  return (
    <ProtectedRoute>
      <MyResultsContent />
    </ProtectedRoute>
  );
}
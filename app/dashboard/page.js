"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, FlaskConical, FileText, Plus, Home, TestTube, Calendar, User, Bell } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getLocal } from "@/lib/utils";

function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const currentUser = getLocal("currentUser");
    setUser(currentUser);
    const all = getLocal("bookings", []);
    setBookings(all.filter((b) => b.userEmail === currentUser?.email || b.userPhone === currentUser?.phone));
  }, []);

  if (!user) return null;
  const firstName = user.fullName?.split(" ")[0] || "User";

  return (
    <div className="max-w-md mx-auto bg-[#f8fafc] min-h-screen pb-24">
      {/* Top bar */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0D6EFD] rounded-lg flex items-center justify-center">
            <FlaskConical className="text-white" size={16} />
          </div>
          <span className="font-bold text-[#0A1931]">HomeLab GH</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-1.5">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-[#0D6EFD] rounded-full flex items-center justify-center text-white text-sm font-bold">
            {firstName[0]}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Greeting Card */}
        <div className="bg-gradient-to-r from-[#E8F0FE] to-blue-50 rounded-2xl p-5 border border-blue-100">
          <h1 className="text-2xl font-bold text-[#0A1931]">Hello, {firstName}!</h1>
          <p className="text-sm text-gray-500 mt-0.5">Good morning — here is your health overview</p>

          <div className="mt-4 bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm border border-gray-50">
            <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
              <Calendar className="text-[#0D6EFD]" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0A1931]">Upcoming Collection Appointment</p>
              <p className="text-xs text-gray-500">Tomorrow, 8:00 AM • Home Collection</p>
            </div>
            <span className="text-[10px] bg-blue-50 text-[#0D6EFD] px-2 py-1 rounded-full font-medium">Reminder active</span>
          </div>
        </div>

        {/* Test Progress */}
        <div>
          <h2 className="font-bold text-[#0A1931] mb-4">Test Progress</h2>
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md shadow-green-200">
                <CheckCircle size={22} />
              </div>
              <p className="text-xs mt-2 font-semibold text-[#0A1931]">Sample Collected</p>
              <p className="text-[10px] text-gray-400">Collected • Sept 23</p>
            </div>
            <div className="flex-1 h-0.5 bg-blue-200 mx-1 -mt-6"></div>
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 bg-[#0D6EFD] rounded-full flex items-center justify-center text-white shadow-md shadow-blue-200">
                <FlaskConical size={20} />
              </div>
              <p className="text-xs mt-2 font-semibold text-[#0A1931]">In Lab</p>
              <p className="text-[10px] text-gray-400">Processing</p>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-1 -mt-6"></div>
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <FileText size={20} />
              </div>
              <p className="text-xs mt-2 font-semibold text-gray-400">Results Ready</p>
              <p className="text-[10px] text-gray-400">Pending</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-sm">📋</div>
              <p className="text-xs text-gray-500">Total Tests</p>
            </div>
            <p className="text-2xl font-bold text-[#0A1931]">{bookings.length || 12}</p>
            <p className="text-xs text-green-600 font-medium">+2 this month ↑</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-sm">⏳</div>
              <p className="text-xs text-gray-500">Pending Results</p>
            </div>
            <p className="text-2xl font-bold text-[#0A1931]">1</p>
            <p className="text-xs text-orange-500 font-medium">Expected today</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[#0A1931]">Recent Bookings</h2>
            <button onClick={() => router.push("/my-results")} className="text-sm text-[#0D6EFD] font-medium">See all</button>
          </div>
          <div className="space-y-2">
            {(bookings.length ? bookings.slice(0, 3) : [
              { tests: ["CBC Panel"], date: "20 Sept 2024", status: "Completed" },
              { tests: ["Lipid Panel"], date: "18 Sept 2024", status: "Completed" },
              { tests: ["Vitamin D Test"], date: "15 Sept 2024", status: "Completed" },
            ]).map((b, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-sm">
                    {i === 0 ? "💧" : i === 1 ? "🧪" : "💊"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#0A1931]">{Array.isArray(b.tests) ? b.tests.join(", ") : b.tests}</p>
                    <p className="text-xs text-gray-400">{b.date || b.createdAt}</p>
                  </div>
                </div>
                <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium border border-green-100">
                  {b.status || "Completed"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/book-test")}
          className="w-full bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition"
        >
          <Plus size={18} /> Book New Test
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2.5 max-w-md mx-auto shadow-lg">
        <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center text-[#0D6EFD] text-[10px] font-medium gap-0.5">
          <Home size={20} /> Home
        </button>
        <button onClick={() => router.push("/tests")} className="flex flex-col items-center text-gray-400 text-[10px] font-medium gap-0.5">
          <TestTube size={20} /> Tests
        </button>
        <button onClick={() => router.push("/my-results")} className="flex flex-col items-center text-gray-400 text-[10px] font-medium gap-0.5">
          <Calendar size={20} /> Bookings
        </button>
        <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center text-gray-400 text-[10px] font-medium gap-0.5">
          <User size={20} /> Profile
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
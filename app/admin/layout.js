"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { checkAdmin } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("isAdmin") === "true") {
      setAuthed(true);
    }
    setReady(true);
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    if (checkAdmin(email, password)) {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ email, fullName: "Dr. Kojo Mensah", role: "admin" })
      );
      setAuthed(true);
      setError("");
    } else {
      setError("Invalid admin credentials");
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-500">
        Loading…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-bold text-white">
              HL
            </div>
            <h1 className="text-xl font-bold text-[#0F172A]">Admin Login</h1>
            <p className="mt-1 text-sm text-slate-500">HomeLab GH Laboratory Service</p>
          </div>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
            required
          />
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#2563EB] py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Login as Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="min-h-screen pt-14 lg:pt-0 lg:ml-64">{children}</div>
    </div>
  );
}

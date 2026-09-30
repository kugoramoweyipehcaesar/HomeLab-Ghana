"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Users,
  UserCheck,
  FlaskConical,
  Edit2,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getLocal, setLocal } from "@/lib/utils";

const ROLE_STYLE = {
  Doctor: "bg-indigo-100 text-indigo-700",
  Nurse: "bg-blue-100 text-blue-700",
  "Lab Scientist": "bg-violet-100 text-violet-700",
  "Lab Technician": "bg-violet-100 text-violet-700",
  Rider: "bg-orange-100 text-orange-700",
  Admin: "bg-slate-800 text-white",
};

const AVATARS = ["bg-blue-500", "bg-violet-500", "bg-orange-500", "bg-pink-500", "bg-slate-500", "bg-emerald-500", "bg-indigo-500"];

const SEED = [
  { id: 1, name: "Dr. Ama Serwah", email: "ama.serwah@homelabgh.com", role: "Nurse", phone: "+233 24 555 1201", status: "Active", area: "Phlebotomy" },
  { id: 2, name: "Joseph Owusu", email: "j.owusu@homelabgh.com", role: "Lab Scientist", phone: "+233 20 331 8890", status: "Active", area: "Sample Processing" },
  { id: 3, name: "Kwame Boateng", email: "k.boateng@homelabgh.com", role: "Rider", phone: "+233 55 742 9931", status: "Off Duty", area: "Delivery / Logistics" },
  { id: 4, name: "Linda Dawson", email: "l.dawson@homelabgh.com", role: "Lab Scientist", phone: "+233 24 118 7762", status: "Active", area: "Microbiology Lab" },
  { id: 5, name: "Richard Agyapong", email: "r.agyapong@homelabgh.com", role: "Admin", phone: "+233 50 999 4422", status: "On Leave", area: "Admin Office" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "Nurse",
  area: "",
  status: "Active",
};

export default function AdminStaffPage() {
  const { showToast } = useToast();
  const [staff, setStaff] = useState(SEED);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = getLocal("adminStaff", null);
    if (saved?.length) setStaff(saved);
  }, []);

  function persist(list) {
    setStaff(list);
    setLocal("adminStaff", list);
  }

  const filtered = useMemo(() => {
    return staff.filter((st) => {
      const s = q.toLowerCase();
      const matchQ =
        !q ||
        st.name.toLowerCase().includes(s) ||
        st.role.toLowerCase().includes(s) ||
        st.phone.includes(s) ||
        st.area.toLowerCase().includes(s);
      const matchR = roleFilter === "All Roles" || st.role === roleFilter;
      return matchQ && matchR;
    });
  }, [staff, q, roleFilter]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(st) {
    setEditingId(st.id);
    setForm({
      name: st.name,
      email: st.email,
      phone: st.phone,
      role: st.role,
      area: st.area,
      status: st.status,
    });
    setShowModal(true);
  }

  function submitStaff(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      showToast("Name and phone are required", "error");
      return;
    }
    if (editingId) {
      const updated = staff.map((s) =>
        s.id === editingId ? { ...s, ...form } : s
      );
      persist(updated);
      showToast(`${form.name} updated`);
    } else {
      const next = {
        id: Date.now(),
        ...form,
        email: form.email || `${form.name.split(" ")[0].toLowerCase()}@homelabgh.com`,
      };
      persist([next, ...staff]);
      showToast(`${form.name} added as ${form.role}`);
    }
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function statusColor(status) {
    if (status === "Active") return "bg-emerald-100 text-emerald-700";
    if (status === "On Leave") return "bg-amber-100 text-amber-700";
    return "bg-slate-200 text-slate-600";
  }

  const activeCount = staff.filter((s) => s.status === "Active").length;
  const scientistCount = staff.filter(
    (s) => s.role === "Lab Scientist" || s.role === "Lab Technician"
  ).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Staff Management</h1>
          <p className="text-sm text-slate-500">
            Manage staff members, roles, and assignments across the laboratory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search staff by name, role, phone..."
              className="w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <button type="button" className="rounded-xl border border-slate-200 bg-white p-2.5">
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add Staff
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Total Staff</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{staff.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <UserCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Active On Duty</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-violet-600">
            <FlaskConical className="h-5 w-5" />
            <span className="text-sm font-medium">Lab Scientists</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{scientistCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0F172A]">Staff Directory</h2>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option>All Roles</option>
            <option>Doctor</option>
            <option>Nurse</option>
            <option>Lab Scientist</option>
            <option>Rider</option>
            <option>Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-3 font-medium">Staff Name</th>
                <th className="pb-3 pr-3 font-medium">Role</th>
                <th className="pb-3 pr-3 font-medium">Phone</th>
                <th className="pb-3 pr-3 font-medium">Status</th>
                <th className="pb-3 pr-3 font-medium">Assigned Area</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((st, i) => (
                <tr key={st.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${AVATARS[i % AVATARS.length]}`}
                      >
                        {st.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{st.name}</p>
                        <p className="text-xs text-slate-400">{st.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ROLE_STYLE[st.role] || "bg-slate-100 text-slate-700"}`}>
                      {st.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600">{st.phone}</td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(st.status)}`}>
                      ● {st.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600">{st.area}</td>
                  <td className="py-3.5">
                    <div className="flex gap-1 text-slate-400">
                      <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={() => openEdit(st)}>
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 hover:bg-slate-100"
                        onClick={() => {
                          persist(staff.filter((s) => s.id !== st.id));
                          showToast(`${st.name} removed`);
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400">Showing {filtered.length} of {staff.length} staff</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={submitStaff}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">
                {editingId ? "Edit Staff" : "Add New Staff"}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Dr. Kojo Mensah"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Lab Scientist">Lab Scientist</option>
                  <option value="Rider">Rider</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Phone *</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="+233 ..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Assigned Area</label>
                <input
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Phlebotomy"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option>Active</option>
                  <option>Off Duty</option>
                  <option>On Leave</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white"
              >
                {editingId ? "Save Changes" : "Add Staff"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

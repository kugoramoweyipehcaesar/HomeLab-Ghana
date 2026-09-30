"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  FlaskConical,
  Edit2,
  MoreHorizontal,
  X,
  Trash2,
  Eye,
  Settings2,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getLocal, setLocal } from "@/lib/utils";

const SUPER_ADMIN = "kugoramoweyipehcaesar49@gmail.com";
const STAFF_KEY = "homelab_staff";
const ROLES_KEY = "homelab_roles";

const DEFAULT_ROLES = ["Doctor", "Nurse", "Lab Scientist", "Admin"];

const AREAS = [
  "Phlebotomy",
  "Sample Processing",
  "Delivery / Logistics",
  "Microbiology Lab",
  "Hematology Lab",
  "Front Desk",
  "Consultation",
  "Admin Office",
];

const ROLE_STYLE = {
  Doctor: "bg-indigo-100 text-indigo-700",
  Nurse: "bg-blue-100 text-blue-700",
  "Lab Scientist": "bg-violet-100 text-violet-700",
  Admin: "bg-slate-800 text-white",
};

const AVATARS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-slate-500",
  "bg-emerald-500",
  "bg-indigo-500",
];

const SEED = [
  {
    id: 1,
    name: "Dr. Ama Serwah",
    email: "ama.serwah@homelabgh.com",
    role: "Nurse",
    phone: "+233 24 555 1201",
    status: "Active",
    area: "Phlebotomy",
    avatar: "AS",
  },
  {
    id: 2,
    name: "Joseph Owusu",
    email: "j.owusu@homelabgh.com",
    role: "Lab Scientist",
    phone: "+233 20 331 8890",
    status: "Active",
    area: "Sample Processing",
    avatar: "JO",
  },
  {
    id: 3,
    name: "Kwame Boateng",
    email: "k.boateng@homelabgh.com",
    role: "Admin",
    phone: "+233 55 742 9931",
    status: "Off Duty",
    area: "Front Desk",
    avatar: "KB",
  },
  {
    id: 4,
    name: "Linda Dawson",
    email: "l.dawson@homelabgh.com",
    role: "Lab Scientist",
    phone: "+233 24 118 7762",
    status: "Active",
    area: "Microbiology Lab",
    avatar: "LD",
  },
  {
    id: 5,
    name: "Richard Agyapong",
    email: "richard@homelabgh.com",
    role: "Doctor",
    phone: "+233 24 123 4567",
    status: "Active",
    area: "Consultation",
    avatar: "RA",
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "Nurse",
  area: "Phlebotomy",
  status: "Active",
};

function makeAvatar(name) {
  return (name || "ST")
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminStaffPage() {
  const { showToast } = useToast();
  const [staff, setStaff] = useState(SEED);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [showRoles, setShowRoles] = useState(false);
  const [newRole, setNewRole] = useState("");

  const [menuId, setMenuId] = useState(null);
  const [viewId, setViewId] = useState(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("admin_email") || "";
    setIsSuperAdmin(email === SUPER_ADMIN);

    // Always drop Rider from roles (removed from product)
    setLocal(ROLES_KEY, DEFAULT_ROLES);
    setRoles(DEFAULT_ROLES);

    const savedStaff = getLocal(STAFF_KEY, null) || getLocal("adminStaff", null);
    if (savedStaff?.length) {
      const migrated = savedStaff.map((st) =>
        st.role === "Rider"
          ? {
              ...st,
              role: "Admin",
              area: st.area === "Delivery / Logistics" ? "Front Desk" : st.area,
            }
          : st
      );
      setStaff(migrated);
      setLocal(STAFF_KEY, migrated);
      setLocal("adminStaff", migrated);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setLocal(STAFF_KEY, staff);
    setLocal("adminStaff", staff);
  }, [staff, loaded]);

  useEffect(() => {
    if (!loaded) return;
    setLocal(ROLES_KEY, roles);
  }, [roles, loaded]);

  useEffect(() => {
    if (menuId == null) return;
    const close = () => setMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return staff.filter((st) => {
      const matchQ =
        !s ||
        st.name?.toLowerCase().includes(s) ||
        st.role?.toLowerCase().includes(s) ||
        st.phone?.includes(s) ||
        st.area?.toLowerCase().includes(s);
      const matchR = roleFilter === "All Roles" || st.role === roleFilter;
      return matchQ && matchR;
    });
  }, [staff, q, roleFilter]);

  const activeCount = staff.filter((s) => s.status === "Active").length;
  const scientistCount = staff.filter((s) => s.role === "Lab Scientist").length;

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, role: roles[0] || "Nurse" });
    setShowModal(true);
  }

  function openEdit(st) {
    setEditingId(st.id);
    setForm({
      name: st.name || "",
      email: st.email || "",
      phone: st.phone || "",
      role: st.role || roles[0],
      area: st.area || "",
      status: st.status || "Active",
    });
    setShowModal(true);
    setMenuId(null);
    setViewId(null);
  }

  function submitStaff(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.role || !form.area.trim()) {
      showToast("Fill all required fields", "error");
      return;
    }

    if (editingId != null) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                role: form.role,
                area: form.area.trim(),
                status: form.status,
                avatar: makeAvatar(form.name),
              }
            : s
        )
      );
      showToast(`Staff updated: role changed to ${form.role}`);
    } else {
      const next = {
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        area: form.area.trim(),
        status: form.status,
        avatar: makeAvatar(form.name),
      };
      setStaff((prev) => [next, ...prev]);
      showToast(`Staff added: ${next.name}`);
    }
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function toggleStatus(st) {
    const next =
      st.status === "Active" ? "Off Duty" : st.status === "Off Duty" ? "Active" : "Active";
    setStaff((prev) => prev.map((s) => (s.id === st.id ? { ...s, status: next } : s)));
    showToast(`${st.name} → ${next}`);
  }

  function deleteStaff(id) {
    if (!isSuperAdmin) {
      showToast("Only super admin can delete staff", "error");
      return;
    }
    if (!confirm("Delete this staff member?")) return;
    setStaff((prev) => prev.filter((s) => s.id !== id));
    showToast("Staff deleted");
    setMenuId(null);
    setViewId(null);
  }

  function addRole(e) {
    e.preventDefault();
    const r = newRole.trim();
    if (!r) return;
    if (roles.some((x) => x.toLowerCase() === r.toLowerCase())) {
      showToast("Role already exists", "error");
      return;
    }
    setRoles((prev) => [...prev, r]);
    setNewRole("");
    showToast("Role added");
  }

  function deleteRole(role) {
    if (!isSuperAdmin) return;
    if (staff.some((s) => s.role === role)) {
      showToast("Cannot delete — staff still assigned this role", "error");
      return;
    }
    setRoles((prev) => prev.filter((r) => r !== role));
    showToast("Role removed");
  }

  function statusColor(status) {
    if (status === "Active") return "bg-emerald-100 text-emerald-700";
    if (status === "On Leave") return "bg-amber-100 text-amber-700";
    return "bg-slate-200 text-slate-600";
  }

  const viewStaff = staff.find((s) => s.id === viewId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Staff Management</h1>
          <p className="text-sm text-slate-500">
            Manage staff members, roles, and assignments across the laboratory
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search staff by name, role, phone..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setShowRoles(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Settings2 className="h-4 w-4" /> Manage Roles
            </button>
          )}
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
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

      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0F172A]">Staff Directory</h2>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option>All Roles</option>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
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
                        {st.avatar || makeAvatar(st.name)}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{st.name}</p>
                        <p className="text-xs text-slate-400">{st.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ROLE_STYLE[st.role] || "bg-slate-100 text-slate-700"}`}
                    >
                      {st.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600">{st.phone}</td>
                  <td className="py-3.5 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleStatus(st)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(st.status)}`}
                      title="Click to toggle status"
                    >
                      ● {st.status}
                    </button>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-600">{st.area}</td>
                  <td className="py-3.5">
                    <div className="relative flex gap-1 text-slate-400">
                      <button
                        type="button"
                        className="rounded p-1.5 hover:bg-slate-100 hover:text-[#2563EB]"
                        onClick={() => openEdit(st)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === st.id ? null : st.id);
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuId === st.id && (
                        <div
                          className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                            onClick={() => {
                              setViewId(st.id);
                              setMenuId(null);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" /> View Profile
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                            onClick={() => openEdit(st)}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <div className="border-t border-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400">
                            Change Role
                          </div>
                          {roles.map((r) => (
                            <button
                              key={r}
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50"
                              onClick={() => {
                                setStaff((prev) =>
                                  prev.map((s) => (s.id === st.id ? { ...s, role: r } : s))
                                );
                                showToast(`${st.name} role → ${r}`);
                                setMenuId(null);
                              }}
                            >
                              {st.role === r ? (
                                <Check className="h-3 w-3 text-[#2563EB]" />
                              ) : (
                                <span className="w-3" />
                              )}
                              {r}
                            </button>
                          ))}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 border-t border-slate-50 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              onClick={() => deleteStaff(st.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete Staff
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No staff found</p>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Showing {filtered.length} of {staff.length} staff
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form
            onSubmit={submitStaff}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Staff Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="e.g. Dr. Ama Serwah" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="ama.serwah@homelabgh.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Phone *</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="+233 24 555 1201" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Role *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]">
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Status *</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]">
                  <option>Active</option>
                  <option>Off Duty</option>
                  <option>On Leave</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Assigned Area *</label>
                <input required list="area-list" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="Phlebotomy" />
                <datalist id="area-list">
                  {AREAS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium">Cancel</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">{editingId ? "Save Changes" : "Add Staff"}</button>
            </div>
          </form>
        </div>
      )}

      {showRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Manage Roles</h3>
              <button type="button" onClick={() => setShowRoles(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <ul className="mb-4 max-h-48 space-y-1 overflow-y-auto">
              {roles.map((r) => (
                <li key={r} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                  <span className="font-medium text-[#0F172A]">{r}</span>
                  <button type="button" onClick={() => deleteRole(r)} className="rounded p-1 text-red-500 hover:bg-red-50" title="Delete role"><Trash2 className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
            <form onSubmit={addRole} className="flex gap-2">
              <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Pharmacist" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" />
              <button type="submit" className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Add Role</button>
            </form>
          </div>
        </div>
      )}

      {viewStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Staff Profile</h3>
              <button type="button" onClick={() => setViewId(null)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">{viewStaff.avatar || makeAvatar(viewStaff.name)}</div>
              <div>
                <p className="font-bold text-[#0F172A]">{viewStaff.name}</p>
                <p className="text-xs text-slate-500">{viewStaff.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="text-slate-400">Role:</span> {viewStaff.role}</p>
              <p><span className="text-slate-400">Phone:</span> {viewStaff.phone}</p>
              <p><span className="text-slate-400">Status:</span> {viewStaff.status}</p>
              <p><span className="text-slate-400">Area:</span> {viewStaff.area}</p>
            </div>
            <button type="button" onClick={() => openEdit(viewStaff)} className="mt-5 w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">Edit Staff</button>
          </div>
        </div>
      )}
    </div>
  );
}

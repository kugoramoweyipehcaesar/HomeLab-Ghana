"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Users, UserCheck, FlaskConical, Edit2, MoreHorizontal,
  X, Trash2, Eye, Settings2, Check, Shield, Ban,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getLocal, setLocal } from "@/lib/utils";
import { SUPER_ADMIN, isProtectedAccount, isSuperAdminEmail } from "@/lib/auth";

const STAFF_KEY = "homelab_staff";
const ROLES_KEY = "homelab_roles";
const DEFAULT_ROLES = ["Super Admin", "Admin", "Doctor", "Nurse", "Lab Scientist"];
const AREAS = ["Phlebotomy", "Sample Processing", "Delivery / Logistics", "Microbiology Lab", "Hematology Lab", "Front Desk", "Consultation", "Admin Office"];
const ROLE_STYLE = { "Super Admin": "bg-amber-100 text-amber-800", Admin: "bg-slate-800 text-white", Doctor: "bg-indigo-100 text-indigo-700", Nurse: "bg-blue-100 text-blue-700", "Lab Scientist": "bg-violet-100 text-violet-700" };
const AVATARS = ["bg-blue-500", "bg-violet-500", "bg-orange-500", "bg-pink-500", "bg-slate-500", "bg-emerald-500", "bg-indigo-500"];
const SUPER_ADMIN_SEED = { id: 0, name: "Super Admin", email: SUPER_ADMIN, role: "Super Admin", phone: "+233 00 000 0000", status: "Active", area: "Admin Office", avatar: "SA", isSuperAdmin: true };
const SEED = [
  SUPER_ADMIN_SEED,
  { id: 1, name: "Dr. Ama Serwah", email: "ama.serwah@homelabgh.com", role: "Nurse", phone: "+233 24 555 1201", status: "Active", area: "Phlebotomy", avatar: "AS" },
  { id: 2, name: "Joseph Owusu", email: "j.owusu@homelabgh.com", role: "Lab Scientist", phone: "+233 20 331 8890", status: "Active", area: "Sample Processing", avatar: "JO" },
  { id: 3, name: "Kwame Boateng", email: "k.boateng@homelabgh.com", role: "Admin", phone: "+233 55 742 9931", status: "Off Duty", area: "Front Desk", avatar: "KB" },
  { id: 4, name: "Linda Dawson", email: "l.dawson@homelabgh.com", role: "Lab Scientist", phone: "+233 24 118 7762", status: "Active", area: "Microbiology Lab", avatar: "LD" },
  { id: 5, name: "Richard Agyapong", email: "richard@homelabgh.com", role: "Doctor", phone: "+233 24 123 4567", status: "Active", area: "Consultation", avatar: "RA" },
];
const EMPTY_FORM = { name: "", email: "", phone: "", role: "Nurse", area: "Phlebotomy", status: "Active" };

function makeAvatar(name) {
  return (name || "ST").replace(/^Dr\.\s*/i, "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
function ensureSuperAdmin(list) {
  const has = list.some((s) => isProtectedAccount(s));
  if (has) return list.map((s) => isProtectedAccount(s) ? { ...s, email: SUPER_ADMIN, role: "Super Admin", status: "Active", isSuperAdmin: true } : s);
  return [SUPER_ADMIN_SEED, ...list];
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
    const isAdminFlag = localStorage.getItem("isAdmin") === "true";
    setIsSuperAdmin(isSuperAdminEmail(email) || isAdminFlag);
    if (isAdminFlag && !email) localStorage.setItem("admin_email", SUPER_ADMIN);
    const savedRoles = getLocal(ROLES_KEY, null);
    if (savedRoles?.length) setRoles((savedRoles.includes("Super Admin") ? savedRoles : ["Super Admin", ...savedRoles]).filter((r) => r !== "Rider"));
    else { setLocal(ROLES_KEY, DEFAULT_ROLES); setRoles(DEFAULT_ROLES); }
    const savedStaff = getLocal(STAFF_KEY, null) || getLocal("adminStaff", null);
    if (savedStaff?.length) setStaff(ensureSuperAdmin(savedStaff));
    else { setStaff(SEED); setLocal(STAFF_KEY, SEED); }
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
      const matchQ = !s || st.name?.toLowerCase().includes(s) || st.role?.toLowerCase().includes(s) || st.phone?.includes(s) || st.email?.toLowerCase().includes(s);
      return matchQ && (roleFilter === "All Roles" || st.role === roleFilter);
    });
  }, [staff, q, roleFilter]);

  const activeCount = staff.filter((s) => s.status === "Active").length;
  const scientistCount = staff.filter((s) => s.role === "Lab Scientist").length;

  function openAdd() { setEditingId(null); setForm({ ...EMPTY_FORM, role: "Nurse" }); setShowModal(true); }
  function openEdit(st) {
    if (isProtectedAccount(st)) {
      setEditingId(st.id);
      setForm({ name: st.name || "", email: SUPER_ADMIN, phone: st.phone || "", role: "Super Admin", area: st.area || "Admin Office", status: "Active" });
      setShowModal(true); setMenuId(null); return;
    }
    setEditingId(st.id);
    setForm({ name: st.name || "", email: st.email || "", phone: st.phone || "", role: st.role || "Nurse", area: st.area || "", status: st.status || "Active" });
    setShowModal(true); setMenuId(null); setViewId(null);
  }
  function submitStaff(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) { showToast("Fill required fields", "error"); return; }
    if (editingId != null) {
      const target = staff.find((s) => s.id === editingId);
      if (isProtectedAccount(target)) {
        setStaff((prev) => prev.map((s) => s.id === editingId ? { ...s, name: form.name.trim(), phone: form.phone.trim(), area: form.area.trim() || s.area, email: SUPER_ADMIN, role: "Super Admin", status: "Active", isSuperAdmin: true } : s));
        showToast("Super admin profile updated");
      } else {
        setStaff((prev) => prev.map((s) => s.id === editingId ? { ...s, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, area: form.area.trim(), status: form.status, avatar: makeAvatar(form.name) } : s));
        showToast(`Staff updated: ${form.name}`);
      }
    } else {
      if (isSuperAdminEmail(form.email)) { showToast("Cannot create another super admin", "error"); return; }
      const next = { id: Date.now(), name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role === "Super Admin" ? "Admin" : form.role, area: form.area.trim(), status: form.status, avatar: makeAvatar(form.name) };
      setStaff((prev) => [next, ...prev]);
      showToast(`Staff added: ${next.name}`);
    }
    setShowModal(false); setEditingId(null); setForm(EMPTY_FORM);
  }
  function changeRole(st, role) {
    if (isProtectedAccount(st)) { showToast("Super admin cannot be demoted", "error"); setMenuId(null); return; }
    if (role === "Super Admin") { showToast("Cannot promote to Super Admin", "error"); return; }
    setStaff((prev) => prev.map((s) => (s.id === st.id ? { ...s, role } : s)));
    showToast(`${st.name} role → ${role}`); setMenuId(null);
  }
  function banStaff(st) {
    if (isProtectedAccount(st)) { showToast("Super admin cannot be banned", "error"); setMenuId(null); return; }
    setStaff((prev) => prev.map((s) => (s.id === st.id ? { ...s, status: "Banned" } : s)));
    showToast(`${st.name} banned`); setMenuId(null);
  }
  function unbanStaff(st) {
    setStaff((prev) => prev.map((s) => (s.id === st.id ? { ...s, status: "Active" } : s)));
    showToast(`${st.name} unbanned`); setMenuId(null);
  }
  function toggleStatus(st) {
    if (isProtectedAccount(st)) { showToast("Super admin status is always Active", "error"); return; }
    if (st.status === "Banned") { unbanStaff(st); return; }
    const next = st.status === "Active" ? "Off Duty" : "Active";
    setStaff((prev) => prev.map((s) => (s.id === st.id ? { ...s, status: next } : s)));
    showToast(`${st.name} → ${next}`);
  }
  function deleteStaff(st) {
    if (isProtectedAccount(st)) { showToast("Super admin cannot be deleted", "error"); setMenuId(null); return; }
    if (!confirm(`Delete ${st.name}?`)) return;
    setStaff((prev) => prev.filter((s) => s.id !== st.id));
    showToast("Staff deleted"); setMenuId(null); setViewId(null);
  }
  function addRole(e) {
    e.preventDefault();
    const r = newRole.trim();
    if (!r) return;
    if (r.toLowerCase() === "super admin") { showToast("Reserved role", "error"); return; }
    if (roles.some((x) => x.toLowerCase() === r.toLowerCase())) { showToast("Role exists", "error"); return; }
    setRoles((prev) => [...prev, r]); setNewRole(""); showToast("Role added");
  }
  function deleteRole(role) {
    if (role === "Super Admin") { showToast("Cannot delete Super Admin role", "error"); return; }
    if (staff.some((s) => s.role === role)) { showToast("Staff still use this role", "error"); return; }
    setRoles((prev) => prev.filter((r) => r !== role)); showToast("Role removed");
  }
  function statusColor(status) {
    if (status === "Active") return "bg-emerald-100 text-emerald-700";
    if (status === "Banned") return "bg-red-100 text-red-700";
    if (status === "On Leave") return "bg-amber-100 text-amber-700";
    return "bg-slate-200 text-slate-600";
  }
  const viewStaff = staff.find((s) => s.id === viewId);
  const editableRoles = roles.filter((r) => r !== "Super Admin");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Staff Management</h1>
          <p className="text-sm text-slate-500">Super admin cannot be banned, deleted, or demoted</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staff..." className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <button type="button" onClick={() => setShowRoles(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"><Settings2 className="h-4 w-4" /> Manage Roles</button>
          <button type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Add Staff</button>
        </div>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="mb-2 flex items-center gap-2 text-blue-600"><Users className="h-5 w-5" /><span className="text-sm font-medium">Total Staff</span></div><p className="text-4xl font-bold text-[#0F172A]">{staff.length}</p></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="mb-2 flex items-center gap-2 text-emerald-600"><UserCheck className="h-5 w-5" /><span className="text-sm font-medium">Active On Duty</span></div><p className="text-4xl font-bold text-[#0F172A]">{activeCount}</p></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="mb-2 flex items-center gap-2 text-violet-600"><FlaskConical className="h-5 w-5" /><span className="text-sm font-medium">Lab Scientists</span></div><p className="text-4xl font-bold text-[#0F172A]">{scientistCount}</p></div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0F172A]">Staff Directory</h2>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"><option>All Roles</option>{roles.map((r) => <option key={r}>{r}</option>)}</select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead><tr className="border-b text-xs uppercase tracking-wide text-slate-400"><th className="pb-3 pr-3 font-medium">Staff Name</th><th className="pb-3 pr-3 font-medium">Role</th><th className="pb-3 pr-3 font-medium">Phone</th><th className="pb-3 pr-3 font-medium">Status</th><th className="pb-3 pr-3 font-medium">Assigned Area</th><th className="pb-3 font-medium">Actions</th></tr></thead>
            <tbody>
              {filtered.map((st, i) => {
                const protected_ = isProtectedAccount(st);
                return (
                  <tr key={st.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3.5 pr-3"><div className="flex items-center gap-2.5"><div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${AVATARS[i % AVATARS.length]}`}>{st.avatar || makeAvatar(st.name)}</div><div><p className="font-medium text-[#0F172A] flex items-center gap-1">{st.name}{protected_ && <Shield className="h-3.5 w-3.5 text-amber-500" />}</p><p className="text-xs text-slate-400">{st.email}</p></div></div></td>
                    <td className="py-3.5 pr-3"><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ROLE_STYLE[st.role] || "bg-slate-100 text-slate-700"}`}>{st.role}</span></td>
                    <td className="py-3.5 pr-3 text-slate-600">{st.phone}</td>
                    <td className="py-3.5 pr-3"><button type="button" onClick={() => toggleStatus(st)} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(st.status)}`}>● {st.status}</button></td>
                    <td className="py-3.5 pr-3 text-slate-600">{st.area}</td>
                    <td className="py-3.5">
                      <div className="relative flex items-center gap-0.5 text-slate-400">
                        <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={() => openEdit(st)} title="Edit"><Edit2 className="h-4 w-4" /></button>
                        {!protected_ && (<>{st.status === "Banned" ? (<button type="button" className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50" onClick={() => unbanStaff(st)} title="Unban"><Check className="h-4 w-4" /></button>) : (<button type="button" className="rounded p-1.5 hover:bg-amber-50 hover:text-amber-700" onClick={() => banStaff(st)} title="Ban"><Ban className="h-4 w-4" /></button>)}<button type="button" className="rounded p-1.5 hover:bg-red-50 hover:text-red-600" onClick={() => deleteStaff(st)} title="Delete"><Trash2 className="h-4 w-4" /></button></>)}
                        <button type="button" className="rounded p-1.5 hover:bg-slate-100" onClick={(e) => { e.stopPropagation(); setMenuId(menuId === st.id ? null : st.id); }}><MoreHorizontal className="h-4 w-4" /></button>
                        {menuId === st.id && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setViewId(st.id); setMenuId(null); }}><Eye className="h-3.5 w-3.5" /> View</button>
                            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => openEdit(st)}><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                            {!protected_ && (<><div className="border-t px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400">Change Role</div>{editableRoles.map((r) => (<button key={r} type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50" onClick={() => changeRole(st, r)}>{st.role === r ? <Check className="h-3 w-3 text-[#2563EB]" /> : <span className="w-3" />}{r}</button>))}{st.status === "Banned" ? (<button type="button" className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm text-emerald-600" onClick={() => unbanStaff(st)}><Check className="h-3.5 w-3.5" /> Unban</button>) : (<button type="button" className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm text-amber-700" onClick={() => banStaff(st)}><Ban className="h-3.5 w-3.5" /> Ban</button>)}<button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600" onClick={() => deleteStaff(st)}><Trash2 className="h-3.5 w-3.5" /> Delete</button></>)}
                            {protected_ && <p className="border-t px-3 py-2 text-[11px] text-amber-700">Protected account</p>}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400">Showing {filtered.length} of {staff.length} staff</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form onSubmit={submitStaff} className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{editingId != null ? "Edit Staff" : "Add Staff"}</h3><button type="button" onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <div><label className="mb-1 block text-xs font-medium">Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
              <div><label className="mb-1 block text-xs font-medium">Email *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={editingId != null && isProtectedAccount(staff.find((s) => s.id === editingId))} className="w-full rounded-xl border px-3 py-2.5 text-sm disabled:bg-slate-50" /></div>
              <div><label className="mb-1 block text-xs font-medium">Phone *</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /></div>
              <div><label className="mb-1 block text-xs font-medium">Role *</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={editingId != null && isProtectedAccount(staff.find((s) => s.id === editingId))} className="w-full rounded-xl border px-3 py-2.5 text-sm disabled:bg-slate-50">{(editingId != null && isProtectedAccount(staff.find((s) => s.id === editingId)) ? ["Super Admin"] : editableRoles).map((r) => <option key={r}>{r}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-medium">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} disabled={editingId != null && isProtectedAccount(staff.find((s) => s.id === editingId))} className="w-full rounded-xl border px-3 py-2.5 text-sm disabled:bg-slate-50"><option>Active</option><option>Off Duty</option><option>On Leave</option><option>Banned</option></select></div>
              <div><label className="mb-1 block text-xs font-medium">Area</label><input list="area-list" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" /><datalist id="area-list">{AREAS.map((a) => <option key={a} value={a} />)}</datalist></div>
            </div>
            <div className="mt-5 flex gap-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border py-2.5 text-sm">Cancel</button><button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">Save</button></div>
          </form>
        </div>
      )}

      {showRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">Manage Roles</h3><button type="button" onClick={() => setShowRoles(false)}><X className="h-5 w-5" /></button></div>
            <ul className="mb-4 max-h-48 space-y-1 overflow-y-auto">{roles.map((r) => (<li key={r} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"><span>{r}{r === "Super Admin" ? " (locked)" : ""}</span>{r !== "Super Admin" && <button type="button" onClick={() => deleteRole(r)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>}</li>))}</ul>
            <form onSubmit={addRole} className="flex gap-2"><input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role" className="flex-1 rounded-xl border px-3 py-2 text-sm" /><button type="submit" className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Add</button></form>
          </div>
        </div>
      )}

      {viewStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex justify-between"><h3 className="text-lg font-bold">Staff Profile</h3><button type="button" onClick={() => setViewId(null)}><X className="h-5 w-5" /></button></div>
            <p className="font-bold">{viewStaff.name}</p>
            <p className="text-xs text-slate-500">{viewStaff.email}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-600"><p>Role: {viewStaff.role}</p><p>Phone: {viewStaff.phone}</p><p>Status: {viewStaff.status}</p><p>Area: {viewStaff.area}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

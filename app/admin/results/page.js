"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Upload,
  Clock,
  CheckCircle2,
  FileUp,
  X,
  Eye,
  Shield,
  Download,
  Edit2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const STORAGE_KEY = "homelab_results";
const SUPER_ADMIN = "kugoramoweyipehcaesar49@gmail.com";
const VIEW_CODE = "106585";

const INITIAL = [
  {
    id: 1,
    client: "Ama Boateng",
    test: "PCR Test",
    date: "Oct 14, 2024",
    status: "pending_upload",
    file: null,
    notes: "",
    uploadedBy: null,
    uploadDate: null,
    lastUpdated: null,
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
  },
  {
    id: 2,
    client: "Kwame Asamoah",
    test: "Blood Panel",
    date: "Oct 13, 2024",
    status: "completed",
    file: "Kwame_BloodPanel_Oct13.pdf",
    notes: "Results within normal range",
    uploadedBy: "Dr. Kojo Mensah",
    uploadDate: "Oct 13, 2024",
    lastUpdated: "Oct 13, 2024 - 2:30 PM",
    approvedBy: SUPER_ADMIN,
    approvedAt: "Oct 13, 2024",
    rejectReason: null,
  },
  {
    id: 3,
    client: "Esi Mensah",
    test: "COVID Test",
    date: "Oct 12, 2024",
    status: "pending_approval",
    file: "Esi_COVID_Oct12.pdf",
    notes: "Awaiting super admin review",
    uploadedBy: "Dr. Kojo Mensah",
    uploadDate: "Oct 12, 2024",
    lastUpdated: "Oct 12, 2024 - 4:10 PM",
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
    awaiting: SUPER_ADMIN,
  },
  {
    id: 4,
    client: "John Opoku",
    test: "Malaria Test",
    date: "Oct 12, 2024",
    status: "pending_upload",
    file: null,
    notes: "",
    uploadedBy: null,
    uploadDate: null,
    lastUpdated: null,
    approvedBy: null,
    approvedAt: null,
    rejectReason: null,
  },
];

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function nowStamp() {
  const d = new Date();
  return (
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " - " +
    d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" })
  );
}

function statusBadge(status) {
  if (status === "pending_upload")
    return { label: "Pending Upload", className: "bg-amber-100 text-amber-700" };
  if (status === "completed")
    return { label: "Completed", className: "bg-emerald-100 text-emerald-700" };
  if (status === "pending_approval")
    return { label: "Pending Approval from Super Admin", className: "bg-blue-100 text-blue-700" };
  return { label: status, className: "bg-slate-100 text-slate-600" };
}

export default function AdminResultsPage() {
  const { showToast } = useToast();
  const uploadFileRef = useRef(null);

  const [results, setResults] = useState(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState("");

  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeTargetId, setCodeTargetId] = useState(null);

  const [viewId, setViewId] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editFile, setEditFile] = useState(null);

  const currentUserEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_email") || "Dr. Kojo Mensah"
      : "Dr. Kojo Mensah";
  const isSuperAdmin = currentUserEmail === SUPER_ADMIN;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setResults(parsed);
      }
    } catch {
      /* keep initial */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch {
      /* ignore */
    }
  }, [results, loaded]);

  const stats = useMemo(() => {
    const pending = results.filter((r) => r.status === "pending_upload").length;
    const completed = results.filter((r) => r.status === "completed").length;
    const pendingApproval = results.filter((r) => r.status === "pending_approval").length;
    const today = todayLabel();
    const uploadedToday = results.filter(
      (r) => r.uploadDate && (r.uploadDate === today || r.uploadDate.includes(today.split(",")[0]))
    ).length;
    return { pending, completed, pendingApproval, uploadedToday };
  }, [results]);

  const filtered = useMemo(() => {
    let list = results;
    if (tab === "pending_upload") list = list.filter((r) => r.status === "pending_upload");
    if (tab === "completed") list = list.filter((r) => r.status === "completed");
    if (tab === "pending_approval") list = list.filter((r) => r.status === "pending_approval");
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) => r.client?.toLowerCase().includes(q) || r.test?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [results, tab, search]);

  function validatePdf(file) {
    if (!file) return false;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are allowed", "error");
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast("Max file size is 20MB", "error");
      return false;
    }
    return true;
  }

  function openUpload(row) {
    setUploadTarget(row);
    setUploadFile(null);
    setUploadNotes("");
  }

  function submitUpload(e) {
    e.preventDefault();
    if (!uploadTarget) return;
    if (!uploadFile) {
      showToast("Select a PDF file", "error");
      return;
    }
    setResults((prev) =>
      prev.map((r) =>
        r.id === uploadTarget.id
          ? {
              ...r,
              status: "pending_approval",
              file: uploadFile.name,
              notes: uploadNotes.trim(),
              uploadedBy: currentUserEmail,
              uploadDate: todayLabel(),
              lastUpdated: nowStamp(),
              awaiting: SUPER_ADMIN,
              rejectReason: null,
            }
          : r
      )
    );
    showToast("Result uploaded - sent to super admin for approval");
    setUploadTarget(null);
    setUploadFile(null);
    setUploadNotes("");
  }

  function requestView(id) {
    setCodeTargetId(id);
    setCode("");
    setCodeError("");
    setCodeOpen(true);
  }

  function unlockView(e) {
    e.preventDefault();
    if (code !== VIEW_CODE) {
      setCodeError("Invalid code");
      return;
    }
    setCodeOpen(false);
    setViewId(codeTargetId);
    setCode("");
    setCodeError("");
  }

  function approveResult(id) {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "completed",
              approvedBy: currentUserEmail,
              approvedAt: nowStamp(),
              lastUpdated: nowStamp(),
            }
          : r
      )
    );
    showToast("Result approved");
  }

  function rejectResult(id) {
    const reason = prompt("Rejection reason (optional):") || "Rejected";
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "pending_upload",
              file: null,
              rejectReason: reason,
              lastUpdated: nowStamp(),
              approvedBy: null,
              approvedAt: null,
            }
          : r
      )
    );
    showToast("Result rejected — back to pending upload");
    setViewId(null);
  }

  function openEdit(row) {
    setEditId(row.id);
    setEditNotes(row.notes || "");
    setEditFile(null);
  }

  function submitEdit(e) {
    e.preventDefault();
    setResults((prev) =>
      prev.map((r) =>
        r.id === editId
          ? {
              ...r,
              notes: editNotes.trim(),
              file: editFile ? editFile.name : r.file,
              status: editFile ? "pending_approval" : r.status,
              uploadedBy: editFile ? currentUserEmail : r.uploadedBy,
              uploadDate: editFile ? todayLabel() : r.uploadDate,
              lastUpdated: nowStamp(),
              awaiting: editFile ? SUPER_ADMIN : r.awaiting,
            }
          : r
      )
    );
    showToast("Result updated");
    setEditId(null);
    setEditFile(null);
  }

  const viewRow = results.find((r) => r.id === viewId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Results Upload</h1>
          <p className="text-sm text-slate-500">Upload and verify lab results from partner clinics</p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or test..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <div className="rounded-xl bg-amber-50 p-2">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Pending Results</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{stats.pending}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting verification</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <div className="rounded-xl bg-emerald-50 p-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Completed Uploads</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{stats.completed}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <div className="rounded-xl bg-blue-50 p-2">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Pending Approval</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{stats.pendingApproval}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting approval</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-violet-600">
            <div className="rounded-xl bg-violet-50 p-2">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Uploaded Today</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{stats.uploadedToday}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "pending_upload", label: "Pending Uploads" },
            { key: "completed", label: "Completed Uploads" },
            { key: "pending_approval", label: "Pending Approval" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                tab === t.key
                  ? "bg-[#2563EB] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-3 font-medium">Client Name</th>
                <th className="pb-3 pr-3 font-medium">Test Type</th>
                <th className="pb-3 pr-3 font-medium">Booking Date</th>
                <th className="pb-3 pr-3 font-medium">Status</th>
                <th className="pb-3 pr-3 font-medium">Uploaded File</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const badge = statusBadge(r.status);
                return (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3.5 pr-3 font-medium text-[#0F172A]">{r.client}</td>
                    <td className="py-3.5 pr-3 text-slate-600">{r.test}</td>
                    <td className="py-3.5 pr-3 text-slate-600">{r.date}</td>
                    <td className="py-3.5 pr-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 text-slate-500">
                      {r.file ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <FileText className="h-3.5 w-3.5" /> {r.file}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-2">
                        {r.status === "pending_upload" && (
                          <button
                            type="button"
                            onClick={() => openUpload(r)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-2.5 py-1.5 text-xs font-semibold text-white"
                          >
                            <Upload className="h-3.5 w-3.5" /> Upload Results
                          </button>
                        )}
                        {(r.status === "completed" || r.status === "pending_approval") && (
                          <button
                            type="button"
                            onClick={() => requestView(r.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-50"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Results
                          </button>
                        )}
                        {r.status === "pending_approval" && (
                          <button
                            type="button"
                            onClick={() => approveResult(r.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No results found</p>
          )}
        </div>
      </div>

      {/* Upload modal (per-row) */}
      {uploadTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <form
            onSubmit={submitUpload}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Upload Results</h3>
                <p className="text-xs text-slate-500">PDF will be sent for approval</p>
              </div>
              <button type="button" onClick={() => setUploadTarget(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Client</p>
                <p className="font-medium text-[#0F172A]">{uploadTarget.client}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Test</p>
                <p className="font-medium text-[#0F172A]">{uploadTarget.test}</p>
              </div>
            </div>
            <input
              ref={uploadFileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (validatePdf(f)) setUploadFile(f);
              }}
            />
            <div
              className="mb-3 cursor-pointer rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-6 text-center"
              onClick={() => uploadFileRef.current?.click()}
            >
              <FileUp className="mx-auto mb-2 h-6 w-6 text-[#2563EB]" />
              <p className="text-sm font-medium text-[#0F172A]">
                {uploadFile ? uploadFile.name : "Drag & drop or browse PDF"}
              </p>
              <p className="text-xs text-slate-500">PDF only · max 20MB</p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-700">Notes</label>
              <textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] resize-none"
                placeholder="Optional notes…"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setUploadTarget(null)} className="flex-1 rounded-xl border py-2.5 text-sm">
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">
                Upload & Send for Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security code */}
      {codeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={unlockView} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-lg font-bold text-[#0F172A]">Enter Security Code</h3>
              </div>
              <button type="button" onClick={() => setCodeOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-500">Enter code to view results</p>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError("");
              }}
              placeholder="Enter code"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
              autoFocus
            />
            {codeError && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> {codeError}
              </p>
            )}
            <button type="submit" className="mt-4 w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">
              Unlock
            </button>
          </form>
        </div>
      )}

      {/* Viewer */}
      {viewRow && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Results Viewer</h3>
              <button type="button" onClick={() => setViewId(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {viewRow.status === "pending_approval" && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                Awaiting approval from Super Admin: {SUPER_ADMIN}
              </div>
            )}

            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="text-slate-400">Client:</span>{" "}
                <strong className="text-[#0F172A]">{viewRow.client}</strong>
              </p>
              <p>
                <span className="text-slate-400">Test:</span>{" "}
                <strong className="text-[#0F172A]">{viewRow.test}</strong>
              </p>
              <p>
                <span className="text-slate-400">File:</span> {viewRow.file || "—"}
              </p>
              <p>
                <span className="text-slate-400">Uploaded by:</span> {viewRow.uploadedBy || "—"}
              </p>
              <p>
                <span className="text-slate-400">Date:</span> {viewRow.uploadDate || "—"}
              </p>
              {viewRow.lastUpdated && (
                <p className="text-xs text-slate-500">Last updated: {viewRow.lastUpdated}</p>
              )}
              {viewRow.notes && <p className="text-slate-600">Notes: {viewRow.notes}</p>}
            </div>

            <div className="mb-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
              <div className="text-center">
                <FileText className="mx-auto mb-2 h-8 w-8" />
                PDF preview: {viewRow.file || "No file"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  openEdit(viewRow);
                  setViewId(null);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit / Update Result
              </button>
              {viewRow.status === "pending_approval" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      approveResult(viewRow.id);
                      setViewId(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve Result
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectResult(viewRow.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => showToast(viewRow.file ? `Downloading ${viewRow.file}` : "No file")}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </button>
              <button
                type="button"
                onClick={() => setViewId(null)}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submitEdit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Edit / Update Result</h3>
              <button type="button" onClick={() => setEditId(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium">Replace PDF (optional)</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (validatePdf(f)) setEditFile(f);
                }}
                className="w-full text-sm"
              />
              {editFile && <p className="mt-1 text-xs text-slate-500">{editFile.name}</p>}
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditId(null)} className="flex-1 rounded-xl border py-2.5 text-sm">
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">
                Save Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

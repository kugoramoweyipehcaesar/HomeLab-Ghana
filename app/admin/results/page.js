"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  Upload,
  Clock,
  CheckCircle2,
  FileUp,
  X,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getLocal, setLocal } from "@/lib/utils";

const SEED_UPLOADS = [
  { id: 1, clinic: "Acme Clinic", test: "CBC Panel", size: "2.4 MB", status: "uploading", progress: 65 },
  { id: 2, clinic: "Northshore Med", test: "Lipid Panel", size: "1.8 MB", status: "pending" },
  { id: 3, clinic: "CityCare Labs", test: "COVID-19 PCR", size: "3.1 MB", status: "completed" },
];

const SEED_APPROVAL = [
  { id: "RES-10284", client: "Acme Clinic", test: "CBC Panel", uploaded: "Today, 10:32 AM", status: "Ready for Review" },
  { id: "RES-10281", client: "Northshore Med", test: "Lipid Panel", uploaded: "Today, 09:15 AM", status: "Ready for Review" },
  { id: "RES-10277", client: "CityCare Labs", test: "COVID-19 PCR", uploaded: "Today, 08:41 AM", status: "Verified" },
];

export default function AdminResultsPage() {
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const [uploads, setUploads] = useState(SEED_UPLOADS);
  const [approvals, setApprovals] = useState(SEED_APPROVAL);
  const [dragging, setDragging] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [meta, setMeta] = useState({ client: "", test: "", fileName: "" });

  useEffect(() => {
    const u = getLocal("adminUploads", null);
    const a = getLocal("adminApprovals", null);
    if (u?.length) setUploads(u);
    if (a?.length) setApprovals(a);
  }, []);

  function approve(id) {
    const next = approvals.map((r) =>
      r.id === id ? { ...r, status: "Verified" } : r
    );
    setApprovals(next);
    setLocal("adminApprovals", next);

    const bookings = getLocal("bookings", []);
    if (bookings.length) {
      const updated = bookings.map((b, i) =>
        i === 0 ? { ...b, status: "Ready" } : b
      );
      setLocal("bookings", updated);
    }
    showToast(`${id} approved — client notified`);
  }

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are allowed", "error");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast("Max file size is 20MB", "error");
      return;
    }
    setMeta((m) => ({
      ...m,
      fileName: file.name,
      test: m.test || file.name.replace(/\.pdf$/i, ""),
    }));
    setShowForm(true);
  }

  function confirmUpload(e) {
    e.preventDefault();
    const id = Date.now();
    const sizeMb = "1.2 MB";
    const newUpload = {
      id,
      clinic: meta.client || "HomeLab Upload",
      test: meta.test || meta.fileName,
      size: sizeMb,
      status: "uploading",
      progress: 0,
    };
    const nextUploads = [newUpload, ...uploads];
    setUploads(nextUploads);
    setLocal("adminUploads", nextUploads);
    setShowForm(false);
    showToast(`Uploading ${meta.fileName}…`);

    let progress = 0;
    const timer = setInterval(() => {
      progress += 25;
      setUploads((prev) => {
        const u = prev.map((x) =>
          x.id === id
            ? {
                ...x,
                progress,
                status: progress >= 100 ? "completed" : "uploading",
              }
            : x
        );
        setLocal("adminUploads", u);
        return u;
      });
      if (progress >= 100) {
        clearInterval(timer);
        const resId = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
        const approval = {
          id: resId,
          client: meta.client || "HomeLab Upload",
          test: meta.test || meta.fileName,
          uploaded: "Just now",
          status: "Ready for Review",
        };
        setApprovals((prev) => {
          const a = [approval, ...prev];
          setLocal("adminApprovals", a);
          return a;
        });
        showToast("Upload complete — pending approval");
        setMeta({ client: "", test: "", fileName: "" });
      }
    }, 400);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Results Upload</h1>
          <p className="text-sm text-slate-500">
            Upload and verify lab results from partner clinics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search..." className="w-40 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm sm:w-52" />
          </div>
          <button type="button" className="relative rounded-xl border border-slate-200 bg-white p-2.5">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {approvals.filter((a) => a.status !== "Verified").length}
            </span>
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <div className="rounded-xl bg-amber-50 p-2">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Pending Results</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">
            {approvals.filter((a) => a.status !== "Verified").length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Awaiting verification</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-emerald-600">
            <div className="rounded-xl bg-emerald-50 p-2">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Uploaded Today</span>
          </div>
          <p className="text-4xl font-bold text-[#0F172A]">{uploads.length}</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-[#0F172A]">Upload Lab Results</h2>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging ? "border-[#2563EB] bg-blue-100" : "border-blue-200 bg-blue-50/50"
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FileUp className="h-6 w-6 text-[#2563EB]" />
          </div>
          <p className="font-semibold text-[#0F172A]">Drag & drop your lab results PDF here</p>
          <p className="mt-1 text-sm text-[#2563EB] underline">or click to browse</p>
          <p className="mt-2 text-xs text-slate-500">
            Supported: PDF only · Max file size 20MB · Encrypted & HIPAA compliant
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white"
          >
            Browse Files
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-[#0F172A]">
            Pending Uploads{" "}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{uploads.length}</span>
          </h3>
          <div className="space-y-3">
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {(u.clinic || "UP").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{u.clinic}</p>
                    <p className="text-xs text-slate-500">{u.test} · {u.size}</p>
                  </div>
                </div>
                <div>
                  {u.status === "uploading" && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      Uploading {u.progress || 0}%
                    </span>
                  )}
                  {u.status === "pending" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                  )}
                  {u.status === "completed" && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Completed</span>
                  )}
                  {u.status === "failed" && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[#0F172A]">Results Pending Approval</h3>
            <span className="text-xs text-slate-400">{approvals.length} results</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="pb-2 pr-2 font-medium">Result ID</th>
                  <th className="pb-2 pr-2 font-medium">Client</th>
                  <th className="pb-2 pr-2 font-medium">Test</th>
                  <th className="pb-2 pr-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-2 font-medium text-[#0F172A]">{r.id}</td>
                    <td className="py-2.5 pr-2 text-slate-600">{r.client}</td>
                    <td className="py-2.5 pr-2 text-slate-600">{r.test}</td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "Verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {r.status !== "Verified" ? (
                        <button
                          type="button"
                          onClick={() => approve(r.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-2 py-1 text-[10px] font-semibold text-white"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={confirmUpload} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Confirm Upload</h3>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-500">File: <strong>{meta.fileName}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Client / Clinic</label>
                <input
                  value={meta.client}
                  onChange={(e) => setMeta({ ...meta, client: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="e.g. Accra Home Visit"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Test Type</label>
                <input
                  value={meta.test}
                  onChange={(e) => setMeta({ ...meta, test: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="e.g. Full Blood Count"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white">
                Upload & Queue
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

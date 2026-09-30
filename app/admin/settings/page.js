"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getLocal, setLocal } from "@/lib/utils";

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        on ? "bg-[#2563EB]" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          on ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [labName, setLabName] = useState("HomeLab GH Laboratory Service");
  const [regNo, setRegNo] = useState("GHS-LAB-024817");
  const [email, setEmail] = useState("admin@homelabgh.com");
  const [phone, setPhone] = useState("+233 30 245 6789");
  const [address, setAddress] = useState("No. 12 Labone Crescent, Labone, Accra, Ghana");
  const [momoEnabled, setMomoEnabled] = useState(true);
  const [bankEnabled, setBankEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(true);
  const [provider, setProvider] = useState("MTN MoMo");
  const [merchantId, setMerchantId] = useState("MOMO*HLGH*001924");
  const [bankName, setBankName] = useState("GCB Bank");
  const [accountName, setAccountName] = useState("HomeLab GH Ltd");
  const [accountNumber, setAccountNumber] = useState("1234567890");
  const [branch, setBranch] = useState("Accra Main");
  const [autoReconcile, setAutoReconcile] = useState(true);
  const [hours, setHours] = useState({ weekday: true, saturday: true, sunday: false });
  const [roles, setRoles] = useState({ twofa: true, techEdit: false, staffHistory: true });
  const [notif, setNotif] = useState({ email: true, sms: true, criticalOnly: true });
  const [privacy, setPrivacy] = useState({ export: true, consent: true, retention: "1825" });

  useEffect(() => {
    const s = getLocal("adminSettings", null);
    if (!s) return;
    if (s.labName) setLabName(s.labName);
    if (s.regNo) setRegNo(s.regNo);
    if (s.email) setEmail(s.email);
    if (s.phone) setPhone(s.phone);
    if (s.address) setAddress(s.address);
    if (s.momoEnabled !== undefined) setMomoEnabled(s.momoEnabled);
    if (s.bankEnabled !== undefined) setBankEnabled(s.bankEnabled);
    if (s.cashEnabled !== undefined) setCashEnabled(s.cashEnabled);
    if (s.provider) setProvider(s.provider);
    if (s.merchantId) setMerchantId(s.merchantId);
    if (s.bankName) setBankName(s.bankName);
    if (s.accountName) setAccountName(s.accountName);
    if (s.accountNumber) setAccountNumber(s.accountNumber);
    if (s.branch) setBranch(s.branch);
    if (s.autoReconcile !== undefined) setAutoReconcile(s.autoReconcile);
    if (s.hours) setHours(s.hours);
    if (s.roles) setRoles(s.roles);
    if (s.notif) setNotif(s.notif);
    if (s.privacy) setPrivacy(s.privacy);
  }, []);

  function save() {
    const payload = {
      labName,
      regNo,
      email,
      phone,
      address,
      momoEnabled,
      bankEnabled,
      cashEnabled,
      provider,
      merchantId,
      bankName,
      accountName,
      accountNumber,
      branch,
      autoReconcile,
      hours,
      roles,
      notif,
      privacy,
      paymentMethods: {
        momo: momoEnabled,
        bankTransfer: bankEnabled,
        cash: cashEnabled,
      },
    };
    setLocal("adminSettings", payload);
    setLocal("paymentOptions", {
      momo: momoEnabled,
      bankTransfer: bankEnabled,
      cash: cashEnabled,
      bank: { bankName, accountName, accountNumber, branch },
      momo: { provider, merchantId },
    });
    showToast("Settings saved — payment options updated");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage laboratory preferences, payments (MoMo + Bank Transfer), and system config
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
            Discard
          </button>
          <button type="button" onClick={save} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">
            ✓ Save Changes
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-[#0F172A]">Business Information</h2>
          <p className="mb-4 text-xs text-slate-500">Update your lab&apos;s business details</p>
          <div className="space-y-3">
            <Field label="Laboratory Name" value={labName} onChange={setLabName} />
            <Field label="Registration No (GHS)" value={regNo} onChange={setRegNo} />
            <Field label="Email Address" value={email} onChange={setEmail} />
            <Field label="Phone Number" value={phone} onChange={setPhone} />
            <Field label="Business Address" value={address} onChange={setAddress} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-[#0F172A]">Payment Settings</h2>
          <p className="mb-4 text-xs text-slate-500">Mobile Money, Bank Transfer & Cash</p>

          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Mobile Money</p>
              <p className="text-xs text-slate-500">MTN, Vodafone, AirtelTigo</p>
            </div>
            <Toggle on={momoEnabled} onChange={setMomoEnabled} />
          </div>
          {momoEnabled && (
            <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3">
              <label className="block text-xs font-medium">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option>MTN MoMo</option>
                <option>Vodafone Cash</option>
                <option>AirtelTigo Money</option>
              </select>
              <Field label="Merchant ID" value={merchantId} onChange={setMerchantId} />
            </div>
          )}

          <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-sm font-medium">Enable Bank Transfer</p>
              <p className="text-xs text-slate-500">Clients pay via bank deposit / transfer</p>
            </div>
            <Toggle on={bankEnabled} onChange={setBankEnabled} />
          </div>
          {bankEnabled && (
            <div className="mb-4 space-y-2 rounded-xl bg-blue-50/50 p-3">
              <Field label="Bank Name" value={bankName} onChange={setBankName} />
              <Field label="Account Name" value={accountName} onChange={setAccountName} />
              <Field label="Account Number" value={accountNumber} onChange={setAccountNumber} />
              <Field label="Branch" value={branch} onChange={setBranch} />
            </div>
          )}

          <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-sm font-medium">Enable Cash on Collection</p>
              <p className="text-xs text-slate-500">Pay phlebotomist at home visit</p>
            </div>
            <Toggle on={cashEnabled} onChange={setCashEnabled} />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-sm font-medium">Auto-Reconcile Payments</p>
              <p className="text-xs text-slate-500">Match daily MoMo & bank transactions</p>
            </div>
            <Toggle on={autoReconcile} onChange={setAutoReconcile} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-[#0F172A]">Lab Hours</h2>
          <p className="mb-4 text-xs text-slate-500">Operating hours for sample collection</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Monday – Friday</p>
                <p className="text-xs text-slate-500">08:00 AM – 06:00 PM</p>
              </div>
              <Toggle on={hours.weekday} onChange={(v) => setHours((h) => ({ ...h, weekday: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Saturday</p>
                <p className="text-xs text-slate-500">09:00 AM – 02:00 PM</p>
              </div>
              <Toggle on={hours.saturday} onChange={(v) => setHours((h) => ({ ...h, saturday: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sunday</p>
                <p className="text-xs text-slate-400">Closed</p>
              </div>
              <Toggle on={hours.sunday} onChange={(v) => setHours((h) => ({ ...h, sunday: v }))} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-[#0F172A]">User Roles & Permissions</h2>
          <p className="mb-4 text-xs text-slate-500">Staff access controls</p>
          <div className="space-y-3">
            <RowToggle title="Require 2FA for Admins" desc="Enforce two-factor for admins" on={roles.twofa} onChange={(v) => setRoles((r) => ({ ...r, twofa: v }))} />
            <RowToggle title="Allow Technicians to Edit Results" desc="Before final approval" on={roles.techEdit} onChange={(v) => setRoles((r) => ({ ...r, techEdit: v }))} />
            <RowToggle title="Allow Staff to View Patient History" desc="Access history records" on={roles.staffHistory} onChange={(v) => setRoles((r) => ({ ...r, staffHistory: v }))} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-[#0F172A]">Notification Settings</h2>
          <div className="mt-3 space-y-3">
            <RowToggle title="Email Notifications" desc="New tests and results" on={notif.email} onChange={(v) => setNotif((n) => ({ ...n, email: v }))} />
            <RowToggle title="SMS Alerts" desc="Completed results to patients" on={notif.sms} onChange={(v) => setNotif((n) => ({ ...n, sms: v }))} />
            <RowToggle title="Critical Results Only" desc="Critical/abnormal only" on={notif.criticalOnly} onChange={(v) => setNotif((n) => ({ ...n, criticalOnly: v }))} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-[#0F172A]">Data & Privacy</h2>
          <div className="mt-3 space-y-3">
            <RowToggle title="Enable Data Export" desc="CSV or Excel" on={privacy.export} onChange={(v) => setPrivacy((p) => ({ ...p, export: v }))} />
            <RowToggle title="Patient Consent Required" desc="Before sharing externally" on={privacy.consent} onChange={(v) => setPrivacy((p) => ({ ...p, consent: v }))} />
            <div>
              <label className="mb-1 block text-sm font-medium">Data Retention Period (days)</label>
              <input value={privacy.retention} onChange={(e) => setPrivacy((p) => ({ ...p, retention: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-slate-400">Ghana Data Protection Act (Act 843)</p>
            </div>
          </div>
        </section>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Secure · Encrypted · Ghana Data Protection Act compliant · Payment methods: MoMo{bankEnabled ? " · Bank Transfer" : ""}{cashEnabled ? " · Cash" : ""}
      </p>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
      />
    </div>
  );
}

function RowToggle({ title, desc, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[#0F172A]">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconBriefcase, IconClipboardList, IconFactory, IconPackage, IconPlus, IconWrench, IconX } from "../icons/Icons";
import SectionPanel from "./cards/SectionPanel";
import type { AssetFlowSection } from "@/app/lib/assetflow-roles";
import { createAssetRequest, listMyAssetRequests, type AssetRequestItem } from "@/app/lib/imsApi";

type Props = {
  section: AssetFlowSection;
  backHref: string;
  title: string;
  subtitle: string;
};

type RequestTemplate = {
  name: string;
  category: string;
  quantity: number;
  purpose: string;
  icon: "chair" | "cpu" | "table" | "laptop" | "monitor" | "desk";
};

const REQUEST_TEMPLATES: RequestTemplate[] = [
  { name: "Office Chair", category: "Furniture", quantity: 1, purpose: "Ergonomic seating for daily workstation use.", icon: "chair" },
  { name: "CPU Tower", category: "Electronics", quantity: 1, purpose: "Primary office desktop setup.", icon: "cpu" },
  { name: "Desktop Monitor", category: "Electronics", quantity: 1, purpose: "Dual-screen productivity setup.", icon: "monitor" },
  { name: "Work Desk", category: "Furniture", quantity: 1, purpose: "Compact workstation desk.", icon: "desk" },
  { name: "Office Table", category: "Furniture", quantity: 1, purpose: "Shared meeting or workspace table.", icon: "table" },
  { name: "Laptop", category: "Electronics", quantity: 1, purpose: "Portable device for field or remote work.", icon: "laptop" },
];

const ASSIGNED_ASSETS = [
  { tag: "ASSET-214", name: "Laptop Pro 14", status: "Assigned", category: "Electronics", note: "Primary work device" },
  { tag: "ASSET-336", name: "Wireless Mouse", status: "Assigned", category: "Accessories", note: "Desk accessory" },
  { tag: "ASSET-509", name: "Headset", status: "Assigned", category: "Accessories", note: "Calls and meetings" },
];

function iconForTemplate(icon: RequestTemplate["icon"]) {
  switch (icon) {
    case "chair":
      return <IconBriefcase size={16} />;
    case "cpu":
      return <IconPackage size={16} />;
    case "table":
      return <IconFactory size={16} />;
    case "monitor":
      return <IconClipboardList size={16} />;
    case "desk":
      return <IconPackage size={16} />;
    case "laptop":
    default:
      return <IconWrench size={16} />;
  }
}

function statusTone(status: AssetRequestItem["status"]) {
  if (status === "Approved") return "bg-emerald-50 text-emerald-700";
  if (status === "Rejected") return "bg-rose-50 text-rose-700";
  if (status === "Fulfilled") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function statusLabel(status: AssetRequestItem["status"]) {
  if (status === "Fulfilled") return "Fulfilled";
  return status;
}

function numberFormat(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default function EmployeeWorkspacePage({ section, backHref, title, subtitle }: Props) {
  const [requests, setRequests] = useState<AssetRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    itemName: "",
    category: "",
    quantity: 1,
    purpose: "",
    location: "Employee workstation",
  });

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await listMyAssetRequests();
      setRequests(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to load requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = useMemo(() => requests.filter((item) => item.status === "Pending").length, [requests]);
  const approvedCount = useMemo(() => requests.filter((item) => item.status === "Approved").length, [requests]);
  const fulfilledCount = useMemo(() => requests.filter((item) => item.status === "Fulfilled").length, [requests]);

  const heading = section === "my-assets" ? "Request workspace assets" : section === "bookings" ? "Reserve work essentials" : section === "maintenance" ? "Raise a service request" : section === "notifications" ? "Keep your workspace updated" : "Manage your profile";

  const onTemplateClick = (template: RequestTemplate) => {
    setForm({
      itemName: template.name,
      category: template.category,
      quantity: template.quantity,
      purpose: template.purpose,
      location: "Employee workstation",
    });
    setModalOpen(true);
    setMessage("");
  };

  const submitRequest = async () => {
    if (!form.itemName.trim()) {
      setMessage("Please select or enter an asset name.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      await createAssetRequest({
        itemName: form.itemName.trim(),
        category: form.category.trim() || undefined,
        quantity: form.quantity,
        purpose: form.purpose.trim() || undefined,
        location: form.location.trim() || undefined,
      });
      setModalOpen(false);
      setForm({ itemName: "", category: "", quantity: 1, purpose: "", location: "Employee workstation" });
      await loadRequests();
      setMessage("Request submitted successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="glass-panel soft-shadow rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#5b3df5]/30 hover:text-[#5b3df5]"
          >
            <IconArrowLeft size={14} />
            Back to dashboard
          </Link>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#5b3df5]/20 bg-[#5b3df5]/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#5b3df5]">
            Employee live workspace
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5b3df5] px-4 py-3 text-sm font-bold text-white shadow-[0_18px_30px_rgba(91,61,245,0.26)] transition hover:brightness-110"
        >
          <IconPlus size={16} />
          Request asset
        </button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          { label: "Requests", value: numberFormat(requests.length), hint: "Your total submissions" },
          { label: "Pending", value: numberFormat(pendingCount), hint: "Waiting for approval" },
          { label: "Approved", value: numberFormat(approvedCount + fulfilledCount), hint: "Ready or fulfilled" },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-2 text-sm text-slate-500">{item.hint}</div>
          </div>
        ))}
      </div>

      {message && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionPanel title={heading} subtitle={section === "my-assets" ? "Pick a template or request a new item directly." : "A compact action panel for the employee workspace."}>
          <div className="grid gap-3 sm:grid-cols-2">
            {REQUEST_TEMPLATES.map((template) => (
              <button
                key={template.name}
                type="button"
                onClick={() => onTemplateClick(template)}
                className="rounded-[1.35rem] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#5b3df5]/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#5b3df5]">
                      {iconForTemplate(template.icon)}
                      Quick add
                    </div>
                    <div className="mt-3 text-base font-black text-slate-900">{template.name}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-2 text-slate-500">{template.quantity}x</div>
                </div>
                <div className="mt-2 text-sm text-slate-600">{template.purpose}</div>
              </button>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Recent requests" subtitle="Live MongoDB request history">
          <div className="grid gap-3">
            {loading ? (
              <div className="grid gap-3">
                <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
                <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
              </div>
            ) : requests.length ? (
              requests.map((item) => (
                <div key={item.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.itemName}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {item.quantity}x {item.category}
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  {(item.purpose || item.location) && (
                    <div className="mt-2 text-sm leading-6 text-slate-500">
                      {item.purpose}
                      {item.location ? ` • ${item.location}` : ""}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 p-6 text-sm leading-7 text-slate-600">
                No requests yet. Use <span className="font-semibold text-slate-900">Request asset</span> to submit a chair, CPU, office chair, or any other item.
              </div>
            )}
          </div>
        </SectionPanel>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionPanel title="My assets" subtitle="Dummy entries for quick understanding">
          <div className="grid gap-3 sm:grid-cols-3">
            {ASSIGNED_ASSETS.map((asset) => (
              <div key={asset.tag} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{asset.tag}</div>
                <div className="mt-2 text-base font-black text-slate-900">{asset.name}</div>
                <div className="mt-1 text-sm text-slate-500">{asset.category}</div>
                <div className="mt-2 text-sm font-medium text-slate-600">{asset.note}</div>
                <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{asset.status}</div>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Use these items" subtitle="Suggested assets your team often requests">
          <div className="grid gap-2">
            {[
              "Office Chair",
              "CPU Tower",
              "Laptop",
              "Monitor",
              "Keyboard",
              "Mouse",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setForm((current) => ({ ...current, itemName: item, category: item.toLowerCase().includes("chair") || item.toLowerCase().includes("desk") ? "Furniture" : "Electronics" }));
                  setModalOpen(true);
                }}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#5b3df5]/30 hover:shadow-md"
              >
                <span className="text-sm font-semibold text-slate-900">{item}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b3df5]">Use now</span>
              </button>
            ))}
          </div>
        </SectionPanel>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Request asset</div>
                <div className="mt-1 text-2xl font-black tracking-tight text-slate-900">Submit a new entry</div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Asset name</span>
                <input
                  value={form.itemName}
                  onChange={(e) => setForm((current) => ({ ...current, itemName: e.target.value }))}
                  placeholder="Office Chair"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5b3df5]/40 focus:bg-white"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Category</span>
                <input
                  value={form.category}
                  onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                  placeholder="Furniture"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5b3df5]/40 focus:bg-white"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm((current) => ({ ...current, quantity: Number(e.target.value) || 1 }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5b3df5]/40 focus:bg-white"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Location</span>
                <input
                  value={form.location}
                  onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                  placeholder="Employee workstation"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5b3df5]/40 focus:bg-white"
                />
              </label>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Purpose</span>
              <textarea
                rows={3}
                value={form.purpose}
                onChange={(e) => setForm((current) => ({ ...current, purpose: e.target.value }))}
                placeholder="Why do you need this asset?"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5b3df5]/40 focus:bg-white"
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={submitRequest}
                className="rounded-2xl bg-[#5b3df5] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_30px_rgba(91,61,245,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

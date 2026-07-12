"use client";

import { useEffect, useMemo, useState } from "react";
import SectionPanel from "./cards/SectionPanel";
import { IconCheckCircle, IconClipboardList, IconRefresh } from "../icons/Icons";
import { approveAssetRequest, listAssetRequests, type AssetRequestItem } from "@/app/lib/imsApi";

function statusTone(status: AssetRequestItem["status"]) {
  if (status === "Approved") return "bg-emerald-50 text-emerald-700";
  if (status === "Rejected") return "bg-rose-50 text-rose-700";
  if (status === "Fulfilled") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function numberFormat(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AllocationReviewPage() {
  const [requests, setRequests] = useState<AssetRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await listAssetRequests();
      setRequests(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to load asset requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = useMemo(() => requests.filter((item) => item.status === "Pending").length, [requests]);
  const approvedCount = useMemo(() => requests.filter((item) => item.status === "Approved").length, [requests]);

  const approve = async (id: string) => {
    setBusyId(id);
    setMessage("");
    try {
      const updated = await approveAssetRequest(id);
      setRequests((current) => current.map((item) => (item.id === id ? updated : item)));
      setMessage("Request approved and sent back to the employee.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to approve request.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="glass-panel soft-shadow rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5b3df5]/20 bg-[#5b3df5]/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#5b3df5]">
            Manager approvals
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Asset allocation queue</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Review employee requests, approve the ones you want to issue, and keep the employee updated on the final status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#5b3df5]/30 hover:text-[#5b3df5]"
        >
          <IconRefresh size={16} />
          Refresh
        </button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          { label: "Total requests", value: numberFormat(requests.length), hint: "All visible requests" },
          { label: "Pending review", value: numberFormat(pendingCount), hint: "Waiting for your approval" },
          { label: "Approved", value: numberFormat(approvedCount), hint: "Already cleared for handover" },
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

      <SectionPanel title="Requests" subtitle="Approve from the manager queue">
        {loading ? (
          <div className="grid gap-3">
            <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
            <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
          </div>
        ) : requests.length ? (
          <div className="grid gap-3">
            {requests.map((item) => {
              const approved = item.status === "Approved" || item.status === "Fulfilled";
              return (
                <div key={item.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-black text-slate-900">{item.itemName}</div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {item.quantity}x {item.category} requested by {item.requesterName}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">
                        {item.purpose || "No purpose provided"}
                        {item.location ? ` • ${item.location}` : ""}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        Submitted {formatDateTime(item.createdAt)}
                        {item.approvedBy ? ` • Approved by ${item.approvedBy}` : ""}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      {approved ? (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                          <IconCheckCircle size={16} />
                          Approved
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => approve(item.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5b3df5] px-4 py-3 text-sm font-bold text-white shadow-[0_18px_30px_rgba(91,61,245,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <IconClipboardList size={16} />
                          {busyId === item.id ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 p-6 text-sm leading-7 text-slate-600">
            No employee asset requests are waiting right now.
          </div>
        )}
      </SectionPanel>
    </section>
  );
}

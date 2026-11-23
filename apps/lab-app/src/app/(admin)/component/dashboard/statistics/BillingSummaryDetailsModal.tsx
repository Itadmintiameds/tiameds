"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ArrowDown, ArrowUp, Download, X } from "lucide-react";
import { toast } from "react-toastify";

import { getDetailedBilling } from "../../../../../../services/statisticsService";
import { BillingByLabRow, DetailedBilling } from "@/types/statisticsData";
import { amt, buildCsv, toExportLabLabel, withCsvHeading } from "@/lib/stats/dashboardCardCsv";
import { downloadCSV } from "@/utils/csvUtils";
import Loader from "../../common/Loader";

export type ModalFilterType = "currentFY" | "week" | "month" | "lastMonth" | "year" | "custom";

export interface ModalDateRange {
  startDate: string;
  endDate: string;
}

type TabKey = "total" | "paid" | "due";

const TABS: { key: TabKey; label: string; field: "netBilled" | "paid" | "due"; color: string }[] = [
  { key: "total", label: "Total Bill Amount", field: "netBilled", color: "#FDBA12" },
  { key: "paid", label: "Paid Amount", field: "paid", color: "#38B000" },
  { key: "due", label: "Due Amount", field: "due", color: "#F75A5A" },
];

const inr = (value: number) => `₹${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Props {
  open: boolean;
  onClose: () => void;
  labId?: number;
  labName?: string | null;
  initialFilter: ModalFilterType;
  initialCustomRange: ModalDateRange;
  /** Resolves a filter into concrete YYYY-MM-DD dates (same logic the dashboard cards use). */
  resolveRange: (filter: ModalFilterType, custom: ModalDateRange) => { startDate?: string; endDate?: string };
  fyLabel: string;
}

const BillingSummaryDetailsModal = ({
  open,
  onClose,
  labId,
  labName,
  initialFilter,
  initialCustomRange,
  resolveRange,
  fyLabel,
}: Props) => {
  const [tab, setTab] = useState<TabKey>("total");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<ModalFilterType>(initialFilter);
  const [customRange, setCustomRange] = useState<ModalDateRange>(initialCustomRange);
  const [data, setData] = useState<DetailedBilling | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Each time the popup opens, start from the card's current filter and the first tab.
  useEffect(() => {
    if (open) {
      setTab("total");
      setSortOrder("desc");
      setFilter(initialFilter);
      setCustomRange(initialCustomRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const range = useMemo(() => resolveRange(filter, customRange), [filter, customRange, resolveRange]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getDetailedBilling(labId, range.startDate, range.endDate));
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Failed to load billing details");
    } finally {
      setLoading(false);
    }
  }, [labId, range.startDate, range.endDate]);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const summary = data?.summary;

  // Backend only returns byLab for the all-labs view; with one lab selected, that lab is the single row.
  const labRows: BillingByLabRow[] = useMemo(() => {
    if (!data) return [];
    if (data.byLab && data.byLab.length > 0) return data.byLab;
    if (labId != null && data.summary) {
      return [
        {
          labId,
          labName: labName || "Selected Lab",
          totalBillings: data.summary.totalBillings,
          netBilled: data.summary.netBilled,
          paid: data.summary.totalPaid,
          due: data.summary.totalDue,
        },
      ];
    }
    return [];
  }, [data, labId, labName]);

  const activeTab = TABS.find((t) => t.key === tab)!;

  const sortedRows = useMemo(
    () =>
      [...labRows].sort((a, b) => {
        const diff = (Number(a[activeTab.field]) || 0) - (Number(b[activeTab.field]) || 0);
        return sortOrder === "asc" ? diff : -diff;
      }),
    [labRows, activeTab, sortOrder]
  );

  const handleExport = () => {
    if (sortedRows.length === 0) return;
    const csv = buildCsv(
      ["SI No.", "Lab Name", "Total Bills", activeTab.label],
      sortedRows.map((r, i) => [
        i + 1,
        r.labName || "Unknown Lab",
        r.totalBillings || 0,
        amt(r[activeTab.field]),
      ])
    );
    const scope = labName ? `"${labName}"` : "(All Labs)";
    const dates =
      range.startDate && range.endDate
        ? ` - ${dayjs(range.startDate).format("DD/MM/YYYY")} to ${dayjs(range.endDate).format("DD/MM/YYYY")}`
        : "";
    downloadCSV(
      withCsvHeading(`Billing Summary - ${activeTab.label} ${scope}${dates}`, csv),
      `billing-summary-${tab}-${toExportLabLabel(labName)}.csv`
    );
    toast.info("Downloading file");
  };

  if (!open) return null;

  const maxDate = dayjs().format("YYYY-MM-DD");
  const filterOptions: { value: ModalFilterType; label: string }[] = [
    { value: "currentFY", label: `Current FY: ${fyLabel}` },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Date" },
  ];
  const dateInputClass =
    "rounded-lg border border-pneutral-100 bg-base-white px-3 py-2 text-p3 text-pneutral-900 shadow-xsm focus:outline-none focus:ring-2 focus:ring-secondary-500";

  const consolidated = [
    { label: "Total Bills", value: String(summary?.totalBillings ?? 0), color: "#4F6BED" },
    { label: "Total Bill Amount", value: inr(summary?.netBilled ?? 0), color: TABS[0].color },
    { label: "Paid Amount", value: inr(summary?.totalPaid ?? 0), color: TABS[1].color },
    { label: "Due Amount", value: inr(summary?.totalDue ?? 0), color: TABS[2].color },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Billing Summary details"
    >
      <div
        className="flex h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-secondary-50 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg bg-info-200 px-5 py-4">
          <div>
            <h2 className="text-p2 font-heading font-semibold text-pneutral-900">Billing Summary Details</h2>
            <p className="text-p3 text-pneutral-900">{labName ? labName : "All Labs"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ModalFilterType)}
              className="rounded-lg border border-pneutral-100 bg-pneutral-100 px-4 py-2 text-p3 font-medium text-pneutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {filter === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customRange.startDate}
                  max={maxDate}
                  onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                  className={dateInputClass}
                />
                <span className="text-p3 text-pneutral-500">to</span>
                <input
                  type="date"
                  value={customRange.endDate}
                  max={maxDate}
                  onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                  className={dateInputClass}
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={loading || sortedRows.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-success-500 px-3 py-2 text-p3 font-medium text-white shadow-xsm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              Export
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg bg-base-white p-2 text-warning-500 shadow-xsm hover:bg-pneutral-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader type="spinner" size="sm" text="" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-danger-500">{error}</div>
          ) : (
            <>
              {/* Consolidated summary */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {consolidated.map((c) => (
                  <div key={c.label} className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      <span className="text-p3 text-pneutral-600">{c.label}</span>
                    </div>
                    <p className="mt-1 text-p2 font-semibold text-pneutral-900">{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="mt-5 flex gap-1 border-b border-pneutral-100" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`-mb-px border-b-2 px-4 py-2 text-p3 font-medium transition-colors ${
                      tab === t.key
                        ? "border-secondary-700 text-secondary-700"
                        : "border-transparent text-pneutral-600 hover:text-pneutral-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
                  className="my-1 ml-auto flex items-center rounded-lg border border-pneutral-100 bg-base-white p-2 text-pneutral-700 shadow-xsm hover:bg-pneutral-50"
                  aria-label={`Sort ${sortOrder === "desc" ? "ascending" : "descending"}`}
                  title={sortOrder === "desc" ? "Descending (click for ascending)" : "Ascending (click for descending)"}
                >
                  {sortOrder === "desc" ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                </button>
              </div>

              {/* Lab-wise table, sorted by the active tab's amount (descending by default) */}
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-y border-pneutral-100 bg-pneutral-50">
                      <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
                      <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">Lab Name</th>
                      <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">Total Bills</th>
                      <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
                        {activeTab.label}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-pneutral-500">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      sortedRows.map((r, i) => {
                        const value = Number(r[activeTab.field]) || 0;
                        return (
                          <tr key={r.labId} className="border-b border-pneutral-100">
                            <td className="px-4 py-2 text-p3 text-pneutral-600">{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">{r.labName || "Unknown Lab"}</td>
                            <td className="px-4 py-2 text-right text-p3 text-pneutral-600">{r.totalBillings || 0}</td>
                            <td className="px-4 py-2 text-right text-p3 font-semibold text-pneutral-900">{inr(value)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingSummaryDetailsModal;

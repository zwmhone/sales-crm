// resources/js/pages/OpportunityStagesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/**
 * FULL FILE
 * - UI matches screenshot (header + search + export + filter buttons + advanced filters + 3 stage columns)
 * - Clicking the ACTION button on each deal opens the "Opportunity Quick View" modal like your screenshot
 * - No external modal library required
 *
 * API expected: GET /api/opportunity-stages?search=...
 * {
 *   stages: [
 *     {
 *       key: "Bronze",
 *       label: "Bronze",
 *       currency: "SGD",
 *       count: 3,
 *       totalAmount: 45000,
 *       deals: [
 *         {
 *           pipelineId: "2001",
 *           contactId: "123",
 *           stage: "Bronze",
 *           dealName: "Retail Upskilling",
 *           companyName: "Example Pte Ltd",
 *           dealExec: "DBD - Team A",
 *           amount: 18000,
 *           currency: "SGD",
 *           closeDate: "2025-02-04",
 *           lastUpdated: "2025-02-02",
 *           probability: 40,
 *           score: 55,
 *
 *           // optional (if you have)
 *           sopStatus: "Due Soon",
 *           needsActionLabel: "Verify Now (12h)",
 *           sopDueAt: "2026-03-04T10:20:00Z",
 *           description: "Bronze stage. Awaiting verification..."
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

export default function OpportunityStagesPage() {
    // Search
    const [typing, setTyping] = useState("");
    const [search, setSearch] = useState("");

    // Load
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stages, setStages] = useState([]);

    // Filter bar (top buttons)
    const [myDeals, setMyDeals] = useState("My Deals"); // "My Deals" | "All Deals"
    const [owner, setOwner] = useState("Owner"); // "Owner" | ownerName
    const [closeDatePreset, setCloseDatePreset] = useState("Close Date");
    const [lastUpdatePreset, setLastUpdatePreset] = useState("Last Update");

    // Advanced filters panel
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [adv, setAdv] = useState({
        currency: "Any",
        minAmount: "",
        maxAmount: "",
        minProbability: "",
        maxProbability: "",
        minScore: "",
        maxScore: "",
    });

    // ✅ Quick View modal (your requested popup)
    const [quickOpen, setQuickOpen] = useState(false);
    const [quickDeal, setQuickDeal] = useState(null);

    function openQuickView(deal) {
        setQuickDeal(deal);
        setQuickOpen(true);
    }

    function closeQuickView() {
        setQuickOpen(false);
        setQuickDeal(null);
    }

    // debounce typing -> search
    useEffect(() => {
        const t = setTimeout(() => setSearch(typing.trim()), 300);
        return () => clearTimeout(t);
    }, [typing]);

    // Load from API
    useEffect(() => {
        let alive = true;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const res = await axios.get("/api/opportunity-stages", {
                    params: search ? { search } : {},
                });

                if (!alive) return;
                setStages(res.data?.stages || []);
            } catch (e) {
                if (!alive) return;
                setError(
                    e?.response?.data?.message ||
                        e?.message ||
                        "Failed to load opportunity stages.",
                );
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, [search]);

    /* ---------------- Helpers ---------------- */

    function formatMoney(value) {
        if (value === null || value === undefined || value === "") return "-";
        const num = Number(value);
        if (Number.isNaN(num)) return String(value);
        return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    function formatDate(value) {
        if (!value) return "";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        });
    }

    function toDate(value) {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    function daysFromNow(n) {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d;
    }

    function isWithin(date, start, end) {
        if (!date) return false;
        const t = date.getTime();
        return t >= start.getTime() && t <= end.getTime();
    }

    /* ---------------- Flatten for dropdown options ---------------- */

    const allDealsFlat = useMemo(() => {
        const list = [];
        (stages || []).forEach((s) =>
            (s.deals || []).forEach((d) => list.push(d)),
        );
        return list;
    }, [stages]);

    const ownerOptions = useMemo(() => {
        const set = new Set();
        allDealsFlat.forEach((d) => {
            const o = d?.dealExec || d?.dealMgr || d?.owner || "";
            if (String(o).trim()) set.add(String(o).trim());
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [allDealsFlat]);

    const currencyOptions = useMemo(() => {
        const set = new Set();
        allDealsFlat.forEach((d) => {
            const c = d?.currency || "";
            if (String(c).trim()) set.add(String(c).trim());
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [allDealsFlat]);

    /* ---------------- Apply filters client-side ---------------- */

    const filteredStages = useMemo(() => {
        const now = new Date();

        const closeDateFilter = (deal) => {
            const cd = toDate(deal?.closeDate);
            if (closeDatePreset === "Close Date") return true;
            if (!cd) return false;

            if (closeDatePreset === "Next 7 days")
                return isWithin(cd, now, daysFromNow(7));
            if (closeDatePreset === "Next 30 days")
                return isWithin(cd, now, daysFromNow(30));
            if (closeDatePreset === "Past Due")
                return cd.getTime() < now.getTime();
            if (closeDatePreset === "This Month") {
                return (
                    cd.getMonth() === now.getMonth() &&
                    cd.getFullYear() === now.getFullYear()
                );
            }
            return true;
        };

        const lastUpdateFilter = (deal) => {
            const lu = toDate(
                deal?.lastUpdated || deal?.lastUpdate || deal?.updatedAt,
            );
            if (lastUpdatePreset === "Last Update") return true;
            if (!lu) return false;

            if (lastUpdatePreset === "Today") {
                return (
                    lu.getDate() === now.getDate() &&
                    lu.getMonth() === now.getMonth() &&
                    lu.getFullYear() === now.getFullYear()
                );
            }
            if (lastUpdatePreset === "Last 7 days")
                return isWithin(lu, daysFromNow(-7), now);
            if (lastUpdatePreset === "Last 30 days")
                return isWithin(lu, daysFromNow(-30), now);
            return true;
        };

        const myDealsFilter = (deal) => {
            if (myDeals === "All Deals") return true;

            // If your backend provides isMine, we use it.
            // If it doesn't, we keep deals visible so your demo doesn't go empty.
            if (deal?.isMine === true) return true;
            return true;
        };

        const ownerFilter = (deal) => {
            if (owner === "Owner") return true;
            const o = String(
                deal?.dealExec || deal?.dealMgr || deal?.owner || "",
            ).trim();
            return o === owner;
        };

        const advFilter = (deal) => {
            if (adv.currency !== "Any") {
                const c = String(deal?.currency || "").trim();
                if (c !== adv.currency) return false;
            }

            const amt = Number(deal?.amount);
            if (adv.minAmount !== "" && !Number.isNaN(Number(adv.minAmount))) {
                if (Number.isNaN(amt) || amt < Number(adv.minAmount))
                    return false;
            }
            if (adv.maxAmount !== "" && !Number.isNaN(Number(adv.maxAmount))) {
                if (Number.isNaN(amt) || amt > Number(adv.maxAmount))
                    return false;
            }

            const prob = Number(deal?.probability);
            if (
                adv.minProbability !== "" &&
                !Number.isNaN(Number(adv.minProbability))
            ) {
                if (Number.isNaN(prob) || prob < Number(adv.minProbability))
                    return false;
            }
            if (
                adv.maxProbability !== "" &&
                !Number.isNaN(Number(adv.maxProbability))
            ) {
                if (Number.isNaN(prob) || prob > Number(adv.maxProbability))
                    return false;
            }

            const score = Number(deal?.score);
            if (adv.minScore !== "" && !Number.isNaN(Number(adv.minScore))) {
                if (Number.isNaN(score) || score < Number(adv.minScore))
                    return false;
            }
            if (adv.maxScore !== "" && !Number.isNaN(Number(adv.maxScore))) {
                if (Number.isNaN(score) || score > Number(adv.maxScore))
                    return false;
            }

            return true;
        };

        const filterDeal = (d) =>
            myDealsFilter(d) &&
            ownerFilter(d) &&
            closeDateFilter(d) &&
            lastUpdateFilter(d) &&
            advFilter(d);

        return (stages || []).map((s) => {
            const deals = (s.deals || []).filter(filterDeal);

            const totals = deals.reduce(
                (acc, d) => {
                    const v = Number(d?.amount);
                    if (!Number.isNaN(v)) acc.sum += v;
                    return acc;
                },
                { sum: 0 },
            );

            return {
                ...s,
                deals,
                count: deals.length,
                totalAmount: totals.sum,
            };
        });
    }, [stages, myDeals, owner, closeDatePreset, lastUpdatePreset, adv]);

    const totalDeals = useMemo(() => {
        return filteredStages.reduce((sum, s) => sum + (s.count || 0), 0);
    }, [filteredStages]);

    function clearAdvanced() {
        setAdv({
            currency: "Any",
            minAmount: "",
            maxAmount: "",
            minProbability: "",
            maxProbability: "",
            minScore: "",
            maxScore: "",
        });
    }

    /* ---------------- Export ---------------- */

    function exportCSV() {
        const rows = [];
        rows.push([
            "Stage",
            "Deal Name",
            "Pipeline ID",
            "Contact ID",
            "Company",
            "Owner",
            "Amount",
            "Currency",
            "Close Date",
            "Last Updated",
            "Probability",
            "Score",
            "SOP Status",
            "Needs Action",
            "SOP Due At",
            "Description",
        ]);

        filteredStages.forEach((s) => {
            (s.deals || []).forEach((d) => {
                const ownerName = d?.dealExec || d?.dealMgr || d?.owner || "";
                rows.push([
                    s.label || s.key || "",
                    d?.dealName || "",
                    d?.pipelineId ?? "",
                    d?.contactId ?? "",
                    d?.companyName || d?.company || "",
                    ownerName,
                    d?.amount ?? "",
                    d?.currency ?? "",
                    d?.closeDate ? formatDate(d.closeDate) : "",
                    d?.lastUpdated ? formatDate(d.lastUpdated) : "",
                    d?.probability ?? "",
                    d?.score ?? "",
                    d?.sopStatus ?? "",
                    d?.needsActionLabel ?? "",
                    d?.sopDueAt ?? "",
                    d?.description ?? "",
                ]);
            });
        });

        const csv = rows
            .map((r) =>
                r
                    .map((cell) => {
                        const s = String(cell ?? "");
                        const needs =
                            s.includes(",") ||
                            s.includes('"') ||
                            s.includes("\n");
                        const esc = s.replace(/"/g, '""');
                        return needs ? `"${esc}"` : esc;
                    })
                    .join(","),
            )
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `opportunity-stages-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="min-h-screen">
            <style>{`
                .os-shell{ max-width:1100px; margin:0 auto; padding:22px; }
                .os-card{ background:#fff; border:1px solid #e5e7eb; border-radius:14px; }
                .os-header{ padding:18px 18px 14px; }
                .os-title{ font-size:22px; font-weight:800; color:#111827; }
                .os-sub{ margin-top:4px; font-size:12px; color:#6b7280; }

                .os-toprow{ display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
                .os-actions{ display:flex; align-items:center; gap:10px; }
                .os-searchWrap{ position:relative; width: 320px; max-width: 100%; }
                .os-search{ width:100%; border:1px solid #e5e7eb; border-radius:10px; padding:9px 36px 9px 12px; font-size:13px; outline:none; }
                .os-search:focus{ box-shadow:0 0 0 3px rgba(15, 23, 42, 0.08); }
                .os-searchIcon{ position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#9ca3af; font-size:14px; }

                .os-btn{ border:1px solid #e5e7eb; background:#fff; border-radius:10px; padding:9px 12px; font-size:12px; font-weight:700; color:#111827; cursor:pointer; }
                .os-btn:hover{ background:#f9fafb; }
                .os-btnExport{ background:#f3f4f6; border-color:#e5e7eb; }
                .os-btnExport:hover{ background:#eef2f7; }

                .os-filters{ padding:12px 18px 16px; border-top:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
                .os-filterLeft{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
                .os-dd{ border:1px solid #e5e7eb; background:#f9fafb; border-radius:10px; padding:8px 10px; font-size:12px; font-weight:700; color:#111827; cursor:pointer; }
                .os-dd:focus{ outline:none; box-shadow:0 0 0 3px rgba(15, 23, 42, 0.08); }
                .os-advToggle{ display:flex; align-items:center; gap:8px; font-size:12px; font-weight:800; color:#111827; cursor:pointer; user-select:none; }
                .os-advIcon{ width:14px; height:14px; display:inline-block; }

                .os-advPanel{ padding:14px 18px 18px; border-top:1px solid #f1f5f9; display:grid; gap:12px; }
                .os-advGrid{ display:grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap:10px; }
                .os-advField{ display:flex; flex-direction:column; gap:6px; }
                .os-lbl{ font-size:11px; color:#6b7280; font-weight:800; }
                .os-in{ border:1px solid #e5e7eb; border-radius:10px; padding:8px 10px; font-size:12px; outline:none; background:#fff; }
                .os-in:focus{ box-shadow:0 0 0 3px rgba(15, 23, 42, 0.08); }
                .os-advBtns{ display:flex; gap:10px; justify-content:flex-end; }

                .os-error{ margin-top:14px; border:1px solid #fecaca; background:#fef2f2; color:#b91c1c; border-radius:12px; padding:10px 12px; font-size:12px; font-weight:800; }

                .os-board{ padding:18px; }
                .os-cols{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:14px; }
                .os-col{ border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff; }
                .os-colHead{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:10px; }
                .os-colTitle{ font-size:13px; font-weight:900; color:#111827; }
                .os-colMeta{ font-size:10px; color:#6b7280; margin-top:2px; }
                .os-colMeta b{ color:#111827; }
                .os-cardStack{ display:flex; flex-direction:column; gap:10px; }

                .deal{ border:1px solid #e5e7eb; border-radius:12px; padding:10px 10px; background:#fff; }
                .dealTop{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
                .dealName{ font-size:12px; font-weight:900; color:#111827; }
                .dealSub{ margin-top:2px; font-size:10px; color:#6b7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 100%; }
                .dealSmall{ margin-top:4px; font-size:10px; color:#94a3b8; display:flex; gap:10px; flex-wrap:wrap; }
                .dealPill{ display:inline-flex; align-items:center; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:900; border:1px solid; }
                .pillOk{ background:#ecfdf5; color:#047857; border-color:#a7f3d0; }
                .pillDue{ background:#fffbeb; color:#92400e; border-color:#fde68a; }
                .pillRisk{ background:#fef2f2; color:#b91c1c; border-color:#fecaca; }
                .dealAction{ background:#4b5f2a; color:#fff; border:none; border-radius:8px; padding:6px 12px; font-size:11px; font-weight:900; cursor:pointer; }
                .dealAction:hover{ filter:brightness(0.95); }

                /* Quick View Modal */
                .qv-overlay{
                    position:fixed; inset:0; background:rgba(0,0,0,0.45);
                    display:flex; align-items:center; justify-content:center;
                    padding:18px; z-index:9999;
                }
                .qv-modal{
                    width:520px; max-width:100%;
                    background:#fff; border-radius:18px;
                    box-shadow:0 18px 60px rgba(0,0,0,0.25);
                    overflow:hidden;
                }
                .qv-head{
                    padding:18px 20px;
                    border-bottom:1px solid #eef2f7;
                    font-size:20px; font-weight:900; color:#111827;
                }
                .qv-body{ padding:18px 20px 14px; }
                .qv-grid{
                    display:grid;
                    grid-template-columns: 1fr 1fr;
                    gap:18px 26px;
                }
                .qv-item .qv-label{
                    font-size:12px; font-weight:900; color:#111827;
                    margin-bottom:3px;
                }
                .qv-item .qv-value{
                    font-size:13px; color:#111827;
                }
                .qv-wide{ grid-column: 1 / -1; }
                .qv-notes{
                    margin-top:2px;
                    font-size:13px; color:#111827; line-height:1.35;
                }
                .qv-foot{
                    padding:14px 20px 18px;
                    display:flex; justify-content:flex-end;
                }
                .qv-close{
                    background:#8b1c3a; color:#fff;
                    border:none; border-radius:8px;
                    padding:8px 18px;
                    font-size:12px; font-weight:900;
                    cursor:pointer;
                }
                .qv-close:hover{ filter:brightness(0.95); }

                @media (max-width: 980px){
                    .os-cols{ grid-template-columns: 1fr; }
                    .os-advGrid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
                    .os-searchWrap{ width: 100%; }
                    .os-actions{ width: 100%; justify-content:space-between; }
                    .qv-grid{ grid-template-columns: 1fr; }
                    .qv-wide{ grid-column: 1 / 2; }
                }
            `}</style>

            <div className="os-shell">
                <div className="os-card">
                    {/* Header */}
                    <div className="os-header">
                        <div className="os-toprow">
                            <div>
                                <div className="os-title">
                                    Opportunity Stages
                                </div>
                                <div className="os-sub">
                                    {loading
                                        ? "Loading…"
                                        : `${totalDeals} deals`}
                                </div>
                            </div>

                            <div className="os-actions">
                                <div className="os-searchWrap">
                                    <input
                                        className="os-search"
                                        value={typing}
                                        onChange={(e) =>
                                            setTyping(e.target.value)
                                        }
                                        placeholder="Search Deals....."
                                    />
                                    <div className="os-searchIcon">🔍</div>
                                </div>

                                <button
                                    className="os-btn os-btnExport"
                                    type="button"
                                    onClick={exportCSV}
                                >
                                    Export
                                </button>
                            </div>
                        </div>

                        {error ? <div className="os-error">{error}</div> : null}
                    </div>

                    {/* Filter Row */}
                    <div className="os-filters">
                        <div className="os-filterLeft">
                            <select
                                className="os-dd"
                                value={myDeals}
                                onChange={(e) => setMyDeals(e.target.value)}
                            >
                                <option>My Deals</option>
                                <option>All Deals</option>
                            </select>

                            <select
                                className="os-dd"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                            >
                                <option>Owner</option>
                                {ownerOptions.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="os-dd"
                                value={closeDatePreset}
                                onChange={(e) =>
                                    setCloseDatePreset(e.target.value)
                                }
                            >
                                <option>Close Date</option>
                                <option>Next 7 days</option>
                                <option>Next 30 days</option>
                                <option>This Month</option>
                                <option>Past Due</option>
                            </select>

                            <select
                                className="os-dd"
                                value={lastUpdatePreset}
                                onChange={(e) =>
                                    setLastUpdatePreset(e.target.value)
                                }
                            >
                                <option>Last Update</option>
                                <option>Today</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>

                        <div
                            className="os-advToggle"
                            onClick={() => setAdvancedOpen((v) => !v)}
                            role="button"
                            tabIndex={0}
                        >
                            <span className="os-advIcon">☰</span>
                            Advanced filters
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    {advancedOpen ? (
                        <div className="os-advPanel">
                            <div className="os-advGrid">
                                <div className="os-advField">
                                    <div className="os-lbl">Currency</div>
                                    <select
                                        className="os-in"
                                        value={adv.currency}
                                        onChange={(e) =>
                                            setAdv((p) => ({
                                                ...p,
                                                currency: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="Any">Any</option>
                                        {currencyOptions.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="os-advField">
                                    <div className="os-lbl">Min Amount</div>
                                    <input
                                        className="os-in"
                                        placeholder="e.g. 10000"
                                        value={adv.minAmount}
                                        onChange={(e) =>
                                            setAdv((p) => ({
                                                ...p,
                                                minAmount: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="os-advField">
                                    <div className="os-lbl">Max Amount</div>
                                    <input
                                        className="os-in"
                                        placeholder="e.g. 120000"
                                        value={adv.maxAmount}
                                        onChange={(e) =>
                                            setAdv((p) => ({
                                                ...p,
                                                maxAmount: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="os-advField">
                                    <div className="os-lbl">Min Prob %</div>
                                    <input
                                        className="os-in"
                                        placeholder="0"
                                        value={adv.minProbability}
                                        onChange={(e) =>
                                            setAdv((p) => ({
                                                ...p,
                                                minProbability: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="os-advField">
                                    <div className="os-lbl">Max Prob %</div>
                                    <input
                                        className="os-in"
                                        placeholder="100"
                                        value={adv.maxProbability}
                                        onChange={(e) =>
                                            setAdv((p) => ({
                                                ...p,
                                                maxProbability: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="os-advField">
                                    <div className="os-lbl">Min Score</div>
                                    <input
                                        className="os-in"
                                        placeholder="e.g. 50"
                                        value={adv.minScore}
                                        onChange={(e) =>
                                            setAdv((p) => ({
                                                ...p,
                                                minScore: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="os-advField">
                                    <div className="os-lbl">Max Score</div>
                                    <input
                                        className="os-in"
                                        placeholder="e.g. 100"
                                        value={adv.maxScore}
                                        onChange={(e) =>
                                            setAdv((p) => ({
                                                ...p,
                                                maxScore: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="os-advBtns">
                                <button
                                    className="os-btn"
                                    type="button"
                                    onClick={clearAdvanced}
                                >
                                    Clear
                                </button>
                                <button
                                    className="os-btn"
                                    type="button"
                                    onClick={() => setAdvancedOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Board */}
                    <div className="os-board">
                        {loading ? (
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "#6b7280",
                                    fontWeight: 800,
                                }}
                            >
                                Loading board…
                            </div>
                        ) : filteredStages.length === 0 ? (
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "#6b7280",
                                    fontWeight: 800,
                                }}
                            >
                                No deals found.
                            </div>
                        ) : (
                            <div className="os-cols">
                                {filteredStages.map((stage) => (
                                    <StageColumn
                                        key={stage.key || stage.label}
                                        title={stage.label || stage.key}
                                        count={stage.count || 0}
                                        currency={stage.currency || "SGD"}
                                        totalAmount={stage.totalAmount || 0}
                                        deals={stage.deals || []}
                                        onQuick={openQuickView}
                                        formatMoney={formatMoney}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Quick View Modal */}
            <OpportunityQuickViewModal
                open={quickOpen}
                deal={quickDeal}
                onClose={closeQuickView}
                formatDate={formatDate}
                formatMoney={formatMoney}
            />
        </div>
    );
}

/* ---------------- Column ---------------- */

function StageColumn({
    title,
    count,
    currency,
    totalAmount,
    deals,
    onQuick,
    formatMoney,
    formatDate,
}) {
    return (
        <div className="os-col">
            <div className="os-colHead">
                <div>
                    <div className="os-colTitle">{title}</div>
                    <div className="os-colMeta">
                        (<b>{count}</b> Deals | <b>{currency}</b>{" "}
                        <b>{formatMoney(totalAmount)}</b>)
                    </div>
                </div>
            </div>

            <div className="os-cardStack">
                {deals.length === 0 ? (
                    <div
                        style={{
                            padding: "18px 10px",
                            fontSize: 12,
                            color: "#94a3b8",
                            fontWeight: 800,
                        }}
                    >
                        —
                    </div>
                ) : (
                    deals.map((d) => (
                        <DealCard
                            key={`${d.pipelineId}-${d.contactId}`}
                            deal={d}
                            stageTitle={title}
                            onQuick={onQuick}
                            formatMoney={formatMoney}
                            formatDate={formatDate}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

/* ---------------- Deal Card ---------------- */

function DealCard({ deal, stageTitle, onQuick, formatMoney, formatDate }) {
    const ownerName = deal?.dealExec || deal?.dealMgr || deal?.owner || "—";
    const ccy = deal?.currency || "SGD";
    const amountText =
        deal?.amount !== null &&
        deal?.amount !== undefined &&
        deal?.amount !== ""
            ? formatMoney(deal.amount)
            : "-";

    // pill rules to mimic screenshot feel
    // - Bronze: Due Soon (amber)
    // - Silver/Gold: OK (green)
    // - If probability very low (<30): Risk (red)
    let pill = null;
    const prob = Number(deal?.probability);
    if (!Number.isNaN(prob) && prob < 30) {
        pill = { text: "Risk", cls: "pillRisk" };
    } else if (String(stageTitle).toLowerCase().includes("bronze")) {
        pill = { text: "Due Soon", cls: "pillDue" };
    } else {
        pill = { text: "OK", cls: "pillOk" };
    }

    return (
        <div className="deal">
            <div className="dealTop">
                <div style={{ minWidth: 0 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <div className="dealName" title={deal?.dealName || ""}>
                            {deal?.dealName || "(No name)"}
                        </div>
                        {pill ? (
                            <span className={`dealPill ${pill.cls}`}>
                                {pill.text}
                            </span>
                        ) : null}
                    </div>

                    <div
                        className="dealSub"
                        title={`Opp #${deal?.pipelineId || "—"}`}
                    >
                        Opp #{deal?.pipelineId ?? "—"} · {ownerName} · {ccy}{" "}
                        {amountText}
                    </div>

                    <div className="dealSmall">
                        {deal?.closeDate ? (
                            <span>Close: {formatDate(deal.closeDate)}</span>
                        ) : null}
                        {deal?.lastUpdated ? (
                            <span>
                                Last Updated: {formatDate(deal.lastUpdated)}
                            </span>
                        ) : deal?.lastUpdate ? (
                            <span>
                                Last Updated: {formatDate(deal.lastUpdate)}
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* ✅ ACTION BUTTON: opens Quick View popup */}
                <button
                    className="dealAction"
                    type="button"
                    onClick={() => onQuick(deal)}
                >
                    Action
                </button>
            </div>
        </div>
    );
}

/* ---------------- Quick View Modal ---------------- */

function fmtMoneyWithCcy(deal, formatMoney) {
    const ccy = deal?.currency || "SGD";
    const v = deal?.amount ?? "";
    const amount = formatMoney(v);
    return `${ccy} - ${amount}`;
}

function computeSop(deal) {
    // Prefer backend-provided fields if available
    const sopStatus = deal?.sopStatus || deal?.sla_status || "";
    const needsActionLabel =
        deal?.needsActionLabel || deal?.recommended_action_label || "";
    const sopDueAt = deal?.sopDueAt || deal?.dueAt || deal?.sla_due_at || null;

    // If backend gave us SOP info, keep it
    if (sopStatus || needsActionLabel || sopDueAt) {
        const remaining = computeRemainingTime(sopDueAt);
        return {
            sopStatus: sopStatus || "Due Soon",
            needsAction: needsActionLabel || "Verify Now (12h)",
            remaining: remaining || "Due in 1h 20m",
        };
    }

    // Demo fallback logic:
    const stage = String(deal?.stage || "").toLowerCase();
    let needsAction = "Verify Now (12h)";
    if (stage.includes("silver")) needsAction = "Confirm Now (24h)";
    if (stage.includes("gold")) needsAction = "Finalize Next Step (48h)";

    let status = "OK";
    if (stage.includes("bronze")) status = "Due Soon";
    const prob = Number(deal?.probability);
    if (!Number.isNaN(prob) && prob < 30) status = "At Risk";

    return { sopStatus: status, needsAction, remaining: "Due in 1h 20m" };
}

function computeRemainingTime(dueAt) {
    if (!dueAt) return "";
    const due = new Date(dueAt);
    if (Number.isNaN(due.getTime())) return "";

    const ms = due.getTime() - Date.now();
    const abs = Math.abs(ms);

    const h = Math.floor(abs / 3600000);
    const m = Math.floor((abs % 3600000) / 60000);

    if (ms < 0) {
        if (h <= 0) return `Overdue by ${m}m`;
        return `Overdue by ${h}h ${m}m`;
    }
    if (h <= 0) return `Due in ${m}m`;
    return `Due in ${h}h ${m}m`;
}

function OpportunityQuickViewModal({
    open,
    deal,
    onClose,
    formatDate,
    formatMoney,
}) {
    if (!open || !deal) return null;

    // Match your screenshot layout + labels
    const opportunityId = deal?.pipelineId
        ? `Opp #RT-${deal.pipelineId}`
        : "Opp #—";
    const stage = deal?.stage || "—";
    const company = deal?.companyName || deal?.company || "—";
    const owner = deal?.dealExec || deal?.dealMgr || deal?.owner || "—";
    const value = fmtMoneyWithCcy(deal, formatMoney);

    const { sopStatus, needsAction, remaining } = computeSop(deal);
    const description =
        deal?.description ||
        deal?.notes ||
        "Bronze stage. Awaiting verification and confirmation of key decision maker.";

    // Close modal on overlay click (but not when clicking inside)
    function onOverlayClick(e) {
        if (e.target === e.currentTarget) onClose();
    }

    return (
        <div className="qv-overlay" onMouseDown={onOverlayClick}>
            <div className="qv-modal" role="dialog" aria-modal="true">
                <div className="qv-head">Opportunity Quick View</div>

                <div className="qv-body">
                    <div className="qv-grid">
                        <div className="qv-item">
                            <div className="qv-label">Opportunity ID</div>
                            <div className="qv-value">{opportunityId}</div>
                        </div>

                        <div className="qv-item">
                            <div className="qv-label">Stage</div>
                            <div className="qv-value">{stage}</div>
                        </div>

                        <div className="qv-item">
                            <div className="qv-label">Company</div>
                            <div className="qv-value">{company}</div>
                        </div>

                        <div className="qv-item">
                            <div className="qv-label">Owner</div>
                            <div className="qv-value">{owner}</div>
                        </div>

                        <div className="qv-item">
                            <div className="qv-label">Value</div>
                            <div className="qv-value">{value}</div>
                        </div>

                        <div className="qv-item">
                            <div className="qv-label">SOP Status</div>
                            <div className="qv-value">
                                {sopStatus || "Due Soon"}
                            </div>
                        </div>

                        <div className="qv-item">
                            <div className="qv-label">Needs Action</div>
                            <div className="qv-value">
                                {needsAction || "Verify Now (12h)"}
                            </div>
                        </div>

                        <div className="qv-item">
                            <div className="qv-label">Remaining Time</div>
                            <div className="qv-value">
                                {remaining || "Due in 1h 20m"}
                            </div>
                        </div>

                        <div className="qv-item qv-wide">
                            <div className="qv-label">Description/Notes</div>
                            <div className="qv-notes">{description}</div>
                        </div>

                        {/* Optional: if you want to show dates inside modal too */}
                        {deal?.closeDate ? (
                            <div className="qv-item">
                                <div className="qv-label">Close Date</div>
                                <div className="qv-value">
                                    {formatDate(deal.closeDate)}
                                </div>
                            </div>
                        ) : null}

                        {deal?.lastUpdated || deal?.lastUpdate ? (
                            <div className="qv-item">
                                <div className="qv-label">Last Updated</div>
                                <div className="qv-value">
                                    {formatDate(
                                        deal?.lastUpdated || deal?.lastUpdate,
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="qv-foot">
                    <button
                        className="qv-close"
                        type="button"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const TABS = [
    { key: "RETAIL", label: "Retail" },
    { key: "ALLIANCE", label: "Alliance" },
    { key: "ENTERPRISE", label: "Enterprise" },
];

function Badge({ children }) {
    return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
            {children}
        </span>
    );
}

function MobileCard({ title, subtitle, lines = [], actions }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                    {title}
                </div>
                {subtitle ? (
                    <div className="text-xs text-gray-500 mt-0.5 break-words">
                        {subtitle}
                    </div>
                ) : null}
            </div>

            <div className="mt-3 space-y-2">
                {lines.map((l, idx) => (
                    <div
                        key={idx}
                        className="flex items-start justify-between gap-4"
                    >
                        <div className="text-xs font-semibold text-gray-600">
                            {l.label}
                        </div>
                        <div className="text-xs text-gray-900 text-right break-words">
                            {l.value || "—"}
                        </div>
                    </div>
                ))}
            </div>

            {actions ? <div className="mt-4">{actions}</div> : null}
        </div>
    );
}

export default function CompanyListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Keep BU in URL like contacts does (easy DB wiring)
    const tab = (searchParams.get("bu") || "RETAIL").toUpperCase();

    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState("db");
    const [error, setError] = useState("");
    const [rows, setRows] = useState([]);

    async function fetchList(buKey) {
        setLoading(true);
        setError("");
        try {
            // Your backend expects Retail/Alliance/Enterprise - convert key to label
            const label =
                buKey === "ALLIANCE"
                    ? "Alliance"
                    : buKey === "ENTERPRISE"
                      ? "Enterprise"
                      : "Retail";

            const res = await axios.get(`/api/companies`, {
                params: { bu: label },
            });

            setRows(res.data?.data ?? []);
            setSource(res.data?.source ?? "db");
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e.message ||
                    "Failed to load companies",
            );
            setRows([]);
            setSource("db");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchList(tab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    const tableRows = useMemo(() => {
        return (rows || []).map((c) => ({
            id: c.id,
            company_name: c.company_name ?? "—",
            company_email: c.company_email ?? "—",
            bu: c.bu ?? "—",
            owner: c.owner ?? "—",
            owner_team: c.owner_team ?? "",
            industry: c.industry ?? "—",
            location: c.location ?? "—",
            related_contacts_count: c.related_contacts_count ?? 0,
            related_opportunities_count: c.related_opportunities_count ?? 0,
        }));
    }, [rows]);

    function setTab(nextKey) {
        setSearchParams({ bu: nextKey });
    }

    function currentBuLabel() {
        return tab === "ALLIANCE"
            ? "Alliance"
            : tab === "ENTERPRISE"
              ? "Enterprise"
              : "Retail";
    }

    return (
        <div className="p-3 sm:p-6">
            <div className="mx-auto max-w-6xl">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* Header (responsive like Contacts list) */}
                    <div className="px-4 sm:px-6 pt-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Company List
                                </h1>
                                <div className="mt-1 text-xs text-gray-500">
                                    Browse companies by Business Unit. Tap{" "}
                                    <b>View</b> for details.
                                </div>
                            </div>

                            {/* Tabs - same style as Contacts list */}
                            <div className="inline-flex w-full sm:w-auto items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                                {TABS.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => setTab(t.key)}
                                        className={[
                                            "flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition",
                                            tab === t.key
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900",
                                        ].join(" ")}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 border-t border-gray-100" />
                    </div>

                    {/* Body */}
                    <div className="px-4 sm:px-6 pb-6 pt-4">
                        {error ? (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        {/* Loading */}
                        {loading ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                                Loading…
                            </div>
                        ) : null}

                        {/* MOBILE VIEW: cards */}
                        {!loading ? (
                            <div className="sm:hidden">
                                {tableRows.length === 0 ? (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                                        No companies found.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {tableRows.map((c) => (
                                            <MobileCard
                                                key={c.id}
                                                title={c.company_name}
                                                subtitle={c.company_email}
                                                lines={[
                                                    {
                                                        label: "BU",
                                                        value: currentBuLabel(),
                                                    },
                                                    {
                                                        label: "Owner",
                                                        value: c.owner,
                                                    },
                                                    {
                                                        label: "Industry",
                                                        value: c.industry,
                                                    },
                                                    {
                                                        label: "Location",
                                                        value: c.location,
                                                    },
                                                    {
                                                        label: "Contacts",
                                                        value: String(
                                                            c.related_contacts_count,
                                                        ),
                                                    },
                                                    {
                                                        label: "Opportunities",
                                                        value: String(
                                                            c.related_opportunities_count,
                                                        ),
                                                    },
                                                ]}
                                                actions={
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/companies/${encodeURIComponent(
                                                                        c.id,
                                                                    )}?bu=${encodeURIComponent(
                                                                        currentBuLabel(),
                                                                    )}`,
                                                                )
                                                            }
                                                            className="rounded-md bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                fetchList(tab)
                                                            }
                                                            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Refresh
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* DESKTOP VIEW: table */}
                        {!loading ? (
                            <div className="hidden sm:block rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr className="text-left text-xs font-semibold text-gray-600">
                                                <th className="px-5 py-3">
                                                    Lead
                                                </th>
                                                <th className="px-5 py-3">
                                                    BU
                                                </th>
                                                <th className="px-5 py-3">
                                                    Owner
                                                </th>
                                                <th className="px-5 py-3">
                                                    Industry
                                                </th>
                                                <th className="px-5 py-3">
                                                    Location
                                                </th>
                                                <th className="px-5 py-3">
                                                    Related Contacts (count)
                                                </th>
                                                <th className="px-5 py-3">
                                                    Related Opportunities
                                                    (count)
                                                </th>
                                                <th className="px-5 py-3 text-right">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {tableRows.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-5 py-10 text-center text-sm text-gray-500"
                                                    >
                                                        No companies found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                tableRows.map((c) => (
                                                    <tr
                                                        key={c.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {c.company_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {
                                                                    c.company_email
                                                                }
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <Badge>
                                                                {currentBuLabel()}
                                                            </Badge>
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-gray-700">
                                                            {c.owner}
                                                            {c.owner_team ? (
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        c.owner_team
                                                                    }
                                                                </div>
                                                            ) : null}
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-gray-700">
                                                            {c.industry}
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-gray-700">
                                                            {c.location}
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-gray-700">
                                                            {String(
                                                                c.related_contacts_count,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-gray-700">
                                                            {String(
                                                                c.related_opportunities_count,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/companies/${encodeURIComponent(
                                                                            c.id,
                                                                        )}?bu=${encodeURIComponent(
                                                                            currentBuLabel(),
                                                                        )}`,
                                                                    )
                                                                }
                                                                className="rounded-md bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : null}

                        {/* footer */}
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                            <div>
                                Showing <b>{tableRows.length}</b> companies
                            </div>

                            <button
                                type="button"
                                onClick={() => fetchList(tab)}
                                className="w-full sm:w-auto rounded-md border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="mt-2 text-xs text-gray-400">
                            Data source:{" "}
                            <span className="font-medium text-gray-600">
                                {source}
                            </span>
                            {source === "mock"
                                ? " (DB empty → mock rows for UI preview)"
                                : ""}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

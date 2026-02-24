// resources/js/pages/ContactsListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../Components/Modal";

const TABS = [
    { key: "RETAIL", label: "Retail" },
    { key: "ALLIANCE", label: "Alliance" },
    { key: "ENTERPRISE", label: "Enterprise" },
];

function Pill({ tone = "gray", children }) {
    const cls =
        tone === "red"
            ? "bg-red-100 text-red-700 border-red-200"
            : tone === "amber"
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}
        >
            {children}
        </span>
    );
}

function slaTone(sla) {
    const v = (sla || "").toLowerCase();
    if (v.includes("breach")) return "red";
    if (v.includes("due")) return "amber";
    return "gray";
}

function actionFromException(exceptionType = "") {
    const t = (exceptionType || "").toLowerCase();

    if (t.includes("not verified"))
        return { action: "VERIFY", label: "Verify Now", sop: "12h" };
    if (t.includes("not confirmed"))
        return {
            action: "LOG_CONFIRMATION",
            label: "Log Confirmation",
            sop: "24h",
        };
    if (t.includes("no-show"))
        return {
            action: "START_RETARGET",
            label: "Start Retarget",
            sop: "48h",
        };
    if (t.includes("follow-up overdue") || t.includes("overdue"))
        return { action: "SEND_FOLLOWUP", label: "Send Follow-up", sop: "2h" };

    return { action: "VERIFY", label: "Verify Now", sop: "12h" };
}

function MobileCard({
    name,
    id,
    exception_type,
    sla_status,
    owner,
    onOpen,
    onAction,
    actionLabel,
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {name || "—"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                        Lead #{id}
                    </div>
                </div>

                <div className="shrink-0 flex gap-2">
                    <button
                        onClick={onOpen}
                        className="rounded-md bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
                    >
                        Open
                    </button>
                    <button
                        onClick={onAction}
                        className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                    <div className="font-semibold text-gray-500">Exception</div>
                    <div className="text-gray-900 break-words">
                        {exception_type || "—"}
                    </div>
                </div>
                <div>
                    <div className="font-semibold text-gray-500">Owner</div>
                    <div className="text-gray-900 break-words">
                        {owner || "—"}
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="font-semibold text-gray-500 mb-1">
                        SLA Status
                    </div>
                    <Pill tone={slaTone(sla_status)}>{sla_status || "—"}</Pill>
                </div>
            </div>
        </div>
    );
}

export default function ContactsListPage() {
    const navigate = useNavigate();

    const [tab, setTab] = useState("RETAIL");
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState("db");
    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");

    const [actionOpen, setActionOpen] = useState(false);
    const [actionRow, setActionRow] = useState(null);

    const [form, setForm] = useState({
        channel: "Call",
        outcome: "Confirmed",
        notes: "",
        verification_result: "Verified",
        document_status: "CV Received",
        retarget_channel: "WhatsApp",
        retarget_result: "Attempted - No Reply",
        followup_type: "Thank-you Note",
        sent_via: "Email",
        message_summary: "",
    });

    async function fetchList(bu) {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(
                `/api/contacts?bu=${encodeURIComponent(bu)}`,
            );
            setRows(res.data?.data ?? []);
            setSource(res.data?.source ?? "db");
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e.message ||
                    "Failed to load contacts",
            );
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (cancelled) return;
            await fetchList(tab);
        })();
        return () => {
            cancelled = true;
        };
    }, [tab]);

    const tableRows = useMemo(() => {
        return (rows || []).map((r) => ({
            contact_id: r.contact_id,
            bu: r.bu ?? "—",
            name: r.name ?? "—",
            email: r.email ?? "—",
            owner: r.owner ?? "—",
            documents: r.documents ?? "—",
            lead_status: r.lead_status ?? "—",
            exception_type: r.exception_type ?? "—",
            sla_status: r.sla_status ?? "—",
        }));
    }, [rows]);

    function openActionModal(row) {
        setActionRow(row);

        const meta = actionFromException(row?.exception_type);
        if (meta.action === "VERIFY") {
            setForm((p) => ({
                ...p,
                verification_result: "Verified",
                document_status: "CV Received",
                notes: "",
            }));
        } else if (meta.action === "LOG_CONFIRMATION") {
            setForm((p) => ({
                ...p,
                channel: "Call",
                outcome: "Confirmed",
                notes: "",
            }));
        } else if (meta.action === "START_RETARGET") {
            setForm((p) => ({
                ...p,
                retarget_channel: "WhatsApp",
                retarget_result: "Attempted - No Reply",
                notes: "",
            }));
        } else if (meta.action === "SEND_FOLLOWUP") {
            setForm((p) => ({
                ...p,
                followup_type: "Thank-you Note",
                sent_via: "Email",
                message_summary: "",
            }));
        }

        setActionOpen(true);
    }

    async function saveAction() {
        if (!actionRow) return;
        const meta = actionFromException(actionRow.exception_type);

        let payloadForm = {};
        if (meta.action === "VERIFY") {
            payloadForm = {
                verification_result: form.verification_result,
                document_status: form.document_status,
                notes: form.notes,
            };
        } else if (meta.action === "LOG_CONFIRMATION") {
            payloadForm = {
                channel: form.channel,
                outcome: form.outcome,
                notes: form.notes,
            };
        } else if (meta.action === "START_RETARGET") {
            payloadForm = {
                retarget_channel: form.retarget_channel,
                result: form.retarget_result,
                notes: form.notes,
            };
        } else if (meta.action === "SEND_FOLLOWUP") {
            payloadForm = {
                followup_type: form.followup_type,
                sent_via: form.sent_via,
                message_summary: form.message_summary,
            };
        }

        await axios.post(`/api/contacts/${actionRow.contact_id}/action`, {
            action: meta.action,
            form: payloadForm,
        });

        setActionOpen(false);
        setActionRow(null);
        await fetchList(tab);
    }

    function renderActionModalBody() {
        const meta = actionFromException(actionRow?.exception_type);
        const name = actionRow?.name || "—";
        const id = actionRow?.contact_id || "—";

        // same body as yours (unchanged) but with better wrapping
        const SelectBox = ({ label, value, onChange, options }) => (
            <div>
                <div className="mb-1 text-xs font-semibold text-gray-600">
                    {label}
                </div>
                <select
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={value}
                    onChange={onChange}
                >
                    {options.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
            </div>
        );

        const Notes = ({ placeholder, value, onChange }) => (
            <div className="mt-4">
                <div className="mb-1 text-xs font-semibold text-gray-600">
                    Notes
                </div>
                <textarea
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    rows={4}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        );

        if (meta.action === "VERIFY") {
            return (
                <div className="text-sm text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span className="text-gray-400">•</span>
                        <span>Lead #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <SelectBox
                            label="Verification Result"
                            value={form.verification_result}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    verification_result: e.target.value,
                                }))
                            }
                            options={["Verified", "Not Verified"]}
                        />
                        <SelectBox
                            label="Document Status"
                            value={form.document_status}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    document_status: e.target.value,
                                }))
                            }
                            options={[
                                "CV Received",
                                "CV Missing",
                                "CaLA Received",
                                "CaLA Missing",
                            ]}
                        />
                    </div>

                    <Notes
                        placeholder="Add any exception notes..."
                        value={form.notes}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, notes: e.target.value }))
                        }
                    />
                </div>
            );
        }

        if (meta.action === "LOG_CONFIRMATION") {
            return (
                <div className="text-sm text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span className="text-gray-400">•</span>
                        <span>Lead #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <SelectBox
                            label="Channel"
                            value={form.channel}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    channel: e.target.value,
                                }))
                            }
                            options={["Call", "Email", "WhatsApp"]}
                        />
                        <SelectBox
                            label="Outcome"
                            value={form.outcome}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    outcome: e.target.value,
                                }))
                            }
                            options={["Confirmed", "Not Confirmed"]}
                        />
                    </div>

                    <Notes
                        placeholder="What happened? Any reschedule details?"
                        value={form.notes}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, notes: e.target.value }))
                        }
                    />
                </div>
            );
        }

        if (meta.action === "START_RETARGET") {
            return (
                <div className="text-sm text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span className="text-gray-400">•</span>
                        <span>Lead #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <SelectBox
                            label="Retarget Channel"
                            value={form.retarget_channel}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    retarget_channel: e.target.value,
                                }))
                            }
                            options={["WhatsApp", "Call", "Email"]}
                        />
                        <SelectBox
                            label="Result"
                            value={form.retarget_result}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    retarget_result: e.target.value,
                                }))
                            }
                            options={[
                                "Attempted - No Reply",
                                "Confirmed Next Step",
                                "Wrong Contact",
                            ]}
                        />
                    </div>

                    <Notes
                        placeholder="Message summary + next step..."
                        value={form.notes}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, notes: e.target.value }))
                        }
                    />
                </div>
            );
        }

        return (
            <div className="text-sm text-gray-700">
                <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    <span className="truncate max-w-[200px]">{name}</span>
                    <span className="text-gray-400">•</span>
                    <span>Lead #{id}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectBox
                        label="Follow-up Type"
                        value={form.followup_type}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                followup_type: e.target.value,
                            }))
                        }
                        options={["Thank-you Note", "Reminder", "Reschedule"]}
                    />
                    <SelectBox
                        label="Sent Via"
                        value={form.sent_via}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, sent_via: e.target.value }))
                        }
                        options={["Email", "WhatsApp", "Call"]}
                    />
                </div>

                <div className="mt-4">
                    <div className="mb-1 text-xs font-semibold text-gray-600">
                        Message Summary
                    </div>
                    <textarea
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        rows={4}
                        placeholder="Short summary of what was sent..."
                        value={form.message_summary}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                message_summary: e.target.value,
                            }))
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 pt-5">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Contacts List
                    </h1>

                    {/* Tabs: wrap + full width on mobile */}
                    <div className="inline-flex w-full sm:w-auto items-center rounded-lg border border-gray-200 bg-gray-50 p-1 overflow-x-auto">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={[
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition whitespace-nowrap",
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

                <div className="px-4 sm:px-6 pb-6 pt-4">
                    {error ? (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    {/* MOBILE: cards */}
                    <div className="sm:hidden space-y-3">
                        {loading ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
                                Loading…
                            </div>
                        ) : tableRows.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
                                No contacts found.
                            </div>
                        ) : (
                            tableRows.map((r) => {
                                const meta = actionFromException(
                                    r.exception_type,
                                );
                                return (
                                    <MobileCard
                                        key={r.contact_id}
                                        name={r.name}
                                        id={r.contact_id}
                                        exception_type={r.exception_type}
                                        sla_status={r.sla_status}
                                        owner={r.owner}
                                        actionLabel={meta.label}
                                        onOpen={() =>
                                            navigate(
                                                `/contacts/${r.contact_id}`,
                                            )
                                        }
                                        onAction={() => openActionModal(r)}
                                    />
                                );
                            })
                        )}
                    </div>

                    {/* DESKTOP: table */}
                    <div className="hidden sm:block rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-xs font-semibold text-gray-600">
                                        <th className="px-5 py-3">Lead/Deal</th>
                                        <th className="px-5 py-3">
                                            Exception Type
                                        </th>
                                        <th className="px-5 py-3">
                                            SLA Status
                                        </th>
                                        <th className="px-5 py-3">Owner</th>
                                        <th className="px-5 py-3 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-10 text-center text-sm text-gray-500"
                                            >
                                                Loading…
                                            </td>
                                        </tr>
                                    ) : tableRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-10 text-center text-sm text-gray-500"
                                            >
                                                No contacts found.
                                            </td>
                                        </tr>
                                    ) : (
                                        tableRows.map((r) => {
                                            const meta = actionFromException(
                                                r.exception_type,
                                            );

                                            return (
                                                <tr
                                                    key={r.contact_id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {r.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Lead #{r.contact_id}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-700">
                                                        {r.exception_type}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <Pill
                                                            tone={slaTone(
                                                                r.sla_status,
                                                            )}
                                                        >
                                                            {r.sla_status}
                                                        </Pill>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-700">
                                                        {r.owner}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/contacts/${r.contact_id}`,
                                                                    )
                                                                }
                                                                className="rounded-md bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                                                            >
                                                                Open
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    openActionModal(
                                                                        r,
                                                                    )
                                                                }
                                                                className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                                            >
                                                                {meta.label}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
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

            <Modal
                open={actionOpen}
                title={`${actionFromException(actionRow?.exception_type).label} (SOP: ${actionFromException(actionRow?.exception_type).sop})`}
                subtitle="Record action and outcome."
                onClose={() => setActionOpen(false)}
                footer={
                    <>
                        <button
                            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            onClick={() => setActionOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            onClick={saveAction}
                        >
                            Save
                        </button>
                    </>
                }
            >
                {renderActionModalBody()}
            </Modal>
        </div>
    );
}

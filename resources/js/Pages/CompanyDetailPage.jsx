// resources/js/pages/CompanyDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Modal from "../Components/Modal";

// Decide which SOP action button to show based on Exception Type text
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

function Field({ label, value }) {
    return (
        <div className="py-2">
            <div className="text-xs font-semibold text-gray-600">{label}</div>
            <div className="text-sm text-gray-900 break-words">
                {value || "—"}
            </div>
        </div>
    );
}

function Section({ title, onEdit, children }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">
                    {title}
                </div>
                {onEdit ? (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="rounded-md bg-green-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
                    >
                        Edit
                    </button>
                ) : null}
            </div>
            <div className="px-4 sm:px-5 py-4">{children}</div>
        </div>
    );
}

function MobileRowCard({
    title,
    subtitle,
    metaLeft,
    metaRight,
    children,
    actions,
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {title}
                    </div>
                    {subtitle ? (
                        <div className="text-xs text-gray-500 mt-0.5">
                            {subtitle}
                        </div>
                    ) : null}
                </div>
                {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>

            {metaLeft || metaRight ? (
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <div className="font-semibold text-gray-500">BU</div>
                        <div className="text-gray-900">{metaLeft || "—"}</div>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-500">Owner</div>
                        <div className="text-gray-900">{metaRight || "—"}</div>
                    </div>
                </div>
            ) : null}

            {children ? <div className="mt-3">{children}</div> : null}
        </div>
    );
}

export default function CompanyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const bu = (searchParams.get("bu") || "Retail").trim();

    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState("db");
    const [error, setError] = useState("");
    const [company, setCompany] = useState(null);

    const [relContacts, setRelContacts] = useState([]);
    const [relDeals, setRelDeals] = useState([]);
    const [relSource, setRelSource] = useState({ contacts: "db", deals: "db" });

    const [editOpen, setEditOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);
    const [sopLogOpen, setSopLogOpen] = useState(false);

    const [sopContext, setSopContext] = useState({
        type: "contact",
        row: null,
    });

    const [form, setForm] = useState({
        company_name: "",
        company_email: "",
        industry: "",
        mobile: "",
        domain: "",
        location: "",
        owner: "",
        notes: "",
    });

    const [actionForm, setActionForm] = useState({
        verification_result: "Verified",
        document_status: "CV Received",
        notes: "",
        channel: "Call",
        outcome: "Confirmed",
        retarget_channel: "WhatsApp",
        retarget_result: "Attempted - No Reply",
        followup_type: "Thank-you Note",
        sent_via: "Email",
        message_summary: "",
    });

    async function loadAll() {
        setLoading(true);
        setError("");

        try {
            const [cRes, rcRes, rdRes] = await Promise.all([
                axios.get(`/api/companies/${encodeURIComponent(id)}`, {
                    params: { bu },
                }),
                axios.get(
                    `/api/companies/${encodeURIComponent(id)}/related-contacts`,
                    {
                        params: { bu },
                    },
                ),
                axios.get(
                    `/api/companies/${encodeURIComponent(id)}/related-deals`,
                    {
                        params: { bu },
                    },
                ),
            ]);

            setSource(cRes.data?.source ?? "db");
            setCompany(cRes.data?.data ?? null);

            setRelSource({
                contacts: rcRes.data?.source ?? "db",
                deals: rdRes.data?.source ?? "db",
            });

            setRelContacts(rcRes.data?.data ?? []);
            setRelDeals(rdRes.data?.data ?? []);
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e.message ||
                    "Failed to load company",
            );
            setCompany(null);
            setRelContacts([]);
            setRelDeals([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, bu]);

    useEffect(() => {
        if (!company) return;
        setForm({
            company_name: company.company_name || "",
            company_email: company.company_email || "",
            industry: company.industry || "",
            mobile: company.mobile || "",
            domain: company.domain || "",
            location: company.location || "",
            owner: company.owner || "",
            notes: company.notes || "",
        });
    }, [company]);

    const meta = useMemo(
        () => actionFromException(company?.exception_type || ""),
        [company],
    );

    function openEdit() {
        setEditOpen(true);
    }

    async function saveEdit() {
        await axios.patch(`/api/companies/${encodeURIComponent(id)}`, {
            company_name: form.company_name,
            company_email: form.company_email,
            industry: form.industry,
            mobile: form.mobile,
            domain: form.domain,
            location: form.location,
            owner: form.owner,
            notes: form.notes,
        });

        setEditOpen(false);
        await loadAll();
    }

    function openAction() {
        const m = meta.action;
        if (m === "VERIFY") {
            setActionForm((p) => ({
                ...p,
                verification_result: "Verified",
                document_status: "CV Received",
                notes: "",
            }));
        } else if (m === "LOG_CONFIRMATION") {
            setActionForm((p) => ({
                ...p,
                channel: "Call",
                outcome: "Confirmed",
                notes: "",
            }));
        } else if (m === "START_RETARGET") {
            setActionForm((p) => ({
                ...p,
                retarget_channel: "WhatsApp",
                retarget_result: "Attempted - No Reply",
                notes: "",
            }));
        } else if (m === "SEND_FOLLOWUP") {
            setActionForm((p) => ({
                ...p,
                followup_type: "Thank-you Note",
                sent_via: "Email",
                message_summary: "",
            }));
        }
        setActionOpen(true);
    }

    async function saveAction() {
        let payloadForm = {};

        if (meta.action === "VERIFY") {
            payloadForm = {
                verification_result: actionForm.verification_result,
                document_status: actionForm.document_status,
                notes: actionForm.notes,
            };
        } else if (meta.action === "LOG_CONFIRMATION") {
            payloadForm = {
                channel: actionForm.channel,
                outcome: actionForm.outcome,
                notes: actionForm.notes,
            };
        } else if (meta.action === "START_RETARGET") {
            payloadForm = {
                retarget_channel: actionForm.retarget_channel,
                result: actionForm.retarget_result,
                notes: actionForm.notes,
            };
        } else if (meta.action === "SEND_FOLLOWUP") {
            payloadForm = {
                followup_type: actionForm.followup_type,
                sent_via: actionForm.sent_via,
                message_summary: actionForm.message_summary,
            };
        }

        await axios.post(`/api/companies/${encodeURIComponent(id)}/action`, {
            action: meta.action,
            form: payloadForm,
        });

        setActionOpen(false);
        await loadAll();
    }

    function openSopLog(type, row) {
        setSopContext({ type, row });
        setSopLogOpen(true);
    }

    function Input({ label, value, onChange, placeholder = "" }) {
        return (
            <div>
                <div className="mb-1 text-xs font-semibold text-gray-600">
                    {label}
                </div>
                <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </div>
        );
    }

    function Select({ label, value, onChange, options }) {
        return (
            <div>
                <div className="mb-1 text-xs font-semibold text-gray-600">
                    {label}
                </div>
                <select
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    function TextArea({ label, value, onChange, placeholder = "" }) {
        return (
            <div>
                <div className="mb-1 text-xs font-semibold text-gray-600">
                    {label}
                </div>
                <textarea
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    rows={4}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </div>
        );
    }

    function renderActionBody() {
        const companyName = company?.company_name || "—";

        if (meta.action === "VERIFY") {
            return (
                <div className="text-sm text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="truncate max-w-[200px]">
                            {companyName}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>Company #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            label="Verification Result"
                            value={actionForm.verification_result}
                            onChange={(v) =>
                                setActionForm((p) => ({
                                    ...p,
                                    verification_result: v,
                                }))
                            }
                            options={["Verified", "Not Verified"]}
                        />
                        <Select
                            label="Document Status"
                            value={actionForm.document_status}
                            onChange={(v) =>
                                setActionForm((p) => ({
                                    ...p,
                                    document_status: v,
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

                    <div className="mt-4">
                        <TextArea
                            label="Notes"
                            value={actionForm.notes}
                            onChange={(v) =>
                                setActionForm((p) => ({ ...p, notes: v }))
                            }
                            placeholder="Add any exception notes..."
                        />
                    </div>
                </div>
            );
        }

        if (meta.action === "LOG_CONFIRMATION") {
            return (
                <div className="text-sm text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="truncate max-w-[200px]">
                            {companyName}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>Company #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            label="Channel"
                            value={actionForm.channel}
                            onChange={(v) =>
                                setActionForm((p) => ({ ...p, channel: v }))
                            }
                            options={["Call", "Email", "WhatsApp"]}
                        />
                        <Select
                            label="Outcome"
                            value={actionForm.outcome}
                            onChange={(v) =>
                                setActionForm((p) => ({ ...p, outcome: v }))
                            }
                            options={["Confirmed", "Not Confirmed"]}
                        />
                    </div>

                    <div className="mt-4">
                        <TextArea
                            label="Notes"
                            value={actionForm.notes}
                            onChange={(v) =>
                                setActionForm((p) => ({ ...p, notes: v }))
                            }
                            placeholder="What happened? Any reschedule details?"
                        />
                    </div>
                </div>
            );
        }

        if (meta.action === "START_RETARGET") {
            return (
                <div className="text-sm text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="truncate max-w-[200px]">
                            {companyName}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>Company #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            label="Retarget Channel"
                            value={actionForm.retarget_channel}
                            onChange={(v) =>
                                setActionForm((p) => ({
                                    ...p,
                                    retarget_channel: v,
                                }))
                            }
                            options={["WhatsApp", "Call", "Email"]}
                        />
                        <Select
                            label="Result"
                            value={actionForm.retarget_result}
                            onChange={(v) =>
                                setActionForm((p) => ({
                                    ...p,
                                    retarget_result: v,
                                }))
                            }
                            options={[
                                "Attempted - No Reply",
                                "Confirmed Next Step",
                                "Wrong Contact",
                            ]}
                        />
                    </div>

                    <div className="mt-4">
                        <TextArea
                            label="Notes"
                            value={actionForm.notes}
                            onChange={(v) =>
                                setActionForm((p) => ({ ...p, notes: v }))
                            }
                            placeholder="Message summary + next step..."
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="text-sm text-gray-700">
                <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    <span className="truncate max-w-[200px]">
                        {companyName}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>Company #{id}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Select
                        label="Follow-up Type"
                        value={actionForm.followup_type}
                        onChange={(v) =>
                            setActionForm((p) => ({ ...p, followup_type: v }))
                        }
                        options={["Thank-you Note", "Reminder", "Reschedule"]}
                    />
                    <Select
                        label="Sent Via"
                        value={actionForm.sent_via}
                        onChange={(v) =>
                            setActionForm((p) => ({ ...p, sent_via: v }))
                        }
                        options={["Email", "WhatsApp", "Call"]}
                    />
                </div>

                <div className="mt-4">
                    <TextArea
                        label="Message Summary"
                        value={actionForm.message_summary}
                        onChange={(v) =>
                            setActionForm((p) => ({ ...p, message_summary: v }))
                        }
                        placeholder="Short summary of what was sent..."
                    />
                </div>
            </div>
        );
    }

    function renderSopLogBody() {
        const type = sopContext.type;
        const row = sopContext.row || {};

        const actionType =
            type === "deal"
                ? "Log Confirmation"
                : actionFromException(row.exception_type || "Not Verified")
                      .label;

        const handledBy = row.owner || company?.owner || "—";
        const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        return (
            <div className="text-sm text-gray-700">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Action Type" value={actionType} />
                    <Field label="Handled By" value={handledBy} />
                    <Field label="Timestamp" value={timestamp} />
                    <Field label="SOP Status" value="Breached" />
                    <Field label="Remaining Time" value="Breached by 12hr" />
                </div>

                <div className="mt-3">
                    <TextArea
                        label="Notes"
                        value={actionForm.notes}
                        onChange={(v) =>
                            setActionForm((p) => ({ ...p, notes: v }))
                        }
                        placeholder="Add Notes here..."
                    />
                </div>

                <div className="mt-2 text-xs text-gray-500">
                    (UI log only) — wire this to a SOP log table later.
                </div>
            </div>
        );
    }

    const activity = company?.activity || [];

    return (
        <div className="p-3 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
                {/* HEADER */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                            Company Detail - {company?.company_name || "—"}
                        </div>

                        {/* stack on mobile, row on desktop */}
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-gray-500">
                            <div>
                                Last SOP Action:{" "}
                                {company?.last_action || meta.label} •{" "}
                                {company?.last_action_at || "—"}
                            </div>
                            <div className="text-gray-600">
                                {company?.owner || "—"} • {company?.bu || bu}
                            </div>
                        </div>

                        {/* buttons: full width on mobile */}
                        <div className="mt-3 grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/companies?bu=${encodeURIComponent(bu)}`,
                                    )
                                }
                                className="w-full sm:w-auto rounded-md bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                            >
                                Go Back
                            </button>

                            <button
                                type="button"
                                onClick={openAction}
                                className="w-full sm:w-auto rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                            >
                                {meta.label}
                            </button>
                        </div>

                        {error ? (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="mt-3 text-xs text-gray-400">
                            Data source:{" "}
                            <span className="font-medium text-gray-600">
                                {source}
                            </span>
                            {source === "mock"
                                ? " (DB empty → mock data for UI preview)"
                                : ""}
                        </div>
                    </div>
                </div>

                {/* CONTACT INFORMATION */}
                <Section title="Contact Information" onEdit={openEdit}>
                    {loading ? (
                        <div className="text-sm text-gray-500">Loading…</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                            <Field
                                label="Company Name"
                                value={company?.company_name}
                            />
                            <Field label="Industry" value={company?.industry} />
                            <Field
                                label="Contact Email"
                                value={company?.company_email}
                            />
                            <Field label="Mobile" value={company?.mobile} />
                            <Field label="Location" value={company?.location} />
                            <Field label="Domain" value={company?.domain} />
                            <Field label="Owner" value={company?.owner} />
                            <Field label="Company ID" value={company?.id} />
                            <div className="py-2 sm:col-span-2">
                                <div className="text-xs font-semibold text-gray-600">
                                    Notes
                                </div>
                                <div className="text-sm text-gray-900 break-words">
                                    {company?.notes || "—"}
                                </div>
                            </div>
                        </div>
                    )}
                </Section>

                {/* RELATED CONTACTS */}
                <Section title="Related Contacts">
                    {/* Mobile cards */}
                    <div className="space-y-3 sm:hidden">
                        {(relContacts || []).length === 0 ? (
                            <div className="text-sm text-gray-500">
                                No related contacts.
                            </div>
                        ) : (
                            relContacts.map((r) => (
                                <MobileRowCard
                                    key={r.contact_id}
                                    title={r.name || "—"}
                                    subtitle={`Lead #${r.contact_id}`}
                                    metaLeft={r.bu || "—"}
                                    metaRight={r.owner || "—"}
                                    actions={
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/contacts/${r.contact_id}`,
                                                    )
                                                }
                                                className="rounded-md bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
                                            >
                                                Open
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openSopLog("contact", r)
                                                }
                                                className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                            >
                                                SOP
                                            </button>
                                        </div>
                                    }
                                >
                                    <div className="text-xs text-gray-600">
                                        <span className="font-semibold">
                                            Lead Status:{" "}
                                        </span>
                                        <span className="text-gray-900">
                                            {r.lead_status || "—"}
                                        </span>
                                    </div>
                                </MobileRowCard>
                            ))
                        )}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden sm:block rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-xs font-semibold text-gray-600">
                                        <th className="px-5 py-3">Contact</th>
                                        <th className="px-5 py-3">BU</th>
                                        <th className="px-5 py-3">
                                            Lead Status
                                        </th>
                                        <th className="px-5 py-3">Owner</th>
                                        <th className="px-5 py-3 text-center">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {(relContacts || []).length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-8 text-center text-sm text-gray-500"
                                            >
                                                No related contacts.
                                            </td>
                                        </tr>
                                    ) : (
                                        relContacts.map((r) => (
                                            <tr
                                                key={r.contact_id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {r.name || "—"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Lead #{r.contact_id}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {r.bu || "—"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {r.lead_status || "—"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {r.owner || "—"}
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
                                                                openSopLog(
                                                                    "contact",
                                                                    r,
                                                                )
                                                            }
                                                            className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                                        >
                                                            SOP Log
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-400">
                        Related contacts source:{" "}
                        <span className="font-medium text-gray-600">
                            {relSource.contacts}
                        </span>
                    </div>
                </Section>

                {/* RELATED DEALS */}
                <Section title="Related Deals">
                    {/* Mobile cards */}
                    <div className="space-y-3 sm:hidden">
                        {(relDeals || []).length === 0 ? (
                            <div className="text-sm text-gray-500">
                                No related deals.
                            </div>
                        ) : (
                            relDeals.map((d) => (
                                <MobileRowCard
                                    key={d.opportunity_id}
                                    title={`Opp #${d.opportunity_id}`}
                                    subtitle={
                                        d.stage ? `Stage: ${d.stage}` : ""
                                    }
                                    metaLeft={company?.bu || bu}
                                    metaRight={d.owner || "—"}
                                    actions={
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/opportunities/${encodeURIComponent(d.opportunity_id)}`,
                                                    )
                                                }
                                                className="rounded-md bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
                                            >
                                                Open
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openSopLog("deal", d)
                                                }
                                                className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                            >
                                                SOP
                                            </button>
                                        </div>
                                    }
                                >
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <div className="font-semibold text-gray-500">
                                                Value
                                            </div>
                                            <div className="text-gray-900">
                                                {d.value || "—"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-500">
                                                Updated
                                            </div>
                                            <div className="text-gray-900">
                                                {d.updated_at || "—"}
                                            </div>
                                        </div>
                                    </div>
                                </MobileRowCard>
                            ))
                        )}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden sm:block rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-xs font-semibold text-gray-600">
                                        <th className="px-5 py-3">
                                            Opportunity
                                        </th>
                                        <th className="px-5 py-3">Stage</th>
                                        <th className="px-5 py-3">Value</th>
                                        <th className="px-5 py-3">Owner</th>
                                        <th className="px-5 py-3">Updated</th>
                                        <th className="px-5 py-3 text-center">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {(relDeals || []).length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-5 py-8 text-center text-sm text-gray-500"
                                            >
                                                No related deals.
                                            </td>
                                        </tr>
                                    ) : (
                                        relDeals.map((d) => (
                                            <tr
                                                key={d.opportunity_id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        Opp #{d.opportunity_id}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {d.stage || "—"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {d.value || "—"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {d.owner || "—"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {d.updated_at || "—"}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/opportunities/${encodeURIComponent(d.opportunity_id)}`,
                                                                )
                                                            }
                                                            className="rounded-md bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                                                        >
                                                            Open
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openSopLog(
                                                                    "deal",
                                                                    d,
                                                                )
                                                            }
                                                            className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                                        >
                                                            SOP Log
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-400">
                        Related deals source:{" "}
                        <span className="font-medium text-gray-600">
                            {relSource.deals}
                        </span>
                    </div>
                </Section>

                {/* ACTIVITY HISTORY */}
                <Section title="Activity History">
                    {(activity || []).length === 0 ? (
                        <div className="text-sm text-gray-500">
                            No activity yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {activity.map((a, idx) => (
                                <div
                                    key={idx}
                                    className="py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6"
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {a.type}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {a.title}
                                        </div>
                                    </div>
                                    <div className="sm:text-right">
                                        <div className="text-xs text-gray-500">
                                            {a.timestamp}
                                        </div>
                                        <div className="text-xs font-semibold text-gray-700">
                                            {a.handled_by}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* EDIT MODAL */}
                <Modal
                    open={editOpen}
                    title="Edit Company"
                    subtitle="Update fields and save."
                    onClose={() => setEditOpen(false)}
                    footer={
                        <>
                            <button
                                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                onClick={saveEdit}
                            >
                                Save
                            </button>
                        </>
                    }
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label="Company Name"
                            value={form.company_name}
                            onChange={(v) =>
                                setForm((p) => ({ ...p, company_name: v }))
                            }
                        />
                        <Input
                            label="Contact Email"
                            value={form.company_email}
                            onChange={(v) =>
                                setForm((p) => ({ ...p, company_email: v }))
                            }
                        />
                        <Input
                            label="Industry"
                            value={form.industry}
                            onChange={(v) =>
                                setForm((p) => ({ ...p, industry: v }))
                            }
                        />
                        <Input
                            label="Mobile"
                            value={form.mobile}
                            onChange={(v) =>
                                setForm((p) => ({ ...p, mobile: v }))
                            }
                        />
                        <Input
                            label="Domain"
                            value={form.domain}
                            onChange={(v) =>
                                setForm((p) => ({ ...p, domain: v }))
                            }
                        />
                        <Input
                            label="Location"
                            value={form.location}
                            onChange={(v) =>
                                setForm((p) => ({ ...p, location: v }))
                            }
                        />
                        <Input
                            label="Owner"
                            value={form.owner}
                            onChange={(v) =>
                                setForm((p) => ({ ...p, owner: v }))
                            }
                        />
                        <div className="sm:col-span-2">
                            <TextArea
                                label="Notes"
                                value={form.notes}
                                onChange={(v) =>
                                    setForm((p) => ({ ...p, notes: v }))
                                }
                                placeholder="Add notes..."
                            />
                        </div>
                    </div>
                </Modal>

                {/* TOP SOP ACTION MODAL */}
                <Modal
                    open={actionOpen}
                    title={`${meta.label} (SOP: ${meta.sop})`}
                    subtitle="Confirm required fields and record the action."
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
                    {renderActionBody()}
                </Modal>

                {/* SOP LOG MODAL */}
                <Modal
                    open={sopLogOpen}
                    title={
                        sopContext.type === "deal"
                            ? "Opportunity SOP Log"
                            : "SOP Log"
                    }
                    subtitle="Record SOP action outcome."
                    onClose={() => setSopLogOpen(false)}
                    footer={
                        <>
                            <button
                                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                onClick={() => setSopLogOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                onClick={() => setSopLogOpen(false)}
                            >
                                Save
                            </button>
                        </>
                    }
                >
                    {renderSopLogBody()}
                </Modal>
            </div>
        </div>
    );
}

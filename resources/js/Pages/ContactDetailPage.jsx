// resources/js/pages/ContactDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../Components/Modal";

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
                <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-md bg-green-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
                >
                    Edit
                </button>
            </div>
            <div className="px-4 sm:px-5 py-4">{children}</div>
        </div>
    );
}

function actionFromException(exceptionType = "") {
    const t = (exceptionType || "").toLowerCase();
    if (t.includes("not verified"))
        return { action: "VERIFY", label: "Verify Lead", sop: "12h" };
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
    return { action: "VERIFY", label: "Verify Lead", sop: "12h" };
}

export default function ContactDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState("db");
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editSection, setEditSection] = useState(null);

    const [actionOpen, setActionOpen] = useState(false);

    const [docOpen, setDocOpen] = useState(false);
    const [docMode, setDocMode] = useState("upload");

    const [form, setForm] = useState({
        contact: {
            first_name: "",
            last_name: "",
            mobile: "",
            whatsapp: "",
            preferred_channel: "",
            student_nrc: "",
        },
        lead_qualification: {
            inquiry_type: "",
            solution_course_interest: "",
            current_company: "",
            current_job_role: "",
            target_career_goals: "",
            qualification_score: "",
            notes: "",
        },
        documents: {
            cv_status: "",
            last_cv_upload_date: "",
            document_notes: "",
            cala_form: "",
            cv_url: "",
            cala_url: "",
        },
        verify: {
            verification_result: "Verified",
            document_status: "CV Received",
            notes: "",
        },
        confirm: { channel: "Call", outcome: "Confirmed", notes: "" },
        retarget: {
            retarget_channel: "WhatsApp",
            result: "Attempted - No Reply",
            notes: "",
        },
        followup: {
            followup_type: "Thank-you Note",
            sent_via: "Email",
            message_summary: "",
        },
    });

    async function load() {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(
                `/api/contacts/${encodeURIComponent(id)}`,
            );
            setSource(res.data?.source ?? "db");
            setData(res.data?.data ?? null);
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e.message ||
                    "Failed to load contact",
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [id]);

    useEffect(() => {
        if (!data) return;

        const contact = data.contact || {};
        const lead = data.lead_qualification || {};
        const docs = data.documents || {};

        setForm((prev) => ({
            ...prev,
            contact: {
                first_name:
                    contact.first_name ||
                    (data.name ? data.name.split(" ")[0] : ""),
                last_name:
                    contact.last_name ||
                    (data.name ? data.name.split(" ").slice(1).join(" ") : ""),
                mobile: contact.mobile || "",
                whatsapp: contact.whatsapp || "",
                preferred_channel: contact.preferred_channel || "",
                student_nrc: contact.student_nrc || "",
            },
            lead_qualification: {
                inquiry_type: lead.inquiry_type || "",
                solution_course_interest: lead.solution_course_interest || "",
                current_company: lead.current_company || "",
                current_job_role: lead.current_job_role || "",
                target_career_goals: lead.target_career_goals || "",
                qualification_score: lead.qualification_score || "",
                notes: lead.notes || "",
            },
            documents: {
                cv_status: docs.cv_status || data.documents || "",
                last_cv_upload_date: docs.last_cv_upload_date || "",
                document_notes: docs.document_notes || "",
                cala_form: docs.cala_form || "",
                cv_url: docs.cv_url || "",
                cala_url: docs.cala_url || "",
            },
        }));
    }, [data]);

    const meta = useMemo(
        () => actionFromException(data?.exception_type || ""),
        [data],
    );

    const header = useMemo(() => {
        const name = data?.name || "—";
        const owner = data?.owner || "—";
        const bu = data?.bu || "—";
        const lastAction = data?.last_action || meta.label;
        const lastAt = data?.last_action_at || "—";
        return {
            title: `Contacts Detail - ${name}`,
            metaLeft: `Last SOP Action: ${lastAction}  •  ${lastAt}`,
            metaRight: `${owner}  •  ${bu}`,
        };
    }, [data, meta]);

    function openEdit(which) {
        setEditSection(which);
        setEditOpen(true);
    }

    async function saveEdit() {
        const payload =
            editSection === "contact"
                ? { contact: form.contact }
                : editSection === "lead"
                  ? { lead_qualification: form.lead_qualification }
                  : { documents: form.documents };

        await axios.patch(`/api/contacts/${encodeURIComponent(id)}`, payload);

        setEditOpen(false);
        setEditSection(null);
        await load();
    }

    function openAction() {
        setActionOpen(true);
    }

    async function saveAction() {
        let payloadForm = {};
        if (meta.action === "VERIFY") payloadForm = form.verify;
        if (meta.action === "LOG_CONFIRMATION") payloadForm = form.confirm;
        if (meta.action === "START_RETARGET") payloadForm = form.retarget;
        if (meta.action === "SEND_FOLLOWUP") payloadForm = form.followup;

        await axios.post(`/api/contacts/${encodeURIComponent(id)}/action`, {
            action: meta.action,
            form: payloadForm,
        });

        setActionOpen(false);
        await load();
    }

    function openDoc(mode) {
        setDocMode(mode);
        setDocOpen(true);
    }

    function openIfUrl(url) {
        const u = (url || "").trim();
        if (!u) return false;
        window.open(u, "_blank", "noopener,noreferrer");
        return true;
    }

    async function saveDocLinks() {
        await axios.patch(`/api/contacts/${encodeURIComponent(id)}`, {
            documents: { ...form.documents },
        });

        setDocOpen(false);
        await load();
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

    // YOUR existing modal bodies (unchanged)
    function renderEditBody() {
        if (editSection === "contact") {
            return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="First Name"
                        value={form.contact.first_name}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                contact: { ...p.contact, first_name: v },
                            }))
                        }
                    />
                    <Input
                        label="Last Name"
                        value={form.contact.last_name}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                contact: { ...p.contact, last_name: v },
                            }))
                        }
                    />
                    <Input
                        label="Mobile"
                        value={form.contact.mobile}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                contact: { ...p.contact, mobile: v },
                            }))
                        }
                    />
                    <Input
                        label="WhatsApp"
                        value={form.contact.whatsapp}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                contact: { ...p.contact, whatsapp: v },
                            }))
                        }
                    />
                    <Input
                        label="Preferred Channel"
                        value={form.contact.preferred_channel}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                contact: { ...p.contact, preferred_channel: v },
                            }))
                        }
                    />
                    <Input
                        label="Student NRC"
                        value={form.contact.student_nrc}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                contact: { ...p.contact, student_nrc: v },
                            }))
                        }
                    />
                </div>
            );
        }

        if (editSection === "lead") {
            return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Inquiry Type"
                        value={form.lead_qualification.inquiry_type}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                lead_qualification: {
                                    ...p.lead_qualification,
                                    inquiry_type: v,
                                },
                            }))
                        }
                    />
                    <Input
                        label="Solution / Course Interest"
                        value={form.lead_qualification.solution_course_interest}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                lead_qualification: {
                                    ...p.lead_qualification,
                                    solution_course_interest: v,
                                },
                            }))
                        }
                    />
                    <Input
                        label="Current Company"
                        value={form.lead_qualification.current_company}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                lead_qualification: {
                                    ...p.lead_qualification,
                                    current_company: v,
                                },
                            }))
                        }
                    />
                    <Input
                        label="Current Job Role"
                        value={form.lead_qualification.current_job_role}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                lead_qualification: {
                                    ...p.lead_qualification,
                                    current_job_role: v,
                                },
                            }))
                        }
                    />
                    <Input
                        label="Target Career Goals"
                        value={form.lead_qualification.target_career_goals}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                lead_qualification: {
                                    ...p.lead_qualification,
                                    target_career_goals: v,
                                },
                            }))
                        }
                    />
                    <Input
                        label="Qualification Score"
                        value={form.lead_qualification.qualification_score}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                lead_qualification: {
                                    ...p.lead_qualification,
                                    qualification_score: v,
                                },
                            }))
                        }
                    />
                    <div className="sm:col-span-2">
                        <TextArea
                            label="Notes"
                            value={form.lead_qualification.notes}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    lead_qualification: {
                                        ...p.lead_qualification,
                                        notes: v,
                                    },
                                }))
                            }
                            placeholder="Add notes..."
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                    label="CV Status"
                    value={form.documents.cv_status}
                    onChange={(v) =>
                        setForm((p) => ({
                            ...p,
                            documents: { ...p.documents, cv_status: v },
                        }))
                    }
                />
                <Input
                    label="CaLA Form"
                    value={form.documents.cala_form}
                    onChange={(v) =>
                        setForm((p) => ({
                            ...p,
                            documents: { ...p.documents, cala_form: v },
                        }))
                    }
                />
                <Input
                    label="Last CV Upload Date"
                    value={form.documents.last_cv_upload_date}
                    onChange={(v) =>
                        setForm((p) => ({
                            ...p,
                            documents: {
                                ...p.documents,
                                last_cv_upload_date: v,
                            },
                        }))
                    }
                />
                <div className="sm:col-span-2">
                    <TextArea
                        label="Document Notes"
                        value={form.documents.document_notes}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                documents: {
                                    ...p.documents,
                                    document_notes: v,
                                },
                            }))
                        }
                        placeholder="Add notes..."
                    />
                </div>
                <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="CV URL"
                        value={form.documents.cv_url}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                documents: { ...p.documents, cv_url: v },
                            }))
                        }
                        placeholder="https://..."
                    />
                    <Input
                        label="CaLA URL"
                        value={form.documents.cala_url}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                documents: { ...p.documents, cala_url: v },
                            }))
                        }
                        placeholder="https://..."
                    />
                </div>
            </div>
        );
    }

    function renderActionBody() {
        const name = data?.name || "—";

        // keep your existing logic exactly, just reusing Select/TextArea components:
        if (meta.action === "VERIFY") {
            return (
                <div className="text-sm text-gray-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span className="text-gray-400">•</span>
                        <span>Lead #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            label="Verification Result"
                            value={form.verify.verification_result}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    verify: {
                                        ...p.verify,
                                        verification_result: v,
                                    },
                                }))
                            }
                            options={["Verified", "Not Verified"]}
                        />
                        <Select
                            label="Document Status"
                            value={form.verify.document_status}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    verify: { ...p.verify, document_status: v },
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
                            value={form.verify.notes}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    verify: { ...p.verify, notes: v },
                                }))
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
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span className="text-gray-400">•</span>
                        <span>Lead #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            label="Channel"
                            value={form.confirm.channel}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    confirm: { ...p.confirm, channel: v },
                                }))
                            }
                            options={["Call", "Email", "WhatsApp"]}
                        />
                        <Select
                            label="Outcome"
                            value={form.confirm.outcome}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    confirm: { ...p.confirm, outcome: v },
                                }))
                            }
                            options={["Confirmed", "Not Confirmed"]}
                        />
                    </div>

                    <div className="mt-4">
                        <TextArea
                            label="Notes"
                            value={form.confirm.notes}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    confirm: { ...p.confirm, notes: v },
                                }))
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
                        <span className="truncate max-w-[200px]">{name}</span>
                        <span className="text-gray-400">•</span>
                        <span>Lead #{id}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            label="Retarget Channel"
                            value={form.retarget.retarget_channel}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    retarget: {
                                        ...p.retarget,
                                        retarget_channel: v,
                                    },
                                }))
                            }
                            options={["WhatsApp", "Call", "Email"]}
                        />
                        <Select
                            label="Result"
                            value={form.retarget.result}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    retarget: { ...p.retarget, result: v },
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
                            value={form.retarget.notes}
                            onChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    retarget: { ...p.retarget, notes: v },
                                }))
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
                    <span className="truncate max-w-[200px]">{name}</span>
                    <span className="text-gray-400">•</span>
                    <span>Lead #{id}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Select
                        label="Follow-up Type"
                        value={form.followup.followup_type}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                followup: { ...p.followup, followup_type: v },
                            }))
                        }
                        options={["Thank-you Note", "Reminder", "Reschedule"]}
                    />
                    <Select
                        label="Sent Via"
                        value={form.followup.sent_via}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                followup: { ...p.followup, sent_via: v },
                            }))
                        }
                        options={["Email", "WhatsApp", "Call"]}
                    />
                </div>

                <div className="mt-4">
                    <TextArea
                        label="Message Summary"
                        value={form.followup.message_summary}
                        onChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                followup: { ...p.followup, message_summary: v },
                            }))
                        }
                        placeholder="Short summary of what was sent..."
                    />
                </div>
            </div>
        );
    }

    const contactInfo = data?.contact || {};
    const lead = data?.lead_qualification || {};
    const docs = data?.documents || {};

    const cvUrl = (docs.cv_url || form.documents.cv_url || "").trim();
    const calaUrl = (docs.cala_url || form.documents.cala_url || "").trim();

    return (
        <div className="p-3 sm:p-6">
            <div className="mx-auto max-w-5xl">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="px-4 sm:px-5 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                            {header.title}
                        </div>

                        {/* stack on mobile */}
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-gray-500">
                            <div className="break-words">{header.metaLeft}</div>
                            <div className="text-gray-600 break-words">
                                {header.metaRight}
                            </div>
                        </div>

                        {/* full width buttons on mobile */}
                        <div className="mt-3 grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => navigate("/contacts")}
                                className="w-full sm:w-auto rounded-md bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                            >
                                Go back
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

                <div className="mt-4 sm:mt-5 space-y-4 sm:space-y-5">
                    <Section
                        title="Contact Information"
                        onEdit={() => openEdit("contact")}
                    >
                        {loading ? (
                            <div className="text-sm text-gray-500">
                                Loading…
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                                <Field
                                    label="First Name"
                                    value={
                                        contactInfo.first_name ||
                                        form.contact.first_name
                                    }
                                />
                                <Field
                                    label="Last Name"
                                    value={
                                        contactInfo.last_name ||
                                        form.contact.last_name
                                    }
                                />
                                <Field
                                    label="Contact Email"
                                    value={data?.email}
                                />
                                <Field
                                    label="Mobile"
                                    value={
                                        contactInfo.mobile ||
                                        form.contact.mobile
                                    }
                                />
                                <Field
                                    label="WhatsApp"
                                    value={
                                        contactInfo.whatsapp ||
                                        form.contact.whatsapp
                                    }
                                />
                                <Field
                                    label="Preferred Channel"
                                    value={
                                        contactInfo.preferred_channel ||
                                        form.contact.preferred_channel
                                    }
                                />
                                <Field
                                    label="Student NRC"
                                    value={
                                        contactInfo.student_nrc ||
                                        form.contact.student_nrc
                                    }
                                />
                                <Field label="Business Unit" value={data?.bu} />
                            </div>
                        )}
                    </Section>

                    <Section
                        title="Lead Qualification"
                        onEdit={() => openEdit("lead")}
                    >
                        {loading ? (
                            <div className="text-sm text-gray-500">
                                Loading…
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                                <Field
                                    label="Inquiry Type"
                                    value={
                                        lead.inquiry_type ||
                                        form.lead_qualification.inquiry_type
                                    }
                                />
                                <Field
                                    label="Solution / Course Interest"
                                    value={
                                        lead.solution_course_interest ||
                                        form.lead_qualification
                                            .solution_course_interest
                                    }
                                />
                                <Field
                                    label="Current Company"
                                    value={
                                        lead.current_company ||
                                        form.lead_qualification.current_company
                                    }
                                />
                                <Field
                                    label="Current Job Role"
                                    value={
                                        lead.current_job_role ||
                                        form.lead_qualification.current_job_role
                                    }
                                />
                                <Field
                                    label="Target Career Goals"
                                    value={
                                        lead.target_career_goals ||
                                        form.lead_qualification
                                            .target_career_goals
                                    }
                                />
                                <Field
                                    label="Qualification Score"
                                    value={
                                        lead.qualification_score ||
                                        form.lead_qualification
                                            .qualification_score
                                    }
                                />

                                <div className="py-2 sm:col-span-2">
                                    <div className="text-xs font-semibold text-gray-600">
                                        Notes
                                    </div>
                                    <div className="text-sm text-gray-900 break-words">
                                        {lead.notes ||
                                            form.lead_qualification.notes ||
                                            "—"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Section>

                    <Section
                        title="Documents"
                        onEdit={() => openEdit("documents")}
                    >
                        {loading ? (
                            <div className="text-sm text-gray-500">
                                Loading…
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                                <Field
                                    label="CV Status"
                                    value={
                                        docs.cv_status ||
                                        data?.documents ||
                                        form.documents.cv_status
                                    }
                                />
                                <Field
                                    label="CaLA Form"
                                    value={
                                        docs.cala_form ||
                                        form.documents.cala_form
                                    }
                                />
                                <Field
                                    label="Last CV Upload Date"
                                    value={
                                        docs.last_cv_upload_date ||
                                        form.documents.last_cv_upload_date
                                    }
                                />

                                <div className="py-2">
                                    <div className="text-xs font-semibold text-gray-600">
                                        Links
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!openIfUrl(cvUrl))
                                                    openDoc("cv");
                                            }}
                                            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                                        >
                                            View CV
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!openIfUrl(calaUrl))
                                                    openDoc("cala");
                                            }}
                                            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                                        >
                                            View CaLA
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openDoc("upload")}
                                            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>

                                <div className="py-2 sm:col-span-2">
                                    <div className="text-xs font-semibold text-gray-600">
                                        Document Notes
                                    </div>
                                    <div className="text-sm text-gray-900 break-words">
                                        {docs.document_notes ||
                                            form.documents.document_notes ||
                                            "—"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Section>
                </div>

                {/* EDIT MODAL */}
                <Modal
                    open={editOpen}
                    title={
                        editSection === "contact"
                            ? "Edit Contact Information"
                            : editSection === "lead"
                              ? "Edit Lead Qualification"
                              : "Edit Documents"
                    }
                    subtitle="Update fields and save."
                    onClose={() => {
                        setEditOpen(false);
                        setEditSection(null);
                    }}
                    footer={
                        <>
                            <button
                                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                    setEditOpen(false);
                                    setEditSection(null);
                                }}
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
                    {renderEditBody()}
                </Modal>

                {/* SOP ACTION MODAL */}
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

                {/* DOC LINKS MODAL */}
                <Modal
                    open={docOpen}
                    title={
                        docMode === "cv"
                            ? "CV Link"
                            : docMode === "cala"
                              ? "CaLA Link"
                              : "Upload Document Links"
                    }
                    subtitle="Add a link so the buttons can open the document."
                    onClose={() => setDocOpen(false)}
                    footer={
                        <>
                            <button
                                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                onClick={() => setDocOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                onClick={saveDocLinks}
                            >
                                Save
                            </button>
                        </>
                    }
                >
                    <div className="grid grid-cols-1 gap-4">
                        {docMode !== "cala" ? (
                            <Input
                                label="CV URL"
                                value={form.documents.cv_url || ""}
                                onChange={(v) =>
                                    setForm((p) => ({
                                        ...p,
                                        documents: {
                                            ...p.documents,
                                            cv_url: v,
                                        },
                                    }))
                                }
                                placeholder="https://..."
                            />
                        ) : null}

                        {docMode !== "cv" ? (
                            <Input
                                label="CaLA URL"
                                value={form.documents.cala_url || ""}
                                onChange={(v) =>
                                    setForm((p) => ({
                                        ...p,
                                        documents: {
                                            ...p.documents,
                                            cala_url: v,
                                        },
                                    }))
                                }
                                placeholder="https://..."
                            />
                        ) : null}

                        <div className="text-xs text-gray-500">
                            If your database doesn’t store file links yet, you
                            can use these overrides for UI testing.
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

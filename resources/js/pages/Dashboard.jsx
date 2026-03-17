import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const BRAND_BLUE = "#193E6B";

function formatNumber(value) {
    const number = Number(value || 0);
    return Number.isNaN(number) ? "0" : number.toLocaleString();
}

function formatCurrencyCompact(value) {
    const number = Number(value || 0);
    if (!number) return "$0";
    if (number >= 1000000) return `$${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `$${(number / 1000).toFixed(0)}K`;
    return `$${number.toLocaleString()}`;
}

function BlueTitle({ children, className = "", style = {} }) {
    return (
        <div
            className={className}
            style={{
                color: BRAND_BLUE,
                fontWeight: 700,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function BlueText({ children, className = "", style = {} }) {
    return (
        <div
            className={className}
            style={{
                color: BRAND_BLUE,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function Field({ label, required, full, children }) {
    return (
        <div className={`field ${full ? "full" : ""}`}>
            <label
                style={{
                    color: BRAND_BLUE,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                }}
            >
                {label}
                {required ? " *" : ""}
            </label>
            {children}
        </div>
    );
}

function Toast({ toast }) {
    return (
        <div className={`toast ${toast.type || "success"}`}>
            <strong style={{ color: BRAND_BLUE }}>{toast.title}</strong>
            <div>{toast.message}</div>
        </div>
    );
}

function getTimelineIcon(itemType) {
    switch (itemType) {
        case "meeting":
            return "📅";
        case "task":
            return "☎";
        case "payment":
            return "🧾";
        case "onboarding":
            return "🎓";
        default:
            return "•";
    }
}

function buildViewConfigs({
    upcomingMeetingsAndFollowups = [],
    operationalExceptions = [],
}) {
    const upcomingMap = Object.fromEntries(
        upcomingMeetingsAndFollowups.map((item) => [
            `${item.item_type}-${item.id}`,
            {
                title: `${item.title} Detail`,
                subtitle: `${item.detail_type || item.item_type} detail`,
                content: (
                    <div className="detail-view-wrap">
                        <section className="section-card">
                            <BlueTitle className="section-title">
                                Overview
                            </BlueTitle>
                            <div className="detail-grid">
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Title
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.title || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Subject
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.subject_name || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Event Date
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.event_date || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Status
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.status || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Type
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.detail_type || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Owner
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.owner_name || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Deal
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.deal_name || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Record ID
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.id || "-"}
                                    </BlueText>
                                </div>
                            </div>
                        </section>

                        <section className="section-card">
                            <BlueTitle className="section-title">
                                Notes / Summary
                            </BlueTitle>
                            <div className="detail-box full">
                                <BlueText
                                    className="k"
                                    style={{ fontWeight: 700 }}
                                >
                                    Summary
                                </BlueText>
                                <BlueText className="v">
                                    {item.subtitle || "-"}
                                </BlueText>
                            </div>
                        </section>
                    </div>
                ),
            },
        ]),
    );

    const exceptionMap = Object.fromEntries(
        operationalExceptions.map((item) => [
            `exception-${item.id}`,
            {
                title: item.title || "Exception Detail",
                subtitle: "Operational exception detail",
                content: (
                    <div className="detail-view-wrap">
                        <section className="section-card">
                            <BlueTitle className="section-title">
                                Exception Overview
                            </BlueTitle>
                            <div className="detail-grid">
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Exception Type
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.title || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Status
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.status || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Severity
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.severity || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Owner
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.owner_name || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        SLA
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.sla || "-"}
                                    </BlueText>
                                </div>
                                <div className="detail-box">
                                    <BlueText
                                        className="k"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Exception ID
                                    </BlueText>
                                    <BlueText className="v">
                                        {item.id || "-"}
                                    </BlueText>
                                </div>
                            </div>
                        </section>

                        <section className="section-card">
                            <BlueTitle className="section-title">
                                Blocker Description
                            </BlueTitle>
                            <div className="detail-box full">
                                <BlueText
                                    className="k"
                                    style={{ fontWeight: 700 }}
                                >
                                    Description
                                </BlueText>
                                <BlueText className="v">
                                    {item.description || "-"}
                                </BlueText>
                            </div>
                        </section>
                    </div>
                ),
            },
        ]),
    );

    return {
        ...upcomingMap,
        ...exceptionMap,
    };
}

function getSeedLabel(actionKey) {
    switch (actionKey) {
        case "Log Meeting":
            return "Select the contact / record that needs a meeting entry.";
        case "Create Follow-Up Task":
            return "Select the record that needs follow-up action.";
        case "Send Reminder":
            return "Select the record that needs a reminder.";
        case "Send Proposal":
            return "Select the qualified lead / company to send proposal to.";
        case "Issue Invoice":
            return "Select the deal / company that needs invoice action.";
        case "Create Opportunity":
            return "Select the lead / company to convert into opportunity.";
        case "Mark Closed Won":
            return "Select the deal that is ready to close.";
        case "exception":
            return "Select the blocked record that needs an exception.";
        default:
            return "Select a record.";
    }
}

function seedToSearchText(record) {
    return [
        record.title,
        record.subject_name,
        record.company_name,
        record.deal_name,
        record.owner_name,
        record.stage,
        record.status,
        record.type,
        record.subtitle,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}

function buildModalConfigs(selectedRecord) {
    const seed = selectedRecord || {};

    return {
        "Log Meeting": {
            title: "Log Meeting",
            subtitle: "Session logging workflow",
            submit: "Log Meeting",
            footnote:
                "Step 1: select the record. Step 2: log the meeting with full detail.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Meeting Outcome Logging
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill info">
                            {seed.status || "Selected"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Contact ID">
                            <input value={seed.contact_id || ""} readOnly />
                        </Field>
                        <Field label="Company ID">
                            <input value={seed.company_id || ""} readOnly />
                        </Field>
                        <Field label="Deal ID">
                            <input value={seed.deal_id || ""} readOnly />
                        </Field>
                        <Field label="Meeting Title" required>
                            <input
                                value={form.meetingTitle || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        meetingTitle: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Meeting Type" required>
                            <select
                                value={form.meetingType || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        meetingType: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>CaLA Session</option>
                                <option>Sales Presentation</option>
                                <option>Proposal Review</option>
                                <option>Follow-up</option>
                                <option>Onboarding</option>
                            </select>
                        </Field>
                        <Field label="Meeting Status" required>
                            <select
                                value={form.meetingStatus || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        meetingStatus: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Scheduled</option>
                                <option>Completed</option>
                                <option>Rescheduled</option>
                                <option>No-Show</option>
                                <option>Cancelled</option>
                            </select>
                        </Field>
                        <Field label="Meeting Outcome" required>
                            <select
                                value={form.meetingOutcome || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        meetingOutcome: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Interested</option>
                                <option>Follow-Up Needed</option>
                                <option>Not Interested</option>
                                <option>Rescheduled</option>
                                <option>No-Show</option>
                                <option>Completed</option>
                            </select>
                        </Field>
                        <Field label="Meeting Date & Time" required>
                            <input
                                type="datetime-local"
                                value={form.meetingDate || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        meetingDate: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Assigned To">
                            <input
                                value={form.assignedTo || seed.owner_name || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        assignedTo: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Recording URL">
                            <input
                                value={form.recordingUrl || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        recordingUrl: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Key Notes" full required>
                            <textarea
                                value={form.meetingNotes || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        meetingNotes: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },

        "Create Follow-Up Task": {
            title: "Create Follow-Up Task",
            subtitle: "Set the next touchpoint",
            submit: "Create Task",
            footnote:
                "Step 1: select who needs the task. Step 2: fill the detailed SOP-aligned task form.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Follow-Up Task Setup
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill pending">
                            {seed.status || "Pending"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Contact ID">
                            <input value={seed.contact_id || ""} readOnly />
                        </Field>
                        <Field label="Company ID">
                            <input value={seed.company_id || ""} readOnly />
                        </Field>
                        <Field label="Deal ID">
                            <input value={seed.deal_id || ""} readOnly />
                        </Field>
                        <Field label="Task Title" required>
                            <input
                                value={form.taskTitle || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        taskTitle: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Related Record" required>
                            <input
                                value={
                                    form.recordName || seed.subject_name || ""
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        recordName: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Task Type" required>
                            <select
                                value={form.taskType || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        taskType: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Call Follow-up</option>
                                <option>Email Follow-up</option>
                                <option>Proposal Follow-up</option>
                                <option>Document Request</option>
                                <option>Meeting Schedule</option>
                            </select>
                        </Field>
                        <Field label="Task Category">
                            <select
                                value={form.taskCategory || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        taskCategory: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Lead Qualification</option>
                                <option>Opportunity Management</option>
                                <option>Finance</option>
                                <option>Onboarding</option>
                            </select>
                        </Field>
                        <Field label="Assigned To" required>
                            <input
                                value={form.assignedTo || seed.owner_name || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        assignedTo: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Priority">
                            <select
                                value={form.taskPriority || "High"}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        taskPriority: e.target.value,
                                    }))
                                }
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </Field>
                        <Field label="Task Status">
                            <select
                                value={form.taskStatus || "Pending"}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        taskStatus: e.target.value,
                                    }))
                                }
                            >
                                <option>Pending</option>
                                <option>Active</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                            </select>
                        </Field>
                        <Field label="Communication Channel">
                            <select
                                value={form.communicationChannel || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        communicationChannel: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Call</option>
                                <option>Email</option>
                                <option>WhatsApp</option>
                                <option>SMS</option>
                            </select>
                        </Field>
                        <Field label="Due Date" required>
                            <input
                                type="datetime-local"
                                value={form.dueDate || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        dueDate: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Next Action">
                            <input
                                value={form.nextAction || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        nextAction: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Next Action Date">
                            <input
                                type="datetime-local"
                                value={form.nextActionDate || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        nextActionDate: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Description" full required>
                            <textarea
                                value={form.description || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },

        "Send Reminder": {
            title: "Send Reminder",
            subtitle: "Confirmation, 48-hour, 2-hour, or retarget workflow",
            submit: "Send Reminder",
            footnote:
                "Step 1: select the record. Step 2: log reminder type, channel, time, and message.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Reminder Workflow
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill info">
                            {seed.status || "Selected"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Contact ID">
                            <input value={seed.contact_id || ""} readOnly />
                        </Field>
                        <Field label="Deal ID">
                            <input value={seed.deal_id || ""} readOnly />
                        </Field>
                        <Field label="Reminder Type" required>
                            <select
                                value={form.reminderType || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        reminderType: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Confirmation Call</option>
                                <option>48-hour Reminder</option>
                                <option>2-hour Reminder</option>
                                <option>No-Show Retarget</option>
                            </select>
                        </Field>
                        <Field label="Channel" required>
                            <select
                                value={form.channel || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        channel: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Phone Call</option>
                                <option>WhatsApp</option>
                                <option>SMS</option>
                                <option>Email</option>
                            </select>
                        </Field>
                        <Field label="Reminder Status">
                            <select
                                value={form.reminderStatus || "Pending"}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        reminderStatus: e.target.value,
                                    }))
                                }
                            >
                                <option>Pending</option>
                                <option>Sent</option>
                                <option>Done</option>
                                <option>Missed</option>
                            </select>
                        </Field>
                        <Field label="Reminder Time" required>
                            <input
                                type="datetime-local"
                                value={form.reminderTime || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        reminderTime: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Message / Call Note" full required>
                            <textarea
                                value={form.reminderMessage || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        reminderMessage: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },

        "Send Proposal": {
            title: "Send Proposal",
            subtitle: "Proposal dispatch with progression support",
            submit: "Send Proposal",
            footnote:
                "Step 1: select the qualified record. Step 2: fill proposal detail.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Proposal Dispatch
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill purple">
                            {seed.stage || "Lead"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Contact ID">
                            <input value={seed.contact_id || ""} readOnly />
                        </Field>
                        <Field label="Company ID">
                            <input value={seed.company_id || ""} readOnly />
                        </Field>
                        <Field label="Deal ID">
                            <input value={seed.deal_id || ""} readOnly />
                        </Field>
                        <Field label="Proposal Name" required>
                            <input
                                value={form.proposalName || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        proposalName: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Proposal Type" required>
                            <select
                                value={form.proposalType || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        proposalType: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Proposal Summary</option>
                                <option>Sales Proposal</option>
                                <option>Solution Overview</option>
                            </select>
                        </Field>
                        <Field label="Response Due Date" required>
                            <input
                                type="date"
                                value={form.responseDue || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        responseDue: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Stage After Sending">
                            <select
                                value={form.nextStage || "Opportunity - Bronze"}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        nextStage: e.target.value,
                                    }))
                                }
                            >
                                <option>Lead remains active</option>
                                <option>Opportunity - Bronze</option>
                            </select>
                        </Field>
                        <Field label="Proposal Note" full required>
                            <textarea
                                value={form.proposalNotes || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        proposalNotes: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },

        "Issue Invoice": {
            title: "Issue Invoice",
            subtitle: "Finance request or invoice issuance workflow",
            submit: "Issue Invoice",
            footnote:
                "Step 1: select who / which deal to invoice. Step 2: enter invoice detail.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Invoice Request / Issuance
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill alert">
                            {seed.status || "Finance"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Contact ID">
                            <input value={seed.contact_id || ""} readOnly />
                        </Field>
                        <Field label="Company ID">
                            <input value={seed.company_id || ""} readOnly />
                        </Field>
                        <Field label="Deal ID">
                            <input value={seed.deal_id || ""} readOnly />
                        </Field>
                        <Field label="Deal / Cohort" required>
                            <input
                                value={form.dealName || seed.deal_name || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        dealName: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Invoice Number" required>
                            <input
                                value={form.invoiceNumber || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        invoiceNumber: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Invoice Type" required>
                            <select
                                value={form.invoiceType || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        invoiceType: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Full Payment</option>
                                <option>Initial Payment (10%)</option>
                            </select>
                        </Field>
                        <Field label="Invoice Amount" required>
                            <input
                                value={form.invoiceAmount || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        invoiceAmount: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Due Date" required>
                            <input
                                type="date"
                                value={form.invoiceDue || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        invoiceDue: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Finance Request Note" full required>
                            <textarea
                                value={form.invoiceNote || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        invoiceNote: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },

        "Create Opportunity": {
            title: "Create Opportunity",
            subtitle: "Move qualified leads into active deal tracking",
            submit: "Create Opportunity",
            footnote:
                "Step 1: select the lead / company. Step 2: create the opportunity record.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Create Opportunity
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill info">
                            {seed.stage || "Qualified"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Contact ID">
                            <input value={seed.contact_id || ""} readOnly />
                        </Field>
                        <Field label="Company ID">
                            <input value={seed.company_id || ""} readOnly />
                        </Field>
                        <Field label="Target Name" required>
                            <input
                                value={
                                    form.targetName || seed.subject_name || ""
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        targetName: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Deal Name" required>
                            <input
                                value={form.dealName || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        dealName: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Opportunity Type" required>
                            <select
                                value={form.oppType || "Bronze"}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        oppType: e.target.value,
                                    }))
                                }
                            >
                                <option>Bronze</option>
                                <option>Silver</option>
                                <option>Gold</option>
                            </select>
                        </Field>
                        <Field label="Expected Close Date" required>
                            <input
                                type="date"
                                value={form.closeDate || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        closeDate: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Estimated Value" required>
                            <input
                                value={form.dealValue || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        dealValue: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field
                            label="Reason for Stage Progression"
                            full
                            required
                        >
                            <textarea
                                value={form.oppReason || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        oppReason: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },

        "Mark Closed Won": {
            title: "Mark Closed Won",
            subtitle:
                "Finalization of signed, paid, and onboarding-ready deals",
            submit: "Mark Closed Won",
            footnote:
                "Step 1: select the deal. Step 2: fill final closure detail.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Closed Won Finalization
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill ok">
                            {seed.status || "Ready"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Deal ID">
                            <input value={seed.deal_id || ""} readOnly />
                        </Field>
                        <Field label="Company ID">
                            <input value={seed.company_id || ""} readOnly />
                        </Field>
                        <Field label="Deal Name" required>
                            <input
                                value={form.dealName || seed.deal_name || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        dealName: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Actual Close Date" required>
                            <input
                                type="date"
                                value={form.actualCloseDate || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        actualCloseDate: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Payment Status" required>
                            <select
                                value={form.paymentStatus || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        paymentStatus: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Fully Paid</option>
                                <option>Pending Verification</option>
                            </select>
                        </Field>
                        <Field label="Learners / Pax">
                            <input
                                value={form.pax || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        pax: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Finalization Note" full required>
                            <textarea
                                value={form.finalNote || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        finalNote: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },

        exception: {
            title: "Raise SOP Exception",
            subtitle:
                "Capture blockers, missing docs, reschedules, payment issues, or escalation needs",
            submit: "Raise Exception",
            footnote:
                "Step 1: select the blocked record. Step 2: log full exception detail.",
            render: (form, setForm) => (
                <div className="section-card">
                    <BlueTitle className="section-title">
                        Raise SOP Exception
                    </BlueTitle>

                    <div className="picked-record-banner">
                        <div>
                            <div className="picked-record-title">
                                {seed.title || "Selected Record"}
                            </div>
                            <div className="picked-record-subtitle">
                                {seed.subject_name || "-"} ·{" "}
                                {seed.company_name || "-"} ·{" "}
                                {seed.deal_name || "-"}
                            </div>
                        </div>
                        <span className="pill alert">
                            {seed.status || "Blocked"}
                        </span>
                    </div>

                    <div className="form-grid">
                        <Field label="Contact ID">
                            <input value={seed.contact_id || ""} readOnly />
                        </Field>
                        <Field label="Company ID">
                            <input value={seed.company_id || ""} readOnly />
                        </Field>
                        <Field label="Deal ID">
                            <input value={seed.deal_id || ""} readOnly />
                        </Field>
                        <Field label="Exception Type" required>
                            <select
                                value={form.exceptionType || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        exceptionType: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Missing CV / Document</option>
                                <option>Reschedule Request</option>
                                <option>No-Show</option>
                                <option>Proposal Revision</option>
                                <option>Invoice / Payment Blocker</option>
                                <option>Onboarding Data Missing</option>
                            </select>
                        </Field>
                        <Field label="Severity" required>
                            <select
                                value={form.severity || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        severity: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </Field>
                        <Field label="Record / Deal / Contact" required>
                            <input
                                value={form.refRecord || seed.title || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        refRecord: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Exception Description" full required>
                            <textarea
                                value={form.exceptionDesc || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        exceptionDesc: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </div>
            ),
        },
    };
}

function validateStepTwo(modalKey, form) {
    const rules = {
        "Log Meeting": [
            "meetingTitle",
            "meetingType",
            "meetingStatus",
            "meetingOutcome",
            "meetingDate",
            "meetingNotes",
        ],
        "Create Follow-Up Task": [
            "taskTitle",
            "recordName",
            "taskType",
            "assignedTo",
            "dueDate",
            "description",
        ],
        "Send Reminder": [
            "reminderType",
            "channel",
            "reminderTime",
            "reminderMessage",
        ],
        "Send Proposal": [
            "proposalName",
            "proposalType",
            "responseDue",
            "proposalNotes",
        ],
        "Issue Invoice": [
            "dealName",
            "invoiceNumber",
            "invoiceType",
            "invoiceAmount",
            "invoiceDue",
            "invoiceNote",
        ],
        "Create Opportunity": [
            "targetName",
            "dealName",
            "oppType",
            "closeDate",
            "dealValue",
            "oppReason",
        ],
        "Mark Closed Won": [
            "dealName",
            "actualCloseDate",
            "paymentStatus",
            "finalNote",
        ],
        exception: ["exceptionType", "severity", "refRecord", "exceptionDesc"],
    };

    const requiredFields = rules[modalKey] || [];
    const missing = requiredFields.filter(
        (key) => !String(form[key] || "").trim(),
    );

    return {
        isValid: missing.length === 0,
        missing,
    };
}

function ActionWizardModal({
    isOpen,
    modalKey,
    currentModal,
    currentView,
    closeModal,
    form,
    setForm,
    submitModal,
    actionStep,
    setActionStep,
    selectedSeedRecord,
    setSelectedSeedRecord,
    seedRecords,
    seedQuery,
    setSeedQuery,
}) {
    if (!isOpen) return null;

    const filteredSeedRecords = (seedRecords || []).filter((record) =>
        seedToSearchText(record).includes(seedQuery.trim().toLowerCase()),
    );

    return createPortal(
        <div
            className="dashboard-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
            <div
                className="dashboard-modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dashboardModalTitle"
            >
                <div className="dashboard-modal-header">
                    <div>
                        <h2
                            id="dashboardModalTitle"
                            className="dashboard-modal-title"
                        >
                            {currentView?.title || currentModal?.title}
                        </h2>
                        <p className="dashboard-modal-subtitle">
                            {currentView?.subtitle || currentModal?.subtitle}
                        </p>
                    </div>
                    <button
                        className="dashboard-modal-close"
                        onClick={closeModal}
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <div className="dashboard-modal-content">
                    {currentView && currentView.content}

                    {!currentView && actionStep === 1 && (
                        <div className="section-card">
                            <BlueTitle className="section-title">
                                Step 1 — Select Record
                            </BlueTitle>
                            <div className="wizard-helper">
                                {getSeedLabel(modalKey)}
                            </div>

                            <div className="seed-toolbar">
                                <input
                                    className="mini-input"
                                    value={seedQuery}
                                    onChange={(e) =>
                                        setSeedQuery(e.target.value)
                                    }
                                    placeholder="Search person, company, deal, owner..."
                                />
                            </div>

                            <div className="seed-record-list">
                                {filteredSeedRecords.length === 0 && (
                                    <div className="empty-state">
                                        No matching records found.
                                    </div>
                                )}

                                {filteredSeedRecords.map((record) => {
                                    const isActive =
                                        selectedSeedRecord?.seed_key ===
                                        record.seed_key;

                                    return (
                                        <button
                                            type="button"
                                            key={record.seed_key}
                                            className={`seed-record-card ${isActive ? "active" : ""}`}
                                            onClick={() =>
                                                setSelectedSeedRecord(record)
                                            }
                                        >
                                            <div className="seed-record-top">
                                                <div>
                                                    <div className="seed-record-title">
                                                        {record.title || "-"}
                                                    </div>
                                                    <div className="seed-record-subtitle">
                                                        {record.subject_name ||
                                                            "-"}{" "}
                                                        ·{" "}
                                                        {record.company_name ||
                                                            "-"}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`pill ${record.pillClass || "info"}`}
                                                >
                                                    {record.status ||
                                                        record.stage ||
                                                        "Open"}
                                                </span>
                                            </div>

                                            <div className="seed-meta-grid">
                                                <div>
                                                    <div className="label">
                                                        Deal
                                                    </div>
                                                    <div className="value">
                                                        {record.deal_name ||
                                                            "-"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="label">
                                                        Owner
                                                    </div>
                                                    <div className="value">
                                                        {record.owner_name ||
                                                            "-"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="label">
                                                        Type
                                                    </div>
                                                    <div className="value">
                                                        {record.type || "-"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="label">
                                                        Event / Due
                                                    </div>
                                                    <div className="value">
                                                        {record.event_date ||
                                                            "-"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="seed-notes">
                                                {record.subtitle || "-"}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!currentView &&
                        actionStep === 2 &&
                        currentModal?.render?.(form, setForm)}
                </div>

                <div className="dashboard-modal-footer">
                    <div className="dashboard-modal-note">
                        {currentView
                            ? "Read-only SOP detail view."
                            : currentModal?.footnote}
                    </div>

                    <div className="dashboard-modal-actions">
                        {!currentView && actionStep === 2 && (
                            <button
                                className="btn ghost"
                                onClick={() => setActionStep(1)}
                                type="button"
                            >
                                Back
                            </button>
                        )}

                        <button
                            className="btn ghost"
                            onClick={closeModal}
                            type="button"
                        >
                            {currentView ? "Close" : "Cancel"}
                        </button>

                        {!currentView && actionStep === 1 && (
                            <button
                                className="btn primary"
                                disabled={!selectedSeedRecord}
                                onClick={() =>
                                    selectedSeedRecord && setActionStep(2)
                                }
                                type="button"
                            >
                                Next
                            </button>
                        )}

                        {!currentView && actionStep === 2 && (
                            <button
                                className="btn primary"
                                onClick={submitModal}
                                type="button"
                            >
                                {currentModal?.submit || "Save Action"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default function Dashboard() {
    const [dashboard, setDashboard] = useState({
        topStats: {
            interest_pax: 0,
            leads_pax: 0,
            oppnty_pax: 0,
            sales_pax: 0,
            forecast_pax: 0,
        },
        leadAnalytics: {
            days_in_contact: 0,
            days_in_interest: 0,
            days_in_leads: 0,
            total_leads: 0,
        },
        opportunityAnalytics: {
            days_in_bronze: 0,
            days_in_silver: 0,
            days_in_gold: 0,
            total_amount: 0,
        },
        companyAnalytics: {
            total_deals: 0,
            total_revenue: 0,
            active_learners: 0,
            last_sync: "-",
        },
        todaySopQueue: [],
        pipelineStageMonitor: [],
        upcomingMeetingsAndFollowups: [],
        operationalExceptions: [],
        railCards: [],
        actionSeedData: {
            "Log Meeting": [],
            "Create Follow-Up Task": [],
            "Send Reminder": [],
            "Send Proposal": [],
            "Issue Invoice": [],
            "Create Opportunity": [],
            "Mark Closed Won": [],
            exception: [],
        },
    });

    const [modalKey, setModalKey] = useState(null);
    const [modalViewKey, setModalViewKey] = useState(null);
    const [form, setForm] = useState({});
    const [railQuery, setRailQuery] = useState("");
    const [railFilter, setRailFilter] = useState("all");
    const [toasts, setToasts] = useState([]);
    const [actionStep, setActionStep] = useState(1);
    const [selectedSeedRecord, setSelectedSeedRecord] = useState(null);
    const [seedQuery, setSeedQuery] = useState("");

    useEffect(() => {
        fetch("/api/dashboard")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load dashboard");
                return res.json();
            })
            .then((data) => {
                setDashboard((prev) => ({
                    ...prev,
                    ...data,
                }));
            })
            .catch((err) => {
                console.error("Dashboard fetch error:", err);
            });
    }, []);

    const {
        topStats = {},
        leadAnalytics = {},
        opportunityAnalytics = {},
        companyAnalytics = {},
        todaySopQueue = [],
        pipelineStageMonitor = [],
        upcomingMeetingsAndFollowups = [],
        operationalExceptions = [],
        railCards = [],
        actionSeedData = {},
    } = dashboard;

    const viewConfigs = useMemo(
        () =>
            buildViewConfigs({
                upcomingMeetingsAndFollowups,
                operationalExceptions,
            }),
        [upcomingMeetingsAndFollowups, operationalExceptions],
    );

    const modalConfigs = useMemo(
        () => buildModalConfigs(selectedSeedRecord),
        [selectedSeedRecord],
    );

    const filteredRailCards = useMemo(() => {
        const query = railQuery.trim().toLowerCase();

        return railCards.filter((card) => {
            const matchFilter =
                railFilter === "all" || railFilter === card.stage;
            const haystack = `${card.title} ${card.subtitle} ${card.meta
                .flat()
                .join(" ")}`.toLowerCase();
            const matchQuery = !query || haystack.includes(query);
            return matchFilter && matchQuery;
        });
    }, [railCards, railQuery, railFilter]);

    const currentView = modalViewKey ? viewConfigs[modalViewKey] : null;
    const currentModal = modalKey ? modalConfigs[modalKey] : null;
    const isModalOpen = Boolean(currentModal || currentView);
    const seedRecords = modalKey ? actionSeedData[modalKey] || [] : [];

    const pushToast = (title, message, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 2500);
    };

    const closeModal = () => {
        setModalKey(null);
        setModalViewKey(null);
        setForm({});
        setActionStep(1);
        setSelectedSeedRecord(null);
        setSeedQuery("");
    };

    const openAction = (key) => {
        setModalViewKey(null);
        setModalKey(key);
        setForm({});
        setActionStep(1);
        setSelectedSeedRecord(null);
        setSeedQuery("");
    };

    const openView = (key) => {
        setModalKey(null);
        setModalViewKey(key);
        setForm({});
        setActionStep(1);
        setSelectedSeedRecord(null);
        setSeedQuery("");
    };

    const submitModal = () => {
        const { isValid } = validateStepTwo(modalKey, form);

        if (!selectedSeedRecord) {
            pushToast("No record selected", "Select a record first.", "danger");
            return;
        }

        if (!isValid) {
            pushToast(
                "Missing required fields",
                "Complete the required fields before saving.",
                "danger",
            );
            return;
        }

        closeModal();
        pushToast(
            "Saved",
            `${modalKey} prepared for ${
                selectedSeedRecord.subject_name ||
                selectedSeedRecord.title ||
                "selected record"
            }.`,
            "success",
        );
    };

    return (
        <>
            <style>{`
                .dashboard-main h1,
                .dashboard-main h2,
                .dashboard-main h3,
                .dashboard-main h4,
                .dashboard-main h5,
                .dashboard-main h6,
                .dashboard-main strong,
                .dashboard-main .panel-title,
                .dashboard-main .section-title,
                .dashboard-main .item-title,
                .dashboard-main .rail-card-title,
                .dashboard-main .k,
                .dashboard-main .v,
                .dashboard-main .label,
                .dashboard-main .value,
                .dashboard-main .stat .k,
                .dashboard-main .stat .v,
                .dashboard-main .mini-kpi .k,
                .dashboard-main .mini-kpi .v {
                    color: ${BRAND_BLUE} !important;
                }

                .mini-view-pill {
                    border: 1px solid #dbe4ef;
                    background: #f8fbfe;
                    color: ${BRAND_BLUE} !important;
                    font-size: 11px;
                    line-height: 1;
                    padding: 6px 10px;
                    border-radius: 999px;
                    cursor: pointer;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .mini-view-pill:hover {
                    background: #eef4fb;
                }

                .dashboard-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.45);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .dashboard-modal-dialog {
                    width: min(980px, calc(100vw - 32px));
                    max-height: calc(100vh - 40px);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                    border-radius: 18px;
                    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.24);
                    border: 1px solid #dbe4ef;
                }

                .dashboard-modal-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 20px 22px 14px;
                    border-bottom: 1px solid #e8eef5;
                    background: #ffffff;
                }

                .dashboard-modal-title {
                    margin: 0;
                    color: ${BRAND_BLUE} !important;
                    font-size: 24px;
                    line-height: 1.2;
                    font-weight: 800;
                }

                .dashboard-modal-subtitle {
                    margin: 6px 0 0;
                    color: #5f738c;
                    font-size: 14px;
                }

                .dashboard-modal-close {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    border: 1px solid #dbe4ef;
                    background: #fff;
                    color: ${BRAND_BLUE};
                    font-size: 24px;
                    line-height: 1;
                    cursor: pointer;
                    flex-shrink: 0;
                }

                .dashboard-modal-content {
                    padding: 20px 22px;
                    overflow-y: auto;
                    background: #fff;
                }

                .dashboard-modal-footer {
                    border-top: 1px solid #e8eef5;
                    padding: 14px 22px 18px;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                    flex-wrap: wrap;
                }

                .dashboard-modal-note {
                    color: #5f738c;
                    font-size: 13px;
                    max-width: 620px;
                }

                .dashboard-modal-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .wizard-helper {
                    color: #5f738c;
                    font-size: 14px;
                    margin-bottom: 12px;
                }

                .seed-toolbar {
                    margin-bottom: 14px;
                }

                .seed-record-list {
                    display: grid;
                    gap: 12px;
                }

                .seed-record-card {
                    width: 100%;
                    text-align: left;
                    border: 1px solid #dbe4ef;
                    background: #fff;
                    border-radius: 14px;
                    padding: 14px;
                    cursor: pointer;
                    transition: 0.15s ease;
                }

                .seed-record-card:hover {
                    border-color: #b8cbe0;
                    background: #fbfdff;
                }

                .seed-record-card.active {
                    border-color: #2b6cb0;
                    box-shadow: 0 0 0 2px rgba(43,108,176,0.12);
                    background: #f8fbfe;
                }

                .seed-record-top {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }

                .seed-record-title,
                .picked-record-title {
                    color: ${BRAND_BLUE};
                    font-weight: 800;
                    font-size: 16px;
                    line-height: 1.3;
                }

                .seed-record-subtitle,
                .picked-record-subtitle {
                    color: #5f738c;
                    font-size: 13px;
                    margin-top: 4px;
                }

                .seed-meta-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 10px 14px;
                    margin-bottom: 10px;
                }

                .seed-notes {
                    color: #41566f;
                    font-size: 13px;
                    line-height: 1.45;
                }

                .picked-record-banner {
                    display: flex;
                    justify-content: space-between;
                    gap: 14px;
                    align-items: flex-start;
                    background: #f8fbfe;
                    border: 1px solid #dbe4ef;
                    border-radius: 14px;
                    padding: 14px;
                    margin-bottom: 16px;
                }

                .detail-view-wrap {
                    display: grid;
                    gap: 16px;
                }

                .empty-state {
                    padding: 18px;
                    border: 1px dashed #dbe4ef;
                    border-radius: 12px;
                    color: #6b7a90;
                    text-align: center;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }

                .detail-box {
                    background: #fff;
                    border: 1px solid #dbe4ef;
                    border-radius: 12px;
                    padding: 12px;
                }

                .detail-box.full {
                    grid-column: 1 / -1;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 14px;
                }

                .field.full {
                    grid-column: 1 / -1;
                }

                .field input,
                .field select,
                .field textarea {
                    width: 100%;
                    min-width: 0;
                    border: 1px solid #dbe4ef;
                    border-radius: 10px;
                    padding: 10px 12px;
                    font-size: 14px;
                    color: ${BRAND_BLUE};
                    background: #fff;
                    box-sizing: border-box;
                }

                .field textarea {
                    min-height: 110px;
                    resize: vertical;
                }

                @media (max-width: 768px) {
                    .dashboard-modal-overlay {
                        padding: 12px;
                    }

                    .dashboard-modal-dialog {
                        width: 100%;
                        max-height: calc(100vh - 24px);
                        border-radius: 14px;
                    }

                    .dashboard-modal-header,
                    .dashboard-modal-content,
                    .dashboard-modal-footer {
                        padding-left: 16px;
                        padding-right: 16px;
                    }

                    .dashboard-modal-title {
                        font-size: 20px;
                    }

                    .form-grid,
                    .detail-grid,
                    .seed-meta-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <main className="app-main">
                <div className="main-content page-scroll">
                    <div className="topbar">
                        <div className="topbar-row">
                            <div className="actions">
                                <button
                                    className="btn"
                                    onClick={() => openAction("Log Meeting")}
                                    type="button"
                                >
                                    Log Meeting
                                </button>
                                <button
                                    className="btn"
                                    onClick={() =>
                                        openAction("Create Follow-Up Task")
                                    }
                                    type="button"
                                >
                                    Create Follow-Up
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => openAction("Send Reminder")}
                                    type="button"
                                >
                                    Send Reminder
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => openAction("Send Proposal")}
                                    type="button"
                                >
                                    Send Proposal
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => openAction("Issue Invoice")}
                                    type="button"
                                >
                                    Issue Invoice
                                </button>
                                <button
                                    className="btn primary"
                                    onClick={() =>
                                        openAction("Create Opportunity")
                                    }
                                    type="button"
                                >
                                    Create Opportunity
                                </button>
                                <button
                                    className="btn success"
                                    onClick={() =>
                                        openAction("Mark Closed Won")
                                    }
                                    type="button"
                                >
                                    Mark Closed Won
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="content">
                        <div className="dashboard-layout">
                            <section className="dashboard-main">
                                <section className="panel">
                                    <div className="hero">
                                        <div className="hero-top">
                                            <div>
                                                <h1
                                                    style={{
                                                        color: BRAND_BLUE,
                                                    }}
                                                >
                                                    Home Dashboard
                                                </h1>
                                            </div>
                                        </div>

                                        <div className="stats-grid">
                                            <div className="stat">
                                                <BlueText
                                                    className="k"
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    Interest Pax
                                                </BlueText>
                                                <BlueTitle className="v">
                                                    {formatNumber(
                                                        topStats.interest_pax,
                                                    )}
                                                </BlueTitle>
                                            </div>
                                            <div className="stat">
                                                <BlueText
                                                    className="k"
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    Leads Pax
                                                </BlueText>
                                                <BlueTitle className="v">
                                                    {formatNumber(
                                                        topStats.leads_pax,
                                                    )}
                                                </BlueTitle>
                                            </div>
                                            <div className="stat">
                                                <BlueText
                                                    className="k"
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    Oppnty Pax
                                                </BlueText>
                                                <BlueTitle className="v">
                                                    {formatNumber(
                                                        topStats.oppnty_pax,
                                                    )}
                                                </BlueTitle>
                                            </div>
                                            <div className="stat">
                                                <BlueText
                                                    className="k"
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    Sales Pax
                                                </BlueText>
                                                <BlueTitle className="v">
                                                    {formatNumber(
                                                        topStats.sales_pax,
                                                    )}
                                                </BlueTitle>
                                            </div>
                                            <div className="stat">
                                                <BlueText
                                                    className="k"
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    Forecast Pax
                                                </BlueText>
                                                <BlueTitle className="v">
                                                    {formatNumber(
                                                        topStats.forecast_pax,
                                                    )}
                                                </BlueTitle>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="grid-3">
                                    <section className="panel">
                                        <div className="panel-header">
                                            <BlueTitle className="panel-title">
                                                Lead Stage Analytics
                                            </BlueTitle>
                                        </div>
                                        <div className="body-pad">
                                            <div className="mini-kpi-grid">
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Days in Contact
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {leadAnalytics.days_in_contact ??
                                                            0}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Days in Interest
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {leadAnalytics.days_in_interest ??
                                                            0}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Days in Leads
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {leadAnalytics.days_in_leads ??
                                                            0}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Total Leads
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {formatNumber(
                                                            leadAnalytics.total_leads,
                                                        )}
                                                    </BlueTitle>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="panel">
                                        <div className="panel-header">
                                            <BlueTitle className="panel-title">
                                                Opportunity Stage Analytics
                                            </BlueTitle>
                                        </div>
                                        <div className="body-pad">
                                            <div className="mini-kpi-grid">
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Days in Bronze
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {opportunityAnalytics.days_in_bronze ??
                                                            0}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Days in Silver
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {opportunityAnalytics.days_in_silver ??
                                                            0}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Days in Gold
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {opportunityAnalytics.days_in_gold ??
                                                            0}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Total Amount
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {formatCurrencyCompact(
                                                            opportunityAnalytics.total_amount,
                                                        )}
                                                    </BlueTitle>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="panel">
                                        <div className="panel-header">
                                            <BlueTitle className="panel-title">
                                                Company Analytics
                                            </BlueTitle>
                                        </div>
                                        <div className="body-pad">
                                            <div className="mini-kpi-grid">
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Total Deals
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {formatNumber(
                                                            companyAnalytics.total_deals,
                                                        )}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Total Revenue
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {formatCurrencyCompact(
                                                            companyAnalytics.total_revenue,
                                                        )}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Active Learners
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {formatNumber(
                                                            companyAnalytics.active_learners,
                                                        )}
                                                    </BlueTitle>
                                                </div>
                                                <div className="mini-kpi">
                                                    <BlueText
                                                        className="k"
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Last Sync
                                                    </BlueText>
                                                    <BlueTitle className="v">
                                                        {companyAnalytics.last_sync ||
                                                            "-"}
                                                    </BlueTitle>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </section>

                                <section className="grid-2">
                                    <section className="panel">
                                        <div className="panel-header">
                                            <BlueTitle className="panel-title">
                                                Today’s Queue
                                            </BlueTitle>
                                        </div>
                                        <div className="body-pad list list-scroll">
                                            {todaySopQueue.map(
                                                (item, index) => (
                                                    <div
                                                        className="list-item"
                                                        key={`${item.title}-${index}`}
                                                    >
                                                        <div className="item-top">
                                                            <BlueTitle className="item-title">
                                                                {item.title}
                                                            </BlueTitle>
                                                            <span
                                                                className={`pill ${item.pill.className}`}
                                                            >
                                                                {item.pill.text}
                                                            </span>
                                                        </div>
                                                        <div className="item-meta">
                                                            {item.meta.map(
                                                                ([k, v]) => (
                                                                    <div
                                                                        key={k}
                                                                    >
                                                                        <BlueText
                                                                            className="label"
                                                                            style={{
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            {k}
                                                                        </BlueText>
                                                                        <BlueText className="value">
                                                                            {v}
                                                                        </BlueText>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </section>

                                    <section className="panel">
                                        <div className="panel-header">
                                            <BlueTitle className="panel-title">
                                                Pipeline Stage Monitor
                                            </BlueTitle>
                                        </div>
                                        <div className="body-pad">
                                            <div className="list">
                                                {pipelineStageMonitor.map(
                                                    (stage) => (
                                                        <div
                                                            className="list-item"
                                                            key={stage.stage}
                                                        >
                                                            <div className="item-top">
                                                                <BlueTitle className="item-title">
                                                                    {
                                                                        stage.stage
                                                                    }
                                                                </BlueTitle>
                                                                <span
                                                                    className={`pill ${stage.pillClass}`}
                                                                >
                                                                    {
                                                                        stage.deal_count
                                                                    }{" "}
                                                                    deals
                                                                </span>
                                                            </div>
                                                            <BlueText className="value">
                                                                {
                                                                    stage.description
                                                                }
                                                            </BlueText>
                                                            <div>
                                                                <BlueText
                                                                    className="label"
                                                                    style={{
                                                                        fontWeight: 700,
                                                                        marginBottom: 8,
                                                                    }}
                                                                >
                                                                    Average
                                                                    health
                                                                </BlueText>
                                                                <div className="scorebar">
                                                                    <span
                                                                        style={{
                                                                            width: `${Math.min(Number(stage.avg_health || 0), 100)}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </section>

                                <section className="grid-2">
                                    <section className="panel">
                                        <div className="panel-header">
                                            <BlueTitle className="panel-title">
                                                Upcoming Meetings & Follow-Ups
                                            </BlueTitle>
                                        </div>
                                        <div className="body-pad">
                                            <div
                                                className="timeline"
                                                id="activityFeed"
                                            >
                                                {upcomingMeetingsAndFollowups.map(
                                                    (item) => (
                                                        <div
                                                            key={`${item.item_type}-${item.id}`}
                                                            className="timeline-item viewable-item"
                                                            onClick={() =>
                                                                openView(
                                                                    `${item.item_type}-${item.id}`,
                                                                )
                                                            }
                                                        >
                                                            <div className="timeline-icon">
                                                                {getTimelineIcon(
                                                                    item.item_type,
                                                                )}
                                                            </div>
                                                            <div className="timeline-card">
                                                                <div className="item-top">
                                                                    <strong
                                                                        style={{
                                                                            color: BRAND_BLUE,
                                                                        }}
                                                                    >
                                                                        {
                                                                            item.title
                                                                        }{" "}
                                                                        ·{" "}
                                                                        {
                                                                            item.event_date
                                                                        }
                                                                    </strong>
                                                                    <button
                                                                        className="mini-view-pill"
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            openView(
                                                                                `${item.item_type}-${item.id}`,
                                                                            );
                                                                        }}
                                                                    >
                                                                        View
                                                                    </button>
                                                                </div>
                                                                <div className="subtext">
                                                                    {
                                                                        item.subject_name
                                                                    }{" "}
                                                                    ·{" "}
                                                                    {
                                                                        item.subtitle
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    <section className="panel">
                                        <div className="panel-header">
                                            <BlueTitle className="panel-title">
                                                Operational Exceptions
                                            </BlueTitle>
                                            <button
                                                className="icon-btn"
                                                onClick={() =>
                                                    openAction("exception")
                                                }
                                                type="button"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="body-pad">
                                            <div
                                                className="list"
                                                id="exceptionList"
                                            >
                                                {operationalExceptions.map(
                                                    (item) => (
                                                        <div
                                                            key={`exception-${item.id}`}
                                                            className="list-item viewable-item"
                                                            onClick={() =>
                                                                openView(
                                                                    `exception-${item.id}`,
                                                                )
                                                            }
                                                        >
                                                            <div className="item-top">
                                                                <BlueTitle className="item-title">
                                                                    {item.title}
                                                                </BlueTitle>
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        gap: 8,
                                                                        alignItems:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <span
                                                                        className={`pill ${item.status === "Blocked" ? "alert" : "pending"}`}
                                                                    >
                                                                        {item.status ||
                                                                            item.severity}
                                                                    </span>
                                                                    <button
                                                                        className="mini-view-pill"
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            openView(
                                                                                `exception-${item.id}`,
                                                                            );
                                                                        }}
                                                                    >
                                                                        View
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <BlueText className="value">
                                                                {
                                                                    item.description
                                                                }
                                                            </BlueText>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </section>
                            </section>

                            <aside className="panel rail-scroll">
                                <div className="panel-header">
                                    <div>
                                        <BlueTitle className="panel-title">
                                            Control Center
                                        </BlueTitle>
                                    </div>
                                </div>

                                <div className="filter-bar">
                                    <input
                                        className="mini-input"
                                        value={railQuery}
                                        onChange={(e) =>
                                            setRailQuery(e.target.value)
                                        }
                                        placeholder="Search widgets..."
                                    />
                                    {[
                                        "all",
                                        "lead",
                                        "opp",
                                        "finance",
                                        "onboarding",
                                    ].map((filter) => (
                                        <button
                                            key={filter}
                                            className={`filter-btn ${railFilter === filter ? "active" : ""}`}
                                            onClick={() =>
                                                setRailFilter(filter)
                                            }
                                            type="button"
                                        >
                                            {filter === "all"
                                                ? "All"
                                                : filter === "lead"
                                                  ? "Lead"
                                                  : filter === "opp"
                                                    ? "Opp"
                                                    : filter === "finance"
                                                      ? "Finance"
                                                      : "Onboarding"}
                                        </button>
                                    ))}
                                </div>

                                <div className="rail-card-list rail-scroll">
                                    {filteredRailCards.map((card) => (
                                        <div
                                            className="rail-card"
                                            key={card.id}
                                        >
                                            <div className="rail-card-top">
                                                <div>
                                                    <BlueTitle className="rail-card-title">
                                                        {card.title}
                                                    </BlueTitle>
                                                    <div className="subtext">
                                                        {card.subtitle}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`pill ${card.pill.className}`}
                                                >
                                                    {card.pill.text}
                                                </span>
                                            </div>
                                            <div className="item-meta">
                                                {card.meta.map(([k, v]) => (
                                                    <div key={k}>
                                                        <BlueText
                                                            className="label"
                                                            style={{
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {k}
                                                        </BlueText>
                                                        <BlueText className="value">
                                                            {v}
                                                        </BlueText>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>

            <ActionWizardModal
                isOpen={isModalOpen}
                modalKey={modalKey}
                currentModal={currentModal}
                currentView={currentView}
                closeModal={closeModal}
                form={form}
                setForm={setForm}
                submitModal={submitModal}
                actionStep={actionStep}
                setActionStep={setActionStep}
                selectedSeedRecord={selectedSeedRecord}
                setSelectedSeedRecord={setSelectedSeedRecord}
                seedRecords={seedRecords}
                seedQuery={seedQuery}
                setSeedQuery={setSeedQuery}
            />

            <div className="toast-wrap">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} />
                ))}
            </div>
        </>
    );
}

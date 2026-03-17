import React, { useEffect, useState } from "react";

function CDField({ label, value }) {
    return (
        <div className="cd-field">
            <div className="cd-label">{label}</div>
            <div className="cd-value">{value}</div>
        </div>
    );
}

export default function ContactDetailPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [workspaceOpen, setWorkspaceOpen] = useState(false);
    const [workspaceTab, setWorkspaceTab] = useState("notes");

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setWorkspaceOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    function openWorkspace(tab) {
        setWorkspaceTab(tab);
        setWorkspaceOpen(true);
    }

    return (
        <div className="contact-detail-page">
            <div className="cd-topbar">
                <div className="cd-actions">
                    <button
                        className="cd-btn"
                        onClick={() => openWorkspace("notes")}
                    >
                        Log Note
                    </button>
                    <button
                        className="cd-btn"
                        onClick={() => openWorkspace("emails")}
                    >
                        Send Reminder
                    </button>
                    <button
                        className="cd-btn"
                        onClick={() => openWorkspace("documents")}
                    >
                        Request CV
                    </button>
                    <button
                        className="cd-btn"
                        onClick={() => openWorkspace("meetings")}
                    >
                        Reschedule
                    </button>
                    <button
                        className="cd-btn cd-btn-primary"
                        onClick={() => openWorkspace("tasks")}
                    >
                        Create Follow-Up
                    </button>
                    <button className="cd-btn cd-btn-success">
                        Convert to Opportunity
                    </button>
                </div>
            </div>

            <div className="cd-layout">
                <section className="cd-panel cd-left">
                    <div className="cd-profile">
                        <h1>Rong Wei Toh</h1>
                        <div className="cd-subtext">
                            Retail prospect · Contact detail page
                        </div>
                        <div className="cd-subtext">
                            rong_wei1985@yahoo.com.sg
                        </div>
                    </div>

                    <div className="cd-quick-actions">
                        <button
                            className="cd-qa"
                            onClick={() => openWorkspace("notes")}
                        >
                            <span className="cd-qa-icon">📝</span>
                            <span>Note</span>
                        </button>
                        <button
                            className="cd-qa"
                            onClick={() => openWorkspace("emails")}
                        >
                            <span className="cd-qa-icon">✉</span>
                            <span>Email</span>
                        </button>
                        <button
                            className="cd-qa"
                            onClick={() => openWorkspace("calls")}
                        >
                            <span className="cd-qa-icon">☎</span>
                            <span>Call</span>
                        </button>
                        <button
                            className="cd-qa"
                            onClick={() => openWorkspace("tasks")}
                        >
                            <span className="cd-qa-icon">✓</span>
                            <span>Task</span>
                        </button>
                        <button
                            className="cd-qa"
                            onClick={() => openWorkspace("meetings")}
                        >
                            <span className="cd-qa-icon">📅</span>
                            <span>Meet</span>
                        </button>
                    </div>

                    <div className="cd-section">
                        <div className="cd-section-head">
                            <div className="cd-section-title">
                                Initial Data Verification
                            </div>
                            <div className="cd-link-action">Verified</div>
                        </div>

                        <div className="cd-field-list">
                            <CDField label="Contact ID" value="CNT-000412" />
                            <CDField label="HubSpot ID" value="HS-918472" />
                            <CDField label="First Name" value="Rong Wei" />
                            <CDField label="Last Name" value="Toh" />
                            <CDField
                                label="Contact Email"
                                value="rong_wei1985@yahoo.com.sg"
                            />
                            <CDField label="Mobile" value="+65 9123 4567" />
                            <CDField
                                label="WhatsApp Number"
                                value="+65 9123 4567"
                            />
                            <CDField label="Business Unit" value="Retail" />
                            <CDField label="Region" value="Singapore" />
                            <CDField
                                label="Current Company"
                                value="EduCLaaS Learning Partners Pte Ltd"
                            />
                            <CDField
                                label="Current Job Role"
                                value="Operations Manager"
                            />
                            <CDField
                                label="LinkedIn ID"
                                value="linkedin.com/in/rongwei-toh"
                            />
                            <CDField
                                label="Contact Source"
                                value="Apollo / LinkedIn"
                            />
                            <CDField
                                label="Contact Source Detail"
                                value="Retail sales qualification import"
                            />
                        </div>
                    </div>

                    <div className="cd-section">
                        <div className="cd-section-head">
                            <div className="cd-section-title">
                                Engagement & Lifecycle
                            </div>
                            <div className="cd-link-action">Edit</div>
                        </div>

                        <div className="cd-field-list">
                            <CDField
                                label="Contact Status"
                                value="Meeting Confirmed"
                            />
                            <CDField label="CILOS Status" value="Leads" />
                            <CDField
                                label="CILOS Stage"
                                value="Qualification"
                            />
                            <CDField
                                label="CILOS Stage Entry Date"
                                value="2026-03-06"
                            />
                            <CDField
                                label="Previous CILOS Status"
                                value="Interest"
                            />
                            <CDField
                                label="Stage Change Reason"
                                value="Meeting completed and qualified to lead"
                            />
                            <CDField label="Engagement Level" value="Hot" />
                            <CDField
                                label="Qualification Score"
                                value="84 / 100"
                            />
                            <CDField
                                label="Expected Close Date"
                                value="2026-04-20"
                            />
                            <CDField
                                label="Opportunity Type"
                                value="Bronze-ready"
                            />
                            <CDField label="Number of Follow-Ups" value="2" />
                            <CDField
                                label="Retarget Status"
                                value="Not Applicable"
                            />
                        </div>
                    </div>

                    <div className="cd-section">
                        <div className="cd-section-head">
                            <div className="cd-section-title">
                                CV & Document Tracking
                            </div>
                            <div className="cd-link-action">Open Docs</div>
                        </div>

                        <div className="cd-field-list">
                            <CDField label="Contact CV" value="Uploaded" />
                            <CDField label="CV Status" value="Complete" />
                            <CDField
                                label="Highest Qualification"
                                value="Bachelor’s Degree"
                            />
                            <CDField
                                label="Last CV Upload Date"
                                value="2026-03-05"
                            />
                            <CDField
                                label="Document Tracking ID"
                                value="DOC-72191"
                            />
                            <CDField
                                label="Document Type"
                                value="CV / Proposal Summary / Case Study"
                            />
                            <CDField
                                label="Document Status"
                                value="CV Complete · Proposal Summary Sent"
                            />
                            <CDField
                                label="Document URL"
                                value="secure-link://documents/contact/CNT-000412"
                            />
                            <CDField
                                label="Uploaded Date"
                                value="2026-03-05 10:42"
                            />
                        </div>
                    </div>
                </section>

                <section className="cd-panel cd-middle">
                    <div className="cd-header-card">
                        <h2>Rong Wei Toh</h2>
                        <div className="cd-subtext">
                            Retail contact detail · SOP-aligned qualification
                            and follow-up workspace
                        </div>

                        <div className="cd-tag-row">
                            <span className="cd-badge cd-badge-active">
                                Lead Qualified
                            </span>
                            <span className="cd-badge cd-badge-info">
                                Meeting Confirmed
                            </span>
                            <span className="cd-badge cd-badge-warn">
                                Reminder Pending
                            </span>
                            <span className="cd-badge cd-badge-purple">
                                Bronze-Ready
                            </span>
                        </div>

                        <div className="cd-stats">
                            <div className="cd-stat">
                                <div className="cd-stat-k">
                                    Engagement Score
                                </div>
                                <div className="cd-stat-v">84</div>
                            </div>
                            <div className="cd-stat">
                                <div className="cd-stat-k">Messaging Score</div>
                                <div className="cd-stat-v">78</div>
                            </div>
                            <div className="cd-stat">
                                <div className="cd-stat-k">Follow-Ups</div>
                                <div className="cd-stat-v">2</div>
                            </div>
                            <div className="cd-stat">
                                <div className="cd-stat-k">No-Show Count</div>
                                <div className="cd-stat-v">0</div>
                            </div>
                        </div>
                    </div>

                    <div className="cd-tabs">
                        <button
                            className={`cd-tab ${
                                activeTab === "overview" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </button>
                        <button
                            className={`cd-tab ${
                                activeTab === "meeting" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("meeting")}
                        >
                            Meeting & Reminder
                        </button>
                        <button
                            className={`cd-tab ${
                                activeTab === "qualification" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("qualification")}
                        >
                            Qualification
                        </button>
                        <button
                            className={`cd-tab ${
                                activeTab === "outcome" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("outcome")}
                        >
                            Outcome
                        </button>
                    </div>

                    <div className="cd-body-card">
                        {activeTab === "overview" && (
                            <>
                                <div className="cd-info-grid">
                                    <div className="cd-info-card">
                                        <div className="cd-info-head">
                                            Communication & Confirmation
                                        </div>
                                        <div className="cd-info-body">
                                            <div className="cd-detail-grid">
                                                <CDField
                                                    label="Preferred Channel"
                                                    value="WhatsApp"
                                                />
                                                <CDField
                                                    label="Confirmation Call Count"
                                                    value="1"
                                                />
                                                <CDField
                                                    label="Last Messaging Date"
                                                    value="2026-03-08 09:15"
                                                />
                                                <CDField
                                                    label="Confirmation Call Date"
                                                    value="2026-03-08 09:00"
                                                />
                                                <CDField
                                                    label="Last Messaging Contents"
                                                    value="Confirmed attendance, requested final agenda, acknowledged CV receipt."
                                                />
                                                <CDField
                                                    label="Digital Conversation Contents"
                                                    value="Prospect prefers WhatsApp reminders and online Teams link."
                                                />
                                                <CDField
                                                    label="Messaging Engagement Score"
                                                    value="78"
                                                />
                                                <CDField
                                                    label="Conversation Engagement Score"
                                                    value="82"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="cd-info-card">
                                        <div className="cd-info-head">
                                            Company & Source Context
                                        </div>
                                        <div className="cd-info-body">
                                            <div className="cd-detail-grid">
                                                <CDField
                                                    label="Company ID"
                                                    value="CMP-000128"
                                                />
                                                <CDField
                                                    label="Company Name"
                                                    value="EduCLaaS Learning Partners Pte Ltd"
                                                />
                                                <CDField
                                                    label="Company Email"
                                                    value="hello@educlaas.com"
                                                />
                                                <CDField
                                                    label="Company Phone"
                                                    value="+65 6123 4567"
                                                />
                                                <CDField
                                                    label="Company Website"
                                                    value="www.educlaas.com"
                                                />
                                                <CDField
                                                    label="Industry Sector"
                                                    value="Education Technology"
                                                />
                                                <CDField
                                                    label="Company Classification"
                                                    value="Mid-Market"
                                                />
                                                <CDField
                                                    label="Company Relationship"
                                                    value="Prospect"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="cd-spacer" />

                                <div className="cd-info-card">
                                    <div className="cd-info-head">
                                        Activity Timeline
                                    </div>
                                    <div className="cd-info-body">
                                        <div className="cd-timeline">
                                            <div className="cd-timeline-item">
                                                <div className="cd-timeline-icon">
                                                    ✓
                                                </div>
                                                <div className="cd-timeline-card">
                                                    <strong>
                                                        Initial data
                                                        verification completed
                                                    </strong>
                                                    <div className="cd-subtext">
                                                        Validated required
                                                        contact, BU, status, and
                                                        company fields in CRM.
                                                    </div>
                                                    <div className="cd-subtext cd-time">
                                                        2026-03-06 · by DBD
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="cd-timeline-item">
                                                <div className="cd-timeline-icon">
                                                    📄
                                                </div>
                                                <div className="cd-timeline-card">
                                                    <strong>
                                                        CV uploaded and reviewed
                                                    </strong>
                                                    <div className="cd-subtext">
                                                        CV status updated to
                                                        complete. Highest
                                                        qualification captured.
                                                    </div>
                                                    <div className="cd-subtext cd-time">
                                                        2026-03-05 · by Sales
                                                        Admin
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="cd-timeline-item">
                                                <div className="cd-timeline-icon">
                                                    ☎
                                                </div>
                                                <div className="cd-timeline-card">
                                                    <strong>
                                                        Confirmation call logged
                                                    </strong>
                                                    <div className="cd-subtext">
                                                        Meeting details
                                                        verified. Prospect
                                                        requested Teams meeting
                                                        mode.
                                                    </div>
                                                    <div className="cd-subtext cd-time">
                                                        2026-03-08 · by DBD
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="cd-timeline-item">
                                                <div className="cd-timeline-icon">
                                                    ✉
                                                </div>
                                                <div className="cd-timeline-card">
                                                    <strong>
                                                        Thank-you and proposal
                                                        summary prepared
                                                    </strong>
                                                    <div className="cd-subtext">
                                                        Post-session
                                                        communication
                                                        placeholders ready for
                                                        same-day send.
                                                    </div>
                                                    <div className="cd-subtext cd-time">
                                                        2026-03-08 · by CRM
                                                        Orchestration
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "meeting" && (
                            <div className="cd-info-grid">
                                <div className="cd-info-card">
                                    <div className="cd-info-head">
                                        Meeting Schedule
                                    </div>
                                    <div className="cd-info-body">
                                        <div className="cd-detail-grid">
                                            <CDField
                                                label="Meeting Schedule ID"
                                                value="MS-20260308-18"
                                            />
                                            <CDField
                                                label="Meeting Type"
                                                value="Sales Presentation"
                                            />
                                            <CDField
                                                label="Meeting Status"
                                                value="Confirmed"
                                            />
                                            <CDField
                                                label="Meeting Mode"
                                                value="Online (MS Teams)"
                                            />
                                            <CDField
                                                label="Current Meeting Date"
                                                value="2026-03-10 14:00"
                                            />
                                            <CDField
                                                label="Original Meeting Date"
                                                value="2026-03-10 14:00"
                                            />
                                            <CDField
                                                label="Meeting Link"
                                                value="teams.microsoft.com/l/meetup-join/abc123"
                                            />
                                            <CDField
                                                label="Meeting Location"
                                                value="Online"
                                            />
                                            <CDField
                                                label="Attendees Internal"
                                                value="DBD, EBM, Director"
                                            />
                                            <CDField
                                                label="Attendees External"
                                                value="Rong Wei Toh"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="cd-info-card">
                                    <div className="cd-info-head">
                                        Reminder & Reschedule Control
                                    </div>
                                    <div className="cd-info-body">
                                        <div className="cd-check-grid">
                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        48-hour reminder
                                                    </div>
                                                    <span className="cd-pill cd-pill-pending">
                                                        Pending
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Call prospect 48 hours
                                                    before CaLA session.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        2-hour reminder
                                                    </div>
                                                    <span className="cd-pill cd-pill-pending">
                                                        Pending
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Short reminder before
                                                    session start.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Confirmation call status
                                                    </div>
                                                    <span className="cd-pill cd-pill-ok">
                                                        Confirmed
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Meeting details verified.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Reschedule count
                                                    </div>
                                                    <span className="cd-pill cd-pill-ok">
                                                        0
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    No changes requested.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "qualification" && (
                            <div className="cd-info-grid">
                                <div className="cd-info-card">
                                    <div className="cd-info-head">
                                        Qualification Snapshot
                                    </div>
                                    <div className="cd-info-body">
                                        <div className="cd-detail-grid">
                                            <CDField
                                                label="Highest Qualification"
                                                value="Bachelor’s Degree"
                                            />
                                            <CDField
                                                label="Academic Aptitude"
                                                value="Strong"
                                            />
                                            <CDField
                                                label="Current Job Role"
                                                value="Operations Manager"
                                            />
                                            <CDField
                                                label="Inquiry Type"
                                                value="Career progression"
                                            />
                                            <CDField
                                                label="Lead Status"
                                                value="Ready for proposal"
                                            />
                                            <CDField
                                                label="Qualification Score"
                                                value="84"
                                            />
                                            <CDField
                                                label="Stage Velocity"
                                                value="Fast"
                                            />
                                            <CDField
                                                label="Conversion Readiness"
                                                value="High"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="cd-info-card">
                                    <div className="cd-info-head">
                                        Qualification Checks
                                    </div>
                                    <div className="cd-info-body">
                                        <div className="cd-check-grid">
                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Required contact fields
                                                        captured
                                                    </div>
                                                    <span className="cd-pill cd-pill-ok">
                                                        Complete
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Name, email, BU, company,
                                                    role, region, lifecycle
                                                    status.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        CV uploaded
                                                    </div>
                                                    <span className="cd-pill cd-pill-ok">
                                                        Complete
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    CV available in document
                                                    tracking and profile.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Communication preference
                                                        confirmed
                                                    </div>
                                                    <span className="cd-pill cd-pill-ok">
                                                        Complete
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    WhatsApp selected as
                                                    preferred channel.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Meeting fit validated
                                                    </div>
                                                    <span className="cd-pill cd-pill-pending">
                                                        In Progress
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Awaiting session completion
                                                    and full outcome capture.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "outcome" && (
                            <div className="cd-info-grid">
                                <div className="cd-info-card">
                                    <div className="cd-info-head">
                                        Outcome & Stage Progression
                                    </div>
                                    <div className="cd-info-body">
                                        <div className="cd-check-grid">
                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Current lifecycle state
                                                    </div>
                                                    <span className="cd-pill cd-pill-ok">
                                                        Leads
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Lead qualified after meeting
                                                    preparation.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Post-session branch
                                                    </div>
                                                    <span className="cd-pill cd-pill-purple">
                                                        Bronze-ready
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Progress to Opportunity
                                                    Bronze if interest is
                                                    confirmed.
                                                </div>
                                            </div>

                                            <div className="cd-check-item">
                                                <div className="cd-check-top">
                                                    <div className="cd-check-title">
                                                        Close-lost path
                                                    </div>
                                                    <span className="cd-pill cd-pill-pending">
                                                        Not triggered
                                                    </span>
                                                </div>
                                                <div className="cd-subtext">
                                                    Use only if prospect rejects
                                                    next step.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="cd-info-card">
                                    <div className="cd-info-head">
                                        Opportunity Conversion Readiness
                                    </div>
                                    <div className="cd-info-body">
                                        <div className="cd-detail-grid">
                                            <CDField
                                                label="Deal ID"
                                                value="D-10024"
                                            />
                                            <CDField
                                                label="Deal Name"
                                                value="Retail Upskilling Bronze Opportunity"
                                            />
                                            <CDField
                                                label="Deal Stage"
                                                value="Bronze"
                                            />
                                            <CDField
                                                label="Bronze Entry Date"
                                                value="Pending confirmation"
                                            />
                                            <CDField
                                                label="Deal Amount"
                                                value="$72,000"
                                            />
                                            <CDField
                                                label="Deal Exec"
                                                value="Alicia Tan"
                                            />
                                            <CDField
                                                label="Deal Manager"
                                                value="Marcus Lee"
                                            />
                                            <CDField
                                                label="Business Unit"
                                                value="Retail"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="cd-panel cd-right">
                    <div className="cd-panel-header">
                        <div className="cd-panel-title">SOP Status Console</div>
                    </div>

                    <div className="cd-search-row">
                        <input
                            className="cd-input"
                            placeholder="Search status cards..."
                        />
                        <div className="cd-filter-row">
                            <button className="cd-filter active">All</button>
                            <button className="cd-filter">Meeting</button>
                            <button className="cd-filter">Tasks</button>
                            <button className="cd-filter">Docs</button>
                            <button className="cd-filter">Opportunity</button>
                        </div>
                    </div>

                    <div className="cd-card-list">
                        <div className="cd-status-card">
                            <div className="cd-status-top">
                                <div>
                                    <div className="cd-status-title">
                                        Meeting Confirmation
                                    </div>
                                    <div className="cd-subtext">
                                        SalesDB_Meeting-Schedule
                                    </div>
                                </div>
                                <span className="cd-pill cd-pill-ok">
                                    Confirmed
                                </span>
                            </div>

                            <div className="cd-mini-grid">
                                <CDField
                                    label="Mode"
                                    value="Online (MS Teams)"
                                />
                                <CDField
                                    label="Date"
                                    value="2026-03-10 14:00"
                                />
                                <CDField
                                    label="Confirmation Call"
                                    value="Completed"
                                />
                                <CDField label="Reminder 48H" value="Pending" />
                            </div>
                        </div>

                        <div className="cd-status-card">
                            <div className="cd-status-top">
                                <div>
                                    <div className="cd-status-title">
                                        Document Tracking
                                    </div>
                                    <div className="cd-subtext">
                                        SalesDB_Document-Tracking
                                    </div>
                                </div>
                                <span className="cd-pill cd-pill-ok">
                                    CV Complete
                                </span>
                            </div>

                            <div className="cd-mini-grid">
                                <CDField label="CV Status" value="Complete" />
                                <CDField
                                    label="Proposal Summary"
                                    value="Pending Send"
                                />
                                <CDField
                                    label="Support Docs"
                                    value="Requested"
                                />
                                <CDField
                                    label="Last Upload"
                                    value="2026-03-05"
                                />
                            </div>
                        </div>

                        <div className="cd-status-card">
                            <div className="cd-status-top">
                                <div>
                                    <div className="cd-status-title">
                                        Follow-Up Tasks
                                    </div>
                                    <div className="cd-subtext">
                                        SalesDB_Follow-Up-Tasks
                                    </div>
                                </div>
                                <span className="cd-pill cd-pill-pending">
                                    3 Open
                                </span>
                            </div>

                            <div className="cd-mini-grid">
                                <CDField
                                    label="Task Type"
                                    value="Email Follow-up"
                                />
                                <CDField label="Priority" value="High" />
                                <CDField
                                    label="Due Date"
                                    value="2026-03-10 16:00"
                                />
                                <CDField label="Assigned To" value="DBD" />
                            </div>
                        </div>

                        <div className="cd-status-card">
                            <div className="cd-status-top">
                                <div>
                                    <div className="cd-status-title">
                                        Opportunity Conversion
                                    </div>
                                    <div className="cd-subtext">
                                        SalesDB_Deal-Profile / AnalyticsDB_deal
                                    </div>
                                </div>
                                <span className="cd-pill cd-pill-purple">
                                    Bronze-Ready
                                </span>
                            </div>
                            <div className="cd-amount">$72,000</div>
                        </div>
                    </div>
                </aside>
            </div>

            {workspaceOpen && (
                <div
                    className="cd-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setWorkspaceOpen(false);
                        }
                    }}
                >
                    <div className="cd-modal">
                        <div className="cd-modal-head">
                            <div>
                                <div className="cd-modal-title">
                                    Contact Workspace
                                </div>
                                <div className="cd-subtext">
                                    Working popup for notes, tasks, calls,
                                    emails, documents, and meetings.
                                </div>
                            </div>
                            <button
                                className="cd-modal-close"
                                onClick={() => setWorkspaceOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="cd-modal-meta">
                            <CDField label="Contact" value="Rong Wei Toh" />
                            <CDField
                                label="Email"
                                value="rong_wei1985@yahoo.com.sg"
                            />
                            <CDField label="Phone" value="+65 9123 4567" />
                            <CDField label="CILOS Status" value="Leads" />
                        </div>

                        <div className="cd-modal-tabs">
                            <button
                                className={`cd-modal-tab ${
                                    workspaceTab === "notes" ? "active" : ""
                                }`}
                                onClick={() => setWorkspaceTab("notes")}
                            >
                                Notes
                            </button>
                            <button
                                className={`cd-modal-tab ${
                                    workspaceTab === "tasks" ? "active" : ""
                                }`}
                                onClick={() => setWorkspaceTab("tasks")}
                            >
                                Tasks
                            </button>
                            <button
                                className={`cd-modal-tab ${
                                    workspaceTab === "calls" ? "active" : ""
                                }`}
                                onClick={() => setWorkspaceTab("calls")}
                            >
                                Calls
                            </button>
                            <button
                                className={`cd-modal-tab ${
                                    workspaceTab === "emails" ? "active" : ""
                                }`}
                                onClick={() => setWorkspaceTab("emails")}
                            >
                                Emails
                            </button>
                            <button
                                className={`cd-modal-tab ${
                                    workspaceTab === "meetings" ? "active" : ""
                                }`}
                                onClick={() => setWorkspaceTab("meetings")}
                            >
                                Meetings
                            </button>
                            <button
                                className={`cd-modal-tab ${
                                    workspaceTab === "documents" ? "active" : ""
                                }`}
                                onClick={() => setWorkspaceTab("documents")}
                            >
                                Documents
                            </button>
                        </div>

                        <div className="cd-modal-body">
                            {workspaceTab === "notes" && (
                                <div className="cd-modal-panel">
                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Add Note
                                        </div>
                                        <div className="cd-stack">
                                            <input
                                                className="cd-input"
                                                placeholder="Meeting summary / objection / qualification note"
                                            />
                                            <textarea
                                                className="cd-textarea"
                                                placeholder="Write internal note here..."
                                            />
                                            <button className="cd-btn cd-btn-primary">
                                                Add Note
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Saved Notes
                                        </div>
                                        <div className="cd-entry-list">
                                            <div className="cd-entry">
                                                <div className="cd-entry-title">
                                                    Meeting qualification note
                                                </div>
                                                <div className="cd-subtext">
                                                    Interested in Retail
                                                    proposal. Asked about
                                                    implementation timeline,
                                                    pricing structure, and
                                                    onboarding support.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {workspaceTab === "tasks" && (
                                <div className="cd-modal-panel">
                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Create Task
                                        </div>
                                        <div className="cd-stack">
                                            <input
                                                className="cd-input"
                                                placeholder="Follow up on proposal"
                                            />
                                            <select className="cd-input">
                                                <option>To Do</option>
                                                <option>In Progress</option>
                                                <option>Done</option>
                                            </select>
                                            <input
                                                className="cd-input"
                                                type="date"
                                            />
                                            <textarea
                                                className="cd-textarea"
                                                placeholder="Task details"
                                            />
                                            <button className="cd-btn cd-btn-primary">
                                                Add Task
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Task Board
                                        </div>
                                        <div className="cd-entry-list">
                                            <div className="cd-entry">
                                                <div className="cd-entry-title">
                                                    Send proposal summary
                                                </div>
                                                <div className="cd-subtext">
                                                    Prepare post-meeting summary
                                                    and recommended next steps.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {workspaceTab === "calls" && (
                                <div className="cd-modal-panel">
                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Log Call
                                        </div>
                                        <div className="cd-stack">
                                            <input
                                                className="cd-input"
                                                placeholder="Confirmation call"
                                            />
                                            <select className="cd-input">
                                                <option>Connected</option>
                                                <option>No Answer</option>
                                                <option>Voicemail</option>
                                                <option>
                                                    Follow-Up Required
                                                </option>
                                            </select>
                                            <textarea
                                                className="cd-textarea"
                                                placeholder="Call summary"
                                            />
                                            <button className="cd-btn cd-btn-primary">
                                                Save Call Log
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Call History
                                        </div>
                                        <div className="cd-entry-list">
                                            <div className="cd-entry">
                                                <div className="cd-entry-title">
                                                    Confirmation call
                                                </div>
                                                <div className="cd-subtext">
                                                    Confirmed attendance and
                                                    preferred MS Teams meeting
                                                    format.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {workspaceTab === "emails" && (
                                <div className="cd-modal-panel">
                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Log Email
                                        </div>
                                        <div className="cd-stack">
                                            <input
                                                className="cd-input"
                                                placeholder="Proposal follow-up"
                                            />
                                            <select className="cd-input">
                                                <option>Follow-Up</option>
                                                <option>Reminder</option>
                                                <option>Proposal</option>
                                                <option>
                                                    Document Request
                                                </option>
                                            </select>
                                            <textarea
                                                className="cd-textarea"
                                                placeholder="What was sent?"
                                            />
                                            <button className="cd-btn cd-btn-primary">
                                                Save Email Log
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Email History
                                        </div>
                                        <div className="cd-entry-list">
                                            <div className="cd-entry">
                                                <div className="cd-entry-title">
                                                    Meeting reminder
                                                </div>
                                                <div className="cd-subtext">
                                                    Sent reminder with agenda
                                                    and Teams link.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {workspaceTab === "meetings" && (
                                <div className="cd-modal-panel">
                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Schedule Meeting
                                        </div>
                                        <div className="cd-stack">
                                            <input
                                                className="cd-input"
                                                placeholder="Sales presentation"
                                            />
                                            <input
                                                className="cd-input"
                                                type="datetime-local"
                                            />
                                            <select className="cd-input">
                                                <option>Scheduled</option>
                                                <option>Confirmed</option>
                                                <option>Rescheduled</option>
                                                <option>Completed</option>
                                                <option>No-Show</option>
                                            </select>
                                            <textarea
                                                className="cd-textarea"
                                                placeholder="Mode, agenda, and details"
                                            />
                                            <button className="cd-btn cd-btn-primary">
                                                Add Meeting
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cd-modal-card">
                                        <div className="cd-modal-card-head">
                                            Meeting History
                                        </div>
                                        <div className="cd-entry-list">
                                            <div className="cd-entry">
                                                <div className="cd-entry-title">
                                                    Sales presentation
                                                </div>
                                                <div className="cd-subtext">
                                                    Mode: MS Teams. Agenda:
                                                    retail prospect
                                                    qualification and next-step
                                                    fit.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {workspaceTab === "documents" && (
                                <div className="cd-modal-panel">
                                    <div className="cd-modal-card cd-modal-card-full">
                                        <div className="cd-modal-card-head">
                                            Document Request / Tracking
                                        </div>
                                        <div className="cd-stack">
                                            <input
                                                className="cd-input"
                                                placeholder="Document title"
                                            />
                                            <select className="cd-input">
                                                <option>CV</option>
                                                <option>
                                                    Proposal Summary
                                                </option>
                                                <option>Case Study</option>
                                                <option>Supporting Docs</option>
                                            </select>
                                            <textarea
                                                className="cd-textarea"
                                                placeholder="Document request notes"
                                            />
                                            <button className="cd-btn cd-btn-primary">
                                                Save Document Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

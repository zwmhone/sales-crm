import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
export default function ContactsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [contacts, setContacts] = useState([]);
    const [queueCards, setQueueCards] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [countryFilter, setCountryFilter] = useState("all");
    const [meetingFilter, setMeetingFilter] = useState("all");
    const [cvFilter, setCvFilter] = useState("all");

    useEffect(() => {
        fetchContacts();
    }, []);

    async function fetchContacts() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/contacts", {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load contacts");
            }

            const data = await response.json();

            setContacts(Array.isArray(data.contacts) ? data.contacts : []);
            setQueueCards(
                Array.isArray(data.queue_cards) ? data.queue_cards : [],
            );
        } catch (err) {
            setError(err.message || "Failed to load contacts");
        } finally {
            setLoading(false);
        }
    }

    const countries = useMemo(() => {
        return [
            ...new Set(contacts.map((item) => item.country).filter(Boolean)),
        ];
    }, [contacts]);

    const stats = useMemo(() => {
        return {
            contacts: contacts.length,
            interest: contacts.filter((c) => c.cilos_status === "Interest")
                .length,
            leads: contacts.filter((c) => c.cilos_status === "Leads").length,
            reminder_due: contacts.filter(
                (c) =>
                    c.reminder_label &&
                    !["Done", "Completed"].includes(c.reminder_label),
            ).length,
            bronze_ready: contacts.filter((c) =>
                ["Bronze Ready", "Bronze Candidate", "Converted"].includes(
                    c.opportunity_readiness,
                ),
            ).length,
        };
    }, [contacts]);

    const filteredContacts = useMemo(() => {
        return contacts.filter((row) => {
            const haystack = [
                row.contact_name,
                row.email,
                row.phone,
                row.company_name,
                row.job_title,
                row.country,
                row.region,
                row.cilos_status,
                row.contact_status,
                row.meeting_status,
                row.cv_status,
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !search.trim() ||
                haystack.includes(search.toLowerCase().trim());

            const matchesStatus =
                statusFilter === "all" || row.cilos_status === statusFilter;

            const matchesCountry =
                countryFilter === "all" || row.country === countryFilter;

            const matchesMeeting =
                meetingFilter === "all" || row.meeting_status === meetingFilter;

            const matchesCv = cvFilter === "all" || row.cv_status === cvFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCountry &&
                matchesMeeting &&
                matchesCv
            );
        });
    }, [
        contacts,
        search,
        statusFilter,
        countryFilter,
        meetingFilter,
        cvFilter,
    ]);

    function getInitials(name) {
        if (!name) return "?";
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("");
    }

    function getPillClass(value) {
        const v = String(value || "").toLowerCase();

        if (
            [
                "meeting confirmed",
                "interested",
                "complete",
                "completed",
                "done",
                "converted",
                "ok",
            ].includes(v)
        ) {
            return "contact-pill ok";
        }

        if (
            [
                "interest",
                "scheduled",
                "awaiting confirmation",
                "pending",
                "under review",
                "not ready",
                "confirmation due",
                "48h pending",
            ].includes(v)
        ) {
            return "contact-pill pending";
        }

        if (
            [
                "close lost",
                "no-show",
                "missed",
                "missing",
                "blocked",
                "alert",
            ].includes(v)
        ) {
            return "contact-pill alert";
        }

        if (
            [
                "opportunity",
                "bronze ready",
                "bronze candidate",
                "purple",
            ].includes(v)
        ) {
            return "contact-pill purple";
        }

        return "contact-pill info";
    }

    function getScoreWidth(value) {
        const score = Number(value || 0);
        if (Number.isNaN(score)) return "0%";
        return `${Math.max(0, Math.min(100, score))}%`;
    }

    return (
        <div className="main-content contacts-page">
            <div className="topbar">
                <div className="topbar-row">
                    <div className="actions">
                        <button className="btn">Create Contact</button>
                        <button className="btn">Schedule Meeting</button>
                        <button className="btn">Send Reminder</button>
                        <button className="btn">Request CV</button>
                        <button className="btn primary">
                            Create Follow-Up
                        </button>
                        <button className="btn success">Import CSV</button>
                    </div>
                </div>
            </div>

            <div className="body-pad">
                <div className="contacts-layout">
                    <section className="contacts-main">
                        <div className="contacts-panel">
                            <div className="contacts-hero">
                                <div className="contacts-hero-top">
                                    <div>
                                        <h1 className="contacts-title">
                                            Contacts
                                        </h1>
                                    </div>
                                </div>

                                <div className="contacts-stats-grid">
                                    <div className="contact-stat">
                                        <div className="k">Contacts</div>
                                        <div className="v">
                                            {stats.contacts}
                                        </div>
                                    </div>

                                    <div className="contact-stat">
                                        <div className="k">Interest</div>
                                        <div className="v">
                                            {stats.interest}
                                        </div>
                                    </div>

                                    <div className="contact-stat">
                                        <div className="k">Leads</div>
                                        <div className="v">{stats.leads}</div>
                                    </div>

                                    <div className="contact-stat">
                                        <div className="k">Reminder Due</div>
                                        <div className="v">
                                            {stats.reminder_due}
                                        </div>
                                    </div>

                                    <div className="contact-stat">
                                        <div className="k">Bronze Ready</div>
                                        <div className="v">
                                            {stats.bronze_ready}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="contacts-filterbar">
                                <div className="contacts-search">
                                    <input
                                        type="text"
                                        placeholder="Search by name, company, email..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="contacts-filter">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Interest">
                                            Interest
                                        </option>
                                        <option value="Leads">Leads</option>
                                        <option value="Opportunity">
                                            Opportunity
                                        </option>
                                        <option value="Close Lost">
                                            Close Lost
                                        </option>
                                    </select>
                                </div>

                                <div className="contacts-filter">
                                    <select
                                        value={countryFilter}
                                        onChange={(e) =>
                                            setCountryFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            All Countries
                                        </option>
                                        {countries.map((country) => (
                                            <option
                                                key={country}
                                                value={country}
                                            >
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="contacts-filter">
                                    <select
                                        value={meetingFilter}
                                        onChange={(e) =>
                                            setMeetingFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            All Meetings
                                        </option>
                                        <option value="Scheduled">
                                            Scheduled
                                        </option>
                                        <option value="Confirmed">
                                            Confirmed
                                        </option>
                                        <option value="Rescheduled">
                                            Rescheduled
                                        </option>
                                        <option value="No-Show">No-Show</option>
                                        <option value="Completed">
                                            Completed
                                        </option>
                                    </select>
                                </div>

                                <div className="contacts-filter">
                                    <select
                                        value={cvFilter}
                                        onChange={(e) =>
                                            setCvFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            All CV Status
                                        </option>
                                        <option value="Complete">
                                            Complete
                                        </option>
                                        <option value="Pending">Pending</option>
                                        <option value="Under Review">
                                            Under Review
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="contacts-loading">
                                    Loading contacts...
                                </div>
                            ) : error ? (
                                <div className="contacts-error">{error}</div>
                            ) : (
                                <div className="contacts-table-wrap">
                                    <table className="contacts-table">
                                        <thead>
                                            <tr>
                                                <th>Contact</th>
                                                <th>Company</th>
                                                <th>CILOS Status</th>
                                                <th>Contact Status</th>
                                                <th>Meeting</th>
                                                <th>Reminder</th>
                                                <th>CV / Docs</th>
                                                <th>Follow-Up</th>
                                                <th>Engagement</th>
                                                <th>Qualification</th>
                                                <th>Opportunity Readiness</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredContacts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="11">
                                                        <div className="contacts-empty">
                                                            No contacts found
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredContacts.map(
                                                    (row, index) => (
                                                        <tr
                                                            key={
                                                                row.contact_id ||
                                                                index
                                                            }
                                                        >
                                                            <td>
                                                                <div className="contact-cell">
                                                                    <div className="contact-avatar">
                                                                        {getInitials(
                                                                            row.contact_name,
                                                                        )}
                                                                    </div>

                                                                    <div className="contact-info">
                                                                        <div className="contact-name">
                                                                            {row.contact_name ||
                                                                                "-"}
                                                                        </div>
                                                                        <div className="contact-meta">
                                                                            {row.email ||
                                                                                "-"}
                                                                        </div>
                                                                        <div className="contact-meta">
                                                                            {row.phone ||
                                                                                "-"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="contact-value">
                                                                    {row.company_name ||
                                                                        "-"}
                                                                </div>
                                                                <div className="contact-subvalue">
                                                                    {row.job_title ||
                                                                        "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={getPillClass(
                                                                        row.cilos_status,
                                                                    )}
                                                                >
                                                                    {row.cilos_status ||
                                                                        "-"}
                                                                </span>
                                                                <div className="contact-subvalue">
                                                                    Stage:{" "}
                                                                    {row.cilos_stage ||
                                                                        "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={getPillClass(
                                                                        row.contact_status,
                                                                    )}
                                                                >
                                                                    {row.contact_status ||
                                                                        "-"}
                                                                </span>
                                                                <div className="contact-subvalue">
                                                                    {row.region ||
                                                                        "-"}{" "}
                                                                    ·{" "}
                                                                    {row.country ||
                                                                        "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="contact-value">
                                                                    {row.meeting_type ||
                                                                        "-"}
                                                                </div>
                                                                <div className="contact-subvalue">
                                                                    {row.meeting_date ||
                                                                        "-"}
                                                                </div>
                                                                <div className="contact-subvalue">
                                                                    Mode:{" "}
                                                                    {row.meeting_mode ||
                                                                        "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={getPillClass(
                                                                        row.reminder_label,
                                                                    )}
                                                                >
                                                                    {row.reminder_label ||
                                                                        "-"}
                                                                </span>
                                                                <div className="contact-subvalue">
                                                                    {row.reminder_subtext ||
                                                                        "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={getPillClass(
                                                                        row.cv_status,
                                                                    )}
                                                                >
                                                                    {row.cv_status ||
                                                                        "-"}
                                                                </span>
                                                                <div className="contact-subvalue">
                                                                    {row.cv_subtext ||
                                                                        "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="contact-value">
                                                                    {row.follow_up_title ||
                                                                        "-"}
                                                                </div>
                                                                <div className="contact-subvalue">
                                                                    {row.follow_up_due ||
                                                                        "-"}
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="contact-score">
                                                                    <div className="contact-score-value">
                                                                        {row.engagement_score ??
                                                                            0}
                                                                    </div>
                                                                    <div className="contact-scorebar">
                                                                        <span
                                                                            style={{
                                                                                width: getScoreWidth(
                                                                                    row.engagement_score,
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="contact-score">
                                                                    <div className="contact-score-value">
                                                                        {row.qualification_score ??
                                                                            0}
                                                                    </div>
                                                                    <div className="contact-scorebar">
                                                                        <span
                                                                            style={{
                                                                                width: getScoreWidth(
                                                                                    row.qualification_score,
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={getPillClass(
                                                                        row.opportunity_readiness,
                                                                    )}
                                                                >
                                                                    {row.opportunity_readiness ||
                                                                        "-"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="contacts-rail">
                        <div className="contacts-panel">
                            <div className="panel-header">
                                <div className="panel-title">
                                    Lead Queue Control Center
                                </div>
                            </div>

                            <div className="contacts-rail-scroll">
                                <div className="contacts-rail-card-list">
                                    {queueCards.length === 0 ? (
                                        <>
                                            <div className="contacts-rail-card">
                                                <div className="contacts-rail-card-top">
                                                    <div>
                                                        <div className="contacts-rail-card-title">
                                                            Meeting Confirmation
                                                            Queue
                                                        </div>
                                                        <div className="contacts-rail-card-subtext">
                                                            Contacts needing
                                                            confirmation call or
                                                            attendance
                                                            verification
                                                        </div>
                                                    </div>
                                                    <span className="contact-pill pending">
                                                        0 due
                                                    </span>
                                                </div>

                                                <div className="contacts-meta-grid">
                                                    <div>
                                                        <div className="contacts-label">
                                                            Scheduled
                                                        </div>
                                                        <div className="contacts-meta-value">
                                                            0
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="contacts-label">
                                                            Confirmed
                                                        </div>
                                                        <div className="contacts-meta-value">
                                                            0
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="contacts-label">
                                                            Rescheduled
                                                        </div>
                                                        <div className="contacts-meta-value">
                                                            0
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="contacts-label">
                                                            No-Show
                                                        </div>
                                                        <div className="contacts-meta-value">
                                                            0
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        queueCards.map((card, index) => (
                                            <div
                                                className="contacts-rail-card"
                                                key={index}
                                            >
                                                <div className="contacts-rail-card-top">
                                                    <div>
                                                        <div className="contacts-rail-card-title">
                                                            {card.title}
                                                        </div>
                                                        <div className="contacts-rail-card-subtext">
                                                            {card.description}
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={getPillClass(
                                                            card.badge_type,
                                                        )}
                                                    >
                                                        {card.badge}
                                                    </span>
                                                </div>

                                                <div className="contacts-meta-grid">
                                                    {(card.items || []).map(
                                                        (item, itemIndex) => (
                                                            <div
                                                                key={itemIndex}
                                                            >
                                                                <div className="contacts-label">
                                                                    {item.label}
                                                                </div>
                                                                <div className="contacts-meta-value">
                                                                    {item.value}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

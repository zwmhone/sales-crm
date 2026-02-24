// resources/js/Components/Layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
    { key: "home", label: "Home", icon: "🏠", href: "/" },
    { key: "contacts", label: "Contacts List", icon: "👤", href: "/contacts" },
    {
        key: "companies",
        label: "Companies List",
        icon: "🏢",
        href: "/companies",
    },
    {
        key: "opps",
        label: "Opportunity List",
        icon: "📄",
        href: "/opportunities",
    },
    { key: "stages", label: "Opportunity Stages", icon: "📊", href: "/stages" },
    {
        key: "pipeline",
        label: "Pipeline Summary",
        icon: "📈",
        href: "/pipeline",
    },
    { key: "import", label: "CSV Import", icon: "⬆️", href: "/csv-import" },
    { key: "search", label: "Global Search", icon: "🔎", href: "/search" },
];

export default function Sidebar({ open, onToggle, onNavigate }) {
    return (
        <aside className={`sidebar ${open ? "open" : "closed"}`}>
            <div className="sidebarTop">
                <button
                    className="sidebarToggle"
                    onClick={onToggle}
                    type="button"
                    title="Toggle sidebar"
                >
                    {open ? "⟨" : "⟩"}
                </button>
            </div>

            <nav className="sidebarNav">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.key}
                        to={item.href}
                        className={({ isActive }) =>
                            `navRow ${isActive ? "active" : ""}`
                        }
                        onClick={() => {
                            // Close sidebar after navigation on mobile
                            if (typeof onNavigate === "function") onNavigate();
                        }}
                    >
                        <span className="navIcon">{item.icon}</span>
                        <span className="navText">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

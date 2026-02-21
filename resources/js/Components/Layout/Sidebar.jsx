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

    // keep these even if pages aren't built yet
    { key: "stages", label: "Opportunity Stages", icon: "📊", href: "/stages" },
    {
        key: "pipeline",
        label: "Pipeline Summary",
        icon: "📈",
        href: "/pipeline",
    },

    // recommend kebab-case in Laravel routes:
    { key: "import", label: "CSV Import", icon: "⬆️", href: "/csv-import" },
    { key: "search", label: "Global Search", icon: "🔎", href: "/search" },
];

export default function Sidebar({ open, onToggle }) {
    const pathname =
        typeof window !== "undefined" ? window.location.pathname : "/";

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
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;

                    return (
                        <a
                            key={item.key}
                            href={item.href}
                            className={`navRow ${active ? "active" : ""}`}
                        >
                            <span className="navIcon">{item.icon}</span>
                            <span className="navText">{item.label}</span>
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}

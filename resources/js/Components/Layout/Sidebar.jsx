import React, { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const SALES_ITEMS = [
    {
        key: "home",
        label: "Home",
        href: "/",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.3103 1.77586C11.6966 1.40805 12.3034 1.40805 12.6897 1.77586L20.6897 9.39491L23.1897 11.7759C23.5896 12.1567 23.605 12.7897 23.2241 13.1897C22.8433 13.5896 22.2103 13.605 21.8103 13.2241L21 12.4524V20C21 21.1046 20.1046 22 19 22H14H10H5C3.89543 22 3 21.1046 3 20V12.4524L2.18966 13.2241C1.78972 13.605 1.15675 13.5896 0.775862 13.1897C0.394976 12.7897 0.410414 12.1567 0.810345 11.7759L3.31034 9.39491L11.3103 1.77586ZM5 10.5476V20H9V15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15V20H19V10.5476L12 3.88095L5 10.5476ZM13 20V15C13 14.4477 12.5523 14 12 14C11.4477 14 11 14.4477 11 15V20H13Z"
                    fill="#B3A125"
                />
            </svg>
        ),
    },
    {
        key: "contacts",
        label: "Contact List",
        href: "/contacts",
        icon: (
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                    fill="#B3A125"
                    d="M30,1L5.118,1c-1.451,0-2.784,0.978-3.06,2.402C1.686,5.317,3.15,7,5,7v2c-1.654,0-3,1.346-3,3 s1.346,3,3,3v2c-1.654,0-3,1.346-3,3s1.346,3,3,3v2c-1.85,0-3.314,1.683-2.942,3.598C2.335,30.022,3.667,31,5.118,31H30 c0.552,0,1-0.448,1-1V2C31,1.448,30.552,1,30,1z M9,4c0,0.551-0.449,1-1,1H5C4.449,5,4,4.551,4,4s0.449-1,1-1h3C8.551,3,9,3.449,9,4 z M8,29H5c-0.551,0-1-0.449-1-1s0.449-1,1-1h3c0.551,0,1,0.449,1,1S8.551,29,8,29z M4,20c0-0.551,0.449-1,1-1h3c0.551,0,1,0.449,1,1 s-0.449,1-1,1H5C4.449,21,4,20.551,4,20z M4,12c0-0.551,0.449-1,1-1h3c0.551,0,1,0.449,1,1 s-0.449,1-1,1H5C4.449,13,4,12.551,4,12z M9.723,29C9.894,28.705,10,28.366,10,28c0-1.104-0.896-2-2-2H7v-4h1c1.104,0,2-0.896,2-2s-0.896-2-2-2H7v-4h1c1.104,0,2-0.896,2-2 s-0.896-2-2-2H7V6h1c1.104,0,2-0.896,2-2c0-0.366-0.106-0.705-0.277-1H29l0.001,26H9.723z M20.94,13.045 C21.533,12.416,22,11.444,22,10c0-1.657-1.343-3-3-3s-3,1.343-3,3c0,1.444,0.467,2.416,1.06,3.045C15.339,13.264,14,14.721,14,16.5 V18h1v-1.5c0-1.378,1.122-2.5,2.5-2.5h3c1.378,0,2.5,1.122,2.5,2.5V18h1v-1.5C24,14.721,22.661,13.264,20.94,13.045z M19,8 c1.103,0,2,0.897,2,2c0,2.491-1.578,3-2,3c-0.422,0-2-0.509-2-3C17,8.897,17.897,8,19,8z M14,21h10v1H14V21z M14,23h10v1H14V23z"
                />
            </svg>
        ),
    },
    {
        key: "companies",
        label: "Company List",
        href: "/companies",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M3 23V1H21V23"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9 23V19C9 18.4477 9.44772 18 10 18H14C14.5523 18 15 18.4477 15 19V23"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M1 23H23"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M7 5H10"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M7 9H17"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M14 13H17"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M7 13H10"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M14 5H17"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        key: "opps",
        label: "Opportunity List",
        href: "/opportunities",
        icon: (
            <svg viewBox="0 -2.65 19.8 19.8" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(-2.2 -4.75)">
                    <line
                        x2="0.1"
                        transform="translate(3.45 6)"
                        fill="none"
                        stroke="#B3A125"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                    />
                    <line
                        x2="0.1"
                        transform="translate(3.45 12)"
                        fill="none"
                        stroke="#B3A125"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                    />
                    <line
                        x2="0.1"
                        transform="translate(3.45 18)"
                        fill="none"
                        stroke="#B3A125"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M9,6H21M9,12H21M9,18H21"
                        fill="none"
                        stroke="#B3A125"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    />
                </g>
            </svg>
        ),
    },
    {
        key: "pipeline",
        label: "Pipeline",
        href: "/pipeline",
        icon: (
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M60 20 H30 C24 20 20 24 20 30 V70 C20 76 24 80 30 80 H70 C76 80 80 76 80 70 V40"
                    stroke="#B3A125"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M33 60 L45 48 L57 60 L78 30"
                    stroke="#B3A125"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="78" cy="20" r="8" fill="#B3A125" />
            </svg>
        ),
    },
    {
        key: "import",
        label: "CSV Import",
        href: "/csv-import",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 4L12 14M12 14L15 11M12 14L9 11"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 20C7.58172 20 4 16.4183 4 12M20 12C20 14.5264 18.8289 16.7792 17 18.2454"
                    stroke="#B3A125"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
];

const MARKETING_ITEMS = [
    {
        key: "email",
        label: "Email",
        href: "/email",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M4 7H20V17H4V7Z"
                    stroke="#667085"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                />
                <path
                    d="M4 8L12 13L20 8"
                    stroke="#667085"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        key: "lead",
        label: "Lead",
        href: "/lead",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="7"
                    stroke="#667085"
                    strokeWidth="1.7"
                />
                <circle cx="12" cy="12" r="2.3" fill="#667085" />
            </svg>
        ),
    },
    {
        key: "placeholder",
        label: "Place Holder",
        href: "/marketing-placeholder",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="7" cy="16.5" r="2" fill="#667085" />
                <circle cx="17" cy="16.5" r="2" fill="#667085" />
                <path
                    d="M5 8H18L19 13H6L5 8Z"
                    stroke="#667085"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                />
                <path
                    d="M8 8V6.5C8 5.67 8.67 5 9.5 5H14.5C15.33 5 16 5.67 16 6.5V8"
                    stroke="#667085"
                    strokeWidth="1.7"
                />
            </svg>
        ),
    },
];

const HELPDESK_ITEMS = [
    {
        key: "ticketing",
        label: "Issue Ticketing",
        href: "/issue-ticketing",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7 8L17 16M11 8H17V14"
                    stroke="#667085"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
];

const ChevronDown = ({ open }) => (
    <svg
        className={`sectionChevronSvg ${open ? "open" : ""}`}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CollapseArrow = ({ open }) => (
    <svg
        className={`collapseArrowSvg ${open ? "open" : ""}`}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M11.75 5.5L7.25 10L11.75 14.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const SectionIconSales = () => (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="6.5" stroke="#B3A125" strokeWidth="1.8" />
        <path
            d="M10 3.5V10H16.5"
            stroke="#193E6B"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const SectionIconMarketing = () => (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="4.2" stroke="#B3A125" strokeWidth="1.8" />
        <path
            d="M10 2.6V4.2M10 15.8V17.4M17.4 10H15.8M4.2 10H2.6M14.9 5.1L13.8 6.2M6.2 13.8L5.1 14.9M14.9 14.9L13.8 13.8M6.2 6.2L5.1 5.1"
            stroke="#667085"
            strokeWidth="1.4"
            strokeLinecap="round"
        />
    </svg>
);

const SectionIconHelpdesk = () => (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="5.6" stroke="#193E6B" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="2" fill="#B3A125" />
    </svg>
);

const SECTIONS = [
    {
        key: "sales",
        label: "Sales",
        icon: <SectionIconSales />,
        items: SALES_ITEMS,
    },
    {
        key: "marketing",
        label: "Marketing",
        icon: <SectionIconMarketing />,
        items: MARKETING_ITEMS,
    },
    {
        key: "helpdesk",
        label: "Helpdesk",
        icon: <SectionIconHelpdesk />,
        items: HELPDESK_ITEMS,
    },
];

export default function Sidebar({ open, onToggle, onNavigate }) {
    const location = useLocation();

    const defaultOpenSections = useMemo(() => {
        const pathname = location.pathname;

        return {
            sales:
                pathname === "/" ||
                pathname.startsWith("/contacts") ||
                pathname.startsWith("/companies") ||
                pathname.startsWith("/opportunities") ||
                pathname.startsWith("/pipeline") ||
                pathname.startsWith("/csv-import") ||
                pathname.startsWith("/stages"),
            marketing:
                pathname.startsWith("/email") ||
                pathname.startsWith("/lead") ||
                pathname.startsWith("/marketing-placeholder"),
            helpdesk: pathname.startsWith("/issue-ticketing"),
        };
    }, [location.pathname]);

    const [expanded, setExpanded] = useState(defaultOpenSections);

    const toggleSection = (sectionKey) => {
        setExpanded((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    return (
        <aside className={`sidebar ${open ? "open" : "closed"}`}>
            <div className="sidebarTop">
                <div className="sidebarTopSpacer" />
                <div className="sidebarTopFill" />
                <button
                    className="sidebarToggle"
                    onClick={onToggle}
                    type="button"
                    title="Toggle sidebar"
                    aria-label="Toggle sidebar"
                >
                    <CollapseArrow open={open} />
                </button>
            </div>

            <nav className="sidebarNav">
                {SECTIONS.map((section) => (
                    <div className="navSection" key={section.key}>
                        <button
                            type="button"
                            className="navSectionHeader"
                            onClick={() => toggleSection(section.key)}
                            aria-expanded={expanded[section.key]}
                        >
                            <div className="navSectionHeaderLeft">
                                <span className="navSectionIcon">
                                    {section.icon}
                                </span>
                                <span className="navSectionTitle">
                                    {section.label}
                                </span>
                            </div>

                            <span
                                className="navSectionChevron"
                                aria-hidden="true"
                            >
                                <ChevronDown open={expanded[section.key]} />
                            </span>
                        </button>

                        {expanded[section.key] && (
                            <div className="navSectionBody">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.key}
                                        to={item.href}
                                        className={({ isActive }) =>
                                            `navRow navRowIndented ${isActive ? "active" : ""}`
                                        }
                                        onClick={() => {
                                            if (
                                                typeof onNavigate === "function"
                                            ) {
                                                onNavigate();
                                            }
                                        }}
                                    >
                                        <span className="navIcon">
                                            {item.icon}
                                        </span>
                                        <span className="navText">
                                            {item.label}
                                        </span>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}

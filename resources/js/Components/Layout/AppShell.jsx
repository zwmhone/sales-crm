// resources/js/Components/Layout/AppShell.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell() {
    const [open, setOpen] = useState(true);
    const location = useLocation();

    // Auto-close sidebar on mobile after route change
    useEffect(() => {
        if (window.innerWidth <= 900) setOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return (
        <div className="appFrame">
            <Header
                user={{ initials: "U" }}
                onMenu={() => setOpen((v) => !v)}
            />

            <div className="body">
                {/* Mobile overlay */}
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className={`sidebarOverlay ${open ? "show" : ""}`}
                    onClick={() => setOpen(false)}
                />

                <Sidebar
                    open={open}
                    onToggle={() => setOpen((v) => !v)}
                    onNavigate={() => {
                        if (window.innerWidth <= 900) setOpen(false);
                    }}
                />

                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

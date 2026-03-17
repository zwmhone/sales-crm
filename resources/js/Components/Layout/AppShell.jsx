import "./layout.css";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="appFrame">
            <Header
                user={{ initials: "U" }}
                onMenu={() => setSidebarOpen((v) => !v)}
            />

            <div className="body">
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className={`sidebarOverlay ${sidebarOpen ? "show" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                />

                <Sidebar
                    open={sidebarOpen}
                    onToggle={() => setSidebarOpen((v) => !v)}
                    onNavigate={() => {
                        if (window.innerWidth <= 900) {
                            setSidebarOpen(false);
                        }
                    }}
                />

                <div className="app-main">
                    <main className="content">{children}</main>
                </div>
            </div>
        </div>
    );
}

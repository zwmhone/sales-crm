import { useMemo, useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./layout.css";

export default function AppShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("sidebarOpen");
            return stored !== null ? JSON.parse(stored) : true;
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    const user = useMemo(
        () => ({
            name: "User",
            initials: "U",
        }),
        [],
    );

    return (
        <div className="shell">
            <Header user={user} />

            <div className="body">
                <Sidebar
                    open={sidebarOpen}
                    onToggle={() => setSidebarOpen((v) => !v)}
                />

                <main className="content">{children}</main>
            </div>
        </div>
    );
}

import { useMemo, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./layout.css";

export default function AppShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

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

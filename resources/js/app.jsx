import { createRoot } from "react-dom/client";
import AppShell from "./Components/Layout/AppShell";

function Dashboard() {
    return <h1 style={{ margin: 0 }}>Dashboard</h1>;
}

createRoot(document.getElementById("app")).render(
    <AppShell>
        <Dashboard />
    </AppShell>,
);

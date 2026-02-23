import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./Components/Layout/AppShell";
import Dashboard from "./Pages/Dashboard";
import Contact from "./Pages/Contact";
import Opportunity from "./Pages/Opportunity";

function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/"               element={<Dashboard />}       />
                    <Route path="/contacts"       element={<Contact />}    />
                    <Route path="/opportunities"  element={<Opportunity />} />
                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}

createRoot(document.getElementById("app")).render(<App />);
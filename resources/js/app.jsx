import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./Components/Layout/AppShell";
import Dashboard from "./pages/Dashboard";
import CsvImportPage from "./pages/CsvImportPage";

function NotFound() {
    return <h1 style={{ margin: 0 }}>404</h1>;
}

createRoot(document.getElementById("app")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/csv-import" element={<CsvImportPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AppShell>
        </BrowserRouter>
    </React.StrictMode>,
);

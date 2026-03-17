import "../css/app.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./Components/Layout/AppShell";
import Dashboard from "./pages/Dashboard";
import ContactsListPage from "./pages/ContactsListPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import CompanyListPage from "./pages/CompanyListPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import CsvImportPage from "./pages/CsvImportPage";
import OpportunityListPage from "./pages/OpportunityListPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import OpportunityStagesPage from "./pages/OpportunityStagesPage";

function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <Routes>
                    <Route path="/" element={<Dashboard />} />

                    <Route path="/contacts" element={<ContactsListPage />} />
                    <Route
                        path="/contacts/:id"
                        element={<ContactDetailPage />}
                    />
                    <Route path="/stages" element={<OpportunityStagesPage />} />
                    <Route path="/companies" element={<CompanyListPage />} />
                    <Route
                        path="/companies/:id"
                        element={<CompanyDetailPage />}
                    />

                    <Route path="/csv-import" element={<CsvImportPage />} />

                    <Route
                        path="/opportunities"
                        element={<OpportunityListPage />}
                    />
                    <Route
                        path="/opportunities/:id"
                        element={<OpportunityDetailPage />}
                    />
                </Routes>
            </AppShell>
        </BrowserRouter>
    );
}

createRoot(document.getElementById("app")).render(<App />);

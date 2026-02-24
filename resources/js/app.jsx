import "../css/app.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./Components/Layout/AppShell";
import Dashboard from "./Pages/Dashboard";
//import Contact from "./Pages/Contact";
//import Opportunity from "./Pages/Opportunity";
import CsvImportPage from "./Pages/CsvImportPage";
//import NotFound from "./Pages/NotFound";

import ContactsListPage from "./pages/ContactsListPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import CompanyListPage from "./pages/CompanyListPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";

function HomePage() {
    return <div>Home</div>;
}

function Placeholder({ title }) {
    return <div>{title}</div>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppShell />}>
                    <Route path="/" element={<HomePage />} />

                    <Route path="/contacts" element={<ContactsListPage />} />
                    <Route
                        path="/contacts/:id"
                        element={<ContactDetailPage />}
                    />

                    <Route path="/companies" element={<CompanyListPage />} />
                    <Route
                        path="/companies/:id"
                        element={<CompanyDetailPage />}
                    />

                    <Route
                        path="/opportunities"
                        element={<Placeholder title="Opportunities" />}
                    />
                    <Route
                        path="/stages"
                        element={<Placeholder title="Stages" />}
                    />
                    <Route
                        path="/pipeline"
                        element={<Placeholder title="Pipeline" />}
                    />
                    <Route
                        path="/csv-import"
                        element={<Placeholder title="CSV Import" />}
                    />
                    <Route
                        path="/search"
                        element={<Placeholder title="Global Search" />}
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById("app")).render(<App />);

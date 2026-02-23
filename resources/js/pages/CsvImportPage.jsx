import React, { useMemo, useRef, useState } from "react";

function getCsrfToken() {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el?.getAttribute("content") || "";
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "";
    const units = ["B", "KB", "MB", "GB"];
    let v = bytes;
    let idx = 0;
    while (v >= 1024 && idx < units.length - 1) {
        v /= 1024;
        idx++;
    }
    return `${v.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function Card({ children }) {
    return (
        <div
            style={{
                maxWidth: 900,
                margin: "24px auto",
                padding: 20,
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                background: "white",
            }}
        >
            {children}
        </div>
    );
}

function Button({ children, ...props }) {
    return (
        <button
            {...props}
            style={{
                appearance: "none",
                border: "1px solid #111827",
                background: props.disabled ? "#9ca3af" : "#111827",
                color: "white",
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 600,
                cursor: props.disabled ? "not-allowed" : "pointer",
                ...props.style,
            }}
        >
            {children}
        </button>
    );
}

function GhostButton({ children, ...props }) {
    return (
        <button
            {...props}
            style={{
                appearance: "none",
                border: "1px solid #e5e7eb",
                background: "white",
                color: "#111827",
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 600,
                cursor: props.disabled ? "not-allowed" : "pointer",
                ...props.style,
            }}
        >
            {children}
        </button>
    );
}

function Progress({ value }) {
    return (
        <div style={{ marginTop: 10 }}>
            <div
                style={{
                    height: 10,
                    borderRadius: 999,
                    background: "#e5e7eb",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${Math.max(0, Math.min(100, value))}%`,
                        background: "#111827",
                        transition: "width 150ms linear",
                    }}
                />
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                Upload: {value.toFixed(0)}%
            </div>
        </div>
    );
}

function Alert({ type = "info", title, children }) {
    const styles = useMemo(() => {
        if (type === "success")
            return { bg: "#e6ffed", border: "#b7f5c5", text: "#065f46" };
        if (type === "error")
            return { bg: "#ffecec", border: "#ffb9b9", text: "#7f1d1d" };
        return { bg: "#eef2ff", border: "#c7d2fe", text: "#1e3a8a" };
    }, [type]);

    return (
        <div
            style={{
                padding: 12,
                borderRadius: 12,
                background: styles.bg,
                border: `1px solid ${styles.border}`,
                color: styles.text,
                marginTop: 14,
                lineHeight: 1.45,
            }}
        >
            {title && (
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
            )}
            <div>{children}</div>
        </div>
    );
}

function StatGrid({ stats }) {
    const items = [
        ["Rows total", stats.rows_total],
        ["Skipped (no key)", stats.rows_skipped_no_key],
        ["Companies created", stats.companies_created],
        ["Companies updated", stats.companies_updated],
        ["Contacts created", stats.contacts_created],
        ["Contacts updated", stats.contacts_updated],
    ];

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginTop: 12,
            }}
        >
            {items.map(([label, value]) => (
                <div
                    key={label}
                    style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 14,
                        padding: 12,
                        background: "white",
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            color: "#6b7280",
                            fontWeight: 700,
                        }}
                    >
                        {label}
                    </div>
                    <div
                        style={{
                            marginTop: 4,
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#111827",
                        }}
                    >
                        {value ?? 0}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function CsvImportPage() {
    const inputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);

    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [stats, setStats] = useState(null);
    const [meta, setMeta] = useState(null);

    function resetMessages() {
        setSuccessMsg("");
        setErrorMsg("");
        setStats(null);
        setMeta(null);
    }

    function validateAndSetFile(f) {
        if (!f) {
            setFile(null);
            return;
        }

        const name = (f.name || "").toLowerCase();
        const isCsv = name.endsWith(".csv") || f.type === "text/csv";
        if (!isCsv) {
            setFile(null);
            setErrorMsg("Please choose a .csv file.");
            return;
        }

        if (f.size > 20 * 1024 * 1024) {
            setFile(null);
            setErrorMsg("File too large. Max size is 20MB.");
            return;
        }

        setFile(f);
    }

    function onPickFile(e) {
        resetMessages();
        const f = e.target.files?.[0] || null;
        validateAndSetFile(f);
    }

    function onDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        resetMessages();
        const f = e.dataTransfer.files?.[0] || null;
        validateAndSetFile(f);
    }

    function clearFile() {
        setFile(null);
        resetMessages();
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
    }

    async function upload() {
        resetMessages();

        if (!file) {
            setErrorMsg("Please select a CSV file first.");
            return;
        }

        setBusy(true);
        setProgress(0);

        try {
            const form = new FormData();
            form.append("file", file);

            const json = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/csv-import", true);

                const csrf = getCsrfToken();
                if (csrf) xhr.setRequestHeader("X-CSRF-TOKEN", csrf);

                xhr.setRequestHeader("Accept", "application/json");

                xhr.upload.onprogress = (evt) => {
                    if (!evt.lengthComputable) return;
                    const pct = (evt.loaded / evt.total) * 100;
                    setProgress(pct);
                };

                xhr.onload = () => {
                    try {
                        const data = JSON.parse(xhr.responseText || "{}");
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(data);
                        } else {
                            reject({ status: xhr.status, data });
                        }
                    } catch (e) {
                        reject({
                            status: xhr.status,
                            data: {
                                message: "Invalid JSON response from server.",
                            },
                        });
                    }
                };

                xhr.onerror = () =>
                    reject({
                        status: 0,
                        data: { message: "Network error during upload." },
                    });

                xhr.send(form);
            });

            if (json?.ok) {
                setSuccessMsg(json.message || "Import completed.");
                setStats(json.stats || null);
                setMeta(json.meta || null);
                setProgress(100);
            } else {
                setErrorMsg(json?.message || "Import failed.");
            }
        } catch (err) {
            const msg =
                err?.data?.message ||
                (err?.status === 422
                    ? "Validation failed. Check the CSV columns and try again."
                    : "Upload failed.");
            setErrorMsg(msg);

            const errors = err?.data?.errors;
            if (errors && typeof errors === "object") {
                const firstKey = Object.keys(errors)[0];
                if (firstKey && errors[firstKey]?.[0]) {
                    setErrorMsg(errors[firstKey][0]);
                }
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 16 }}>
            <Card>
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 16,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 22,
                                color: "#111827",
                            }}
                        >
                            CSV Import
                        </h1>
                        <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
                            Upload a CSV to upsert contacts and auto-create
                            missing companies.
                        </p>
                    </div>
                </div>

                <div
                    onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver(true);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver(false);
                    }}
                    onDrop={onDrop}
                    style={{
                        marginTop: 18,
                        borderRadius: 16,
                        border: `2px dashed ${dragOver ? "#111827" : "#d1d5db"}`,
                        background: dragOver ? "#f3f4f6" : "white",
                        padding: 18,
                        transition: "all 120ms ease",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 800, color: "#111827" }}>
                                Drag & drop your CSV here
                            </div>
                            <div
                                style={{
                                    marginTop: 6,
                                    fontSize: 13,
                                    color: "#6b7280",
                                }}
                            >
                                CSV only. Max 20MB. Company names with commas
                                must be quoted.
                            </div>
                        </div>

                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,text/csv"
                            onChange={onPickFile}
                            disabled={busy}
                        />
                    </div>

                    {file && (
                        <div
                            style={{
                                marginTop: 14,
                                padding: 12,
                                borderRadius: 12,
                                border: "1px solid #e5e7eb",
                                background: "#fff",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                alignItems: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontWeight: 800,
                                        color: "#111827",
                                    }}
                                >
                                    {file.name}
                                </div>
                                <div
                                    style={{
                                        marginTop: 4,
                                        fontSize: 13,
                                        color: "#6b7280",
                                    }}
                                >
                                    {formatBytes(file.size)}
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <GhostButton
                                    onClick={clearFile}
                                    disabled={busy}
                                >
                                    Clear
                                </GhostButton>
                                <Button onClick={upload} disabled={busy}>
                                    {busy ? "Uploading..." : "Upload & Import"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {busy && <Progress value={progress} />}

                    {successMsg && (
                        <Alert type="success" title="Import complete">
                            {successMsg}
                            {stats && <StatGrid stats={stats} />}
                            {meta && (
                                <div
                                    style={{
                                        marginTop: 10,
                                        fontSize: 12,
                                        color: "#065f46",
                                    }}
                                >
                                    <div>
                                        <b>Company name column:</b>{" "}
                                        {meta.company_name_column_used ||
                                            "none"}
                                    </div>
                                    <div>
                                        <b>Contact match key:</b>{" "}
                                        {meta.contact_match_key}
                                    </div>
                                </div>
                            )}
                        </Alert>
                    )}

                    {errorMsg && (
                        <Alert type="error" title="Error">
                            {errorMsg}
                        </Alert>
                    )}

                    <Alert type="info" title="CSV header tips">
                        <div style={{ fontSize: 13 }}>
                            Best: use headers that match DB columns exactly
                            (snake_case). For company name, include{" "}
                            <code>company_name</code> or{" "}
                            <code>current_company</code>. If company name
                            contains a comma, wrap it in quotes:
                            <br />
                            <code>"ACME, Inc."</code>
                        </div>
                    </Alert>
                </div>
            </Card>
        </div>
    );
}

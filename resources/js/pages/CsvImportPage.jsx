import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CsvImportPage() {
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadPct, setUploadPct] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Columns
    const [columnsLoading, setColumnsLoading] = useState(true);
    const [requiredCols, setRequiredCols] = useState([]);
    const [colsError, setColsError] = useState(null);

    // UI polish
    const [query, setQuery] = useState("");
    const [showColumns, setShowColumns] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setColumnsLoading(true);
                setColsError(null);

                const res = await fetch("/api/csv-import/columns");
                const data = await res.json();

                if (!data.success)
                    throw new Error(data.error || "Failed to load columns");
                setRequiredCols(data.required_header_columns || []);
            } catch (e) {
                setColsError(e.message);
            } finally {
                setColumnsLoading(false);
            }
        })();
    }, []);

    const filteredCols = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return requiredCols;
        return requiredCols.filter((c) => c.toLowerCase().includes(q));
    }, [requiredCols, query]);

    function handleFileChange(e) {
        setFile(e.target.files[0] || null);
    }

    function downloadSample() {
        window.location.href = "/api/csv-import/sample";
    }

    async function copyColumns() {
        try {
            await navigator.clipboard.writeText(requiredCols.join(","));
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            // fallback: still avoid alert UI; show toast-like state
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        }
    }

    async function handleUpload() {
        if (!file) return;

        setUploading(true);
        setUploadPct(0);
        setResult(null);
        setError(null);

        const form = new FormData();
        form.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/csv-import", true);

        xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
                setUploadPct((evt.loaded / evt.total) * 100);
            }
        };

        xhr.onload = () => {
            try {
                const data = JSON.parse(xhr.responseText || "{}");
                if (data.success) setResult(data);
                else setError(data.error || "Upload failed");
            } catch {
                setError("Invalid server response");
            }

            setUploading(false);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        xhr.onerror = () => {
            setError("Network error");
            setUploading(false);
        };

        xhr.send(form);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                        CSV Import
                    </h1>
                    <p className="text-slate-600">
                        Upload a CSV file and we’ll sync it to staging. Use the
                        exact database column names.
                    </p>
                </div>

                {/* Requirements + columns */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Requirements */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm">
                            <div className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
                                        {/* info icon */}
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="text-slate-700"
                                        >
                                            <path
                                                d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M12 10V16"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M12 7H12.01"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                CSV Format Requirements
                                            </h2>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                                                Header-only sample available
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-slate-600">
                                            Your CSV header must match the
                                            database column names.
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {[
                                                "Exact spelling & underscores",
                                                "Do not rename columns",
                                                "Missing columns won't import",
                                                "Extra columns ignored",
                                            ].map((t) => (
                                                <span
                                                    key={t}
                                                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={downloadSample}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:bg-slate-900"
                                            >
                                                {/* download icon */}
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M12 3V14"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                    />
                                                    <path
                                                        d="M7 10L12 15L17 10"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M5 21H19"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                Download sample header CSV
                                            </button>

                                            <button
                                                onClick={copyColumns}
                                                disabled={
                                                    requiredCols.length === 0
                                                }
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                                            >
                                                {/* copy icon */}
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M8 7H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                    />
                                                    <path
                                                        d="M9 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                                Copy column names
                                            </button>
                                        </div>

                                        {/* toast */}
                                        <div
                                            className={`mt-3 text-sm transition-opacity ${
                                                copied
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            }`}
                                        >
                                            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M20 6L9 17L4 12"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                Copied to clipboard
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 px-5 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-900">
                                            Columns
                                        </span>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                            {requiredCols.length}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowColumns((v) => !v)
                                        }
                                        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                                    >
                                        {showColumns ? "Hide" : "Show"}
                                    </button>
                                </div>

                                {showColumns && (
                                    <div className="mt-3">
                                        <div className="relative">
                                            <input
                                                value={query}
                                                onChange={(e) =>
                                                    setQuery(e.target.value)
                                                }
                                                placeholder="Search columns…"
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
                                            />
                                            <div className="absolute right-3 top-2.5 text-xs text-slate-500">
                                                {filteredCols.length}/
                                                {requiredCols.length}
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            {columnsLoading && (
                                                <div className="text-sm text-slate-500">
                                                    Loading columns…
                                                </div>
                                            )}

                                            {colsError && (
                                                <div className="text-sm text-red-600">
                                                    Error: {colsError}
                                                </div>
                                            )}

                                            {!columnsLoading && !colsError && (
                                                <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {filteredCols.map(
                                                            (c) => (
                                                                <span
                                                                    key={c}
                                                                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-700 shadow-sm"
                                                                >
                                                                    {c}
                                                                </span>
                                                            ),
                                                        )}
                                                        {filteredCols.length ===
                                                            0 && (
                                                            <div className="text-sm text-slate-500">
                                                                No columns match
                                                                “{query}”.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Upload */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm">
                            <div className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Upload CSV
                                    </h2>
                                    {result?.success && (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                            Completed
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 text-sm text-slate-600">
                                    Select a CSV file and upload. We’ll process
                                    and sync to staging.
                                </p>

                                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                                    <label className="md:col-span-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:bg-slate-50 cursor-pointer">
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-slate-900 truncate">
                                                {file
                                                    ? file.name
                                                    : "Choose a CSV file"}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {file
                                                    ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                                                    : "CSV, up to 500MB (server limit)"}
                                            </div>
                                        </div>
                                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                            Browse
                                        </span>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900"
                                    >
                                        {uploading ? "Uploading…" : "Upload"}
                                    </button>
                                </div>

                                {uploading && (
                                    <div className="mt-5">
                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                            <span>Uploading</span>
                                            <span>
                                                {Math.round(uploadPct)}%
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-slate-900 transition-all"
                                                style={{
                                                    width: `${uploadPct}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {result && (
                                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <div className="text-sm font-semibold text-emerald-900">
                                            Import completed
                                        </div>
                                        <div className="mt-1 text-sm text-emerald-900">
                                            Rows inserted:{" "}
                                            <span className="font-semibold">
                                                {
                                                    result.rows_inserted_this_upload
                                                }
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-emerald-800">
                                            File: {result.file_name} • Batch:{" "}
                                            {result.batch_id}
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                                        <div className="text-sm font-semibold text-red-900">
                                            Upload failed
                                        </div>
                                        <div className="mt-1 text-sm text-red-800">
                                            {error}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* footer */}
                            <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
                                Tip: download the sample header CSV and paste
                                your data under the headers.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

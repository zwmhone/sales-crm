import React from "react";

export default function Modal({
    open,
    title,
    subtitle,
    onClose,
    children,
    footer,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-[720px] max-w-[95vw] rounded-2xl bg-white shadow-xl border border-gray-200">
                <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100">
                    <div>
                        <div className="text-sm font-semibold text-gray-900">
                            {title}
                        </div>
                        {subtitle ? (
                            <div className="mt-1 text-xs text-gray-500">
                                {subtitle}
                            </div>
                        ) : null}
                    </div>
                    <button
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                <div className="p-5">{children}</div>

                {footer ? (
                    <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

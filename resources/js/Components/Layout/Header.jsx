import React, { useState } from "react";

export default function Header({ user, onMenu }) {
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    return (
        <header className="appHeader">
            <div className="headerLeft">
                <button
                    type="button"
                    className="mobileMenuBtn"
                    onClick={onMenu}
                    aria-label="Open menu"
                    title="Menu"
                >
                    ☰
                </button>

                <div className="brandWrap">
                    <img
                        src="/logo.png"
                        className="brandLogo"
                        alt="CLaaS 2SaaS"
                    />
                    <span className="brandDivider" />
                    <span className="brandProduct">Kernel Apps</span>
                </div>
            </div>

            <div className="headerCenter">
                <div className="headerSearch">
                    <span className="headerSearchIcon">⌕</span>
                    <input
                        type="text"
                        placeholder="Search Modules..."
                        aria-label="Search Modules"
                    />
                </div>
            </div>

            <div className="headerRight">
                <button
                    type="button"
                    className="headerIconBtn mobileSearchBtn"
                    aria-label="Toggle search"
                    onClick={() => setMobileSearchOpen((prev) => !prev)}
                >
                    {mobileSearchOpen ? "✕" : "⌕"}
                </button>

                <div className="environmentBox">
                    <span className="environmentLabel">ENVIRONMENT</span>
                    <span className="environmentValue">CLaaS2SaaS default</span>
                </div>

                <button
                    type="button"
                    className="headerIconBtn"
                    aria-label="Language"
                    title="Language"
                >
                    🌐
                </button>

                <button
                    type="button"
                    className="headerIconBtn notificationBtn"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    🔔
                    <span className="notificationDot" />
                </button>

                <button
                    type="button"
                    className="headerIconBtn"
                    aria-label="Settings"
                    title="Settings"
                >
                    ⚙
                </button>

                <button
                    type="button"
                    className="headerIconBtn"
                    aria-label="Quick actions"
                    title="Quick actions"
                >
                    ⚡
                </button>

                <button
                    type="button"
                    className="userAvatarBtn"
                    aria-label="User profile"
                    title={user?.name || "User"}
                >
                    <span className="userAvatar" />
                </button>
            </div>

            {mobileSearchOpen && (
                <div className="mobileSearchRow">
                    <div className="headerSearch mobileHeaderSearch">
                        <span className="headerSearchIcon">⌕</span>
                        <input
                            type="text"
                            placeholder="Search Modules..."
                            aria-label="Search Modules"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}

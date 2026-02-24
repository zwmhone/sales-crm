// resources/js/Components/Layout/Header.jsx
import React from "react";

export default function Header({ user, onMenu }) {
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

                <img src="/logo.png" className="brandLogo" alt="CLaaS 2SaaS" />
            </div>

            <div className="userProfile">
                <div className="avatarCircle">
                    {user?.initials || "U"}
                </div>
                <div className="userInfo">
                    <div className="userName">{user?.name || "User"}</div>
                    <div className="userRole">{user?.role || "Role"}</div>
                </div>
            </div>
        </header>
    );
}
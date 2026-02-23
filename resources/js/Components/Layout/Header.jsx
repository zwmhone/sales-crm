export default function Header({ user }) {
    return (
        <header className="appHeader">
            <img src="/logo.png" className="brandLogo" alt="CLaaS 2SaaS" />

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
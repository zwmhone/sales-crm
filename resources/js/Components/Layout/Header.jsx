export default function Header({ user }) {
    return (
        <header className="appHeader">
            <img src="/logo.png" className="brandLogo" alt="CLaaS 2SaaS" />

            <div className="avatarCircle">{user?.initials || "U"}</div>
        </header>
    );
}

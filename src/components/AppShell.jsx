import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Brand from "./Brand.jsx";

const LINKS = [
  { to: "/desk", label: "Desk", hint: "Ask Hearth" },
  { to: "/people", label: "People", hint: "Directory" },
  { to: "/pulse", label: "Pulse", hint: "Headcount" },
  { to: "/you", label: "You", hint: "Settings" },
];

export default function AppShell() {
  const { profile, theme, toggleTheme } = useApp();
  const { pathname } = useLocation();
  const current = LINKS.find((l) => l.to === pathname);

  return (
    <div className="shell">
      <aside className="rail">
        <Brand />

        <nav className="rail-nav" aria-label="Desk">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "rail-link is-on" : "rail-link"
              }
            >
              <span>{link.label}</span>
              <small>{link.hint}</small>
            </NavLink>
          ))}
        </nav>

        <div className="rail-foot">
          <button
            type="button"
            className="ghost-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "Lights on" : "Lights out"}
          </button>
          <div className="you-chip">
            <span className="avatar tiny">
              {(profile.firstName?.[0] || "S") + (profile.lastName?.[0] || "K")}
            </span>
            <div>
              <b>
                {profile.firstName} {profile.lastName}
              </b>
              <span>{profile.title}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="stage">
        <header className="stage-bar">
          <div>
            <p className="eyebrow">{current?.hint || "Desk"}</p>
            <h1>{current?.label || "Hearth"}</h1>
          </div>
          <p className="quiet">Internal · not for vendors</p>
        </header>
        <main className="stage-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function Settings() {
  const { profile, setProfile, prefs, setPrefs, theme, setTheme } = useApp();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
  }

  function onSave(e) {
    e.preventDefault();
    setProfile(form);
    setSaved(true);
  }

  return (
    <div className="settings">
      <form className="panel form" onSubmit={onSave}>
        <header className="panel-head">
          <h2>Your card</h2>
          <p>This is just for the desk. People still owns the real record.</p>
        </header>

        <div className="fields">
          <label>
            First name
            <input name="firstName" value={form.firstName} onChange={onChange} required />
          </label>
          <label>
            Last name
            <input name="lastName" value={form.lastName} onChange={onChange} required />
          </label>
          <label>
            Title
            <input name="title" value={form.title} onChange={onChange} />
          </label>
          <label>
            Work email
            <input type="email" name="email" value={form.email} onChange={onChange} />
          </label>
          <label className="span-2">
            Where you sit
            <input name="desk" value={form.desk} onChange={onChange} />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn solid">
            Save this
          </button>
          {saved && <span className="ok">Saved on this machine.</span>}
        </div>
      </form>

      <section className="panel">
        <header className="panel-head">
          <h2>How it looks</h2>
          <p>Dark is easier after 6. Light is what the 3rd floor actually uses.</p>
        </header>
        <div className="seg">
          <button
            type="button"
            className={theme === "light" ? "on" : ""}
            onClick={() => setTheme("light")}
          >
            Paper
          </button>
          <button
            type="button"
            className={theme === "dark" ? "on" : ""}
            onClick={() => setTheme("dark")}
          >
            Ink
          </button>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Pings</h2>
          <p>None of these leave the browser. They’re just switches so the form feels finished.</p>
        </header>
        <ul className="toggles">
          <Toggle
            label="Desk pings"
            hint="When Hearth finishes a long reply"
            on={prefs.deskPings}
            onChange={(v) => setPrefs({ ...prefs, deskPings: v })}
          />
          <Toggle
            label="Friday digest"
            hint="A weekly recap nobody asked for"
            on={prefs.weeklyDigest}
            onChange={(v) => setPrefs({ ...prefs, weeklyDigest: v })}
          />
          <Toggle
            label="Sound"
            hint="A small tick. You’ll turn it off by Wednesday."
            on={prefs.sound}
            onChange={(v) => setPrefs({ ...prefs, sound: v })}
          />
        </ul>
      </section>
    </div>
  );
}

function Toggle({ label, hint, on, onChange }) {
  return (
    <li>
      <div>
        <b>{label}</b>
        <span>{hint}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        className={on ? "switch on" : "switch"}
        onClick={() => onChange(!on)}
      >
        <i />
      </button>
    </li>
  );
}

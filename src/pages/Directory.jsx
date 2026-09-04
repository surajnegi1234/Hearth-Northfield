import { useMemo, useState } from "react";
import EmployeeCard from "../components/EmployeeCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { DEPARTMENTS, employees } from "../data/employees.js";

export default function Directory() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return employees.filter((p) => {
      const inDept = dept === "all" || p.department === dept;
      if (!inDept) return false;
      if (!needle) return true;
      const hay = `${p.name} ${p.position} ${p.email} ${p.location} ${p.department}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [q, dept]);

  return (
    <div className="dir">
      <div className="dir-tools">
        <label className="search">
          <span className="sr-only">Search people</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try ‘finance’ or a last name"
          />
        </label>
        <div className="filters" role="tablist" aria-label="Department">
          <button
            type="button"
            className={dept === "all" ? "chip on" : "chip"}
            onClick={() => setDept("all")}
          >
            Everyone
          </button>
          {DEPARTMENTS.map((name) => (
            <button
              key={name}
              type="button"
              className={dept === name ? "chip on" : "chip"}
              onClick={() => setDept(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <p className="quiet">
          {list.length} {list.length === 1 ? "person" : "people"}
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Nobody matches that."
          copy="The filter’s probably too tight. Or we have a hiring problem. Try another shop, or clear the search."
        >
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setQ("");
              setDept("all");
            }}
          >
            Reset
          </button>
        </EmptyState>
      ) : (
        <div className="person-grid">
          {list.map((person) => (
            <EmployeeCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}

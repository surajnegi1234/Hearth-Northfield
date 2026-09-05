function Bone({ className = "" }) {
  return <span className={`sk-bone ${className}`} aria-hidden="true" />;
}

function PeopleSkeleton() {
  return (
    <div className="dir">
      <div className="dir-tools">
        <Bone className="sk-search" />
        <div className="filters">
          {["a", "b", "c", "d", "e"].map((id) => (
            <Bone key={id} className="sk-chip" />
          ))}
        </div>
        <Bone className="sk-count" />
      </div>
      <div className="person-grid">
        {["1", "2", "3", "4", "5", "6"].map((id) => (
          <article key={id} className="person-card">
            <header>
              <Bone className="sk-avatar" />
              <div>
                <Bone className="sk-line sk-w-80" />
                <Bone className="sk-line sk-w-55" />
              </div>
              <Bone className="sk-pill" />
            </header>
            <dl>
              <div>
                <Bone className="sk-line sk-w-40" />
                <Bone className="sk-line sk-w-70" />
              </div>
              <div>
                <Bone className="sk-line sk-w-40" />
                <Bone className="sk-line sk-w-70" />
              </div>
              <div>
                <Bone className="sk-line sk-w-40" />
                <Bone className="sk-line sk-w-50" />
              </div>
            </dl>
            <Bone className="sk-line sk-w-90" />
          </article>
        ))}
      </div>
    </div>
  );
}

function PulseSkeleton() {
  return (
    <div className="pulse">
      <div className="stat-row">
        {["1", "2", "3"].map((id) => (
          <div key={id} className="stat">
            <Bone className="sk-line sk-w-50" />
            <Bone className="sk-stat" />
            <Bone className="sk-line sk-w-70" />
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <section className="panel">
          <header className="panel-head">
            <Bone className="sk-title" />
            <Bone className="sk-line sk-w-60" />
          </header>
          <Bone className="sk-chart" />
        </section>
        <section className="panel">
          <header className="panel-head">
            <Bone className="sk-title" />
            <Bone className="sk-line sk-w-55" />
          </header>
          <div className="pie-wrap">
            <Bone className="sk-pie" />
            <div className="legend">
              {["1", "2", "3"].map((id) => (
                <Bone key={id} className="sk-line sk-w-90" />
              ))}
            </div>
          </div>
        </section>
      </div>
      <section className="panel">
        <header className="panel-head">
          <Bone className="sk-title" />
          <Bone className="sk-line sk-w-45" />
        </header>
        <Bone className="sk-chart sk-chart-short" />
      </section>
    </div>
  );
}

function YouSkeleton() {
  return (
    <div className="settings">
      <section className="panel">
        <header className="panel-head">
          <Bone className="sk-title" />
          <Bone className="sk-line sk-w-70" />
        </header>
        <div className="fields">
          {["1", "2", "3", "4"].map((id) => (
            <div key={id}>
              <Bone className="sk-line sk-w-40" />
              <Bone className="sk-field" />
            </div>
          ))}
          <div className="span-2">
            <Bone className="sk-line sk-w-30" />
            <Bone className="sk-field" />
          </div>
        </div>
        <div className="form-actions">
          <Bone className="sk-btn" />
        </div>
      </section>
      <section className="panel">
        <header className="panel-head">
          <Bone className="sk-title" />
          <Bone className="sk-line sk-w-65" />
        </header>
        <Bone className="sk-seg" />
      </section>
      <section className="panel">
        <header className="panel-head">
          <Bone className="sk-title" />
          <Bone className="sk-line sk-w-75" />
        </header>
        <ul className="toggles">
          {["1", "2", "3"].map((id) => (
            <li key={id}>
              <div>
                <Bone className="sk-line sk-w-40" />
                <Bone className="sk-line sk-w-70" />
              </div>
              <Bone className="sk-switch" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function RouteSkeleton({ path }) {
  const page =
    path === "/people" ? (
      <PeopleSkeleton />
    ) : path === "/pulse" ? (
      <PulseSkeleton />
    ) : path === "/you" ? (
      <YouSkeleton />
    ) : (
      <p className="quiet" style={{ padding: "2rem 0" }}>
        One second…
      </p>
    );

  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {page}
    </div>
  );
}

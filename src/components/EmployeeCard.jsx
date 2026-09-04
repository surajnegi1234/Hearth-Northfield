import { initials } from "../data/employees.js";

const STATUS_LABEL = {
  active: "Around",
  leave: "On leave",
  inactive: "Offboarded",
};

export default function EmployeeCard({ person }) {
  return (
    <article className="person-card">
      <header>
        <span className="avatar">{initials(person.name)}</span>
        <div>
          <h3>{person.name}</h3>
          <p>{person.position}</p>
        </div>
        <span className={`pill pill-${person.status}`}>
          {STATUS_LABEL[person.status]}
        </span>
      </header>
      <dl>
        <div>
          <dt>Dept</dt>
          <dd>{person.department}</dd>
        </div>
        <div>
          <dt>Desk</dt>
          <dd>{person.location}</dd>
        </div>
        <div>
          <dt>Since</dt>
          <dd>{person.started}</dd>
        </div>
      </dl>
      <a className="mail" href={`mailto:${person.email}`}>
        {person.email}
      </a>
    </article>
  );
}

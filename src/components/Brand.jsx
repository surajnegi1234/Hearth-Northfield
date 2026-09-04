import { Link } from "react-router-dom";

export default function Brand({ to = "/" }) {
  return (
    <Link className="brand" to={to}>
      <span className="brand-mark" aria-hidden="true" />
      <span>
        <strong>Hearth</strong>
        <em>Northfield</em>
      </span>
    </Link>
  );
}

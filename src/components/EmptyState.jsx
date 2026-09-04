export default function EmptyState({ title, copy, children }) {
  return (
    <div className="empty">
      <span className="empty-mark" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{copy}</p>
      {children}
    </div>
  );
}

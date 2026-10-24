// items: [{ label, value, tone }] where tone is pending | forwarded | approved | rejected
export default function StatCards({ items }) {
  return (
    <div className="stats">
      {items.map((s) => (
        <div key={s.label} className={`stat ${s.tone ? "is-" + s.tone : ""}`}>
          <span className="stat-n">{s.value}</span>
          <span className="stat-l">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

const STEPS = ["Submitted", "Admin check", "Officer decision", "Decision letter"];

// Works out how far an application has got
export function trackerStates(status, rejectedBy) {
  if (status === "pending") return ["done", "active", "todo", "todo"];
  if (status === "forwarded") return ["done", "done", "active", "todo"];
  if (status === "approved") return ["done", "done", "done", "done"];
  if (status === "rejected" && rejectedBy === "admin") return ["done", "failed", "todo", "done"];
  if (status === "rejected") return ["done", "done", "failed", "done"];
  return ["todo", "todo", "todo", "todo"];
}

const NOTES = { active: "In progress", failed: "Rejected" };

export default function Tracker({ status, rejectedBy }) {
  const states = trackerStates(status, rejectedBy);
  return (
    <ol className="tracker" aria-label="Application progress">
      {STEPS.map((label, i) => (
        <li key={label} className={states[i]}>
          {label}
          {NOTES[states[i]] && <small>{NOTES[states[i]]}</small>}
        </li>
      ))}
    </ol>
  );
}

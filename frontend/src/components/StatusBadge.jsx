const LABELS = {
  pending: "Pending review",
  forwarded: "With government officer",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}

export const STATUS_LABELS = LABELS;

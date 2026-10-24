import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { fmtDateTime } from "../hooks.js";

export default function ApplicationList({ applications, basePath, showApplicant }) {
  if (!applications.length) return <p className="muted">Nothing here yet.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Service</th>
          {showApplicant && <th>Applicant</th>}
          <th>Status</th>
          <th>Updated</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {applications.map((a) => (
          <tr key={a.id}>
            <td>{a.ref}</td>
            <td>{a.serviceTitle}</td>
            {showApplicant && (
              <td>
                {a.applicantName}
                <div className="muted">{a.applicantPhone}</div>
              </td>
            )}
            <td>
              <StatusBadge status={a.status} />
            </td>
            <td className="muted nowrap">{fmtDateTime(a.updatedAt)}</td>
            <td>
              <Link to={`${basePath}/${a.id}`}>Open</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

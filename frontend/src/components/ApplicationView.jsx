import SecureImage from "./SecureImage.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { fmtDateTime } from "../hooks.js";

function isVisible(f, data) {
  return !f.showIf || data[f.showIf.field] === f.showIf.equals;
}

// Read only view of an application: details, documents, rejection reason and history
export default function ApplicationView({ application, service, showHistory = true }) {
  const data = application.data || {};

  return (
    <div>
      <div className="row between">
        <div>
          <h2 style={{ margin: 0 }}>{application.serviceTitle}</h2>
          <span className="muted">Reference {application.ref}</span>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {application.status === "rejected" && (
        <div className="box box-bad">
          <strong>Rejected by {application.rejectedBy === "officer" ? "the government officer" : "the admin"}</strong>
          <p>{application.rejectionReason}</p>
        </div>
      )}
      {application.status === "approved" && (
        <div className="box box-good">
          <strong>Approved.</strong> The officer will contact you on your phone number.
        </div>
      )}

      {service &&
        service.fields.map((f) => {
          if (!isVisible(f, data)) return null;
          const v = data[f.name];
          if (v === undefined || v === null || v === "") return null;
          return (
            <div key={f.name}>
              {f.section && <h3 className="section">{f.section}</h3>}
              <div className="detail">
                <span className="detail-label">{f.label}</span>
                <span className="detail-value">
                  {f.type === "file" ? <SecureImage fileId={v} alt={f.label} /> : String(v)}
                </span>
              </div>
            </div>
          );
        })}

      {showHistory && (
        <>
          <h3 className="section">History</h3>
          <table>
            <tbody>
              {[...(application.history || [])].reverse().map((h, i) => (
                <tr key={i}>
                  <td className="muted nowrap">{fmtDateTime(h.at)}</td>
                  <td>
                    <strong>{h.action}</strong> <span className="muted">by {h.actor}</span>
                    {h.note && <div>{h.note}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

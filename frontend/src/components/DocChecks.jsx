import SecureImage from "./SecureImage.jsx";

// One block per person: the stored record next to the photos the customer uploaded.
// With onToggle the admin ticks each block after checking it by eye. Without it the block is read only.
export default function DocChecks({ checks, application, confirmed = [], onToggle }) {
  if (!checks || checks.length === 0) return null;
  return (
    <div className="stack">
      {checks.map((c) => {
        const r = c.record;
        return (
          <div key={c.key} className={`docheck ${c.problem ? "docheck-bad" : ""}`}>
            <h3>{c.title}</h3>

            {c.problem && <div className="box box-bad">{c.problem}</div>}

            {r && (
              <div className="docheck-record">
                <div className="detail"><span className="detail-label">{c.person}</span><span className="detail-value">{r.fullName}</span></div>
                <div className="detail"><span className="detail-label">Citizenship no.</span><span className="detail-value">{r.citizenshipNumber}</span></div>
                <div className="detail"><span className="detail-label">Date of birth</span><span className="detail-value">{r.dob}</span></div>
                <div className="detail"><span className="detail-label">Issued in</span><span className="detail-value">{r.issueDistrict}</span></div>
                <div className="detail"><span className="detail-label">Father's name</span><span className="detail-value">{r.fatherName}</span></div>
                <div className="detail"><span className="detail-label">Mother's name</span><span className="detail-value">{r.motherName}</span></div>
                <div className="detail"><span className="detail-label">Address</span><span className="detail-value">{r.address}</span></div>
              </div>
            )}

            <div className="docheck-photos">
              {c.fields.length === 0 && <span className="muted">No photo uploaded.</span>}
              {c.fields.map((f) => (
                <SecureImage key={f} fileId={application.data[f]} alt={c.title} />
              ))}
            </div>

            {onToggle && r && !c.problem && (
              <label className="tick" htmlFor={`chk-${c.key}`}>
                <input id={`chk-${c.key}`} type="checkbox" checked={confirmed.includes(c.key)} onChange={() => onToggle(c.key)} />
                The photo matches this record
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Side by side: what the applicant wrote vs what the citizen record says
export default function RecordCompare({ match }) {
  if (!match || !match.record) {
    return <p className="box box-bad">No matching citizen record was found automatically.</p>;
  }
  const { record, rows, level, source } = match;
  return (
    <div>
      <p className={`box ${level === "full" ? "box-good" : "box-warn"}`}>
        {level === "full" ? "Everything matches the record." : "Some details do not match the record."}{" "}
        <span className="muted">({source === "manual" ? "chosen by admin" : "found automatically"})</span>
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Application</th>
            <th>Record</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={r.ok ? "row-ok" : "row-bad"}>
              <td>{r.label}</td>
              <td>{r.applicant || "-"}</td>
              <td>{r.record}</td>
              <td>{r.ok ? "OK" : "Different"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">
        Record: {record.citizenshipNumber}, issued in {record.issueDistrict}, address {record.address}
      </p>
    </div>
  );
}

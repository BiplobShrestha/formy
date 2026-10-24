import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useLoad } from "../hooks.js";
import DynamicForm from "../components/DynamicForm.jsx";

export default function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error, loading } = useLoad(() => api(`/api/applications/${id}`), [id]);

  async function submit(values) {
    await api(`/api/applications/${id}`, { method: "PUT", body: { data: values } });
    navigate(`/applications/${id}`);
  }

  return (
    <div className="page">
      <Link className="back" to={`/applications/${id}`}>Back to the application</Link>
      {loading && <p className="muted">Loading...</p>}
      {error && <div className="box box-bad">{error}</div>}
      {data && data.application.status !== "rejected" && <p>Only rejected applications can be edited.</p>}
      {data && data.application.status === "rejected" && (
        <>
          <div className="page-head">
            <h1>Edit and resubmit</h1>
          </div>
          <div className="box box-bad">
            <strong>Reason for rejection</strong>
            <p>{data.application.rejectionReason}</p>
          </div>
          <DynamicForm
            service={data.service}
            initial={data.application.data}
            submitLabel="Resubmit application"
            onSubmit={submit}
          />
        </>
      )}
    </div>
  );
}

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
      <p>
        <Link to={`/applications/${id}`}>Back</Link>
      </p>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && data.application.status !== "rejected" && <p>Only rejected applications can be edited.</p>}
      {data && data.application.status === "rejected" && (
        <>
          <h1>Edit and resubmit</h1>
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

import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLoad } from "../hooks.js";
import DynamicForm from "../components/DynamicForm.jsx";

export default function ApplyForm() {
  const { key } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, error, loading } = useLoad(() => api("/api/services"));

  const service = data && data.services.find((s) => s.key === key);

  async function submit(values) {
    const res = await api("/api/applications", { method: "POST", body: { service: key, data: values } });
    navigate(`/applications/${res.application.id}`);
  }

  return (
    <div className="page">
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && !service && <p>Service not found.</p>}
      {service && (
        <>
          <h1>{service.title}</h1>
          <p>{service.description} All fields are required unless marked otherwise.</p>
          <DynamicForm
            service={service}
            initial={{ fullName: user.name, phone: user.phone }}
            submitLabel="Submit application"
            onSubmit={submit}
          />
        </>
      )}
    </div>
  );
}

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Account from "./pages/Account.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import Forms from "./pages/Forms.jsx";
import ApplyForm from "./pages/ApplyForm.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import EditApplication from "./pages/EditApplication.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminReview from "./pages/AdminReview.jsx";
import AdminNotices from "./pages/AdminNotices.jsx";
import OfficerDashboard from "./pages/OfficerDashboard.jsx";
import OfficerReview from "./pages/OfficerReview.jsx";

const customer = (el) => <ProtectedRoute role="customer">{el}</ProtectedRoute>;
const admin = (el) => <ProtectedRoute role="admin">{el}</ProtectedRoute>;
const officer = (el) => <ProtectedRoute role="officer">{el}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

          <Route path="/dashboard" element={customer(<CustomerDashboard />)} />
          <Route path="/forms" element={customer(<Forms />)} />
          <Route path="/forms/:key" element={customer(<ApplyForm />)} />
          <Route path="/applications/:id" element={customer(<ApplicationDetail />)} />
          <Route path="/applications/:id/edit" element={customer(<EditApplication />)} />

          <Route path="/admin" element={admin(<AdminDashboard />)} />
          <Route path="/admin/applications/:id" element={admin(<AdminReview />)} />
          <Route path="/admin/notices" element={admin(<AdminNotices />)} />

          <Route path="/officer" element={officer(<OfficerDashboard />)} />
          <Route path="/officer/applications/:id" element={officer(<OfficerReview />)} />

          <Route path="*" element={<div className="page"><h1>Page not found</h1><p>Check the address, or go back to the home page.</p></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";

import DonorDashboard from "../pages/donor/DonorDashboard";
import NGODashboard from "../pages/ngo/NGODashboard";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import ProtectedRoute from "../components/common/ProtectedRoute";
import DeliveryTracking from "../pages/DeliveryTracking";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["donor"]}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ngo"]}>
            <NGODashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery/:id/track"
        element={
          <ProtectedRoute>
            <DeliveryTracking />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
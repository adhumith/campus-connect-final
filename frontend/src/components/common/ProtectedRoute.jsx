import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🏫</div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile && allowedRoles && !allowedRoles.includes(userProfile.role)) {
    if (userProfile.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (userProfile.role === "staff") return <Navigate to="/staff/dashboard" replace />;
    if (userProfile.role === "student") return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}
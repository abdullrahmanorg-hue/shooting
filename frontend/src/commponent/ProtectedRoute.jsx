import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children, adminOnly = false }) {
  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-dvh text-lg font-semibold">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

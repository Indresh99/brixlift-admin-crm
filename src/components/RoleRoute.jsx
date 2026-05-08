import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function RoleRoute({ roles, children }) {
  const { user } = useAuth();

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;

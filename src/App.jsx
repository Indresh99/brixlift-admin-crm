import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AuthPage from "./pages/AuthPage";
import { appRoutes } from "./routes";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {appRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<RoleRoute roles={route.roles}>{route.element}</RoleRoute>}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

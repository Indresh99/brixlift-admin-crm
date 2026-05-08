import { useMemo, useState } from "react";
import { authStorage, crmApi } from "../services/crmApi";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authStorage.getUser);
  const [token, setToken] = useState(authStorage.getToken);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      async login(payload) {
        const session = await crmApi.login(payload);
        authStorage.setSession(session);
        setToken(session.token);
        setUser(session.user);
      },
      async signup(payload) {
        const session = await crmApi.signup(payload);
        authStorage.setSession(session);
        setToken(session.token);
        setUser(session.user);
      },
      logout() {
        authStorage.clear();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

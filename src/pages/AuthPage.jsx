import LockRoundedIcon from "@mui/icons-material/LockRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import logoRef from "../assets/rect-full-logo.png";
import { emitToast } from "../toast/toastEvents";

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const { isAuthenticated, login, signup } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error.message ||
        (isSignup
          ? "Owner signup is available only before the first account exists."
          : "Invalid email or password.");
      setError(message);
      if (!error.toastShown) {
        emitToast(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f6f8fb", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box component="img" src={logoRef} alt="Brixlift" sx={{ width: 150 }} />
            <Box>
              <LockRoundedIcon color="primary" />
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                {isSignup ? "Create owner account" : "Sign in to Admin CRM"}
              </Typography>
            </Box>

            <Stack component="form" spacing={2} onSubmit={submit}>
              {isSignup && (
                <TextField label="Name" name="name" value={form.name} onChange={updateField} required fullWidth />
              )}
              <TextField label="Email" name="email" type="email" value={form.email} onChange={updateField} required fullWidth />
              <TextField label="Password" name="password" type="password" value={form.password} onChange={updateField} required fullWidth />
              {error && <Typography color="error">{error}</Typography>}
              <Button type="submit" variant="contained" disabled={submitting} sx={{ borderRadius: 2, textTransform: "none" }}>
                {isSignup ? "Sign up" : "Login"}
              </Button>
            </Stack>

            <Button
              component={RouterLink}
              to={isSignup ? "/login" : "/signup"}
              sx={{ alignSelf: "flex-start", textTransform: "none" }}
            >
              {isSignup ? "Already have an account? Login" : "Need an account? Sign up"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthPage;

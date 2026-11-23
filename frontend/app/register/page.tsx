"use client";

import { useState, type FormEvent } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { API_URL, setSession } from "@/lib/auth";

type FieldErrors = Partial<
  Record<"email_address" | "password" | "password_confirmation", string[]>
>;

const MIN_PASSWORD_LENGTH = 8;

async function postJson(path: string, body: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const mismatch =
    passwordConfirmation.length > 0 && password !== passwordConfirmation;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mismatch) return;

    setPending(true);
    setError(null);
    setFieldErrors({});

    try {
      const signup = await postJson("/users", {
        user: {
          email_address: email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });

      if (!signup.response.ok) {
        if (signup.data.errors) setFieldErrors(signup.data.errors);
        else setError(signup.data.error ?? "Registration failed.");
        return;
      }

      // Account created: sign in right away.
      const login = await postJson("/session", { email_address: email, password });
      if (login.response.ok && login.data.token) {
        setSession(login.data.token, email);
        router.replace("/");
        router.refresh();
        return;
      }

      router.replace("/login");
    } catch {
      setError("Cannot reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const fieldError = (key: keyof FieldErrors, label: string) =>
    fieldErrors[key]?.length ? `${label} ${fieldErrors[key]!.join(", ")}` : undefined;

  return (
    <Container maxWidth="xs" sx={{ display: "flex", flex: 1, alignItems: "center" }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Create account
        </Typography>
        <Box component="form" method="post" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            name="email_address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!fieldErrors.email_address}
            helperText={fieldError("email_address", "Email")}
            required
            fullWidth
            margin="normal"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!fieldErrors.password}
            helperText={
              fieldError("password", "Password") ??
              `At least ${MIN_PASSWORD_LENGTH} characters`
            }
            slotProps={{ htmlInput: { minLength: MIN_PASSWORD_LENGTH } }}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirm password"
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            error={mismatch || !!fieldErrors.password_confirmation}
            helperText={
              mismatch
                ? "Passwords do not match"
                : fieldError("password_confirmation", "Password confirmation")
            }
            required
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={pending || mismatch}
            sx={{ mt: 2 }}
          >
            {pending ? "Creating account…" : "Sign up"}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link component={NextLink} href="/login">
              Log in
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={error !== null}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

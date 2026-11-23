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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email_address: email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        setSession(data.token, email);
        router.replace("/");
        router.refresh();
        return;
      }

      setError(data.error ?? "Login failed.");
    } catch {
      setError("Cannot reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ display: "flex", flex: 1, alignItems: "center" }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Log in
        </Typography>
        <Box component="form" method="post" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            name="email_address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={pending}
            sx={{ mt: 2 }}
          >
            {pending ? "Logging in…" : "Login"}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            No account?{" "}
            <Link component={NextLink} href="/register">
              Sign up
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

"use client";

import { useState, Suspense } from "react";
import { authClient } from "../lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";

function LoginForm() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await authClient.signIn.email(
      { email, password, rememberMe },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => router.push(returnUrl || "/"),
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            setError(
              "Please verify your email address before signing in. Check your inbox for the verification link."
            );
          } else {
            setError(ctx.error.message || "An error occurred during login");
          }
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__logo">Nilexia</span>
          <span className="auth-brand__sub">FIT Campus Marketplace</span>
        </div>

        <h2 className="auth-card__title">Welcome back</h2>
        <p className="auth-card__sub">Sign in to your account</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@my.fit.edu"
            required
            autoComplete="email"
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <label className="form-checkbox-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link href="/forgot-password" style={{ fontSize: "13px" }}>
              Forgot password?
            </Link>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <Button type="submit" loading={loading} variant="primary" size="lg" style={{ width: "100%", marginTop: "4px" }}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-card">
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <span className="spinner spinner--lg" />
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

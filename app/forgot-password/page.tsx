"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__logo">Nilexia</span>
          <span className="auth-brand__sub">FIT Campus Marketplace</span>
        </div>

        <h2 className="auth-card__title">Reset your password</h2>
        <p className="auth-card__sub">
          {success
            ? "Check your inbox for next steps."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {success && (
          <Alert variant="success" className="mb-4">
            Password reset email sent! Check your inbox for instructions.
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@my.fit.edu"
            required
            disabled={loading || success}
            autoComplete="email"
          />

          {error && <Alert variant="error">{error}</Alert>}

          <Button
            type="submit"
            loading={loading}
            disabled={success}
            variant="primary"
            size="lg"
            style={{ width: "100%", marginTop: "4px" }}
          >
            {loading ? "Sending…" : success ? "Email Sent" : "Send Reset Link"}
          </Button>
        </form>

        <p className="auth-footer">
          Remember your password?{" "}
          <Link href="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

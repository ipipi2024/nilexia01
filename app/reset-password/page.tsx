"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "../lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";

function ResetPasswordForm() {
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [emailVerified, setEmailVerified]     = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token      = searchParams.get("token");
  const tokenError = searchParams.get("error");

  useEffect(() => {
    if (tokenError === "INVALID_TOKEN") {
      setError("This reset link is invalid or has expired. Please request a new one.");
    }
  }, [tokenError]);

  useEffect(() => {
    const verifyEmailViaResetLink = async () => {
      if (token && !tokenError) {
        try {
          const response = await fetch("/api/verify-via-reset-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await response.json();
          if (!response.ok) {
            console.error("Failed to verify email via reset link:", data.error);
          } else {
            console.log("Email verified via reset link:", data.message);
            setEmailVerified(true);
          }
        } catch (err) {
          console.error("Error verifying email via reset link:", err);
        }
      }
    };
    verifyEmailViaResetLink();
  }, [token, tokenError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await authClient.resetPassword({ newPassword, token });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !tokenError) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 className="auth-card__title">Invalid Reset Link</h2>
          <p style={{ color: "var(--c-gray-500)", fontSize: "14px", marginBottom: "20px" }}>
            This password reset link is invalid or missing.
          </p>
          <Link href="/forgot-password" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__logo">Nilexia</span>
          <span className="auth-brand__sub">FIT Campus Marketplace</span>
        </div>

        <h2 className="auth-card__title">Set new password</h2>
        <p className="auth-card__sub">Choose a strong password for your account.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
          {emailVerified && (
            <Alert variant="info">Your email has been verified.</Alert>
          )}
          {success && (
            <Alert variant="success">Password reset successful! Redirecting to login…</Alert>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading || success}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || success}
            placeholder="Re-enter your password"
            autoComplete="new-password"
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
            {loading ? "Resetting…" : success ? "Done!" : "Reset Password"}
          </Button>
        </form>

        {!success && (
          <p className="auth-footer">
            Remember your password?{" "}
            <Link href="/login">Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}

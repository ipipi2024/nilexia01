"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";

export default function SignUpPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const emailLower = email.toLowerCase();
    const isFloridaTechEmail =
      emailLower.endsWith("@fit.edu") || emailLower.endsWith("@my.fit.edu");

    if (!isFloridaTechEmail) {
      setError("Please use your Florida Tech email address (@fit.edu or @my.fit.edu)");
      setLoading(false);
      return;
    }

    await authClient.signUp.email(
      { name, email, password },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          setSuccess(
            "Account created! Please check your email to verify your account before signing in."
          );
          setLoading(false);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "An error occurred during sign up");
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

        <h2 className="auth-card__title">Create an account</h2>
        <p className="auth-card__sub">Exclusive to the Florida Tech community</p>

        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            autoComplete="name"
          />

          <Input
            id="email"
            label="Florida Tech Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="username@my.fit.edu"
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
            minLength={8}
            hint="Minimum 8 characters"
            autoComplete="new-password"
          />

          {error   && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {!success && (
            <Button type="submit" loading={loading} variant="primary" size="lg" style={{ width: "100%", marginTop: "4px" }}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          )}
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

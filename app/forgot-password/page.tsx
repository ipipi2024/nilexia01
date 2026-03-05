"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
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
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
            <h1 style={{ marginBottom: "20px" }}>Forgot Password</h1>

            {success ? (
                <div style={{
                    padding: "15px",
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    <p style={{ margin: 0 }}>
                        Password reset email sent! Check your inbox for instructions.
                    </p>
                </div>
            ) : (
                <p style={{ marginBottom: "20px", color: "#666" }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>

                {error && (
                    <div style={{
                        color: "#721c24",
                        padding: "10px",
                        backgroundColor: "#f8d7da",
                        borderRadius: "4px"
                    }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "10px",
                        backgroundColor: loading ? "#ccc" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <p style={{ marginTop: "20px", textAlign: "center" }}>
                Remember your password?{" "}
                <Link href="/login" style={{ color: "#007bff" }}>
                    Back to Login
                </Link>
            </p>
        </div>
    );
}

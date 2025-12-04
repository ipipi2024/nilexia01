"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "../lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const tokenError = searchParams.get("error");

    useEffect(() => {
        if (tokenError === "INVALID_TOKEN") {
            setError("This reset link is invalid or has expired. Please request a new one.");
        }
    }, [tokenError]);

    // MODEL 1: Email Verified on Reset Link Click
    // When the user clicks the reset link, we verify their email immediately
    // This is logically consistent because clicking the link proves inbox ownership
    useEffect(() => {
        const verifyEmailViaResetLink = async () => {
            if (token && !tokenError) {
                try {
                    const response = await fetch("/api/verify-via-reset-link", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        console.error("Failed to verify email via reset link:", data.error);
                    } else {
                        console.log("Email verified via reset link:", data.message);
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

        // Validate token exists
        if (!token) {
            setError("Invalid reset link. Please request a new password reset.");
            return;
        }

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Validate password strength (optional)
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        try {
            await authClient.resetPassword({
                newPassword,
                token,
            });

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token && !tokenError) {
        return (
            <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
                <h1 style={{ marginBottom: "20px" }}>Invalid Reset Link</h1>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                    This password reset link is invalid or missing.
                </p>
                <Link href="/forgot-password" style={{ color: "#007bff" }}>
                    Request a new reset link
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
            <h1 style={{ marginBottom: "20px" }}>Reset Password</h1>

            {success ? (
                <div style={{
                    padding: "15px",
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    <p style={{ margin: 0, marginBottom: "10px" }}>
                        Password reset successful! Redirecting to login...
                    </p>
                </div>
            ) : (
                <p style={{ marginBottom: "20px", color: "#666" }}>
                    Enter your new password below.
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label htmlFor="newPassword" style={{ display: "block", marginBottom: "5px" }}>
                        New Password
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading || success}
                        placeholder="At least 8 characters"
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "5px" }}>
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading || success}
                        placeholder="Re-enter your password"
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
                    disabled={loading || success}
                    style={{
                        padding: "10px",
                        backgroundColor: loading || success ? "#ccc" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading || success ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Resetting..." : success ? "Success!" : "Reset Password"}
                </button>
            </form>

            {!success && (
                <p style={{ marginTop: "20px", textAlign: "center" }}>
                    Remember your password?{" "}
                    <Link href="/login" style={{ color: "#007bff" }}>
                        Back to Login
                    </Link>
                </p>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
                <h1 style={{ marginBottom: "20px" }}>Reset Password</h1>
                <p style={{ color: "#666" }}>Loading...</p>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

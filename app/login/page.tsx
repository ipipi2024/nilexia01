"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "../lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        await authClient.signIn.email(
            {
                email,
                password,
                rememberMe,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    // Redirect to returnUrl if provided, otherwise go to homepage
                    router.push(returnUrl || "/");
                },
                onError: (ctx) => {
                    // Handle email verification errors specifically
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
        <div style={{ maxWidth: "400px", margin: "20px auto", padding: "15px" }}>
            <h1 style={{ marginBottom: "20px", fontSize: "clamp(24px, 5vw, 32px)" }}>Login</h1>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div>
                    <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            id="rememberMe"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="rememberMe">Remember me</label>
                    </div>
                    <a href="/forgot-password" style={{ color: "#007bff", fontSize: "14px" }}>
                        Forgot password?
                    </a>
                </div>
                {error && (
                    <div style={{ color: "red", padding: "10px", backgroundColor: "#fee", borderRadius: "4px" }}>
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
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p style={{ marginTop: "20px", textAlign: "center" }}>
                Don't have an account?{" "}
                <a href="/signup" style={{ color: "#007bff" }}>
                    Sign up
                </a>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
                <p>Loading...</p>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

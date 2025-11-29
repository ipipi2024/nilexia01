"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        await authClient.signUp.email(
            {
                name,
                email,
                password,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    setSuccess(
                        "Account created! Please check your email to verify your account before signing in."
                    );
                    setLoading(false);
                    // Don't redirect to dashboard - user needs to verify email first
                },
                onError: (ctx) => {
                    setError(ctx.error.message || "An error occurred during sign up");
                    setLoading(false);
                },
            }
        );
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
            <h1 style={{ marginBottom: "20px" }}>Sign Up</h1>
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label htmlFor="name" style={{ display: "block", marginBottom: "5px" }}>
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        minLength={8}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                    <small style={{ color: "#666" }}>Minimum 8 characters</small>
                </div>
                {error && (
                    <div style={{ color: "red", padding: "10px", backgroundColor: "#fee", borderRadius: "4px" }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ color: "green", padding: "10px", backgroundColor: "#efe", borderRadius: "4px" }}>
                        {success}
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
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
            <p style={{ marginTop: "20px", textAlign: "center" }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: "#007bff" }}>
                    Log in
                </a>
            </p>
        </div>
    );
}

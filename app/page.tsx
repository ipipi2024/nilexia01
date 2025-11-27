"use client";

import { useSession } from "./lib/auth-client";

export default function Page() {
    const { data: session, isPending } = useSession();

    return (
        <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
            <h1 style={{ marginBottom: "20px" }}>Hello, Next.js! I am Ipule Pipi</h1>

            {isPending ? (
                <p>Loading...</p>
            ) : session ? (
                <div>
                    <p style={{ marginBottom: "20px" }}>Welcome back, {session.user.name}!</p>
                    <a
                        href="/dashboard"
                        style={{
                            display: "inline-block",
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                        }}
                    >
                        Go to Dashboard
                    </a>
                </div>
            ) : (
                <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                    <a
                        href="/login"
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                        }}
                    >
                        Login
                    </a>
                    <a
                        href="/signup"
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#28a745",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                        }}
                    >
                        Sign Up
                    </a>
                </div>
            )}

            <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h2 style={{ marginBottom: "15px" }}>Authentication Features</h2>
                <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
                    <li>Email and Password Authentication</li>
                    <li>Secure Session Management (7-day expiry)</li>
                    <li>MongoDB Database Storage</li>
                    <li>Automatic Session Cleanup with TTL Indexing</li>
                    <li>Protected Dashboard Route</li>
                </ul>
            </div>
        </div>
    );
}
"use client";

import { useSession } from "../lib/auth-client";
import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { data: session, isPending, error } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });
    };

    if (isPending) {
        return (
            <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
                <h1>Access Denied</h1>
                <p>You need to be logged in to access this page.</p>
                <a href="/login" style={{ color: "#007bff" }}>
                    Go to Login
                </a>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h1>Dashboard</h1>
                <button
                    onClick={handleSignOut}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Sign Out
                </button>
            </div>

            <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                <h2 style={{ marginBottom: "15px" }}>Welcome, {session.user.name}!</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p>
                        <strong>Email:</strong> {session.user.email}
                    </p>
                    <p>
                        <strong>User ID:</strong> {session.user.id}
                    </p>
                    {session.user.image && (
                        <p>
                            <strong>Profile Image:</strong> <img src={session.user.image} alt="Profile" style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
                        </p>
                    )}
                </div>
            </div>

            <div style={{ backgroundColor: "#e9ecef", padding: "20px", borderRadius: "8px" }}>
                <h3 style={{ marginBottom: "15px" }}>Session Information</h3>
                <pre style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "4px", overflow: "auto" }}>
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
        </div>
    );
}

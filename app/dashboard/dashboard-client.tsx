"use client";

import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";

type Session = {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    session: {
        expiresAt: Date;
        createdAt: Date;
        id: string;
        userId: string;
    };
};

type DashboardClientProps = {
    initialSession: Session;
};

export default function DashboardClient({ initialSession }: DashboardClientProps) {
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
                <h2 style={{ marginBottom: "15px" }}>Welcome, {initialSession.user.name}!</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p>
                        <strong>Email:</strong> {initialSession.user.email}
                    </p>
                    <p>
                        <strong>User ID:</strong> {initialSession.user.id}
                    </p>
                    {initialSession.user.image && (
                        <p>
                            <strong>Profile Image:</strong>{" "}
                            <img
                                src={initialSession.user.image}
                                alt="Profile"
                                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                            />
                        </p>
                    )}
                </div>
            </div>

            <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "15px" }}>Quick Links</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <a
                        href="/listings"
                        style={{
                            padding: "12px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            textAlign: "center",
                        }}
                    >
                        Browse Campus Marketplace
                    </a>
                    <a
                        href="/listings/create"
                        style={{
                            padding: "12px 20px",
                            backgroundColor: "#28a745",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            textAlign: "center",
                        }}
                    >
                        Create New Listing
                    </a>
                    <a
                        href="/listings/my-listings"
                        style={{
                            padding: "12px 20px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            textAlign: "center",
                        }}
                    >
                        My Listings
                    </a>
                </div>
            </div>

            <div style={{ backgroundColor: "#e9ecef", padding: "20px", borderRadius: "8px" }}>
                <h3 style={{ marginBottom: "15px" }}>Session Information</h3>
                <pre style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "4px", overflow: "auto" }}>
                    {JSON.stringify(initialSession, null, 2)}
                </pre>
            </div>
        </div>
    );
}

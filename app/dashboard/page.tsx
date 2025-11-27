import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
    // Server-side session validation (CRITICAL for security)
    // This runs on the server BEFORE any data is fetched or rendered
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Defense-in-depth: Even though middleware checks this,
    // we validate again to protect against middleware failures
    if (!session) {
        redirect("/login");
    }

    // At this point, we have a validated session
    // Safe to fetch any server-side data here if needed
    // Example: const userData = await db.collection("users").findOne({ id: session.user.id });

    // Pass validated session to client component
    return <DashboardClient initialSession={session} />;
}

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000" // Optional: only needed if auth server is on different domain 
});

export const { signIn, signUp, signOut, useSession } = authClient;

import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Server-side helper to get the current authenticated user's session.
 * Usage: const session = await getAuthSession();
 */
export async function getAuthSession() {
    return await getServerSession(await getAuthOptions());
}

/**
 * Server-side helper to enforce role-based access.
 */
export async function enforceRole(requiredRole: "USER" | "ADMIN") {
    const session = await getAuthSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userRole = (session.user as any).role;
    if (requiredRole === "ADMIN" && userRole !== "ADMIN") {
        throw new Error("Forbidden: Insufficient privileges");
    }

    return session.user;
}

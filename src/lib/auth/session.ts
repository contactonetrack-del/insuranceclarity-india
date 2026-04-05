import { auth } from "@/auth";

/**
 * Server-side helper to get the current authenticated user's session.
 * Updated for Auth.js v5.
 * 
 * Usage: const session = await getAuthSession();
 */
export async function getAuthSession() {
    return await auth();
}

/**
 * Server-side helper to enforce role-based access.
 */
export async function enforceRole(requiredRole: "USER" | "ADMIN" | "CUSTOMER") {
    const session = await getAuthSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userRole = session.user.role;
    if (requiredRole === "ADMIN" && userRole !== "ADMIN") {
        throw new Error("Forbidden: Insufficient privileges");
    }

    return session.user;
}

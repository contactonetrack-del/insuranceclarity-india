import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // Lazy imports to prevent Turbopack Edge runtime from evaluating
    // Prisma and NextAuth at build time (both are Node.js-only)
    const { getServerSession } = await import("next-auth/next");
    const { getAuthOptions } = await import("@/app/api/auth/[...nextauth]/route");
    const { prisma } = await import("@/lib/prisma");

    const session = await getServerSession(await getAuthOptions());

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, inputData, result } = await req.json();

        if (!type || !inputData || !result) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const calculation = await (prisma as typeof prisma & { userCalculation: { create: (args: unknown) => Promise<unknown> } }).userCalculation.create({
            data: {
                userId: (session.user as { id?: string }).id || session.user?.email || "unknown",
                type,
                inputData,
                result
            }
        });

        return NextResponse.json(calculation);

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Save Calculation Error:", error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

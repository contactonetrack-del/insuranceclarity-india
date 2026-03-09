import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "All";

    try {
        // Lazy import to prevent Turbopack module-graph evaluation at build time
        const { prisma } = await import("@/lib/prisma");

        const where: any = {};

        if (category !== "All") {
            where.category = category;
        }

        if (q) {
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { issue: { contains: q, mode: "insensitive" } },
                { details: { contains: q, mode: "insensitive" } },
                { lesson: { contains: q, mode: "insensitive" } }
            ];
        }

        const cases = await prisma.claimCase.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 20
        });

        return NextResponse.json(cases);
    } catch (error: any) {
        console.error("Claim Search Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

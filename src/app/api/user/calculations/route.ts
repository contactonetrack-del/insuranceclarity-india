import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUserCalculation } from "@/services/calculation.service";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, inputData, result } = await req.json();

        if (!type || !inputData || !result) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // The Prisma schema uses 'Calculation' model, linked to User
        const calculation = await createUserCalculation({
            userId: session.user?.id || "unknown",
            type,
            inputData,
            result,
        });

        return NextResponse.json(calculation);

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Save Calculation Error:", error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

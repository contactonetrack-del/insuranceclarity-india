import { NextResponse } from "next/server";
import { auth } from '@/auth';


export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            user: session.user,
            message: "You have accessed a protected route.",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

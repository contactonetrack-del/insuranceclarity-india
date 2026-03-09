import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { openai } from "@/lib/openai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const [{ getAuthOptions }, pdfParseModule, { prisma }] = await Promise.all([
        import("@/app/api/auth/[...nextauth]/route"),
        import("pdf-parse"),
        import("@/lib/prisma"),
    ]);
    const pdf = (pdfParseModule as any).default || pdfParseModule;
    const session = await getServerSession(await getAuthOptions());

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Invalid file type. Only PDF files are allowed." }, { status: 400 });
        }

        // 1. Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 2. Extract Text from PDF
        const extractor = typeof pdf === 'function' ? pdf : (pdf as any).default;
        const data = await extractor(buffer);
        const text = data.text;

        if (!text || text.length < 100) {
            return NextResponse.json({ error: "Could not extract sufficient text from PDF" }, { status: 400 });
        }

        // 3. Send to OpenAI for Analysis
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert Insurance Underwriter and Policy Auditor. 
          Analyze the text and provide a structured JSON:
          {
            "policyName": "Name",
            "overallScore": 0-100,
            "redFlags": [{ "item": "Title", "severity": "High|Medium|Low", "description": "Text" }],
            "waitingPeriods": [{ "type": "Text", "duration": "Text", "details": "Text" }],
            "underwriterVerdict": "Advice"
          }`
                },
                {
                    role: "user",
                    content: text.slice(0, 15000)
                }
            ],
            response_format: { type: "json_object" }
        } as any);

        const analysis = JSON.parse(response.choices[0].message.content || "{}");

        // 4. Save to Database
        await (prisma as any).policyScan.create({
            data: {
                userId: (session.user as any).id || session.user?.email || "unknown",
                policyName: analysis.policyName || "Unknown Policy",
                overallScore: analysis.overallScore || 0,
                redFlags: analysis.redFlags || [],
                waitingPeriods: analysis.waitingPeriods || [],
                verdict: analysis.underwriterVerdict || ""
            }
        });

        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error("AI Scan Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

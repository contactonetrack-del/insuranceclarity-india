import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const leadSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be valid"),
    insuranceType: z.string().min(2, "Insurance type is required"),
    sourceUrl: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = leadSchema.parse(body);

        // Save to Database
        const lead = await prisma.lead.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
                insuranceType: validatedData.insuranceType,
                source: validatedData.sourceUrl || "ORGANIC",
                status: "NEW"
            }
        });

        logger.info({ action: 'createLead', status: 'success', leadId: lead.id, type: lead.insuranceType });

        return NextResponse.json({
            success: true,
            message: "Lead successfully recorded",
            leadId: lead.id
        }, { status: 201 });

    } catch (error) {
        logger.error({ action: 'createLead', status: 'failed', error });

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: "Validation Error",
                errors: error.flatten().fieldErrors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}

import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Lazy import to prevent Turbopack from evaluating Prisma connection at build time
        const { prisma } = await import("@/lib/prisma");

        const categories = await (prisma as any).insuranceCategory.findMany({
            include: {
                subcat: {
                    include: {
                        types: {
                            include: {
                                relatedTo: true,
                                relatedFrom: true
                            }
                        }
                    }
                }
            }
        });

        // Shape the data for the knowledge graph
        const knowledgeGraph = categories.map((cat: any) => ({
            id: cat.id,
            category: cat.name,
            slug: cat.slug,
            subcategories: cat.subcat.map((sub: any) => ({
                id: sub.id,
                name: sub.name,
                products: sub.types.map((type: any) => ({
                    id: type.id,
                    name: type.name,
                    links_to: type.relatedTo.map((rel: any) => ({
                        typeId: rel.toId,
                        relation: rel.relationType
                    })),
                    links_from: type.relatedFrom.map((rel: any) => ({
                        typeId: rel.fromId,
                        relation: rel.relationType
                    }))
                }))
            }))
        }));

        return NextResponse.json(
            { success: true, graph: knowledgeGraph },
            { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
        );

    } catch (error: any) {
        console.error("Knowledge Graph Fetch Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to retrieve the global taxonomy." },
            { status: 500 }
        );
    }
}

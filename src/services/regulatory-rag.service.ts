import { IRDAI_RULE_CHUNKS } from '@/data/irdai-rules';

function tokenize(value: string): string[] {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length >= 3);
}

export interface RegulatoryContext {
    title: string;
    content: string;
    source: string;
}

export function retrieveRegulatoryContext(query: string, limit = 3): RegulatoryContext[] {
    const queryTokens = new Set(tokenize(query));
    if (queryTokens.size === 0) return [];

    const scored = IRDAI_RULE_CHUNKS.map((chunk) => {
        const keywordTokens = tokenize(chunk.keywords.join(' '));
        const contentTokens = tokenize(chunk.content);
        let score = 0;

        for (const token of queryTokens) {
            if (keywordTokens.includes(token)) score += 3;
            if (contentTokens.includes(token)) score += 1;
        }

        return { chunk, score };
    })
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((row) => ({
            title: row.chunk.title,
            content: row.chunk.content,
            source: row.chunk.source,
        }));

    return scored;
}

export function formatRegulatoryContext(context: RegulatoryContext[]): string {
    if (context.length === 0) return '';

    const lines: string[] = ['Regulatory context (IRDAI-grounded references):'];
    for (const item of context) {
        lines.push(`- ${item.title}: ${item.content} [Source: ${item.source}]`);
    }
    return lines.join('\n');
}

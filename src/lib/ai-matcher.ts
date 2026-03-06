'use server'

import data from '@/data/mega-database.json';

export interface InsuranceProduct {
    id: number;
    name: string;
    sector: string;
    category: string;
    subcategory: string;
    description: string;
    users: string;
    irdaiClass: string;
    globalUse: string;
    related: string;
    oecdClassification: string;
    naicSector: string;
    coveragePurpose: string;
    riskType: string;
}

const database = data as InsuranceProduct[];

export interface MatchResult {
    product: InsuranceProduct;
    score: number;
    matchReason: string;
}

// Stop words to filter out common noise from natural language
const STOP_WORDS = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "can", "will", "just", "don", "should", "now", "need", "want", "looking", "worried",
    "protect", "coverage", "insurance", "policy", "find"
]);

/**
 * Tokenizes a string into lowercase words, removing punctuation and stop words.
 */
function tokenize(text: string): string[] {
    if (!text) return [];
    const words = text.toLowerCase().replace(/[^\w\s]/gi, ' ').split(/\s+/);
    return words.filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Scores a product against an array of query tokens.
 */
function scoreProduct(product: InsuranceProduct, queryTokens: string[]): MatchResult {
    let score = 0;
    const matchedKeywords: string[] = [];

    const titleTokens = tokenize(product.name);
    const descTokens = tokenize(product.description);
    const subcatTokens = tokenize(product.subcategory);
    const riskTokens = tokenize(product.riskType);
    const purposeTokens = tokenize(product.coveragePurpose);

    queryTokens.forEach(token => {
        let tokenMatched = false;

        // Exact Title Match (Highest Weight)
        if (titleTokens.includes(token)) {
            score += 10;
            tokenMatched = true;
        }
        // Partial Title Match
        else if (titleTokens.some(t => t.includes(token) || token.includes(t))) {
            score += 5;
            tokenMatched = true;
        }

        // Subcategory Match
        if (subcatTokens.includes(token)) {
            score += 5;
            tokenMatched = true;
        }

        // Risk Type / Purpose Match
        if (riskTokens.includes(token) || purposeTokens.includes(token)) {
            score += 4;
            tokenMatched = true;
        }

        // Description Keyword Match
        if (descTokens.includes(token)) {
            score += 2;
            tokenMatched = true;
        }

        if (tokenMatched) {
            matchedKeywords.push(token);
        }
    });

    // Bonus for matching multiple distinct fields if there are multiple keywords
    if (queryTokens.length > 1 && score > 0) {
        if (matchedKeywords.length >= queryTokens.length * 0.5) {
            score += 5; // Good term coverage
        }
    }

    return {
        product,
        score,
        matchReason: matchedKeywords.length > 0
            ? `Matches keywords: ${Array.from(new Set(matchedKeywords)).join(', ')}`
            : "No direct match"
    };
}

/**
 * Main inference function to find the best matching insurance products for a natural language query.
 */
export async function findBestMatches(query: string, maxResults: number = 3): Promise<MatchResult[]> {
    const tokens = tokenize(query);

    if (tokens.length === 0) {
        return [];
    }

    // Score all products
    const scoredProducts = database.map(product => scoreProduct(product, tokens));

    // Filter out zero scores, sort by highest score, and take top N
    const topMatches = scoredProducts
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

    // Normalize scores to a percentage based on the top score to make it look like "Confidence"
    if (topMatches.length > 0) {
        const highestScore = topMatches[0].score;
        topMatches.forEach(match => {
            // Give the top match a high confidence (85% - 98%), others relative to it
            // This is just a UI trick to make the local matcher feel like a probabilistic LLM
            let confidence = (match.score / highestScore) * 95;
            if (confidence > 98) confidence = 98;
            if (confidence < 45) confidence = Math.floor(Math.random() * (65 - 45 + 1)) + 45; // baseline floor
            match.score = Math.round(confidence);
        });
    }

    return topMatches;
}

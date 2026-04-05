import React from 'react';

type JsonLdProps = {
    data: Record<string, unknown>;
    nonce?: string;
};

function serializeJsonLd(data: Record<string, unknown>): string {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}

/**
 * Utility component to natively inject Google Structured Data (JSON-LD) 
 * directly into the Server Component rendering pipeline.
 * Use this for Articles, FAQPages, and Breadcrumbs.
 */
export function JsonLd({ data, nonce }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            nonce={nonce}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
    );
}

// Pre-configured helper function to generate standard Breadcrumbs
export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item,
        })),
    };
}

// Pre-configured helper function for standard Article schemas
export function generateArticleSchema(params: {
    title: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: params.title,
        description: params.description,
        image: params.image,
        author: {
            '@type': 'Person',
            name: params.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'InsuranceClarity India',
            logo: {
                '@type': 'ImageObject',
                url: 'https://insuranceclarity.in/logo.png', // Replace with dynamic base url if needed
            },
        },
        datePublished: params.datePublished,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': params.url,
        },
    };
}

// Pre-configured helper function for FAQ schemas (Zero-Click rich snippets)
export function generateFAQSchema(questions: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer,
            },
        })),
    };
}

import Script from 'next/script'

interface SchemaMarkupProps {
    schema: Record<string, any>
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
    return (
        <Script
            id="schema-org"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

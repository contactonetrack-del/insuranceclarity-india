// inject-metadata.js
import fs from "fs";
import path from "path";

const targetDir = path.join(__dirname, 'src', 'app', 'insurance');

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory());
}

const folders = getDirectories(targetDir);
let count = 0;

for (const folder of folders) {
    const pagePath = path.join(targetDir, folder, 'page.tsx');
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');

        // Skip if metadata already exists
        if (!content.includes('export const generateMetadata')) {
            const formattedTitle = folder.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            const metadataInjection = `
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const slug = '${folder}'
    return {
        title: \`${formattedTitle} Insurance in India | Compare & Review\`,
        description: \`Deep dive into ${formattedTitle} insurance. Compare policies, learn about hidden coverages, and calculate your exact premium in India.\`,
        alternates: {
            languages: {
                'en-IN': \`/insurance/\${slug}\`,
            },
        },
        openGraph: {
            title: \`${formattedTitle} Insurance Guide | InsuranceClarity\`,
            description: \`Everything you need to know about ${formattedTitle} insurance policies in India.\`,
            url: \`https://insuranceclarity.in/insurance/\${slug}\`,
            images: [
                {
                    url: \`https://insuranceclarity.in/api/og?title=\${encodeURIComponent('${formattedTitle} Insurance')}\`,
                    width: 1200,
                    height: 630,
                    alt: '${formattedTitle} Insurance',
                },
            ],
            type: 'website',
            siteName: 'InsuranceClarity India',
        },
    }
}
`;

            // Insert it after the 'use client' directive if present, or at top
            if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
                // Can't export metadata from a 'use client' file directly, so we need to create a layout.tsx instead
                const layoutPath = path.join(targetDir, folder, 'layout.tsx');
                if (!fs.existsSync(layoutPath)) {
                    const layoutContent = `${metadataInjection}

export default function ${formattedTitle.replace(/\s/g, '')}Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
`;
                    fs.writeFileSync(layoutPath, layoutContent);
                    console.log(`Created layout.tsx for ${folder}`);
                    count++;
                }
            } else {
                content = metadataInjection + '\n' + content;
                fs.writeFileSync(pagePath, content);
                console.log(`Updated page.tsx for ${folder}`);
                count++;
            }
        }
    }
}

console.log(`Successfully injected metadata into ${count} insurance pages.`);

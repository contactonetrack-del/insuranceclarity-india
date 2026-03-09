import fs from "fs";
import path from "path";

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const SKIP_PATHS = [
    'src/components/premium/buttons/magic-button.tsx',
    'src/components/premium/buttons/magic-button.test.tsx',
    'src/components/ui/Button.tsx',
];

walkDir(directoryPath, function (filePath) {
    const normPath = filePath.replace(/\\/g, '/');
    if (SKIP_PATHS.some(skip => normPath.endsWith(skip))) return;

    if (normPath.endsWith('.tsx') || normPath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let hasChanges = false;

        if (content.includes('MagicButton') || content.includes('GlowButton')) {
            // Special case for premium barrel export
            if (normPath.endsWith('src/components/premium/index.ts')) {
                content = content.replace(/export\s*\{\s*MagicButton\s*,\s*GlowButton\s*\}\s*from\s+['"]\.\/buttons\/magic-button['"]\s*\n?/g, '');
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`Updated ${filePath}`);
                return;
            }

            // Replace imports safely
            // Matches: import { MagicButton, SomeOtherThing } from '@/components/premium'
            const importRegex = /import\s+\{([^}]*)\}\s+from\s+['"]@\/components\/premium(?:\/buttons\/magic-button)?['"]/g;

            let newContent = content.replace(importRegex, (match, p1) => {
                if (p1.includes('MagicButton') || p1.includes('GlowButton')) {
                    let newImports = p1.replace(/MagicButton/g, '').replace(/GlowButton/g, '').replace(/,\s*,/g, ',').trim();
                    newImports = newImports.replace(/^,\s*/, '').replace(/,\s*$/, '').trim();

                    if (newImports.length > 0) {
                        return `import { ${newImports} } from '@/components/premium'\nimport { Button } from '@/components/ui/Button'`;
                    } else {
                        return `import { Button } from '@/components/ui/Button'`;
                    }
                }
                return match; // Unchanged
            });

            // If the file didn't use destructuring from premium and just had MagicButton imported, and it wasn't caught
            // (This should be caught by above, but let's be safe)

            // Replace strict JSX tags
            newContent = newContent.replace(/<MagicButton/g, '<Button');
            newContent = newContent.replace(/<\/MagicButton>/g, '</Button>');
            newContent = newContent.replace(/<GlowButton/g, '<Button glow'); // special case mapping intensity to glow prop
            newContent = newContent.replace(/<\/GlowButton>/g, '</Button>');

            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf-8');
                console.log(`Updated ${filePath}`);
            }
        }
    }
});

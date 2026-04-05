import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const srcDir = path.join(process.cwd(), 'src');

function walk(dir: string, callback: (file: string) => void) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

console.log('🚀 Starting Auth.js v5 Bulk Migration...');

walk(srcDir, (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  if (filePath.includes('auth.ts')) return; // Skip the config itself
  if (filePath.includes('nextauth')) return; // Skip the route itself (already handled)

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Replace imports
  // From: import { getServerSession } from 'next-auth' OR 'next-auth/next'
  // To: import { auth } from '@/auth'
  const importRegex = /import\s+\{\s*getServerSession\s*\}\s+from\s+['"]next-auth(\/next)?['"];?/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, "import { auth } from '@/auth';");
    modified = true;
  }

  // 2. Remove authOptions imports
  const optionsRegex = /import\s+\{\s*authOptions\s*\}\s+from\s+['"].*nextauth.*['"];?/g;
  if (optionsRegex.test(content)) {
    content = content.replace(optionsRegex, '');
    modified = true;
  }

  // 3. Replace calls
  // From: await getServerSession(authOptions)
  // To: await auth()
  const callRegex = /await\s+getServerSession\s*\(\s*authOptions\s*\)/g;
  if (callRegex.test(content)) {
    content = content.replace(callRegex, 'await auth()');
    modified = true;
  }

  if (modified) {
    console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('🏁 Bulk Migration Complete.');

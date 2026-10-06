import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('--- ARCHITECTURE BOUNDARY CHECK ---');

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        scanDir(fullPath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Check 1: Web application must NOT import database or backend services directly
const webFiles = scanDir(path.join(root, 'apps/web/src'));
const forbiddenWebImports = ['@prisma/client', 'prisma', 'bcryptjs', '@nestjs', '../api'];

for (const file of webFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const forbidden of forbiddenWebImports) {
    if (content.includes(`'${forbidden}`) || content.includes(`"${forbidden}`)) {
      console.error(`FAIL: Architecture violation in ${path.relative(root, file)}: direct import of ${forbidden}`);
      process.exit(1);
    }
  }
}

// Check 2: Shared package must not depend on apps
const sharedFiles = scanDir(path.join(root, 'packages/shared/src'));
for (const file of sharedFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@wms/api') || content.includes('@wms/web')) {
    console.error(`FAIL: Architecture violation: packages/shared depends on app layer`);
    process.exit(1);
  }
}

console.log('PASS: All architectural boundaries and dependency directions respected.');
process.exit(0);

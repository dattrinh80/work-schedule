import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('--- SECURITY AUDIT CHECK ---');

function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        scanDir(fullPath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allSourceFiles = [
  ...scanDir(path.join(root, 'apps/api/src')),
  ...scanDir(path.join(root, 'apps/web/src')),
  ...scanDir(path.join(root, 'packages/shared/src')),
];

const suspiciousPatterns = [
  /-----BEGIN PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[0-9a-zA-Z]{36}/,
];

for (const file of allSourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pat of suspiciousPatterns) {
    if (pat.test(content)) {
      console.error(`FAIL: Potential hardcoded secret in ${path.relative(root, file)}`);
      process.exit(1);
    }
  }
}

// Check that User model never exposes passwordHash
const sharedModel = fs.readFileSync(path.join(root, 'packages/shared/src/types/models.ts'), 'utf8');
if (sharedModel.includes('passwordHash:')) {
  console.error('FAIL: User interface in packages/shared must not expose passwordHash');
  process.exit(1);
}

console.log('PASS: No secrets detected, credential protections and DTO sanitization confirmed.');
process.exit(0);

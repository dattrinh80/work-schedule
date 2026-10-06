import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('--- CONTRACT VALIDATION CHECK ---');

// 1. Verify Shared Contracts Exist
const sharedTypesPath = path.join(root, 'packages/shared/src/index.ts');
if (!fs.existsSync(sharedTypesPath)) {
  console.error('FAIL: Missing shared contract index');
  process.exit(1);
}

const sharedContent = fs.readFileSync(sharedTypesPath, 'utf8');
const expectedExports = ['enums', 'models', 'auth.contract', 'task.contract'];

for (const exp of expectedExports) {
  if (!sharedContent.includes(exp)) {
    console.error(`FAIL: packages/shared does not export ${exp}`);
    process.exit(1);
  }
}

// 2. Verify API Controller implements required contract routes
const tasksControllerPath = path.join(root, 'apps/api/src/tasks/tasks.controller.ts');
const authControllerPath = path.join(root, 'apps/api/src/auth/auth.controller.ts');

const tasksController = fs.readFileSync(tasksControllerPath, 'utf8');
const authController = fs.readFileSync(authControllerPath, 'utf8');

const requiredRoutes = [
  { file: 'AuthController', content: authController, routes: ["@Post('login')", "@Get('me')"] },
  { file: 'TasksController', content: tasksController, routes: ['@Post()', '@Get()', "@Get(':id')", "@Patch(':id/status')"] },
];

for (const check of requiredRoutes) {
  for (const r of check.routes) {
    if (!check.content.includes(r)) {
      console.error(`FAIL: ${check.file} missing required contract route: ${r}`);
      process.exit(1);
    }
  }
}

console.log('PASS: All API and shared contracts are fully verified and aligned.');
process.exit(0);

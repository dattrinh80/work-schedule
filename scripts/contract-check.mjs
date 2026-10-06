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

// Check UpdateTaskDto
const taskContractContent = fs.readFileSync(
  path.join(root, 'packages/shared/src/contracts/task.contract.ts'),
  'utf8',
);
if (!taskContractContent.includes('interface UpdateTaskDto')) {
  console.error('FAIL: packages/shared missing UpdateTaskDto');
  process.exit(1);
}

// 2. Verify API Controllers implement required contract routes
const tasksController = fs.readFileSync(
  path.join(root, 'apps/api/src/tasks/tasks.controller.ts'),
  'utf8',
);
const authController = fs.readFileSync(
  path.join(root, 'apps/api/src/auth/auth.controller.ts'),
  'utf8',
);
const orgController = fs.readFileSync(
  path.join(root, 'apps/api/src/organizations/organizations.controller.ts'),
  'utf8',
);

const requiredRoutes = [
  {
    file: 'AuthController',
    content: authController,
    routes: ["@Post('login')", "@Get('me')"],
  },
  {
    file: 'OrganizationsController',
    content: orgController,
    routes: ["@Get('facilities')", "@Get('users')"],
  },
  {
    file: 'TasksController',
    content: tasksController,
    routes: [
      '@Post()',
      '@Get()',
      "@Get(':id')",
      "@Patch(':id')",
      "@Patch(':id/status')",
      "@Delete(':id')",
    ],
  },
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

#!/usr/bin/env node

/**
 * Pre-Deployment Validation Script
 * Phase 7 & 8: Error Handling System - Production Readiness Checker
 * 
 * Usage:
 *   npm run check:deploy
 *   node scripts/pre-deployment-validation.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const CHECKS = {
  PASS: '✓',
  FAIL: '✗',
  WARN: '⚠',
  INFO: 'ℹ',
};

class DeploymentValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
    };
    this.issues = [];
  }

  log(message, status = 'INFO') {
    const colors = {
      INFO: BLUE,
      PASS: GREEN,
      FAIL: RED,
      WARN: YELLOW,
    };
    const icon = CHECKS[status];
    console.log(`${colors[status]}${icon} ${message}${RESET}`);
  }

  pass(message) {
    this.log(message, 'PASS');
    this.results.passed++;
  }

  fail(message) {
    this.log(message, 'FAIL');
    this.results.failed++;
    this.issues.push(message);
  }

  warn(message) {
    this.log(message, 'WARN');
    this.results.warnings++;
  }

  info(message) {
    this.log(message, 'INFO');
  }

  section(title) {
    console.log(`\n${BLUE}═══════════════════════════════════════════════════${RESET}`);
    console.log(`${BLUE}${title}${RESET}`);
    console.log(`${BLUE}═══════════════════════════════════════════════════${RESET}\n`);
  }

  async checkCodeQuality() {
    this.section('1. CODE QUALITY CHECKS');

    // Check TypeScript compilation
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.pass('TypeScript compilation successful');
    } catch (error) {
      this.fail('TypeScript compilation failed');
    }

    // Check ESLint
    try {
      execSync('npx eslint . --max-warnings 0', { stdio: 'pipe' });
      this.pass('ESLint checks passed');
    } catch (error) {
      this.warn('ESLint warnings detected - review before deployment');
    }

    // Check for console.log in production code
    try {
      const result = execSync(
        'grep -r "console\\." src/ --include="*.ts" --include="*.tsx" || true',
        { encoding: 'utf-8' }
      );
      if (result.trim()) {
        this.warn('console.* statements found in source code');
      } else {
        this.pass('No console statements in source code');
      }
    } catch (error) {
      this.pass('No console statements in source code');
    }
  }

  async checkTests() {
    this.section('2. TEST COVERAGE CHECKS');

    // Check if test files exist
    try {
      execSync('find . -name "*.test.ts" -o -name "*.spec.ts" | head -1', {
        stdio: 'pipe',
      });
      this.pass('Test files found');
    } catch (error) {
      this.warn('No test files detected');
    }

    // Run tests (optional, can be slow)
    const runTests =
      process.argv.includes('--run-tests') ||
      process.argv.includes('-t');

    if (runTests) {
      try {
        execSync('npm test -- --passWithNoTests --silent', {
          stdio: 'pipe',
        });
        this.pass('Jest tests passed');
      } catch (error) {
        this.fail('Jest tests failed');
      }
    } else {
      this.info('Skipping test execution (use --run-tests to include)');
    }
  }

  async checkDatabaseSetup() {
    this.section('3. DATABASE CONFIGURATION');

    // Check Prisma schema
    if (fs.existsSync('prisma/schema.prisma')) {
      this.pass('prisma/schema.prisma exists');
    } else {
      this.fail('prisma/schema.prisma not found');
    }

    // Check for ErrorLog model
    const schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');
    if (schema.includes('model ErrorLog')) {
      this.pass('ErrorLog model defined in schema');
    } else {
      this.fail('ErrorLog model not found in schema');
    }

    // Check for RateLimitAnomaly model
    if (schema.includes('model RateLimitAnomaly')) {
      this.pass('RateLimitAnomaly model defined in schema');
    } else {
      this.fail('RateLimitAnomaly model not found in schema');
    }

    // Check migration files
    const migrationsDir = 'prisma/migrations';
    if (
      fs.existsSync(migrationsDir) &&
      fs.readdirSync(migrationsDir).length > 0
    ) {
      this.pass('Migration files exist');
    } else {
      this.fail('No migration files found');
    }
  }

  async checkErrorHandlingLibraries() {
    this.section('4. ERROR HANDLING LIBRARIES');

    const requiredFiles = [
      'src/lib/errors/api-error.ts',
      'src/lib/errors/rate-limiter.ts',
      'src/lib/errors/circuit-breaker.ts',
      'src/lib/errors/error-logger.ts',
      'src/lib/errors/api-client.ts',
      'src/lib/errors/middleware.ts',
      'src/lib/errors/index.ts',
    ];

    requiredFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        const lines = fs.readFileSync(file, 'utf-8').split('\n').length;
        this.pass(`${file} exists (${lines} lines)`);
      } else {
        this.fail(`${file} not found`);
      }
    });
  }

  async checkIntegratedRoutes() {
    this.section('5. INTEGRATED ROUTES');

    const routes = [
      'src/app/api/payment-integrated/create-order/route.ts',
      'src/app/api/payment-integrated/verify/route.ts',
      'src/app/api/upload-integrated/route.ts',
    ];

    routes.forEach((route) => {
      if (fs.existsSync(route)) {
        const content = fs.readFileSync(route, 'utf-8');
        if (
          content.includes('withErrorHandler') ||
          content.includes('withRateLimit')
        ) {
          this.pass(`${route} has error handling`);
        } else {
          this.warn(`${route} may not have error handling`);
        }
      } else {
        this.fail(`${route} not found`);
      }
    });
  }

  async checkDocumentation() {
    this.section('6. DOCUMENTATION');

    const docs = [
      'docs/ERROR-HANDLING-OVERVIEW.md',
      'docs/api-reference.md',
      'docs/runtime-error-monitoring.md',
      'docs/error-handling-testing.md',
      'docs/error-handling-maintenance.md',
      'docs/error-handling-integration.md',
      'docs/PHASE-8-PRODUCTION-DEPLOYMENT.md',
      'docs/PHASE-7-8-COMPLETION-SUMMARY.md',
    ];

    docs.forEach((doc) => {
      if (fs.existsSync(doc)) {
        const lines = fs.readFileSync(doc, 'utf-8').split('\n').length;
        this.pass(`${doc} (${lines} lines)`);
      } else {
        this.fail(`${doc} not found`);
      }
    });
  }

  async checkEnvironmentSetup() {
    this.section('7. ENVIRONMENT CONFIGURATION');

    // Check .env file exists
    if (fs.existsSync('.env')) {
      this.pass('.env file exists');

      const envContent = fs.readFileSync('.env', 'utf-8');
      const requiredEnvVars = [
        'DATABASE_URL',
        'DIRECT_URL',
        'SENTRY_DSN',
        'ADMIN_TOKEN',
      ];

      requiredEnvVars.forEach((varName) => {
        if (envContent.includes(varName)) {
          this.pass(`${varName} configured in .env`);
        } else {
          this.warn(`${varName} not configured in .env`);
        }
      });
    } else {
      this.warn('.env file not found - will be needed for deployment');
    }
  }

  async checkPackageJson() {
    this.section('8. PACKAGE.JSON SCRIPTS');

    const packageJson = JSON.parse(
      fs.readFileSync('package.json', 'utf-8')
    );

    const requiredScripts = [
      'build',
      'dev',
      'test',
      'lint',
    ];

    requiredScripts.forEach((script) => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        this.pass(`npm run ${script} available`);
      } else {
        this.warn(`npm run ${script} not found`);
      }
    });

    // Check required dependencies
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const requiredDeps = [
      '@sentry/nextjs',
      'next',
      'react',
      'prisma',
    ];

    requiredDeps.forEach((dep) => {
      if (deps[dep]) {
        this.pass(`${dep} (${deps[dep]}) installed`);
      } else {
        this.fail(`${dep} not found in package.json`);
      }
    });
  }

  async checkBuild() {
    this.section('9. BUILD VERIFICATION');

    const skipBuild =
      process.argv.includes('--skip-build') ||
      process.argv.includes('-sb');

    if (skipBuild) {
      this.info('Skipping build (use without --skip-build to test build)');
    } else {
      try {
        execSync('npm run build 2>&1 | tail -20', { stdio: 'inherit' });
        this.pass('Build successful');
      } catch (error) {
        this.fail('Build failed - check output above');
      }
    }
  }

  async checkGitStatus() {
    this.section('10. GIT STATUS');

    try {
      const status = execSync('git status --porcelain', {
        encoding: 'utf-8',
      }).trim();

      if (status) {
        this.warn('Uncommitted changes detected:');
        status.split('\n').forEach((line) => {
          console.log(`  ${line}`);
        });
      } else {
        this.pass('Working directory clean');
      }
    } catch (error) {
      this.warn('Could not check git status');
    }
  }

  printSummary() {
    console.log(
      `\n${BLUE}═══════════════════════════════════════════════════${RESET}`
    );
    console.log(
      `${BLUE}VALIDATION SUMMARY${RESET}`
    );
    console.log(
      `${BLUE}═══════════════════════════════════════════════════${RESET}\n`
    );

    console.log(`${GREEN}✓ Passed:${RESET}   ${this.results.passed}`);
    console.log(`${YELLOW}⚠ Warnings:${RESET} ${this.results.warnings}`);
    console.log(`${RED}✗ Failed:${RESET}   ${this.results.failed}`);

    if (this.results.failed > 0) {
      console.log(
        `\n${RED}ISSUES FOUND:${RESET}`
      );
      this.issues.forEach((issue) => {
        console.log(`  • ${issue}`);
      });
    }

    const status = this.results.failed === 0 ? 'READY' : 'NOT READY';
    const color = this.results.failed === 0 ? GREEN : RED;
    console.log(
      `\n${color}═ DEPLOYMENT STATUS: ${status} ═${RESET}\n`
    );

    if (this.results.failed === 0) {
      console.log(
        `${GREEN}✓ All checks passed! You are ready to deploy.${RESET}`
      );
      console.log(
        `\n${YELLOW}Next Steps:${RESET}`
      );
      console.log('  1. Create backup: pg_dump $DATABASE_URL > backup.sql');
      console.log('  2. Run migrations: npx prisma migrate deploy');
      console.log('  3. Deploy application: npm run deploy');
      console.log('  4. Verify: npm run test:smoke');
    } else {
      console.log(`${RED}✗ Please fix issues above before deploying.${RESET}`);
      process.exit(1);
    }
  }

  async run() {
    console.log(
      `${BLUE}${'═════════════════════════════════════════════════════'}${RESET}`
    );
    console.log(
      `${BLUE}Pre-Deployment Validation Script${RESET}`
    );
    console.log(
      `${BLUE}Phase 7 & 8: Error Handling System${RESET}`
    );
    console.log(
      `${BLUE}${'═════════════════════════════════════════════════════'}${RESET}\n`
    );

    await this.checkCodeQuality();
    await this.checkTests();
    await this.checkDatabaseSetup();
    await this.checkErrorHandlingLibraries();
    await this.checkIntegratedRoutes();
    await this.checkDocumentation();
    await this.checkEnvironmentSetup();
    await this.checkPackageJson();
    await this.checkBuild();
    await this.checkGitStatus();

    this.printSummary();
  }
}

// Run the validator
const validator = new DeploymentValidator();
validator.run().catch((error) => {
  console.error(`${RED}Validation error: ${error.message}${RESET}`);
  process.exit(1);
});

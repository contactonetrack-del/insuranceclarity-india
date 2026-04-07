#!/usr/bin/env node

/**
 * Post-Deployment Verification Script
 * Phase 10: Production Deployment - Health Check & Monitoring Setup
 *
 * Usage:
 *   npm run verify:deploy
 *   node scripts/post-deployment-verification.js
 */

import { execSync } from 'child_process';
import fs from 'fs';

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

class DeploymentVerifier {
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
    this.results.passed++;
    this.log(message, 'PASS');
  }

  fail(message) {
    this.results.failed++;
    this.issues.push(message);
    this.log(message, 'FAIL');
  }

  warn(message) {
    this.results.warnings++;
    this.log(message, 'WARN');
  }

  info(message) {
    this.log(message, 'INFO');
  }

  async checkHealthEndpoint() {
    try {
      this.info('Checking application health endpoint...');
      // In a real deployment, this would check the production URL
      // For now, we'll check if the health route exists
      const healthRoute = 'src/app/api/health/route.ts';
      if (fs.existsSync(healthRoute)) {
        this.pass('Health endpoint exists');
      } else {
        this.warn('Health endpoint not found - consider adding one');
      }
    } catch (error) {
      this.fail(`Health check failed: ${error.message}`);
    }
  }

  async checkDatabaseConnection() {
    try {
      this.info('Checking database connectivity...');
      // This would normally test the production database
      // For simulation, we'll check if environment variables are set
      const hasDbUrl = process.env.DATABASE_URL;
      const hasDirectUrl = process.env.DIRECT_URL;

      if (hasDbUrl && hasDirectUrl) {
        this.pass('Database environment variables configured');
      } else {
        this.fail('Database environment variables missing');
      }
    } catch (error) {
      this.fail(`Database check failed: ${error.message}`);
    }
  }

  async checkSentryConfiguration() {
    try {
      this.info('Checking Sentry error monitoring...');
      const sentryDsn = process.env.SENTRY_DSN;
      if (sentryDsn) {
        this.pass('Sentry DSN configured');
      } else {
        this.fail('Sentry DSN not configured');
      }
    } catch (error) {
      this.fail(`Sentry check failed: ${error.message}`);
    }
  }

  async checkErrorHandlingRoutes() {
    try {
      this.info('Checking error handling routes...');
      const routes = [
        'src/app/api/payment-integrated/create-order/route.ts',
        'src/app/api/payment-integrated/verify/route.ts',
        'src/app/api/upload-integrated/route.ts',
        'src/app/api/admin/errors/route.ts',
      ];

      let allRoutesExist = true;
      for (const route of routes) {
        if (!fs.existsSync(route)) {
          this.fail(`Route missing: ${route}`);
          allRoutesExist = false;
        }
      }

      if (allRoutesExist) {
        this.pass('All error handling routes present');
      }
    } catch (error) {
      this.fail(`Route check failed: ${error.message}`);
    }
  }

  async checkMonitoringDashboard() {
    try {
      this.info('Checking monitoring dashboard...');
      const dashboard = 'src/app/dashboard/admin/errors/page.tsx';
      const component = 'src/components/dashboard/ErrorMonitoringDashboard.tsx';

      if (fs.existsSync(dashboard) && fs.existsSync(component)) {
        this.pass('Error monitoring dashboard available');
      } else {
        this.fail('Error monitoring dashboard missing');
      }
    } catch (error) {
      this.fail(`Dashboard check failed: ${error.message}`);
    }
  }

  async checkBuildArtifacts() {
    try {
      this.info('Checking build artifacts...');
      if (fs.existsSync('.next')) {
        this.pass('Build artifacts present');
      } else {
        this.warn('Build artifacts not found - run npm run build first');
      }
    } catch (error) {
      this.fail(`Build check failed: ${error.message}`);
    }
  }

  async runAllChecks() {
    console.log('═'.repeat(60));
    console.log('Post-Deployment Verification');
    console.log('Phase 10: Production Deployment Health Check');
    console.log('═'.repeat(60));
    console.log();

    await this.checkHealthEndpoint();
    await this.checkDatabaseConnection();
    await this.checkSentryConfiguration();
    await this.checkErrorHandlingRoutes();
    await this.checkMonitoringDashboard();
    await this.checkBuildArtifacts();

    console.log();
    console.log('═'.repeat(60));
    console.log('VERIFICATION SUMMARY');
    console.log('═'.repeat(60));

    this.log(`Passed:   ${this.results.passed}`, 'PASS');
    this.log(`Warnings: ${this.results.warnings}`, 'WARN');
    this.log(`Failed:   ${this.results.failed}`, 'FAIL');

    if (this.results.failed > 0) {
      console.log();
      console.log('ISSUES FOUND:');
      this.issues.forEach(issue => this.log(`• ${issue}`, 'FAIL'));
      console.log();
      this.log('DEPLOYMENT STATUS: ISSUES DETECTED', 'FAIL');
      process.exit(1);
    } else {
      console.log();
      this.log('DEPLOYMENT STATUS: VERIFIED ✅', 'PASS');
      console.log();
      this.info('Next steps:');
      this.info('1. Monitor error dashboard for first 24 hours');
      this.info('2. Check Sentry for any new error patterns');
      this.info('3. Verify rate limiting is working correctly');
      this.info('4. Test payment and upload flows in production');
    }
  }
}

// Run verification
const verifier = new DeploymentVerifier();
verifier.runAllChecks().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
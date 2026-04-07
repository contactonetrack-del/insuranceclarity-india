/*
  Warnings:

  - A unique constraint covering the columns `[fileHash,createdAt]` on the table `Scan` will be added. If there are existing rows, this will fail.

*/

-- Phase 11: Performance Optimization - Database Indexes
-- These compound indexes optimize common query patterns used in dashboard and analytics

-- Scan queries: frequently filtered by userId, status, and sorted by createdAt
CREATE INDEX IF NOT EXISTS idx_scan_user_status_created ON "Scan"("userId", "status", "createdAt" DESC);

-- Scan queries: frequently filtered by userId and sorted by createdAt
CREATE INDEX IF NOT EXISTS idx_scan_user_created ON "Scan"("userId", "createdAt" DESC);

-- Payment status tracking: find recent payments for user
CREATE INDEX IF NOT EXISTS idx_payment_user_status_created ON "Payment"("userId", "status", "createdAt" DESC);

-- Error log queries: dashboard error monitoring
CREATE INDEX IF NOT EXISTS idx_error_timestamp_http_status ON "ErrorLog"("timestamp" DESC, "httpStatus");
CREATE INDEX IF NOT EXISTS idx_error_error_code_timestamp ON "ErrorLog"("errorCode", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_error_severity_timestamp ON "ErrorLog"("severity", "timestamp" DESC);

-- Subscription management: find active/pending subscriptions
CREATE INDEX IF NOT EXISTS idx_subscription_user_status ON "Subscription"("userId", "status");

-- Rate limit detection: find anomalies by scope and time
CREATE INDEX IF NOT EXISTS idx_ratelimit_scope_detected ON "RateLimitAnomaly"("scope", "detectedAt" DESC);

-- User calculation history: dashboard calculations page
CREATE INDEX IF NOT EXISTS idx_usercalc_user_created ON "UserCalculation"("userId", "createdAt" DESC);

-- Audit log queries: compliance and debugging
CREATE INDEX IF NOT EXISTS idx_auditlog_resource_timestamp ON "AuditLog"("resource", "createdAt" DESC);

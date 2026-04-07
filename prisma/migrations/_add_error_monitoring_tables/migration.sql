-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "errorCode" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "httpStatus" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitAnomaly" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL,
    "windowSeconds" INTEGER NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorLog_errorCode_idx" ON "ErrorLog"("errorCode");

-- CreateIndex
CREATE INDEX "ErrorLog_route_idx" ON "ErrorLog"("route");

-- CreateIndex
CREATE INDEX "ErrorLog_httpStatus_idx" ON "ErrorLog"("httpStatus");

-- CreateIndex
CREATE INDEX "ErrorLog_severity_idx" ON "ErrorLog"("severity");

-- CreateIndex
CREATE INDEX "ErrorLog_userId_idx" ON "ErrorLog"("userId");

-- CreateIndex
CREATE INDEX "ErrorLog_timestamp_idx" ON "ErrorLog"("timestamp");

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- CreateIndex
CREATE INDEX "RateLimitAnomaly_ipAddress_idx" ON "RateLimitAnomaly"("ipAddress");

-- CreateIndex
CREATE INDEX "RateLimitAnomaly_scope_idx" ON "RateLimitAnomaly"("scope");

-- CreateIndex
CREATE INDEX "RateLimitAnomaly_detectedAt_idx" ON "RateLimitAnomaly"("detectedAt");
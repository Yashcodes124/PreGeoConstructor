-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "plotAreaSqFt" DOUBLE PRECISION NOT NULL,
    "builtUpAreaSqFt" DOUBLE PRECISION NOT NULL,
    "buildingType" TEXT NOT NULL,
    "floors" INTEGER NOT NULL,
    "qualityGrade" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "dataConfidence" DOUBLE PRECISION NOT NULL,
    "rawData" JSONB,
    "normalizedData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactorResult" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "factor" TEXT NOT NULL,
    "rawValue" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "FactorResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrientationResult" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "recommendedAngle" DOUBLE PRECISION NOT NULL,
    "solarScore" DOUBLE PRECISION,
    "windScore" DOUBLE PRECISION,
    "candidateScores" JSONB NOT NULL,

    CONSTRAINT "OrientationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEstimate" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "baseRate" DOUBLE PRECISION NOT NULL,
    "terrainMultiplier" DOUBLE PRECISION NOT NULL,
    "qualityMultiplier" DOUBLE PRECISION NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "rangeLow" DOUBLE PRECISION NOT NULL,
    "rangeHigh" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CostEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storagePath" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Site_latitude_longitude_idx" ON "Site"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Site_createdAt_idx" ON "Site"("createdAt");

-- CreateIndex
CREATE INDEX "Analysis_siteId_idx" ON "Analysis"("siteId");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateIndex
CREATE INDEX "FactorResult_analysisId_idx" ON "FactorResult"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "OrientationResult_analysisId_key" ON "OrientationResult"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "CostEstimate_analysisId_key" ON "CostEstimate"("analysisId");

-- CreateIndex
CREATE INDEX "Report_analysisId_idx" ON "Report"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCache_cacheKey_key" ON "ProviderCache"("cacheKey");

-- CreateIndex
CREATE INDEX "ProviderCache_provider_idx" ON "ProviderCache"("provider");

-- CreateIndex
CREATE INDEX "ProviderCache_expiresAt_idx" ON "ProviderCache"("expiresAt");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactorResult" ADD CONSTRAINT "FactorResult_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrientationResult" ADD CONSTRAINT "OrientationResult_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostEstimate" ADD CONSTRAINT "CostEstimate_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;


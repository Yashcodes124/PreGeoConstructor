-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('residential', 'commercial', 'industrial', 'mixed_use', 'institutional');

-- CreateEnum
CREATE TYPE "QualityGrade" AS ENUM ('economy', 'standard', 'premium');

-- CreateEnum
CREATE TYPE "SuitabilityFactor" AS ENUM ('slope', 'water', 'accessibility', 'environment', 'facilities');

-- CreateTable
CREATE TABLE "Site" (
    "id" UUID NOT NULL,
    "label" TEXT,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "plotAreaSqFt" INTEGER NOT NULL,
    "builtUpAreaSqFt" INTEGER NOT NULL,
    "buildingType" "BuildingType" NOT NULL,
    "floors" INTEGER NOT NULL,
    "qualityGrade" "QualityGrade" NOT NULL,
    "budget" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "dataConfidence" DECIMAL(5,2) NOT NULL,
    "rawData" JSONB,
    "normalizedData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactorResult" (
    "id" UUID NOT NULL,
    "analysisId" UUID NOT NULL,
    "factor" "SuitabilityFactor" NOT NULL,
    "rawValue" JSONB,
    "score" DECIMAL(5,2) NOT NULL,
    "weight" DECIMAL(5,4) NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "FactorResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrientationResult" (
    "id" UUID NOT NULL,
    "analysisId" UUID NOT NULL,
    "recommendedAngle" DECIMAL(6,2) NOT NULL,
    "solarScore" DECIMAL(5,2) NOT NULL,
    "windScore" DECIMAL(5,2),
    "candidateScores" JSONB NOT NULL,

    CONSTRAINT "OrientationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEstimate" (
    "id" UUID NOT NULL,
    "analysisId" UUID NOT NULL,
    "area" INTEGER NOT NULL,
    "baseRate" DECIMAL(12,2) NOT NULL,
    "terrainMultiplier" DECIMAL(6,3) NOT NULL,
    "qualityMultiplier" DECIMAL(6,3) NOT NULL,
    "estimatedCost" DECIMAL(14,2) NOT NULL,
    "rangeLow" DECIMAL(14,2) NOT NULL,
    "rangeHigh" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "CostEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "analysisId" UUID NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT,
    "url" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCache" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Site_latitude_longitude_idx" ON "Site"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Analysis_siteId_idx" ON "Analysis"("siteId");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FactorResult_analysisId_factor_key" ON "FactorResult"("analysisId", "factor");

-- CreateIndex
CREATE INDEX "FactorResult_analysisId_idx" ON "FactorResult"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "OrientationResult_analysisId_key" ON "OrientationResult"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "CostEstimate_analysisId_key" ON "CostEstimate"("analysisId");

-- CreateIndex
CREATE INDEX "Report_analysisId_idx" ON "Report"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderCache_key_key" ON "ProviderCache"("key");

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

import { z } from 'zod';

export const buildingTypeSchema = z.enum(['residential', 'commercial', 'industrial', 'institutional']);
export const qualityGradeSchema = z.enum(['economy', 'standard', 'premium', 'luxury']);

export const analysisRequestSchema = z.object({
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  buildingType: buildingTypeSchema,
  plotAreaSqFt: z.number().positive().max(10_000_000),
  builtUpAreaSqFt: z.number().positive().max(10_000_000),
  floors: z.number().int().min(1).max(200),
  qualityGrade: qualityGradeSchema,
  budget: z.number().positive().max(1_000_000_000_000).optional(),
  projectName: z.string().trim().min(1).max(120).optional(),
  locationName: z.string().trim().min(1).max(300).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(3, 'Enter at least 3 characters').max(200),
});

export const reverseQuerySchema = z.object({
  lat: z.coerce.number().gte(-90).lte(90),
  lon: z.coerce.number().gte(-180).lte(180),
});

export const compareRequestSchema = z
  .object({
    analysisIdA: z.string().trim().min(1).max(80),
    analysisIdB: z.string().trim().min(1).max(80),
  })
  .refine((value) => value.analysisIdA !== value.analysisIdB, {
    message: 'Choose two different analyses',
    path: ['analysisIdB'],
  });

export const analysisIdParamSchema = z.object({
  id: z.string().trim().min(1).max(80),
});

export const reportIdParamSchema = z.object({
  reportId: z.string().trim().min(1).max(80),
});

export type AnalysisRequestInput = z.infer<typeof analysisRequestSchema>;

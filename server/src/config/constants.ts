/** Documented suitability weights. Factor scores are 0–10 before conversion to 0–100. */
export const SUITABILITY_WEIGHTS = {
  slope: 0.25,
  water: 0.2,
  accessibility: 0.2,
  environment: 0.15,
  facilities: 0.2,
} as const;

export type SuitabilityFactor = keyof typeof SUITABILITY_WEIGHTS;

/**
 * Preliminary planning rates in INR per square foot of built-up floor area.
 * These are configurable assumptions for an India-context MVP. They are not a
 * quantity-survey quotation and are not fed by a live price index.
 */
export const STANDARD_RATE_INR_PER_SQFT = 2200;

export const QUALITY_RATE_INR_PER_SQFT = {
  economy: 1600,
  standard: 2200,
  premium: 3200,
  luxury: 4800,
} as const;

export const BUILDING_TYPE_MULTIPLIER = {
  residential: 1,
  commercial: 1.15,
  industrial: 0.85,
  institutional: 1.1,
} as const;

export const COST_BREAKDOWN = [
  { category: 'Foundation & Substructure', percentage: 18, description: 'Excavation, footing, plinth beam, and damp-proofing allowance' },
  { category: 'Superstructure & Frame', percentage: 38, description: 'Columns, beams, slabs, and masonry allowance' },
  { category: 'Finishes & Interior Fit-outs', percentage: 24, description: 'Flooring, plaster, paint, doors, and windows allowance' },
  { category: 'MEP (Mechanical, Electrical, Plumbing)', percentage: 14, description: 'Wiring, fixtures, piping, and sanitation allowance' },
  { category: 'Site Prep & External Works', percentage: 6, description: 'Compound, drainage hookup, paving, and external works allowance' },
] as const;

export const WATER_SEARCH_RADIUS_M = 1500;
export const ROAD_SEARCH_RADIUS_M = 600;
export const FACILITY_SEARCH_RADIUS_M = 2500;
export const TRANSIT_SEARCH_RADIUS_M = 800;
export const ELEVATION_OFFSET_M = 90;

export const SOIL_DISCLAIMER =
  'Geotechnical soil bearing capacity cannot be determined from these open geospatial sources. A site-specific investigation is required before foundation design. This report is not a geotechnical or structural certification.';

export const WATER_DISCLAIMER =
  'Water/Flood-Risk Indicator is a planning proxy from mapped surface-water distance and, when available, relative elevation. It is not a hydrodynamic flood model, insurance flood zone, or official inundation forecast.';

export const COST_DISCLAIMER =
  'Preliminary Cost Estimate only. It uses configurable regional planning rates and is not a professional quantity-survey quotation. Land, legal fees, approvals, taxes, and special foundations are excluded.';

export const INHERENT_LIMITATIONS = [
  'Subsurface geotechnical soil bearing capacity is not available from remote sources and requires field investigation.',
  'Municipal zoning, setbacks, and building bylaws are not checked by this service.',
  'This report is not structural certification, legal approval, or professional engineering sign-off.',
] as const;

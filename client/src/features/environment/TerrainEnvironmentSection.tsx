import React from 'react';
import { TerrainAnalysis, WaterRiskIndicator, AccessibilityAnalysis, FacilityDistance, EnvironmentalAnalysis } from '../../types/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Mountain, Droplets, Navigation, Building2, Wind, AlertCircle } from 'lucide-react';
import { formatMeasure, formatMeters } from '../../utils/format';

interface TerrainEnvironmentSectionProps {
  terrain: TerrainAnalysis;
  waterRisk: WaterRiskIndicator;
  accessibility: AccessibilityAnalysis;
  facilities: FacilityDistance[];
  environment: EnvironmentalAnalysis;
}

const getFacilityDisplayLabel = (fac: FacilityDistance): string => {
  if (fac.facilityType === 'Construction Depot') {
    return 'Hardware / DIY Store';
  }
  if (fac.facilityType === 'Water Supply Main') {
    const nameLower = fac.name.toLowerCase();
    if (nameLower.includes('tower')) return 'Water Tower';
    if (nameLower.includes('works')) return 'Water Works';
    return 'Water Facility';
  }
  if (fac.facilityType === 'Hospital') {
    const nameLower = fac.name.toLowerCase();
    if (nameLower.includes('clinic')) return 'Clinic';
    if (nameLower.includes('hospital')) return 'Hospital';
    return 'Hospital / Clinic';
  }
  return fac.facilityType;
};

export const TerrainEnvironmentSection: React.FC<TerrainEnvironmentSectionProps> = ({
  terrain,
  waterRisk,
  accessibility,
  facilities,
  environment,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Terrain & Elevation */}
        <Card title="Terrain & Elevation Profile" icon={<Mountain className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Base Elevation</span>
                <span className="text-lg font-bold text-white font-mono">{formatMeasure(terrain.elevationMeters, ' m')}</span>
                <span className="text-[10px] text-slate-500 block font-mono">Range: {formatMeasure(terrain.minElevation, ' m')} - {formatMeasure(terrain.maxElevation, ' m')}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Surface Slope</span>
                <span className="text-lg font-bold text-white font-mono">{formatMeasure(terrain.slopePercentage, '%')}</span>
                <span className="text-[10px] text-slate-500 block font-mono">{terrain.terrainType}</span>
              </div>
            </div>

            {/* Geotechnical Disclaimer Alert */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Geotechnical Subsurface Data Status</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {terrain.soilInfo.disclaimer}
              </p>
            </div>
          </div>
        </Card>

        {/* Surface Water Proximity Indicator */}
        <Card title="Surface Water Proximity Indicator" icon={<Droplets className="w-4 h-4 text-sky-400" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Proximity to Water</span>
                <span className="text-lg font-bold text-white font-mono">{formatMeters(waterRisk.distanceToWaterMeters)}</span>
                <span className="text-[10px] text-slate-500 block">Nearest OSM surface channel</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Proximity Category</span>
                <Badge variant={waterRisk.riskLevel === 'Low Risk' ? 'success' : waterRisk.riskLevel === 'Moderate Risk' || waterRisk.riskLevel === 'Unavailable' ? 'warning' : 'danger'}>
                  {waterRisk.riskLevel}
                </Badge>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">Relative elevation: {formatMeasure(waterRisk.elevationBufferMeters, ' m')}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
              <strong>Proxy Indicator Notice:</strong> {waterRisk.disclaimer}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accessibility */}
        <Card title="Road Network & Accessibility" icon={<Navigation className="w-4 h-4 text-brand-400" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">{accessibility.roadType}</span>
                <span className="text-[11px] text-slate-400">Nearest mapped road access point</span>
              </div>
              <span className="text-base font-bold text-white font-mono">{formatMeters(accessibility.nearestRoadDistanceMeters)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Major Highway Connection</span>
              <span className="font-mono font-semibold text-slate-200">{formatMeters(accessibility.nearestHighwayDistanceMeters)}</span>
            </div>
          </div>
        </Card>

        {/* Environmental Quality */}
        <Card title="Environmental Quality & Microclimate" icon={<Wind className="w-4 h-4 text-emerald-400" />}>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Modelled US AQI</span>
              <span className="text-lg font-bold text-white font-mono">{formatMeasure(environment.airQualityIndex)}</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">{environment.aqiCategory}</span>
              <span className="text-[9px] text-slate-500 block mt-1">Modelled estimate; not India National AQI (NAQI)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Annual Rainfall</span>
              <span className="text-lg font-bold text-white font-mono">{formatMeasure(environment.annualRainfallMm, ' mm')}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Temp: {formatMeasure(environment.tempMinC, '°C')} - {formatMeasure(environment.tempMaxC, '°C')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Facilities Proximity Table */}
      <Card title="Nearby Mapped Facilities Proximity" icon={<Building2 className="w-4 h-4 text-amber-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {facilities.map((fac, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">{getFacilityDisplayLabel(fac)}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">{fac.name}</span>
              </div>
              <span className="text-xs font-bold text-brand-300 font-mono shrink-0 ml-2">
                {formatMeters(fac.distanceMeters)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

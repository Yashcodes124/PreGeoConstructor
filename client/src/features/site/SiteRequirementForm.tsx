import React, { useState } from 'react';
import { BuildingType, QualityGrade, AnalysisRequest } from '../../types/api';
import { Building2, DollarSign, Sparkles, Sliders } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SiteRequirementFormProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  onSubmit: (data: AnalysisRequest) => void;
  isLoading?: boolean;
}

export const SiteRequirementForm: React.FC<SiteRequirementFormProps> = ({
  latitude,
  longitude,
  locationName,
  onSubmit,
  isLoading = false,
}) => {
  const [buildingType, setBuildingType] = useState<BuildingType>('residential');
  const [plotAreaSqFt, setPlotAreaSqFt] = useState<number>(2400);
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState<number>(1800);
  const [floors, setFloors] = useState<number>(2);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('standard');
  const [budget, setBudget] = useState<number>(6500000);
  const [projectName, setProjectName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      latitude,
      longitude,
      buildingType,
      plotAreaSqFt,
      builtUpAreaSqFt,
      floors,
      qualityGrade,
      budget,
      projectName: projectName || `${buildingType.toUpperCase()} Site Plan`,
      locationName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Building & Site Specifications</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure site constraints and building requirements for deterministic analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Project / Site Reference Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="e.g., Green Valley Villa Plot 42"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Building Type */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Building Structure Type
          </label>
          <select
            value={buildingType}
            onChange={e => setBuildingType(e.target.value as BuildingType)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="residential">Residential Villa / Apartment</option>
            <option value="commercial">Commercial Office / Retail</option>
            <option value="industrial">Industrial Warehouse / Light Mfg</option>
            <option value="institutional">Institutional School / Clinic</option>
          </select>
        </div>

        {/* Quality Grade */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Construction Quality Grade
          </label>
          <select
            value={qualityGrade}
            onChange={e => setQualityGrade(e.target.value as QualityGrade)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="economy">Economy (Basic Finishes & Masonry)</option>
            <option value="standard">Standard (RCC Frame & Standard Tiles)</option>
            <option value="premium">Premium (Engineered Finishes & HVAC)</option>
            <option value="luxury">Luxury (High-end Specs & Automation)</option>
          </select>
        </div>

        {/* Plot Area */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
            <span>Total Plot Area (sq. ft)</span>
            <span className="text-slate-400 font-mono">{(plotAreaSqFt / 43560).toFixed(2)} acres</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={500}
              max={500000}
              value={plotAreaSqFt}
              onChange={e => setPlotAreaSqFt(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">sq ft</span>
          </div>
        </div>

        {/* Built-up Area per floor */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
            <span>Ground Built-up Footprint (sq. ft)</span>
            <span className="text-slate-400 font-mono">
              {((builtUpAreaSqFt / plotAreaSqFt) * 100).toFixed(0)}% Ground Coverage
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={300}
              max={plotAreaSqFt}
              value={builtUpAreaSqFt}
              onChange={e => setBuiltUpAreaSqFt(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">sq ft</span>
          </div>
        </div>

        {/* Number of Floors */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
            <span>Number of Storeys / Floors</span>
            <span className="text-slate-400 font-mono">G + {floors - 1}</span>
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={floors}
            onChange={e => setFloors(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Target Construction Budget (INR)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="number"
              min={1000000}
              step={100000}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            ₹{(budget / 100000).toFixed(1)} Lakhs (~₹{(budget / 10000000).toFixed(2)} Cr)
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-brand-400" />
          <span>Total Gross Floor Area: <strong className="text-slate-200 font-mono">{(builtUpAreaSqFt * floors).toLocaleString()} sq. ft</strong></span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Run Full Site Analysis
        </Button>
      </div>
    </form>
  );
};

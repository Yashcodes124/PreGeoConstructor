import React, { useState } from "react";
import { BuildingType, QualityGrade, AnalysisRequest } from "../../types/api";
import { Building2, IndianRupee, Sparkles, Sliders } from "lucide-react";
import { Button } from "../../components/ui/Button";

/*Limits used by the form */
const LIMITS = {
  plotMin: 500,
  plotMax: 500000,
  builtUpMin: 300,
  floorsMin: 1,
  floorsMax: 30,
} as const;

/** Text box -> number. Empty or invalid text gives null, never 0. */
function parseField(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

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
  const [buildingType, setBuildingType] = useState<BuildingType>("residential");
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>("standard");
  const [projectName, setProjectName] = useState<string>("");

  // Numeric boxes keep the raw text the user typed. An empty box stays empty
  // and is never converted to 0.
  const [plotAreaText, setPlotAreaText] = useState<string>("");
  const [builtUpText, setBuiltUpText] = useState<string>("");
  const [floorsText, setFloorsText] = useState<string>("");
  const [budgetText, setBudgetText] = useState<string>("");
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const plotAreaSqFt = parseField(plotAreaText);
  const builtUpAreaSqFt = parseField(builtUpText);
  const floors = parseField(floorsText);
  const budget = parseField(budgetText);

  const errors: Record<
    "plot" | "builtUp" | "floors" | "budget",
    string | null
  > = {
    plot:
      plotAreaSqFt === null
        ? "Enter the plot area in sq. ft."
        : plotAreaSqFt < LIMITS.plotMin || plotAreaSqFt > LIMITS.plotMax
          ? `Plot area must be between ${LIMITS.plotMin.toLocaleString("en-IN")} and ${LIMITS.plotMax.toLocaleString("en-IN")} sq. ft.`
          : null,
    builtUp:
      builtUpAreaSqFt === null
        ? "Enter the ground built-up footprint in sq. ft."
        : builtUpAreaSqFt < LIMITS.builtUpMin
          ? `Footprint must be at least ${LIMITS.builtUpMin} sq. ft.`
          : plotAreaSqFt !== null && builtUpAreaSqFt > plotAreaSqFt
            ? "Footprint cannot be larger than the plot area."
            : null,
    floors:
      floors === null
        ? "Enter the number of floors."
        : !Number.isInteger(floors) ||
            floors < LIMITS.floorsMin ||
            floors > LIMITS.floorsMax
          ? `Floors must be a whole number from ${LIMITS.floorsMin} to ${LIMITS.floorsMax}.`
          : null,
    // Budget is optional: blank is fine, but if typed it must be above zero.
    budget:
      budgetText.trim() === ""
        ? null
        : budget === null || budget <= 0
          ? "Enter a budget above zero, or leave it blank."
          : null,
  };
  const hasErrors = Object.values(errors).some((message) => message !== null);
  const fieldError = (key: keyof typeof errors): string | null =>
    showErrors ? errors[key] : null;

  // Site coverage = ground footprint / plot area. This is NOT FAR/FSI.
  const siteCoveragePercent =
    plotAreaSqFt !== null && builtUpAreaSqFt !== null && plotAreaSqFt > 0
      ? Math.round((builtUpAreaSqFt / plotAreaSqFt) * 100)
      : null;
  const grossFloorArea =
    builtUpAreaSqFt !== null && floors !== null
      ? builtUpAreaSqFt * floors
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      hasErrors ||
      plotAreaSqFt === null ||
      builtUpAreaSqFt === null ||
      floors === null
    ) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      latitude,
      longitude,
      buildingType,
      plotAreaSqFt,
      builtUpAreaSqFt,
      floors,
      qualityGrade,
      // Only send a budget when the user actually typed one.
      ...(budget !== null && budget > 0 ? { budget } : {}),
      projectName: projectName || `${buildingType.toUpperCase()} Site Plan`,
      locationName,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Building & Site Specifications</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure site constraints and building requirements for
            deterministic analysis.
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
            onChange={(e) => setProjectName(e.target.value)}
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
            onChange={(e) => setBuildingType(e.target.value as BuildingType)}
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
            onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="economy">Economy (Basic Finishes & Masonry)</option>
            <option value="standard">
              Standard (RCC Frame & Standard Tiles)
            </option>
            <option value="premium">
              Premium (Engineered Finishes & HVAC)
            </option>
            <option value="luxury">Luxury (High-end Specs & Automation)</option>
          </select>
        </div>

        {/* Plot Area */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
            <span>Total Plot Area (sq. ft)</span>
            <span className="text-slate-400 font-mono">
              +{" "}
              {plotAreaSqFt === null
                ? ""
                : `${(plotAreaSqFt / 43560).toFixed(2)} acres`}
              +{" "}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={LIMITS.plotMin}
              max={LIMITS.plotMax}
              value={plotAreaText}
              onChange={(e) => setPlotAreaText(e.target.value)}
              placeholder="e.g. 2400"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
              sq ft
            </span>
          </div>
          {fieldError("plot") && (
            <p className="text-[11px] text-rose-400 mt-1">
              {fieldError("plot")}
            </p>
          )}
        </div>

        {/* Built-up Area per floor */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
            <span>Ground Built-up Footprint (sq. ft)</span>
            <span
              className="text-slate-400 font-mono"
              title="Ground footprint divided by plot area. This is site coverage, not FAR/FSI."
            >
              {siteCoveragePercent === null
                ? "Site coverage: not set"
                : `${siteCoveragePercent}% site coverage`}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={LIMITS.builtUpMin}
              max={plotAreaSqFt ?? undefined}
              value={builtUpText}
              onChange={(e) => setBuiltUpText(e.target.value)}
              placeholder="e.g. 1800"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
              sq ft
            </span>
          </div>
        </div>

        {/* Number of Floors */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
            <span>Number of Storeys / Floors</span>
            <span className="text-slate-400 font-mono">
              {floors !== null &&
              Number.isInteger(floors) &&
              floors >= LIMITS.floorsMin
                ? `G + ${floors - 1}`
                : ""}
            </span>
          </label>
          <input
            type="number"
            min={LIMITS.floorsMin}
            max={LIMITS.floorsMax}
            step={1}
            value={floorsText}
            onChange={(e) => setFloorsText(e.target.value)}
            placeholder="e.g. 2"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
          />
          {fieldError("floors") && (
            <p className="text-[11px] text-rose-400 mt-1">
              {fieldError("floors")}
            </p>
          )}
        </div>

        {/* Budget (Optional) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Target Construction Budget (INR){" "}
            <span className="text-slate-500 font-normal">— optional</span>
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="number"
              min={1}
              step={100000}
              value={budgetText}
              onChange={(e) => setBudgetText(e.target.value)}
              placeholder="Leave blank if none"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>
          {fieldError("budget") && (
            <p className="text-[11px] text-rose-400 mt-1">
              {fieldError("budget")}
            </p>
          )}
          {budget !== null && budget > 0 && (
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              ₹{(budget / 100000).toFixed(1)} Lakhs (~₹
              {(budget / 10000000).toFixed(2)} Cr)
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-brand-400" />
          <span>
            Total Gross Floor Area:{" "}
            <strong className="text-slate-200 font-mono">
              {grossFloorArea === null
                ? "Not set"
                : `${grossFloorArea.toLocaleString("en-IN")} sq. ft`}
            </strong>
          </span>
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

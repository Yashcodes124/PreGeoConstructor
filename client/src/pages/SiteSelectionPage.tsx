import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { LocationSearchBar } from '../components/map/LocationSearchBar';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { SiteRequirementForm } from '../features/site/SiteRequirementForm';
import { AnalysisLoadingState } from '../features/site/AnalysisLoadingState';
import { LocationSearchResult, reverseGeocode, analyzeSite, AnalysisRequest } from '../services/api';
import { MapPin, SlidersHorizontal } from 'lucide-react';

export const SiteSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  // Default initial coordinates: Bengaluru, India (or current selection)
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [locationName, setLocationName] = useState<string>('Bengaluru Central, Karnataka, India');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectLocation = (result: LocationSearchResult) => {
    setLatitude(result.latitude);
    setLongitude(result.longitude);
    setLocationName(result.displayName);
  };

  const handleMapLocationChange = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    const rev = await reverseGeocode(lat, lng);
    setLocationName(rev.displayName);
  };

  const handleFormSubmit = async (req: AnalysisRequest) => {
    setError(null);
    setIsAnalyzing(true);
    try {
      const response = await analyzeSite(req);
      setIsAnalyzing(false);
      navigate(`/analysis/${response.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis could not be completed');
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <AppLayout>
        <div className="py-12">
          <AnalysisLoadingState />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 py-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-400" />
              <span>Site Selection & Location Mapping</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select coordinates on the map or search an address, then configure project specifications.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <LocationSearchBar
          onSelectLocation={handleSelectLocation}
          selectedLocationName={locationName}
        />

        {/* Map & Requirements Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Map Column */}
          <div className="lg:col-span-7 space-y-3">
            <Card title="Interactive Map Selection" subtitle="Click anywhere on the map to pin coordinates" icon={<MapPin className="w-4 h-4" />}>
              <InteractiveMap
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleMapLocationChange}
                locationName={locationName}
              />
            </Card>
          </div>

          {/* Site Form Column */}
          <div className="lg:col-span-5">
            <Card title="Site Requirements & Specs" icon={<SlidersHorizontal className="w-4 h-4 text-brand-400" />}>
              <SiteRequirementForm
                latitude={latitude}
                longitude={longitude}
                locationName={locationName}
                onSubmit={handleFormSubmit}
                isLoading={isAnalyzing}
              />
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { LocationSearchResult, searchLocations } from '../../services/api';

interface LocationSearchBarProps {
  onSelectLocation: (result: LocationSearchResult) => void;
  selectedLocationName?: string;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  onSelectLocation,
  selectedLocationName,
}) => {
  const [query, setQuery] = useState(selectedLocationName || '');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLocationName) {
      setQuery(selectedLocationName);
    }
  }, [selectedLocationName]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 3 && isOpen) {
        setLoading(true);
        setError(null);
        try {
          const res = await searchLocations(query);
          setResults(res);
        } catch (err) {
          setResults([]);
          setError(err instanceof Error ? err.message : 'Location search is unavailable');
        } finally {
          setLoading(false);
        }
      } else if (query.trim().length < 3) {
        setResults([]);
        setError(null);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: LocationSearchResult) => {
    setQuery(item.displayName);
    onSelectLocation(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city, area, address, or landmark (e.g. HSR Layout Bengaluru)..."
          className="w-full bg-slate-900 border border-slate-700/80 focus:border-brand-500 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
        />
        {loading ? (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 animate-spin" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown */}
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}

      {isOpen && (results.length > 0 || query.length >= 3) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-800/60">
          {results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/80 transition-colors flex items-start gap-3 group"
              >
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{item.displayName}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.latitude.toFixed(4)}°, {item.longitude.toFixed(4)}° • Source: {item.source}
                  </p>
                </div>
              </button>
            ))
          ) : !loading ? (
            <div className="px-4 py-4 text-center text-xs text-slate-400">
              No matching locations found. You can also click directly on the interactive map below.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

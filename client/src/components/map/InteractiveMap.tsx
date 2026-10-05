import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin as MapPinIcon, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  locationName?: string;
  zoom?: number;
}

// Custom modern SVG Marker Icon to avoid Leaflet missing png asset bug
const createCustomMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border: 2.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 8px 16px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

// Sub-component to sync map view when center props change
function MapCenterSync({ latitude, longitude, zoom }: { latitude: number; longitude: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([latitude, longitude], zoom, { duration: 1.2 });
  }, [latitude, longitude, zoom, map]);
  return null;
}

// Sub-component to listen to map clicks
function MapClickListener({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
  locationName,
  zoom = 14,
}) => {
  const [tileLayerType, setTileLayerType] = useState<'standard' | 'topo' | 'satellite'>('standard');

  const tileLayers = {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: © <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  };

  const markerIcon = createCustomMarkerIcon();

  return (
    <div className="relative w-full h-[450px] md:h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-xl group">
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenterSync latitude={latitude} longitude={longitude} zoom={zoom} />
        <MapClickListener onLocationChange={onLocationChange} />

        <TileLayer
          url={tileLayers[tileLayerType].url}
          attribution={tileLayers[tileLayerType].attribution}
          maxZoom={19}
        />

        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <div className="p-1 space-y-1 text-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-brand-300">
                <MapPinIcon className="w-3.5 h-3.5 text-brand-400" />
                <span>Selected Coordinates</span>
              </div>
              <p className="text-xs text-slate-200 font-medium">{locationName || 'Selected Location'}</p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                Lat: {latitude.toFixed(5)}°<br />
                Lng: {longitude.toFixed(5)}°
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Layer Switcher Controls Overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 shadow-lg flex gap-1 text-xs">
        <button
          type="button"
          onClick={() => setTileLayerType('standard')}
          className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            tileLayerType === 'standard' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Street Map
        </button>
        <button
          type="button"
          onClick={() => setTileLayerType('topo')}
          className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            tileLayerType === 'topo' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Topo / Terrain
        </button>
        <button
          type="button"
          onClick={() => setTileLayerType('satellite')}
          className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            tileLayerType === 'satellite' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Lat/Lng Badge Footer Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md border border-slate-800/90 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-brand-400">
          <Navigation className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-200">Pinned:</span>
        </div>
        <span className="text-slate-300">
          {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
        </span>
      </div>
    </div>
  );
};

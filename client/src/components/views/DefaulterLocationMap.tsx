import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDefaulterAnalysis } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCoordinatesForLocation } from '@/utils/locationCoordinates';

interface LocationData {
  location: string;
  defaulterCount: number;
  defaulterRate: number;
  coordinates?: { lat: number; lng: number };
}

async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // First try predefined coordinates (local lookup - instant, no API calls)
    const coords = getCoordinatesForLocation(location);
    if (coords) {
      return coords;
    }

    // Fallback: Try backend API
    const response = await fetch(`/api/geocode?location=${encodeURIComponent(location)}`);
    if (!response.ok) {
      console.warn(`Geocoding failed for ${location}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return {
      lat: data.lat,
      lng: data.lng,
    };
  } catch (error) {
    console.warn(`Geocoding failed for ${location}:`, error);
  }
  return null;
}

// Component to auto-fit map to markers
function MapFitter({ locations }: { locations: LocationData[] }) {
  const map = useMap();
  const boundsRef = useRef<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (locations.length === 0) return;

    const validCoords = locations.filter((d) => d.coordinates?.lat && d.coordinates?.lng);
    if (validCoords.length === 0) return;

    // Create bounds from all valid coordinates
    const bounds = L.latLngBounds(
      validCoords.map((d) => [d.coordinates!.lat, d.coordinates!.lng])
    );

    boundsRef.current = bounds;

    // Fit map to bounds with padding
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [locations, map]);

  return null;
}

export function DefaulterLocationMap() {
  const { data: analysis, isLoading, error } = useDefaulterAnalysis();
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [geocoding, setGeocoding] = useState(true);

  useEffect(() => {
    if (analysis?.locationWise) {
      const geocodeLocations = async () => {
        setGeocoding(true);
        const geocodedData = await Promise.all(
          analysis.locationWise.slice(0, 20).map(async (loc) => {
            const coords = await geocodeLocation(loc.location);
            return {
              ...loc,
              coordinates: coords || undefined,
            };
          })
        );
        setLocationData(geocodedData.filter((d) => d.coordinates));
        setGeocoding(false);
      };
      geocodeLocations();
    }
  }, [analysis]);

  if (isLoading || geocoding) {
    return (
      <Card className="w-full h-96 border-none shadow-md">
        <Skeleton className="w-full h-full rounded-xl" />
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="w-full h-96 border-none shadow-md flex items-center justify-center">
        <p className="text-red-500">Failed to load map data</p>
      </Card>
    );
  }

  // Calculate initial center from geocoded locations or default to Delhi
  const mapCenter: [number, number] =
    locationData.length > 0
      ? [
          locationData.reduce((sum, d) => sum + (d.coordinates?.lat || 28.7041), 0) / locationData.length,
          locationData.reduce((sum, d) => sum + (d.coordinates?.lng || 77.1025), 0) / locationData.length,
        ]
      : [28.7041, 77.1025]; // Delhi center

  return (
    <Card
      className="w-full h-96 border-none shadow-md overflow-hidden relative"
      style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}
    >
      <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }} className="rounded-xl">
        <MapFitter locations={locationData} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {/* Critical Zones (High Default Rate >15%) */}
        {locationData
          .filter((loc) => loc.defaulterRate > 15 && loc.coordinates?.lat && loc.coordinates?.lng)
          .map((loc) => {
            const coords: [number, number] = [loc.coordinates!.lat, loc.coordinates!.lng];
            return (
              <CircleMarker
                key={`critical-${loc.location}`}
                center={coords}
                pathOptions={{
                  fillColor: '#F59E0B',
                  color: '#D97706',
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.6,
                }}
                radius={Math.min(loc.defaulterCount / 5, 25)}
              >
                <Popup>
                  <div className="p-3 text-sm">
                    <h4 className="font-bold text-base mb-2 text-[#D97706]">{loc.location}</h4>
                    <div className="space-y-1">
                      <p><strong>Default Rate:</strong> <span className="text-[#D97706] font-semibold">{loc.defaulterRate.toFixed(1)}%</span></p>
                      <p><strong>Defaulters:</strong> {loc.defaulterCount}</p>
                      <p className="text-xs text-gray-500 pt-1">🔴 CRITICAL HOTSPOT</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Medium Risk Zones (5-15%) */}
        {locationData
          .filter((loc) => loc.defaulterRate >= 5 && loc.defaulterRate <= 15 && loc.coordinates?.lat && loc.coordinates?.lng)
          .map((loc) => {
            const coords: [number, number] = [loc.coordinates!.lat, loc.coordinates!.lng];
            return (
              <CircleMarker
                key={`medium-${loc.location}`}
                center={coords}
                pathOptions={{
                  fillColor: '#3B82F6',
                  color: '#1E40AF',
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.5,
                }}
                radius={Math.min(loc.defaulterCount / 5, 20)}
              >
                <Popup>
                  <div className="p-3 text-sm">
                    <h4 className="font-bold text-base mb-2 text-[#1E40AF]">{loc.location}</h4>
                    <div className="space-y-1">
                      <p><strong>Default Rate:</strong> <span className="text-[#1E40AF] font-semibold">{loc.defaulterRate.toFixed(1)}%</span></p>
                      <p><strong>Defaulters:</strong> {loc.defaulterCount}</p>
                      <p className="text-xs text-gray-500 pt-1">🟡 MEDIUM RISK</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Low Risk Zones */}
        {locationData
          .filter((loc) => loc.defaulterRate < 5 && loc.coordinates?.lat && loc.coordinates?.lng)
          .map((loc) => {
            const coords: [number, number] = [loc.coordinates!.lat, loc.coordinates!.lng];
            return (
              <CircleMarker
                key={`low-${loc.location}`}
                center={coords}
                pathOptions={{
                  fillColor: '#10B981',
                  color: '#047857',
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.4,
                }}
                radius={Math.min(loc.defaulterCount / 5, 15)}
              >
                <Popup>
                  <div className="p-3 text-sm">
                    <h4 className="font-bold text-base mb-2 text-[#047857]">{loc.location}</h4>
                    <div className="space-y-1">
                      <p><strong>Default Rate:</strong> <span className="text-[#047857] font-semibold">{loc.defaulterRate.toFixed(1)}%</span></p>
                      <p><strong>Defaulters:</strong> {loc.defaulterCount}</p>
                      <p className="text-xs text-gray-500 pt-1">🟢 LOW RISK</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10 text-xs">
        <p className="font-bold mb-2 text-[#1E293B]">Risk Zones</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
            <span>Critical (15%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
            <span>Medium (5-15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
            <span>Low (below 5%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

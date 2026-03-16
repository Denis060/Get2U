import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { MapPin, X } from "lucide-react";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

export interface SingleLocationMapProps {
  address: string;
  onLocationChange: (address: string, lat: number, lng: number) => void;
}

interface Coords { lat: number; lng: number }

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export default function SingleLocationMap({ address, onLocationChange }: SingleLocationMapProps) {
  const [coords, setCoords] = useState<Coords | null>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    const resolvedAddress = await reverseGeocode(lat, lng);
    setCoords({ lat, lng });
    onLocationChange(resolvedAddress, lat, lng);
  };

  const clear = () => {
    setCoords(null);
    onLocationChange("", 0, 0);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Click the map to set the car location</p>

      <div className="h-[300px] md:h-[360px] w-full rounded-lg overflow-hidden border border-border/50">
        <MapContainer center={[40.7128, -74.006]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {coords ? (
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>Car location</Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>

      {address ? (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
          <p className="flex-1 text-xs text-blue-800 line-clamp-2">{address}</p>
          <button type="button" onClick={clear} className="shrink-0 text-blue-500 hover:text-blue-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapPickerProps {
  pickupAddress: string;
  dropoffAddress: string;
  onPickupChange: (address: string, lat: number, lng: number) => void;
  onDropoffChange: (address: string, lat: number, lng: number) => void;
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

export default function MapPicker({ pickupAddress, dropoffAddress, onPickupChange, onDropoffChange }: MapPickerProps) {
  const [mode, setMode] = useState<"pickup" | "dropoff">("pickup");
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    if (mode === "pickup") {
      setPickupCoords({ lat, lng });
      onPickupChange(address, lat, lng);
    } else {
      setDropoffCoords({ lat, lng });
      onDropoffChange(address, lat, lng);
    }
  };

  const clearPickup = () => { setPickupCoords(null); onPickupChange("", 0, 0); };
  const clearDropoff = () => { setDropoffCoords(null); onDropoffChange("", 0, 0); };

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "pickup" ? "default" : "outline"}
          className={mode === "pickup" ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0" : "border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"}
          onClick={() => setMode("pickup")}
        >
          <MapPin className="mr-1 h-3 w-3" /> Set Pickup
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "dropoff" ? "default" : "outline"}
          className={mode === "dropoff" ? "bg-orange-500 hover:bg-orange-600 text-white border-0" : "border-orange-500/50 text-orange-600 hover:bg-orange-50"}
          onClick={() => setMode("dropoff")}
        >
          <MapPin className="mr-1 h-3 w-3" /> Set Drop-off
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {mode === "pickup" ? "Click the map to set pickup location" : "Click the map to set drop-off location"}
      </p>

      {/* Map */}
      <div className="h-[300px] md:h-[380px] w-full rounded-lg overflow-hidden border border-border/50">
        <MapContainer center={[40.7128, -74.006]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {pickupCoords ? (
            <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={greenIcon}>
              <Popup>Pickup</Popup>
            </Marker>
          ) : null}
          {dropoffCoords ? (
            <Marker position={[dropoffCoords.lat, dropoffCoords.lng]} icon={orangeIcon}>
              <Popup>Drop-off</Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>

      {/* Selected addresses */}
      {pickupAddress ? (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <p className="flex-1 text-xs text-emerald-800 line-clamp-2">{pickupAddress}</p>
          <button type="button" onClick={clearPickup} className="shrink-0 text-emerald-500 hover:text-emerald-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      {dropoffAddress ? (
        <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" />
          <p className="flex-1 text-xs text-orange-800 line-clamp-2">{dropoffAddress}</p>
          <button type="button" onClick={clearDropoff} className="shrink-0 text-orange-500 hover:text-orange-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

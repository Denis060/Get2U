import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

export interface LiveTrackingMapProps {
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
  carLocation?: string | null;
  agentLat?: number | null;
  agentLng?: number | null;
  agentName?: string | null;
}

interface GeocodedPoint {
  lat: number;
  lng: number;
}

const createColorIcon = (color: string, label: string) =>
  L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>
      <div style="background:${color};color:white;font-size:9px;font-weight:600;padding:1px 4px;border-radius:3px;white-space:nowrap">${label}</div>
    </div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 8],
  });

const agentIcon = L.divIcon({
  className: "",
  html: `<style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
  <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
    <div style="position:relative;width:16px;height:16px">
      <div style="position:absolute;inset:-4px;border-radius:50%;background:rgba(249,115,22,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>
      <div style="width:16px;height:16px;border-radius:50%;background:#f97316;border:2px solid white;box-shadow:0 2px 6px rgba(249,115,22,0.5)"></div>
    </div>
    <div style="background:#f97316;color:white;font-size:9px;font-weight:600;padding:1px 4px;border-radius:3px">Agent</div>
  </div>`,
  iconSize: [60, 36],
  iconAnchor: [30, 10],
});

const pickupIcon = createColorIcon("#22c55e", "Pickup");
const dropoffIcon = createColorIcon("#ef4444", "Drop-off");

async function geocodeAddress(address: string): Promise<GeocodedPoint | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

function MapBoundsUpdater({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(positions, { padding: [40, 40] });
  }, [positions, map]);
  return null;
}

export default function LiveTrackingMap({
  pickupAddress,
  dropoffAddress,
  carLocation,
  agentLat,
  agentLng,
  agentName: _agentName,
}: LiveTrackingMapProps) {
  const [pickupCoords, setPickupCoords] = useState<GeocodedPoint | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<GeocodedPoint | null>(null);
  const [carCoords, setCarCoords] = useState<GeocodedPoint | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const addressToGeocode = pickupAddress ?? carLocation;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsGeocoding(true);
      const tasks: Promise<void>[] = [];

      if (pickupAddress) {
        tasks.push(
          geocodeAddress(pickupAddress).then((coords) => {
            if (!cancelled) setPickupCoords(coords);
          })
        );
      }

      if (dropoffAddress) {
        tasks.push(
          geocodeAddress(dropoffAddress).then((coords) => {
            if (!cancelled) setDropoffCoords(coords);
          })
        );
      }

      if (carLocation && !pickupAddress) {
        tasks.push(
          geocodeAddress(carLocation).then((coords) => {
            if (!cancelled) setCarCoords(coords);
          })
        );
      }

      await Promise.all(tasks);
      if (!cancelled) setIsGeocoding(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [pickupAddress, dropoffAddress, carLocation, addressToGeocode]);

  const positions: [number, number][] = [];

  const resolvedPickup = pickupCoords ?? carCoords;
  if (resolvedPickup) positions.push([resolvedPickup.lat, resolvedPickup.lng]);
  if (dropoffCoords) positions.push([dropoffCoords.lat, dropoffCoords.lng]);
  if (agentLat != null && agentLng != null) positions.push([agentLat, agentLng]);

  const defaultCenter: [number, number] = [40.7128, -74.006];
  const center: [number, number] =
    positions.length > 0 ? positions[0] : defaultCenter;

  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      {isGeocoding && positions.length === 0 ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading map...
          </div>
        </div>
      ) : null}

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater positions={positions} />

        {resolvedPickup ? (
          <Marker
            position={[resolvedPickup.lat, resolvedPickup.lng]}
            icon={pickupIcon}
          />
        ) : null}

        {dropoffCoords ? (
          <Marker
            position={[dropoffCoords.lat, dropoffCoords.lng]}
            icon={dropoffIcon}
          />
        ) : null}

        {agentLat != null && agentLng != null ? (
          <Marker position={[agentLat, agentLng]} icon={agentIcon} />
        ) : null}
      </MapContainer>
    </div>
  );
}

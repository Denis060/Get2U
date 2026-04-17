import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, X, Navigation, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

function MapController({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, map, zoom]);
  return null;
}

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
  const { toast } = useToast();
  const [mode, setMode] = useState<"pickup" | "dropoff">("pickup");
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      const { latitude: lat, longitude: lng } = position.coords;
      const address = await reverseGeocode(lat, lng);
      
      setMapCenter([lat, lng]);
      
      if (mode === "pickup") {
        setPickupCoords({ lat, lng });
        onPickupChange(address, lat, lng);
      } else {
        setDropoffCoords({ lat, lng });
        onDropoffChange(address, lat, lng);
      }
      
      toast({ title: "Location updated", description: "Map centered on your current position." });
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Location error", 
        description: "Could not access your GPS. Please check permissions.",
        variant: "destructive" 
      });
    } finally {
      setIsLocating(null as any); // Reset to false
      setIsLocating(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        setMapCenter([latitude, longitude]);
        
        if (mode === "pickup") {
          setPickupCoords({ lat: latitude, lng: longitude });
          onPickupChange(display_name, latitude, longitude);
        } else {
          setDropoffCoords({ lat: latitude, lng: longitude });
          onDropoffChange(display_name, latitude, longitude);
        }
      } else {
        toast({ title: "No results", description: "Try a more specific address or city.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Search failed", description: "Could not connect to map service.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const clearPickup = () => { setPickupCoords(null); onPickupChange("", 0, 0); };
  const clearDropoff = () => { setDropoffCoords(null); onDropoffChange("", 0, 0); };

  return (
    <div className="space-y-3">
      {/* Mode toggle & GPS */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "pickup" ? "default" : "outline"}
            className={mode === "pickup" ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0" : "border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"}
            onClick={() => setMode("pickup")}
          >
            <MapPin className="mr-1 h-3 w-3" /> Pickup
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "dropoff" ? "default" : "outline"}
            className={mode === "dropoff" ? "bg-orange-500 hover:bg-orange-600 text-white border-0" : "border-orange-500/50 text-orange-600 hover:bg-orange-50"}
            onClick={() => setMode("dropoff")}
          >
            <MapPin className="mr-1 h-3 w-3" /> Drop-off
          </Button>
        </div>
        
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="bg-primary/10 text-primary hover:bg-primary/20 border-none"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Navigation className="mr-1 h-3 w-3" />}
          My Location
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <Input 
          placeholder="Search for an address or place..." 
          className="pl-9 pr-12 h-10 bg-muted/50 border-border/50 focus:bg-background transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Button 
          type="submit" 
          size="sm" 
          variant="ghost" 
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
          disabled={isSearching}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go"}
        </Button>
      </form>

      {/* Map */}
      <div className="relative h-[300px] md:h-[350px] w-full rounded-2xl overflow-hidden border border-border/50 shadow-inner">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} />
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
        
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1] bg-background/90 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm pointer-events-none">
           Tap map to place marker
        </div>
      </div>

      {/* Selected addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {pickupAddress && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-2.5 transition-all hover:bg-emerald-500/10">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
               <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="flex-1 text-[11px] text-emerald-900/80 leading-tight line-clamp-2 italic font-medium">"{pickupAddress}"</p>
            <button type="button" onClick={clearPickup} className="p-1 rounded-full hover:bg-emerald-500/20 text-emerald-500 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {dropoffAddress && (
          <div className="flex items-center gap-2 rounded-xl bg-orange-500/5 border border-orange-500/20 p-2.5 transition-all hover:bg-orange-500/10">
            <div className="h-7 w-7 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
               <MapPin className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <p className="flex-1 text-[11px] text-orange-900/80 leading-tight line-clamp-2 italic font-medium">"{dropoffAddress}"</p>
            <button type="button" onClick={clearDropoff} className="p-1 rounded-full hover:bg-orange-500/20 text-orange-500 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


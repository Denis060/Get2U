import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Loader2, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Geolocation } from "@capacitor/geolocation";

interface LocationSharingProps {
  orderId: string;
  isActive: boolean;
}

export default function LocationSharing({ orderId, isActive }: LocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postLocation = useCallback(
    (lat: number, lng: number) => {
      api.patch(`/api/orders/${orderId}/location`, { lat, lng }).catch(() => {
        // Silently fail on background updates
      });
    },
    [orderId]
  );

  const shareLocation = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      postLocation(position.coords.latitude, position.coords.longitude);
      setIsSharing(true);
      setError(null);
    } catch {
      setError("Location access denied or failed. Please enable location permissions.");
    }
  }, [postLocation]);

  const handleStartSharing = async () => {
    setIsLoading(true);
    await shareLocation();
    setIsLoading(false);
  };

  // Auto-update location once sharing is active
  useEffect(() => {
    if (!isSharing || !isActive) return;

    let watchId: string | null = null;
    
    const startWatching = async () => {
      try {
        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          (position, err) => {
            if (position) {
              postLocation(position.coords.latitude, position.coords.longitude);
            }
          }
        );
      } catch {
        setError("Background location tracking failed.");
      }
    };

    startWatching();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [isSharing, isActive, postLocation]);

  // Stop sharing when job becomes inactive
  useEffect(() => {
    if (!isActive) {
      setIsSharing(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="mb-3">
      {isSharing ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-700">
            Sharing your location with customer
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartSharing}
            disabled={isLoading}
            className="w-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-3.5 w-3.5" />
            )}
            {isLoading ? "Getting location..." : "Share My Location"}
          </Button>

          {error ? (
            <div className="flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

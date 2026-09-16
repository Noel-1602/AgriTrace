"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import type { Activity, Farm } from "@/lib/database.types";

interface FarmMapProps {
  farm: Farm | null;
  activities?: Activity[];
}

export function FarmMap({ farm, activities = [] }: FarmMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const farmLat = farm?.latitude;
  const farmLng = farm?.longitude;

  const validActivityCoords = activities
    .filter((a) => a.latitude != null && a.longitude != null)
    .map((a) => ({
      lat: a.latitude as number,
      lng: a.longitude as number,
      title: a.activity_type,
      date: a.activity_date,
    }));

  const hasCoordinates =
    (farmLat != null && farmLng != null) || validActivityCoords.length > 0;

  useEffect(() => {
    if (!hasCoordinates || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import("leaflet")).default;

        if (!isMounted || !mapContainerRef.current) return;

        // Cleanup existing map if any
        if (mapInstanceRef.current) {
          (mapInstanceRef.current as L.Map).remove();
          mapInstanceRef.current = null;
        }

        const centerLat = farmLat ?? validActivityCoords[0]?.lat ?? 8.5241;
        const centerLng = farmLng ?? validActivityCoords[0]?.lng ?? 76.9366;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Custom pin icons
        const farmIcon = L.divIcon({
          className: "custom-farm-pin",
          html: `
            <div style="background-color: #2d6a4f; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2px solid white;">
              <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const activityIcon = L.divIcon({
          className: "custom-activity-pin",
          html: `
            <div style="background-color: #52b788; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.15); border: 2px solid white;">
              <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -11],
        });

        const bounds = L.latLngBounds([]);

        if (farmLat != null && farmLng != null) {
          const farmMarker = L.marker([farmLat, farmLng], { icon: farmIcon }).addTo(map);
          farmMarker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
              <strong style="color: #1a3d2e;">${farm?.farm_name || "Farm Origin"}</strong><br/>
              <span style="color: #5c7364;">${[farm?.village, farm?.state].filter(Boolean).join(", ")}</span><br/>
              <span style="font-size: 11px; color: #8fa396;">${farmLat.toFixed(4)}° N, ${farmLng.toFixed(4)}° E</span>
            </div>
          `);
          bounds.extend([farmLat, farmLng]);
        }

        // Add activity markers
        validActivityCoords.forEach((act) => {
          const actMarker = L.marker([act.lat, act.lng], { icon: activityIcon }).addTo(map);
          actMarker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
              <strong style="color: #2d6a4f;">${act.title}</strong><br/>
              <span style="color: #5c7364;">Date: ${act.date}</span><br/>
              <span style="font-size: 10px; color: #8fa396;">${act.lat.toFixed(4)}° N, ${act.lng.toFixed(4)}° E</span>
            </div>
          `);
          bounds.extend([act.lat, act.lng]);
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }

        setMapLoaded(true);
      } catch (err) {
        console.error("Leaflet initialization failed", err);
        setLoadError(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hasCoordinates, farmLat, farmLng, farm?.farm_name, farm?.village, farm?.state, validActivityCoords]);

  if (!hasCoordinates || loadError) {
    return (
      <div className="rounded-xl border border-[#dfe8d8] bg-white p-5 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#e8f0e4] text-[#2d6a4f]">
          <MapPin className="size-5" />
        </div>
        <p className="mt-3 font-semibold text-[#1a3d2e]">{farm?.farm_name ?? "Farm Location"}</p>
        <p className="text-sm text-[#5c7364]">
          {[farm?.village, farm?.district, farm?.state].filter(Boolean).join(", ") || "Location information registered"}
        </p>
        {farmLat != null && farmLng != null && (
          <p className="mt-2 font-mono text-xs text-[#8fa396]">
            {farmLat.toFixed(4)}° N, {farmLng.toFixed(4)}° E
          </p>
        )}
      </div>
    );
  }

  const gmapsUrl = farmLat && farmLng ? `https://www.google.com/maps?q=${farmLat},${farmLng}` : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe8d8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#dfe8d8] bg-[#f8fbf6] px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-[#2d6a4f]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1a3d2e]">
            Farm & Cultivation Geolocation
          </span>
        </div>
        {gmapsUrl && (
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#2d6a4f] hover:underline"
          >
            Google Maps <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      <div className="relative">
        <div
          ref={mapContainerRef}
          className="h-[280px] w-full bg-[#f4f7f2]"
          style={{ zIndex: 1 }}
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f4f7f2] text-xs text-[#5c7364]">
            Loading interactive farm map…
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dfe8d8] bg-white px-4 py-2.5 text-xs text-[#5c7364]">
        <span>
          <strong>{farm?.farm_name}</strong> · {[farm?.village, farm?.state].filter(Boolean).join(", ")}
        </span>
        {farmLat != null && farmLng != null && (
          <span className="font-mono text-[#8fa396]">
            {farmLat.toFixed(4)}° N, {farmLng.toFixed(4)}° E
          </span>
        )}
      </div>
    </div>
  );
}

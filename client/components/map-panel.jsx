"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinned } from "lucide-react";

import { SectionCard } from "@/components/section-card";

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.querySelector('script[data-google-maps="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google.maps));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.dataset.googleMaps = "true";
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function MapPanel({ issues }) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !issues?.length || !mapRef.current) {
      return undefined;
    }

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapRef.current) {
          return;
        }

        const firstIssue = issues[0];
        const map = new maps.Map(mapRef.current, {
          center: { lat: firstIssue.location.lat, lng: firstIssue.location.lng },
          zoom: 12,
          disableDefaultUI: true,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#eaf2ff" }],
            },
          ],
        });

        issues.forEach((issue) => {
          new maps.Marker({
            position: { lat: issue.location.lat, lng: issue.location.lng },
            map,
            title: issue.title,
          });
        });

        setMapReady(true);
      })
      .catch(() => {
        setMapReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, issues]);

  return (
    <SectionCard>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Geospatial View
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Map of active civic issues
          </h3>
        </div>
        <div className="rounded-full border border-blue-100 bg-blue-50/70 px-4 py-2 text-sm font-semibold text-slate-600">
          {issues.length} markers
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="grid h-[240px] place-items-center rounded-2xl border border-dashed border-blue-200 bg-white/75 text-center sm:h-[300px]">
          <div className="max-w-sm px-6">
            <p className="text-xl font-semibold text-ink">No issues to map</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Apply a wider filter range or create a new issue to populate the map.
            </p>
          </div>
        </div>
      ) : apiKey ? (
        <div
          ref={mapRef}
          className="h-[240px] overflow-hidden rounded-2xl border border-blue-100 sm:h-[300px]"
        />
      ) : (
        <div className="grid h-[240px] place-items-center rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50 text-center sm:h-[300px]">
          <div className="max-w-md px-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-lagoon text-white">
              <MapPinned className="h-6 w-6" />
            </div>
            <p className="text-xl font-semibold text-ink">Google Maps API key missing</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to render live markers. The issue
              coordinates below still show precise reported locations for development.
            </p>
          </div>
        </div>
      )}

      {!mapReady && !apiKey && issues.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {issues.slice(0, 4).map((issue) => (
            <div key={issue._id} className="rounded-xl border border-blue-100 bg-white/90 p-4">
              <p className="text-sm font-semibold text-ink">{issue.title}</p>
              <p className="mt-1 text-sm text-slate-500">{issue.location.address}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}

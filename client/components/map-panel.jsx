"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, MapPinned } from "lucide-react";

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
  const mappableIssues = useMemo(
    () =>
      (issues || []).filter(
        (issue) =>
          typeof issue?.location?.lat === "number" &&
          Number.isFinite(issue.location.lat) &&
          typeof issue?.location?.lng === "number" &&
          Number.isFinite(issue.location.lng)
      ),
    [issues]
  );
  const primaryIssue = mappableIssues[0] || null;

  const buildFallbackEmbedUrl = (lat, lng) => {
    const delta = 0.01;
    const left = (lng - delta).toFixed(6);
    const right = (lng + delta).toFixed(6);
    const top = (lat + delta).toFixed(6);
    const bottom = (lat - delta).toFixed(6);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  const buildExternalMapUrl = (lat, lng) =>
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  useEffect(() => {
    if (!apiKey || !mappableIssues.length || !mapRef.current) {
      return undefined;
    }

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapRef.current) {
          return;
        }

        const firstIssue = mappableIssues[0];
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

        mappableIssues.forEach((issue) => {
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
  }, [apiKey, mappableIssues]);

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
          {mappableIssues.length} markers
        </div>
      </div>

      {mappableIssues.length === 0 ? (
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
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white/85">
          <div className="grid gap-4 p-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/40">
              <iframe
                title="Citizen complaint GPS location"
                src={buildFallbackEmbedUrl(primaryIssue.location.lat, primaryIssue.location.lng)}
                className="h-[240px] w-full border-0 sm:h-[300px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <div className="mb-2 flex items-center gap-2 text-blue-900">
                  <MapPinned className="h-4 w-4" />
                  <p className="text-sm font-semibold">Live GPS Tracking Mode</p>
                </div>
                <p className="text-xs leading-5 text-slate-700">
                  Showing exact complaint coordinates from citizen GPS submission.
                </p>
              </div>
              <div className="space-y-3">
                {mappableIssues.slice(0, 4).map((issue) => (
                  <div
                    key={issue._id}
                    className="rounded-xl border border-blue-100 bg-white px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-ink">{issue.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {issue.location?.address || "Address not provided"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {issue.location.lat.toFixed(6)}, {issue.location.lng.toFixed(6)}
                    </p>
                    <a
                      href={buildExternalMapUrl(issue.location.lat, issue.location.lng)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-lagoon hover:text-blue-700"
                    >
                      Open location
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!mapReady && !apiKey && mappableIssues.length > 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-3 text-xs text-slate-600">
          For richer multi-marker map UI, add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in
          `/client/.env.local`.
        </div>
      ) : null}
    </SectionCard>
  );
}

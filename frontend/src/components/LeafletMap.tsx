import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  type?: "farmer" | "collection" | "buyer";
  detail?: string;
}

interface LeafletMapProps {
  markers: MarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectable?: boolean;
}

const LeafletMapInner: React.FC<LeafletMapProps> = ({
  markers = [],
  center = [20.0, 73.8],
  zoom = 10,
  height = "340px",
  onMapClick,
  selectable = false,
}) => {
  const [L, setL] = useState<any>(null);
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      // Fix default Leaflet icon paths in Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setL(leaflet);
    });
  }, []);

  useEffect(() => {
    if (!L) return;

    const mapElement = document.getElementById("leaflet-map-container");
    if (!mapElement) return;

    // Clear any existing map instance on element
    (mapElement as any)._leaflet_id = null;

    const defaultCenter = markers.length > 0 && markers[0].lat && markers[0].lng
      ? [markers[0].lat, markers[0].lng]
      : center;

    const map = L.map("leaflet-map-container", {
      center: defaultCenter,
      zoom: zoom,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    // Custom icons
    const farmerIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: #285d3b; color: white; border: 2px solid white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌱</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const collectionIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: #ac540f; color: white; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; box-shadow: 0 3px 6px rgba(0,0,0,0.4); animation: pulse 2s infinite;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const buyerIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: #1e3a8a; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏢</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    markers.forEach((m) => {
      if (m.lat && m.lng) {
        const icon = m.type === "collection" ? collectionIcon : (m.type === "buyer" ? buyerIcon : farmerIcon);
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #1e293b; font-size: 13px;">${m.label}</strong>
            ${m.detail ? `<p style="color: #64748b; margin: 4px 0 0 0;">${m.detail}</p>` : ""}
          </div>
        `);
        bounds.extend([m.lat, m.lng]);
      }
    });

    if (selectable) {
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedCoord([lat, lng]);
        if (onMapClick) {
          onMapClick(lat, lng);
        }
      });
    }

    if (selectedCoord) {
      L.marker(selectedCoord).addTo(map).bindPopup("Selected Farm Location").openPopup();
      bounds.extend(selectedCoord);
    }

    if (markers.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      map.remove();
    };
  }, [L, markers, selectedCoord]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <div id="leaflet-map-container" style={{ width: "100%", height }} />
      {selectable && (
        <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium shadow-sm">
          Click anywhere on the map to pin coordinates
        </div>
      )}
    </div>
  );
};

export const LeafletMap = dynamic(() => Promise.resolve(LeafletMapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
      Loading OpenStreetMap Logistics Map...
    </div>
  ),
});

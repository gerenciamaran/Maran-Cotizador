"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet no resuelve bien las rutas de los íconos por defecto con bundlers
// como Turbopack/Webpack; se apunta directo a los assets servidos por unpkg.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER: [number, number] = [4.711, -74.0721]; // Bogotá

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// react-leaflet solo usa el prop `center` del MapContainer en el montaje
// inicial — cambiarlo después (ej. al buscar una dirección) no mueve el mapa
// por sí solo. Hay que llamar setView() a mano cuando la posición cambia.
function RecenterMap({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 16));
    }
  }, [position, map]);
  return null;
}

export function LocationPicker({
  initialLat,
  initialLng,
  onChange,
}: {
  initialLat?: number | null;
  initialLng?: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  function handlePick(lat: number, lng: number) {
    setPosition([lat, lng]);
    onChange(lat, lng);
  }

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`,
        { headers: { "Accept-Language": "es" } }
      );
      const results = await res.json();
      if (!results.length) {
        setSearchError("No se encontró esa dirección. Ajusta el pin manualmente.");
        return;
      }
      handlePick(Number(results[0].lat), Number(results[0].lon));
    } catch {
      setSearchError("No se pudo buscar la dirección. Ajusta el pin manualmente.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Busca una dirección o ciudad…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          {searching ? "Buscando…" : "Buscar"}
        </button>
      </div>
      {searchError && <p className="text-danger text-xs mb-2">{searchError}</p>}

      <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 16 : 12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          <RecenterMap position={position} />
          {position && <Marker position={position} icon={markerIcon} />}
        </MapContainer>
      </div>
      <p className="font-mono text-[11px] text-gray-500 mt-1.5">
        {position
          ? `Lat ${position[0].toFixed(6)}, Lng ${position[1].toFixed(6)}`
          : "Haz clic en el mapa para marcar la ubicación del sitio."}
      </p>
    </div>
  );
}

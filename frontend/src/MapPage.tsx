import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
mapboxgl.accessToken = TOKEN;

interface Place {
  name: string;
  type: string;
  category: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
}

interface SuggestionsResponse {
  places: Place[];
  tips: string[];
}

const typeColors: Record<string, string> = {
  restaurant: "#E74C3C",
  grocery: "#E67E22",
  religious: "#9B59B6",
  community: "#1ABC9C",
  government: "#3498DB",
  education: "#F1C40F",
  settlement: "#2ECC71",
  service: "#34495E",
};

const typeEmojis: Record<string, string> = {
  restaurant: "🍽️",
  grocery: "🛒",
  religious: "🕌",
  community: "🏘️",
  government: "🏛️",
  education: "📚",
  settlement: "🤝",
  service: "💼",
};

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Toronto");
  const [loading, setLoading] = useState(false);

  const cities = ["Toronto", "Mississauga", "Brampton", "Scarborough", "Oakville"];

  const fetchSuggestions = async (query?: string) => {
    setLoading(true);
    try {
      let url = `${API_URL}/suggestions/search?q=${encodeURIComponent(query || "restaurants")}&city=${selectedCity}`;
      const response = await fetch(url);
      const data: SuggestionsResponse = await response.json();
      setPlaces(data.places || []);
      setTips(data.tips || []);
      addMarkersToMap(data.places || []);
    } catch (err: any) {
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const addMarkersToMap = (placesData: Place[]) => {
    if (!mapRef.current) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    placesData.forEach((place) => {
      const color = typeColors[place.type] || "#E74C3C";
      const emoji = typeEmojis[place.type] || "📍";

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "300px" }).setHTML(`
        <div style="padding: 5px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">${emoji} ${place.name}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: white; background: ${color}; padding: 4px 8px; border-radius: 4px; display: inline-block;">${place.type.toUpperCase()}</p>
          <p style="margin: 8px 0; font-size: 13px; color: #444; line-height: 1.4;">${place.description}</p>
          <p style="margin: 0; font-size: 12px; color: #888;">📍 ${place.address}</p>
        </div>
      `);

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.innerHTML = `<div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        border: 3px solid white;
        cursor: pointer;
      ">${emoji}</div>`;

      new mapboxgl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
    });

    // Fit map to show all markers
    if (placesData.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      placesData.forEach((place) => bounds.extend([place.lng, place.lat]));
      mapRef.current.fitBounds(bounds, { padding: 80 });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchSuggestions(searchQuery);
    }
  };

  useEffect(() => {
    if (!TOKEN) {
      setError("Missing VITE_MAPBOX_TOKEN");
      return;
    }

    if (!mapboxgl.supported()) {
      setError("WebGL not supported");
      return;
    }

    if (!mapContainerRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-79.3832, 43.6532],
        zoom: 12,
      });

      mapRef.current = map;

      map.on("load", () => {
        map.resize();
        console.log("✅ Map fully loaded");
        setLoaded(true);
        // Don't fetch anything on load - wait for user to search
      });

      map.on("error", (e) => {
        console.error("❌ Mapbox error", e);
        setError(`Mapbox error: ${e.error?.message || "Unknown error"}`);
      });

      return () => map.remove();
    } catch (err: any) {
      setError(`Initialization error: ${err.message}`);
    }
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Search Bar */}
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          right: 15,
          zIndex: 9999,
        }}
      >
        <form onSubmit={handleSearch} style={{ 
          display: "flex", 
          gap: 8, 
          background: "white",
          padding: 10,
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          alignItems: "center",
        }}>
          <input
            type="text"
            placeholder="Search halal food, German restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              outline: "none",
              minWidth: 200,
            }}
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              background: "white",
              cursor: "pointer",
            }}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#95a5a6" : "#3498db",
              color: "white",
              cursor: loading ? "wait" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "..." : "Search"}
          </button>
        </form>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          zIndex: 1000,
          background: "white",
          padding: 15,
          borderRadius: 12,
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        }}
      >
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 600, color: "#333" }}>Legend</h4>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ 
              width: 28, 
              height: 28, 
              borderRadius: "50%", 
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}>
              {typeEmojis[type]}
            </div>
            <span style={{ fontSize: 13, textTransform: "capitalize", color: "#333", fontWeight: 500 }}>{type}</span>
          </div>
        ))}
      </div>

      {/* Tips Panel */}
      {tips.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: "white",
            padding: 15,
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            maxWidth: 300,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: 12 }}>Tips</h4>
          {tips.slice(0, 3).map((tip, i) => (
            <p key={i} style={{ fontSize: 11, margin: "0 0 8px 0", color: "#666" }}>
              • {tip}
            </p>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 20,
            zIndex: 1000,
            background: "rgba(255,0,0,0.8)",
            color: "white",
            padding: 20,
            borderRadius: 8,
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Loading Indicator */}
      {!loaded && !error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            background: "white",
            padding: 20,
            borderRadius: 8,
          }}
        >
          Loading Map...
        </div>
      )}

      {/* Results Count */}
      {loaded && places.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 20,
            zIndex: 1000,
            background: "white",
            padding: "8px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            fontSize: 12,
          }}
        >
          Found {places.length} places
        </div>
      )}

      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

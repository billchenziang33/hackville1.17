import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapPageProps {
  onBack: () => void;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

if (TOKEN) {
  mapboxgl.accessToken = TOKEN;
}

export default function MapPage({ onBack }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!TOKEN) {
      setError("Missing VITE_MAPBOX_TOKEN");
      return;
    }

    if (!mapboxgl.supported()) {
      setError("WebGL is not supported in this browser");
      return;
    }

    if (!mapContainerRef.current) return;

    // 🚫 防止重复初始化
    if (mapRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-79.3832, 43.6532], // Toronto
        zoom: 10,
      });

      mapRef.current = map;

      map.on("load", () => {
        map.resize();
        setLoaded(true);
        console.log("✅ Mapbox loaded");
      });

      map.on("error", (e) => {
        console.error("❌ Mapbox runtime error", e);
        setError(e.error?.message || "Unknown Mapbox error");
      });
    } catch (err: any) {
      console.error("❌ Mapbox init error", err);
      setError(err.message || "Map initialization failed");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* =========================
          🗺️ Map Layer
      ========================= */}
      <div
        ref={mapContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      />

      {/* =========================
          🎛️ UI Layer
      ========================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            pointerEvents: "auto",
            padding: "8px 14px",
            borderRadius: "999px",
            border: "none",
            background: "rgba(0,0,0,0.75)",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Return
        </button>

        {/* Loading Overlay */}
        {!loaded && !error && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              fontWeight: 600,
              pointerEvents: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Loading Map…
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: "rgba(200,0,0,0.9)",
              color: "white",
              padding: "14px 16px",
              fontWeight: 600,
            }}
          >
            Map Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}

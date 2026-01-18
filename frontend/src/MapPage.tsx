import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = TOKEN;

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

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
        style: "mapbox://styles/mapbox/light-v11",
        center: [-79.3832, 43.6532],
        zoom: 10,
      });

      map.on("load", () => {
        map.resize();
        console.log("✅ Map fully loaded");
        setLoaded(true);
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
    <div style={{ position: 'relative', width: "100%", height: "100vh" }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1000,
          background: 'rgba(255,0,0,0.8)',
          color: 'white',
          padding: '20px'
        }}>
          Error: {error}
        </div>
      )}
      {!loaded && !error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          background: 'white',
          padding: '10px'
        }}>
          Loading Map... (Token: {TOKEN ? "Present" : "Missing"})
        </div>
      )}
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

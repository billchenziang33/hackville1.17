import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapboxgl.supported()) {
      alert("WebGL not supported");
      return;
    }

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-79.3832, 43.6532],
      zoom: 10,
    });

    map.on("load", () => {
      map.resize();
      console.log("✅ Map fully loaded");
    });

    map.on("error", (e) => {
      console.error("❌ Mapbox error", e);
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}

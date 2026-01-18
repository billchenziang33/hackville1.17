import { useEffect, useState } from "react";
import MapPage from "./MapPage";
import UserPreferences from "./UserPreferences";

export default function App() {
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreferences(true);
    }, 3000); // 3 秒后显示 UserPreferences

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* 地图背景（始终存在） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <MapPage />
      </div>

      {/* 浮在地图上的 UserPreferences */}
      {showPreferences && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none", // 关键：不影响地图
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <UserPreferences
              onSubmit={(prefs) => {
                console.log("User preferences:", prefs);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

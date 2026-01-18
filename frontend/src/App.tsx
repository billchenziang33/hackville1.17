import { useState } from "react";
import IntroPage from "./IntroPage";
import SplitSelectionPage from "./SplitSelectionPage";
import CreateAccountPage from "./CreateAccountPage";
import LoginPage from "./LoginPage";
import UserPreferences from "./UserPreferences";
import MapPage from "./MapPage";

type Page =
  | "intro"
  | "split"
  | "createAccount"
  | "login"
  | "map";

function App() {
  const [page, setPage] = useState<Page>("intro");

  // 控制 User Preferences 是否作为 Overlay 出现
  const [showPreferencesOverlay, setShowPreferencesOverlay] = useState(false);

  // =========================
  // Intro Page
  // =========================
  if (page === "intro") {
    return (
      <IntroPage
        onGetStartedClick={() => {
          setPage("split");
        }}
      />
    );
  }

  // =========================
  // Split Selection Page
  // =========================
  if (page === "split") {
    return (
      <SplitSelectionPage
        onNewUserClick={() => {
          setPage("createAccount");
        }}
        onCurrentUserClick={() => {
          setPage("login");
        }}
        onPreviewMap={() => {
          setShowPreferencesOverlay(false);
          setPage("map");
        }}
        onBack={() => {
          setPage("intro");
        }}
      />
    );
  }

  // =========================
  // Create Account Page（新用户）
  // =========================
  if (page === "createAccount") {
    return (
      <CreateAccountPage
        onAccountCreated={() => {
          /**
           * 新用户注册成功：
           * 1. 进入 Map
           * 2. 3 秒后显示 UserPreferences Overlay
           */
          setPage("map");
          setShowPreferencesOverlay(false);

          setTimeout(() => {
            setShowPreferencesOverlay(true);
          }, 3000);
        }}
        onLoginClick={() => {
          setPage("login");
        }}
        onBack={() => {
          setPage("split");
        }}
      />
    );
  }

  // =========================
  // Login Page（老用户）
  // =========================
  if (page === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => {
          // ✅ 老用户：直接进 Map，不显示 Preferences
          setShowPreferencesOverlay(false);
          setPage("map");
        }}
        onCreateAccountClick={() => {
          setPage("createAccount");
        }}
        onBack={() => {
          setPage("split");
        }}
      />
    );
  }

  // =========================
  // Map Page（含 Overlay）
  // =========================
  if (page === "map") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        {/* Map 作为背景 */}
        <MapPage
          onBack={() => {
            setShowPreferencesOverlay(false);
            setPage("split");
          }}
        />

        {/* User Preferences Overlay（仅新用户） */}
        {showPreferencesOverlay && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(4px)",
              zIndex: 10,
            }}
          >
            <UserPreferences
              onSubmit={() => {
                setShowPreferencesOverlay(false);
              }}
              onBack={() => {
                setShowPreferencesOverlay(false);
                setPage("createAccount");
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;

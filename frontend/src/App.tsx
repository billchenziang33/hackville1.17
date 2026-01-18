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
  // Create Account Page
  // =========================
  if (page === "createAccount") {
    return (
      <CreateAccountPage
        onAccountCreated={() => {
          /**
           */
          setPage("map");
          setShowPreferencesOverlay(false);

          setTimeout(() => {
            setShowPreferencesOverlay(true);
          }, 1500);
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
  // Login Page
  // =========================
  if (page === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => {
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
  // Map Page
  // =========================
  if (page === "map") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        {/* Map  */}
        <MapPage
          onBack={() => {
            setShowPreferencesOverlay(false);
            setPage("split");
          }}
        />

        {/* User Preferences Overlay */}
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

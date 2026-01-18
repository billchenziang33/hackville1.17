import { useState } from "react";
import IntroPage from "./IntroPage";
import LoginPage from "./LoginPage";
import CreateAccountPage from "./CreateAccountPage";
import MapPage from "./MapPage";

function App() {
  const [currentView, setCurrentView] = useState<"intro" | "login" | "register" | "map">("intro");

  return (
    <>
      {currentView === "intro" && (
        <IntroPage onGetStartedClick={() => setCurrentView("login")} />
      )}
      {currentView === "login" && (
        <LoginPage
          onLoginSuccess={() => setCurrentView("map")}
          onCreateAccountClick={() => setCurrentView("register")}
          onBack={() => setCurrentView("intro")}
        />
      )}
      {currentView === "register" && (
        <CreateAccountPage
          onAccountCreated={() => setCurrentView("map")}
          onLoginClick={() => setCurrentView("login")}
          onBack={() => setCurrentView("login")}
        />
      )}
      {currentView === "map" && (
        <MapPage />
      )}
    </>
  );
}

export default App;

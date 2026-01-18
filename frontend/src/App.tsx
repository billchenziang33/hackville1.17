import { useState } from "react";
import IntroPage from "./IntroPage";
import SplitSelectionPage from "./SplitSelectionPage";
import CreateAccountPage from "./CreateAccountPage";
import LoginPage from "./LoginPage";
import MapPage from "./MapPage";

type Page =
  | "intro"
  | "split"
  | "createAccount"
  | "login"
  | "map";

function App() {
  const [page, setPage] = useState<Page>("intro");

  // Intro Page
  if (page === "intro") {
    return (
      <IntroPage
        onGetStartedClick={() => {
          setPage("split");
        }}
      />
    );
  }

  // Split Selection Page
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
          setPage("map");
        }}
        onBack={() => {
          setPage("intro");
        }}
      />
    );
  }

  // Create Account Page
  if (page === "createAccount") {
    return (
      <CreateAccountPage
        onAccountCreated={() => {
          setPage("map");
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

  // Login Page
  if (page === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => {
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

  // Map Page
  return (
    <MapPage
      onBack={() => {
        setPage("split");
      }}
    />
  );
}

export default App;

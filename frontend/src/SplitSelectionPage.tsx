import React from "react";
import { motion } from "framer-motion";

interface SplitSelectionPageProps {
  onPreviewMap: () => void;
  onNewUserClick: () => void;
  onCurrentUserClick: () => void;
  onBack: () => void; //
}

const SplitSelectionPage: React.FC<SplitSelectionPageProps> = ({
  onPreviewMap,
  onNewUserClick,
  onCurrentUserClick,
  onBack,
}) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ← Return to Intro */}
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 20,
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

      {/* Left Side - New User */}
      <motion.div
        whileHover={{ flex: 1.3 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #ff4d4d 0%, #b30000 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("New User Clicked");
          onNewUserClick();
        }}
      >
        <h2
          style={{
            fontSize: "3.5rem",
            color: "white",
            fontWeight: "800",
            textAlign: "center",
            textShadow: "0 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          New
          <br />
          User
        </h2>
      </motion.div>

      {/* Right Side - Current User */}
      <motion.div
        whileHover={{ flex: 1.3 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #ffffff 0%, #e6e9f0 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("Current User Clicked");
          onCurrentUserClick();
        }}
      >
        <h2
          style={{
            fontSize: "3.5rem",
            color: "#b30000",
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Current
          <br />
          User
        </h2>
      </motion.div>

      {/* Preview Map Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onPreviewMap}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 35px",
          background: "#1a1a1a",
          color: "white",
          border: "none",
          borderRadius: "50px",
          cursor: "pointer",
          zIndex: 10,
          fontWeight: "600",
          fontSize: "0.9rem",
          letterSpacing: "0.05em",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        PREVIEW MAP
      </motion.button>
    </div>
  );
};

export default SplitSelectionPage;

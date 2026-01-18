import React, { useState } from "react";
import { motion } from "framer-motion";

interface CreateAccountPageProps {
  onAccountCreated: () => void;
  onLoginClick: () => void;
  onBack: () => void;
}

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
  onAccountCreated,
  onLoginClick,
  onBack,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    onAccountCreated();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
        position: "relative",
      }}
    >
      {/* Back */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "none",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
          color: "#333",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontWeight: "600",
        }}
      >
        ← Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            color: "#CC0000",
            fontWeight: "800",
            marginBottom: "30px",
            textAlign: "center",
            fontSize: "2rem",
          }}
        >
          Join CanMap
        </h2>

        <form
          onSubmit={handleSignup}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label style={{ fontWeight: 600 }}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              style={inputStyle}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            style={{
              marginTop: "10px",
              padding: "14px",
              backgroundColor: "#CC0000",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Sign Up
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "1rem",
  boxSizing: "border-box",
};

export default CreateAccountPage;

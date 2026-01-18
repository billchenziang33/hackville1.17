import React, { useState } from "react";
import { motion } from "framer-motion";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onCreateAccountClick: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCreateAccountClick,
  onBack,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLoginSuccess();
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
          fontWeight: 600,
        }}
      >
        ← Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            color: "#CC0000",
            fontWeight: 800,
            marginBottom: "30px",
            textAlign: "center",
            fontSize: "2rem",
          }}
        >
          Welcome Back
        </h2>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "1rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "1rem",
              }}
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
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Login
          </motion.button>
        </form>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          Don&apos;t have an account?{" "}
          <span
            onClick={onCreateAccountClick}
            style={{
              color: "#CC0000",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Create Account
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

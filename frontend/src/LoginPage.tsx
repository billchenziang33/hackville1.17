import React, { useState } from "react";
import { motion } from "framer-motion";

interface LoginPageProps {
    onLoginSuccess: () => void;
    onCreateAccountClick: () => void;
    onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onCreateAccountClick, onBack }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Login failed");
            }

            const data = await response.json();
            console.log("Login successful, token:", data.access_token);
            // Ideally store the token here (e.g., localStorage.setItem('token', data.access_token))
            onLoginSuccess();
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: "600"
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
                <h2 style={{ color: "#CC0000", fontWeight: "800", marginBottom: "30px", textAlign: "center", fontSize: "2rem" }}>
                    Welcome Back
                </h2>

                {error && (
                    <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "10px",
                            padding: "14px",
                            backgroundColor: loading ? "#ccc" : "#CC0000",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </motion.button>
                </form>

                <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
                    Don't have an account?{" "}
                    <span
                        onClick={onCreateAccountClick}
                        style={{ color: "#CC0000", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Create Account
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from "react";
import { motion } from "framer-motion";

interface CreateAccountPageProps {
    onAccountCreated: () => void;
    onLoginClick: () => void;
}

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ onAccountCreated, onLoginClick }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Creating account with", username, email, password);
        // TODO: Implement actual signup logic
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
            }}
        >
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
                    Join CanMap
                </h2>

                <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                fontSize: "1rem",
                                boxSizing: 'border-box'
                            }}
                            placeholder="Choose a username"
                            required
                        />
                    </div>

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
                            placeholder="Create a password"
                            required
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

                <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
                    Already have an account?{" "}
                    <span
                        onClick={onLoginClick}
                        style={{ color: "#CC0000", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Login here
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateAccountPage;

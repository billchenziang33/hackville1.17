import React, { useState } from "react";
import { motion } from "framer-motion";

interface CreateAccountPageProps {
    onAccountCreated: () => void;
    onLoginClick: () => void;
    onBack: () => void;
}

interface UserData {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    lastUpdated: string;
    preferences: {
        language: string;
        theme: string;
        notifications: boolean;
        culturalBackground?: string;
        needs?: string[];
    };
    appInfo: {
        name: string;
        version: string;
        exportDate: string;
    };
}

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
                                                                 onAccountCreated,
                                                                 onLoginClick,
                                                                 onBack,
                                                             }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const downloadUserProfile = (userData: UserData) => {
        const jsonString = JSON.stringify(userData, null, 2); // null, 2 是美化格式

        const blob = new Blob([jsonString], { type: "application/json" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // 4. 设置文件名（用户名+时间戳）
        const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const filename = `CanMap_Profile_${username}_${timestamp}.json`;
        link.download = filename;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return filename;
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim()) {
            alert("Please fill in all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }

        const now = new Date();
        const userData: UserData = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: username.trim(),
            email: email.trim(),
            createdAt: now.toISOString(),
            lastUpdated: now.toISOString(),
            preferences: {
                language: "en",
                theme: "light",
                notifications: true,
                culturalBackground: "",
                needs: [],
            },
            appInfo: {
                name: "CanMap - Community Access Hub",
                version: "1.0.0",
                exportDate: now.toISOString(),
            },
        };


        localStorage.setItem("canmap_current_user", JSON.stringify(userData));
        localStorage.setItem("canmap_user_email", email);
        localStorage.setItem("canmap_user_logged_in", "true");

        const existingUsers = localStorage.getItem("canmap_all_users");
        if (existingUsers) {
            const users = JSON.parse(existingUsers);
            users.push(userData);
            localStorage.setItem("canmap_all_users", JSON.stringify(users));
        } else {
            localStorage.setItem("canmap_all_users", JSON.stringify([userData]));
        }

        const filename = downloadUserProfile(userData);

        alert(`✅ Account created successfully!\n\nYour profile has been:\n1. Saved in your browser\n2. Downloaded as: ${filename}\n\nYou can import this file later if needed.`);

        console.log("=== USER PROFILE CREATED ===");
        console.log("📁 File downloaded:", filename);
        console.log("👤 User:", userData.username);
        console.log("📧 Email:", userData.email);
        console.log("🆔 ID:", userData.id);
        console.log("💾 Also saved to localStorage");
        console.log("=============================");

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
                        marginBottom: "15px",
                        textAlign: "center",
                        fontSize: "2rem",
                    }}
                >
                    Join CanMap
                </h2>

                <div style={{
                    backgroundColor: "#f0f7ff",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "20px",
                    borderLeft: "4px solid #4dabf7",
                }}>
                    <p style={{
                        fontSize: "14px",
                        color: "#1864ab",
                        margin: 0,
                        lineHeight: "1.5",
                    }}>
                        <strong>🔐 Local-First Account</strong><br/>
                        Your profile will be:
                        <ol style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                            <li>Saved in your browser</li>
                            <li>Downloaded as a JSON file</li>
                            <li>Accessible offline</li>
                        </ol>
                    </p>
                </div>

                <form
                    onSubmit={handleSignup}
                    style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                    <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                            Username <span style={{ color: "#666", fontSize: "12px" }}>(for display)</span>
                        </label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g., alex_canada"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                            Email <span style={{ color: "#666", fontSize: "12px" }}>(for recovery)</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                            Password <span style={{ color: "#666", fontSize: "12px" }}>(min 6 characters)</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={inputStyle}
                            required
                            minLength={6}
                        />
                    </div>

                    <div style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
                        By signing up, you agree to store your data locally on this device.
                        No data is sent to external servers.
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        style={{
                            marginTop: "5px",
                            padding: "14px",
                            backgroundColor: "#CC0000",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                    >
                        <span>📥</span> Sign Up & Download Profile
                    </motion.button>
                </form>

                <div style={{ marginTop: "25px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                    <button
                        onClick={() => {
                            // 显示当前保存的用户信息
                            const currentUser = localStorage.getItem("canmap_current_user");
                            const allUsers = localStorage.getItem("canmap_all_users");

                            if (currentUser) {
                                const user = JSON.parse(currentUser);
                                console.log("🔍 Current user from localStorage:", user);
                                alert(`Currently logged in as: ${user.username}\nEmail: ${user.email}\nCheck console for full profile.`);
                            } else {
                                alert("No user is currently logged in.");
                            }

                            if (allUsers) {
                                console.log("👥 All saved users:", JSON.parse(allUsers));
                            }
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#666",
                            fontSize: "12px",
                            cursor: "pointer",
                            textDecoration: "underline",
                            display: "block",
                            margin: "0 auto",
                        }}
                    >
                        View Saved Profile Info
                    </button>

                    <p style={{ fontSize: "11px", color: "#888", textAlign: "center", marginTop: "10px" }}>
                        Your JSON file contains your profile data. Keep it safe!
                    </p>
                </div>
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
    backgroundColor: "#fafafa",
};

export default CreateAccountPage;
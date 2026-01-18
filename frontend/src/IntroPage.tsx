import React from "react";
import { motion } from "framer-motion";

interface IntroPageProps {
    onGetStartedClick: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onGetStartedClick }) => {
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Clean Background with subtle gradient */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)",
                    zIndex: 0
                }}
            />

            {/* Main Content */}
            <div style={{ zIndex: 1, textAlign: "center", padding: "20px" }}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        fontSize: "4rem",
                        marginBottom: "1rem",
                        fontWeight: "800",
                        color: "#CC0000", // Canada Red
                        letterSpacing: "-0.02em"
                    }}
                >
                    CanMap
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{
                        fontSize: "1.2rem",
                        color: "#555",
                        marginBottom: "3rem",
                        maxWidth: "400px",
                        lineHeight: "1.5"
                    }}
                >
                    Simple, reliable mapping for everyone.
                </motion.p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onGetStartedClick}
                    style={{
                        padding: "16px 48px",
                        fontSize: "1.1rem",
                        borderRadius: "50px",
                        border: "none",
                        backgroundColor: "#CC0000",
                        color: "white",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(204, 0, 0, 0.3)",
                        fontWeight: "600",
                        letterSpacing: "0.05em"
                    }}
                >
                    Get Started
                </motion.button>
            </div>
        </div>
    );
};

export default IntroPage;

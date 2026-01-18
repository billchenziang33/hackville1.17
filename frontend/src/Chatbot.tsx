// frontend/src/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

interface Place {
    name: string;
    type: string;
    description: string;
    address: string;
    lat: number;
    lng: number;
}

interface ChatbotProps {
    onPlaceSelect?: (place: Place) => void;
    userCity?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ onPlaceSelect, userCity = 'Toronto' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm your AccessHub assistant. Ask me anything like: 'Where can I find a walk-in clinic?' or 'I need help finding food banks.'",
            sender: 'bot'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setInputText('');

        const newUserMessage: Message = {
            id: Date.now(),
            text: userMessage,
            sender: 'user'
        };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/suggestions/chat?message=${encodeURIComponent(userMessage)}&city=${userCity}`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const botMessage: Message = {
                id: Date.now() + 1,
                text: data.response,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);

            if (data.places && data.places.length > 0 && onPlaceSelect) {
                console.log('Chatbot suggested places:', data.places);
                onPlaceSelect(data.places[0]);
            }

        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Sorry, there was an error connecting to the assistant. Please try again.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: Date.now(),
                text: "Chat cleared. How can I help you today?",
                sender: 'bot'
            }
        ]);
    };

    const styles = {
        toggleButton: {
            position: 'fixed' as const,
            bottom: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
        },
        container: {
            position: 'fixed' as const,
            bottom: '80px',
            right: '20px',
            width: '380px',
            maxWidth: '90vw',
            height: '550px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column' as const,
            zIndex: 9999,
            overflow: 'hidden' as const,
            border: '1px solid #e1e5e9',
        },
        header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        messages: {
            flex: 1,
            padding: '20px',
            overflowY: 'auto' as const,
            background: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px',
        },
        inputArea: {
            borderTop: '1px solid #e1e5e9',
            padding: '16px',
            background: 'white',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end' as const,
        },
        message: {
            maxWidth: '85%',
            display: 'flex',
            flexDirection: 'column' as const,
        },
        userMessage: {
            alignSelf: 'flex-end' as const,
        },
        botMessage: {
            alignSelf: 'flex-start' as const,
        },
        messageContent: {
            padding: '12px 16px',
            borderRadius: '18px',
            wordWrap: 'break-word' as const,
            lineHeight: 1.5,
        },
        userContent: {
            background: '#667eea',
            color: 'white',
            borderBottomRightRadius: '4px',
        },
        botContent: {
            background: 'white',
            color: '#333',
            border: '1px solid #e1e5e9',
            borderBottomLeftRadius: '4px',
        },
        sender: {
            fontSize: '12px',
            color: '#6c757d',
            marginTop: '4px',
            padding: '0 4px',
        },
        textarea: {
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            resize: 'none' as const,
            fontSize: '14px',
            lineHeight: 1.5,
            minHeight: '44px',
            maxHeight: '100px',
            fontFamily: 'inherit',
        },
        sendButton: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            cursor: 'pointer' as const,
            fontWeight: 600,
            fontSize: '14px',
            height: '44px',
            minWidth: '70px',
        },
        clearButton: {
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
        },
        closeButton: {
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold' as const,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        typingIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '12px 16px',
        },
        typingDot: {
            width: '8px',
            height: '8px',
            background: '#6c757d',
            borderRadius: '50%',
            opacity: 0.6,
            animation: 'typing 1.4s infinite both',
        },
    };

    return (
        <>
            {!isOpen && (
                <button
                    style={styles.toggleButton}
                    onClick={() => setIsOpen(true)}
                    aria-label="Open chatbot"
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                >
                    <span>💬</span> Ask Assistant
                </button>
            )}

            {isOpen && (
                <div style={styles.container}>
                    <div style={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>💬</span>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>AccessHub Assistant</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                onClick={handleClearChat}
                                style={styles.clearButton}
                                title="Clear chat"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={styles.closeButton}
                                aria-label="Close chatbot"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div style={styles.messages}>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    ...styles.message,
                                    ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage)
                                }}
                            >
                                <div style={{
                                    ...styles.messageContent,
                                    ...(msg.sender === 'user' ? styles.userContent : styles.botContent)
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{
                                    ...styles.sender,
                                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                                }}>
                                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ ...styles.message, ...styles.botMessage }}>
                                <div style={styles.typingIndicator}>
                                    <span style={{ ...styles.typingDot, animationDelay: '0s' }}></span>
                                    <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}></span>
                                    <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.inputArea}>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question here... (e.g., I'm sick, where can I find help?)"
                disabled={isLoading}
                rows={2}
                style={{
                    ...styles.textarea,
                    ...(isLoading ? { background: '#f8f9fa', cursor: 'not-allowed' } : {})
                }}
            />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !inputText.trim()}
                            style={{
                                ...styles.sendButton,
                                ...((isLoading || !inputText.trim()) ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                            }}
                        >
                            {isLoading ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-5px); }
        }
        
        /* 滚动条样式 */
        div[style*="overflowY: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        div[style*="overflowY: auto"]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
      `}</style>
        </>
    );
};

export default Chatbot;
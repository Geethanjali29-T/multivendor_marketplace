import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { api } from '../services/api';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { sender: 'bot', text: 'Hello! Welcome to TradeLink. How can I assist you today with our marketplace?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll to bottom
    const messagesEndRef = useRef(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory, isOpen]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = message.trim();
        setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
        setMessage('');
        setIsTyping(true);

        try {
            // Send to our backend mock endpoint
            const res = await api.sendChatMessage(userMsg);
            setChatHistory(prev => [...prev, { sender: 'bot', text: res.response }]);
        } catch (e) {
            console.error("Chat error", e);
            setChatHistory(prev => [...prev, {
                sender: 'bot',
                text: "I'm sorry, I'm having trouble connecting to my servers right now. Please try again later!"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={styles.container}>
            {!isOpen && (
                <button style={styles.toggleButton} onClick={() => setIsOpen(true)}>
                    <MessageSquare size={24} color="white" />
                </button>
            )}

            {isOpen && (
                <div style={styles.chatWindow}>
                    <div style={styles.header}>
                        <div style={styles.headerInfo}>
                            <div style={styles.avatar}>
                                <MessageSquare size={16} color="var(--brand-primary)" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>TradeLink</h4>
                                <p style={{ margin: 0, fontSize: '0.65rem', color: '#cbd5e1', letterSpacing: '0.05em' }}>ONLINE CONCIERGE</p>
                            </div>
                        </div>
                        <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <X size={18} color="white" />
                        </button>
                    </div>

                    <div style={styles.body}>
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={msg.sender === 'user' ? styles.messageWrapperRight : styles.messageWrapperLeft}>
                                <div style={msg.sender === 'user' ? styles.messageSender : styles.messageReceiver}>
                                    <p style={{ margin: 0 }}>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={styles.messageWrapperLeft}>
                                <div style={{ ...styles.messageReceiver, fontStyle: 'italic', color: '#94a3b8' }}>
                                    <p style={{ margin: 0 }}>Typing...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            style={styles.input}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button style={styles.sendBtn} onClick={handleSend} disabled={isTyping}>
                            <Send size={18} color={isTyping ? "#cbd5e1" : "var(--brand-primary)"} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
    },
    toggleButton: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'var(--brand-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    chatWindow: {
        width: '350px',
        height: '500px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        backgroundColor: 'var(--brand-primary)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white',
    },
    headerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    avatar: {
        width: '32px',
        height: '32px',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
    },
    body: {
        flex: 1,
        padding: '16px',
        backgroundColor: '#f8fafc',
        overflowY: 'auto',
    },
    messageReceiver: {
        backgroundColor: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        borderBottomLeftRadius: '0',
        fontSize: '0.85rem',
        color: 'var(--text-main)',
        border: '1px solid #e2e8f0',
        maxWidth: '85%',
        alignSelf: 'flex-start',
    },
    messageSender: {
        backgroundColor: 'var(--brand-primary)',
        padding: '12px 16px',
        borderRadius: '12px',
        borderBottomRightRadius: '0',
        fontSize: '0.85rem',
        color: 'white',
        maxWidth: '85%',
    },
    messageWrapperLeft: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '12px',
    },
    messageWrapperRight: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '12px',
    },
    inputArea: {
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderTop: '1px solid #e2e8f0',
    },
    input: {
        flex: 1,
        padding: '10px 16px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        outline: 'none',
        fontSize: '0.85rem',
    },
    sendBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
};

export default ChatbotWidget;

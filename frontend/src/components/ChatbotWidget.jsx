import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Plus, History, Sparkles } from 'lucide-react';
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
        const handleOpenChat = (event) => {
            setIsOpen(true);
            if (event.detail && event.detail.message) {
                const incomingMsg = event.detail.message;
                setChatHistory(prev => [...prev, { sender: 'user', text: incomingMsg }]);
                // Trigger auto-response for the incoming message
                processResponse(incomingMsg);
            }
        };
        window.addEventListener('openChatbot', handleOpenChat);
        return () => window.removeEventListener('openChatbot', handleOpenChat);
    }, []);

    const processResponse = async (userMsg) => {
        setIsTyping(true);
        try {
            const res = await api.sendChatMessage(userMsg);
            setChatHistory(prev => [...prev, { sender: 'bot', text: res.response }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { sender: 'bot', text: "Service temporary unavailable. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory, isOpen]);

    useEffect(() => {
        // Expose openChat to window for external triggers
        window.openChat = (initialMsg) => {
            setIsOpen(true);
            if (initialMsg) {
                setChatHistory(prev => [...prev, { sender: 'user', text: initialMsg }]);
                processResponse(initialMsg);
            }
        };
        // Cleanup function for window.openChat if component unmounts
        return () => {
            if (window.openChat) {
                delete window.openChat;
            }
        };
    }, []); // Run once on mount to expose the function

    const handleSend = async () => {
        if (!message.trim()) return;
        const userMsg = message.trim();
        setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
        setMessage('');
        await processResponse(userMsg);
    };

    const handleNewChat = () => {
        setChatHistory([
            { sender: 'bot', text: 'Hello! I am ready for a new conversation. How can I help you today?' }
        ]);
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
                    {/* Sidebar */}
                    <div style={styles.sidebar}>
                        <button style={styles.newChatBtn} onClick={handleNewChat}>
                            <Plus size={18} /> New Chat
                        </button>
                        
                        <div style={styles.sidebarLabel}>RECENT CONVERSATIONS</div>
                        <div style={styles.historyList}>
                            <div style={styles.historyItem}><History size={14} /> Previous Inquiry</div>
                            <div style={styles.historyItem}><History size={14} /> Product Search</div>
                            <div style={styles.historyItem}><History size={14} /> Order Tracking</div>
                        </div>

                        <div style={styles.sidebarFooter}>
                            <div style={styles.userProfile}>
                                <div style={styles.userAvatar}>JD</div>
                                <span>Guest User</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div style={styles.mainArea}>
                        <div style={styles.header}>
                            <div style={styles.headerInfo}>
                                <div style={styles.avatar}>
                                    <Sparkles size={16} color="var(--brand-primary)" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>TradeLink AI</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#cbd5e1' }}>Online Assistance</p>
                                    </div>
                                </div>
                            </div>
                            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                <X size={20} color="white" />
                            </button>
                        </div>

                        <div style={styles.body}>
                            {chatHistory.map((msg, i) => (
                                <div key={i} style={msg.sender === 'user' ? styles.messageWrapperRight : styles.messageWrapperLeft}>
                                    <div style={msg.sender === 'user' ? styles.messageSender : styles.messageReceiver}>
                                        <p style={{ margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div style={styles.messageWrapperLeft}>
                                    <div style={{ ...styles.messageReceiver, fontStyle: 'italic', color: '#94a3b8' }}>
                                        <p style={{ margin: 0 }}>AI is thinking...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={styles.inputArea}>
                            <div style={styles.inputContainer}>
                                <input
                                    type="text"
                                    placeholder="Message TradeLink AI..."
                                    style={styles.input}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button style={styles.sendBtn} onClick={handleSend} disabled={isTyping || !message.trim()}>
                                    <Send size={18} color={isTyping || !message.trim() ? "#cbd5e1" : "var(--brand-primary)"} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
                                TradeLink AI can make mistakes. Check important info.
                            </p>
                        </div>
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    chatWindow: {
        width: '900px',
        height: '700px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    sidebar: {
        width: '260px',
        backgroundColor: '#202123',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
    },
    newChatBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #4d4d4f',
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginBottom: '20px',
    },
    sidebarLabel: {
        fontSize: '0.7rem',
        color: '#8e8ea0',
        fontWeight: 600,
        marginBottom: '12px',
        paddingLeft: '4px',
    },
    historyList: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    historyItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#ececf1',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    sidebarFooter: {
        borderTop: '1px solid #4d4d4f',
        paddingTop: '16px',
    },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.9rem',
    },
    userAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '4px',
        backgroundColor: '#ab68ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    mainArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: 'var(--brand-primary)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white',
    },
    headerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        backgroundColor: 'white',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    closeBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        opacity: 0.8,
        transition: 'opacity 0.2s',
    },
    body: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    messageReceiver: {
        backgroundColor: 'white',
        padding: '14px 18px',
        borderRadius: '16px',
        borderBottomLeftRadius: '2px',
        fontSize: '0.95rem',
        color: '#334155',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
        border: '1px solid #e5e7eb',
        maxWidth: '80%',
    },
    messageSender: {
        backgroundColor: 'var(--brand-primary)',
        padding: '14px 18px',
        borderRadius: '16px',
        borderBottomRightRadius: '2px',
        fontSize: '0.95rem',
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '80%',
    },
    messageWrapperLeft: {
        display: 'flex',
        justifyContent: 'flex-start',
    },
    messageWrapperRight: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    inputArea: {
        padding: '24px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white',
    },
    inputContainer: {
        maxWidth: '768px',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
        padding: '4px 8px',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        border: 'none',
        outline: 'none',
        fontSize: '1rem',
        backgroundColor: 'transparent',
    },
    sendBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    }
};

export default ChatbotWidget;

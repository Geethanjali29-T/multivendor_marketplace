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
    const [searchResults, setSearchResults] = useState([]); // Array of product objects

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
        setSearchResults([]); // Reset results for new query
        
        // Simulating network delay for a more premium "AI" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        const input = userMsg.toLowerCase();
        let response = "";
        let foundProducts = [];

        // Check for product search intent
        const categories = ['mobiles', 'fashion', 'electronics', 'appliances', 'home & kitchen', 'beauty', 'sports', 'toys', 'grocery', 'healthcare', 'education'];
        const matchedCategory = categories.find(cat => input.includes(cat));
        const isPriceSearch = input.includes("price") || input.includes("cheap") || input.includes("low") || input.includes("expensive") || input.includes("high");

        if (matchedCategory || isPriceSearch) {
            try {
                const allProducts = await api.getProducts();
                let filtered = allProducts;

                // 1. Category Filter
                if (matchedCategory) {
                    filtered = filtered.filter(p => p.category?.toLowerCase().includes(matchedCategory));
                }

                // 2. Price Filter/Sort
                if (input.includes("low") || input.includes("cheap")) {
                    filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                } else if (input.includes("high") || input.includes("expensive")) {
                    filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                }

                foundProducts = filtered.slice(0, 3); // Top 3 results
                
                if (foundProducts.length > 0) {
                    const catName = matchedCategory ? matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1) : "premium items";
                    response = `I found some ${input.includes("low") || input.includes("cheap") ? "budget-friendly" : "high-end"} ${catName} for you. Take a look!`;
                    setSearchResults(foundProducts);
                } else {
                    response = "I couldn't find any products matching those specific criteria. Would you like to see our latest arrivals instead?";
                }
            } catch (err) {
                console.error("Search failed", err);
                response = "I'm having a bit of trouble accessing the product catalog right now. Please try again in a moment.";
            }
        } else if (input.includes("motto") || input.includes("mission") || input.includes("purpose")) {
            response = "Our motto is: 'Bridging local businesses with global digital standards.' We empower merchants with premium digital storefronts.";
        } else if (input.includes("tradelink") || input.includes("what is this") || input.includes("project")) {
            response = "TradeLink is a high-end multi-vendor marketplace designed to bring professional digital standards to local commerce.";
        } else if (input.includes("vendor") || input.includes("seller") || input.includes("register")) {
            response = "Vendors can register via the 'Merchant Portal' and set up their premium shops. Registration requires a simple verification process.";
        } else if (input.includes("secure") || input.includes("safe") || input.includes("payment")) {
            response = "Yes, TradeLink uses industry-standard security and encrypted payment gateways like Razorpay to ensure all transactions are protected.";
        } else if (input.includes("ai") || input.includes("support")) {
            response = "Our AI Online Concierge provides real-time support, personalized product recommendations, and automated notifications for a premium buyer experience.";
        } else if (input.includes("buyer") || input.includes("customer") || input.includes("shop")) {
            response = "As a buyer, you can explore premium local brands, enjoy a secure checkout experience, and receive AI-powered personalized notifications.";
        } else if (input.includes("how it works") || input.includes("feature")) {
            response = "TradeLink bridges the gap between local shops and digital shoppers using advanced search, personalized AI support, and robust role-based dashboards.";
        } else if (input.includes("hi") || input.includes("hello") || input.includes("hey")) {
            response = "Hello! I'm your TradeLink concierge. How can I guide you through our premium marketplace today?";
        } else {
            response = "I'm specialized in TradeLink's ecosystem and motto. Could you ask me about our mission, or how vendors and buyers benefit from our platform?";
        }

        setChatHistory(prev => [...prev, { 
            sender: 'bot', 
            text: response, 
            products: foundProducts.length > 0 ? foundProducts : null 
        }]);
        setIsTyping(false);
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

    const handleSend = async (customMsg) => {
        const msgToSend = typeof customMsg === 'string' ? customMsg : message;
        if (!msgToSend.trim()) return;
        
        const userMsg = msgToSend.trim();
        setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
        setMessage('');
        await processResponse(userMsg);
    };

    const handleNewChat = () => {
        setChatHistory([
            { sender: 'bot', text: 'Hello! I am ready for a new conversation. How can I help you today?' }
        ]);
    };

    const faqs = [
        "What is TradeLink's Motto?",
        "How do I register as a Vendor?",
        "Is the marketplace secure?",
        "How does AI support work?"
    ];

    return (
        <div style={styles.container}>
            {!isOpen && (
                <button 
                    style={styles.toggleButton} 
                    className="ag-float-deluxe ag-mesh-bg" 
                    onClick={() => setIsOpen(true)}
                >
                    <div style={styles.toggleGlow}></div>
                    <Sparkles size={30} color="white" fill="white" style={{ position: 'relative', zIndex: 2 }} />
                </button>
            )}

            {isOpen && (
                <div style={styles.chatWindow} className="ag-slide-up-deluxe">
                    {/* Header */}
                    <div style={styles.header} className="ag-mesh-bg">
                        <div style={styles.headerInfo}>
                            <div style={styles.avatar}>
                                <Sparkles size={20} color="white" fill="white" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>TradeLink</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Online Concierge</p>
                                </div>
                            </div>
                        </div>
                        <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <X size={18} color="white" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div style={styles.mainArea}>
                        <div style={styles.body} className="premium-scroll">
                            {chatHistory.map((msg, i) => (
                                <div key={i} style={msg.sender === 'user' ? styles.messageWrapperRight : styles.messageWrapperLeft} className="ag-message-deluxe">
                                    <div style={msg.sender === 'user' ? styles.messageSender : styles.messageReceiver}>
                                        <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.9rem' }}>{msg.text}</p>
                                        
                                        {/* Inline Product Showcase */}
                                        {msg.products && (
                                            <div style={styles.productShowcase}>
                                                {msg.products.map((p, idx) => (
                                                    <div key={idx} style={styles.miniProductCard} onClick={() => window.location.href = `/?search=${p.name}`}>
                                                        <img src={p.image} alt={p.name} style={styles.miniProductImg} />
                                                        <div style={styles.miniProductInfo}>
                                                            <div style={styles.miniProductName}>{p.name}</div>
                                                            <div style={styles.miniProductPrice}>₹{p.price}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {/* FAQ Chips - Only show at the start */}
                            {chatHistory.length === 1 && (
                                <div style={styles.faqContainer}>
                                    <p style={styles.faqTitle}>Frequently Asked Questions</p>
                                    <div style={styles.faqGrid}>
                                        {faqs.map((faq, idx) => (
                                            <button key={idx} style={styles.faqChip} onClick={() => handleSend(faq)}>
                                                {faq}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isTyping && (
                                <div style={styles.messageWrapperLeft} className="ag-message-deluxe">
                                    <div style={styles.messageReceiver}>
                                        <div className="ag-thinking-wave">
                                            <div className="ag-dot-wave"></div>
                                            <div className="ag-dot-wave"></div>
                                            <div className="ag-dot-wave"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={styles.inputArea}>
                            <div style={styles.inputContainer}>
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    style={styles.input}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button style={styles.sendBtn} onClick={() => handleSend()} disabled={isTyping || !message.trim()} className="ag-mesh-bg">
                                    <Send size={18} color="white" />
                                </button>
                            </div>
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
        fontFamily: "'Outfit', sans-serif",
    },
    toggleButton: {
        width: '68px',
        height: '68px',
        borderRadius: '24px',
        background: 'var(--ag-gradient-mesh)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(79, 70, 229, 0.3)',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.2)',
        position: 'relative',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
    },
    toggleGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
        animation: 'ag-pulse-glow 3s infinite',
    },
    chatWindow: {
        width: '400px',
        height: '520px',
        background: '#ffffff',
        borderRadius: '32px',
        boxShadow: '0 30px 90px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)',
    },
    header: {
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--ag-gradient-mesh)',
        position: 'relative',
    },
    headerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    closeBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    mainArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #ffffff 0%, #f1f5f9 100%)',
        minHeight: 0, // CRITICAL: Allows flex child to shrink/scroll
        overflow: 'hidden',
    },
    body: {
        flex: 1,
        padding: '28px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: 0, // CRITICAL: Ensures this area is the one that scrolls
    },
    messageWrapperLeft: {
        display: 'flex',
        justifyContent: 'flex-start',
    },
    messageWrapperRight: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    messageReceiver: {
        background: '#ffffff',
        padding: '14px 20px',
        borderRadius: '20px',
        borderBottomLeftRadius: '4px',
        color: '#334155',
        border: '1px solid #e2e8f0',
        maxWidth: '85%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        fontSize: '0.92rem',
        lineHeight: 1.6,
    },
    messageSender: {
        background: 'var(--ag-gradient-mesh)',
        padding: '14px 20px',
        borderRadius: '20px',
        borderBottomRightRadius: '4px',
        color: 'white',
        maxWidth: '85%',
        boxShadow: '0 8px 25px rgba(79, 70, 229, 0.25)',
        fontSize: '0.92rem',
        lineHeight: 1.6,
        fontWeight: 500,
    },
    faqContainer: {
        margin: '12px 0 8px 0',
        padding: '16px',
        background: 'rgba(79, 70, 229, 0.03)',
        borderRadius: '20px',
        border: '1px dashed rgba(79, 70, 229, 0.15)',
    },
    faqTitle: {
        fontSize: '0.7rem',
        color: 'var(--ag-primary-vibrant)',
        fontWeight: 800,
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textAlign: 'center',
    },
    faqGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    faqChip: {
        background: 'white',
        border: '1px solid #e0e7ff',
        padding: '12px 18px',
        borderRadius: '16px',
        fontSize: '0.85rem',
        color: '#1e1b4b',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    productShowcase: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
    },
    miniProductCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'rgba(255,255,255,0.7)',
        padding: '10px',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    },
    miniProductImg: {
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        objectFit: 'cover',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    miniProductInfo: {
        flex: 1,
        overflow: 'hidden',
    },
    miniProductName: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: '2px',
    },
    miniProductPrice: {
        fontSize: '0.8rem',
        color: 'var(--ag-primary-vibrant)',
        fontWeight: 800,
    },
    inputArea: {
        padding: '24px 28px',
        background: '#ffffff',
        borderTop: '1px solid #f1f5f9',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        background: '#f8fafc',
        borderRadius: '18px',
        padding: '6px 16px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s',
    },
    input: {
        flex: 1,
        padding: '12px 0',
        border: 'none',
        outline: 'none',
        fontSize: '0.95rem',
        color: '#0f172a',
        background: 'transparent',
    },
    sendBtn: {
        background: 'var(--ag-gradient-mesh)',
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
    }
};

export default ChatbotWidget;

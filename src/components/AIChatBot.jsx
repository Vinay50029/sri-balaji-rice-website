import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "model", text: "Hello! I'm your Sri Balaji Traders assistant. Ask me anything about our rice varieties, cooking tips, or prices! 🍚" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [productContext, setProductContext] = useState("");
    const messagesEndRef = useRef(null);

    // Fetch product data for context
    useEffect(() => {
        const fetchContextData = async () => {
            try {
                const [postsSnap, catsSnap, offersSnap, otherSnap] = await Promise.all([
                    getDocs(collection(db, "fatherPosts")),
                    getDocs(collection(db, "riceCategories")),
                    getDocs(collection(db, "offers")),
                    getDocs(collection(db, "otherProducts"))
                ]);

                const products = postsSnap.docs.map(doc => {
                    const data = doc.data();
                    const ratingStr = data.ratingAvg ? `${data.ratingAvg}⭐ (${data.ratingCount} reviews)` : "No ratings";
                    return `- ${data.title}: Price ₹${data.price}, Weight ${data.weight || 'N/A'}. Rating: ${ratingStr}. Description: ${data.description || 'N/A'}. Category: ${data.category || 'General'}`;
                }).join("\n");

                const categories = catsSnap.docs.map(doc => `- ${doc.data().label}`).join("\n");

                const offers = offersSnap.docs.map(doc => {
                    const data = doc.data();
                    return `- Offer: ${data.title}. Deal: ${data.subTitle}. Details: ${data.description}. Color: ${data.color || 'N/A'}`;
                }).join("\n");

                const otherProducts = otherSnap.docs.map(doc => {
                    const data = doc.data();
                    return `- ${data.title}: Price ₹${data.price}, Weight ${data.weight || 'N/A'}. Description: ${data.description || 'N/A'}`;
                }).join("\n");

                const contextString = `
Current Product Inventory (Rice):
${products}

Kitchen Essentials (Other Products):
${otherProducts}

Special Offers:
${offers}

Available Categories:
${categories}

Store Info:
Name: Sri Balaji Traders (Since 1994)
Owner: Ravinder Gattu
Website: https://sribalajitraders.com
Contact: 9951037494
Location: 1-19/78/43, Aditya Nagar Road, Netaji Nagar, Kapra, Hyderabad, 500062.
Open Hours: 9:30 AM - 9:30 PM (Mon-Sun).
Tagline: "Premium Quality Rice for Every Household".
Values: Quality Assured, Genuine Pricing, Customer First.

Social Media:
- Instagram: @sri_balaji_traders09
- WhatsApp: 9951037494
- YouTube: @SriBalajiTraders1974
`;
                setProductContext(contextString);
            } catch (error) {
                console.error("Error fetching AI context:", error);
            }
        };

        fetchContextData();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error("API Key missing");
            }

            // Initialize new SDK client
            const ai = new GoogleGenAI({ apiKey });

            const systemPrompt = `You are a helpful AI assistant for "Sri Balaji Traders", a rice store.
Your goal is to assist customers with questions about rice varieties, quality, cooking tips, and comparisons.

**Guidelines:**
1. **General Knowledge Allowed:** You CAN use your general knowledge to explain what specific rice varieties are (e.g., "What is HMT?", "Benefits of Brown Rice", "Difference between Steam and Raw").
2. **Store Specifics:** For PRICES, STOCK, and AVAILABLE BRANDS, you MUST strictly use the "Context" provided below. Do not invent prices or products.
3. **General Knowledge Allowed, Be Concise & Simple:** Keep answers short and direct. Avoid jargon. No long paragraphs. Use simple language a 10-year-old could understand.
4. **General Knowledge:** You can explain rice types generally (e.g. "What is HMT?"), but for STORE info (Price, Stock), strictly use the Context.
5. **Formatting:** Use bullet points and bold text for readability.
   - Use tables for comparisons.

Context:
${productContext}
`;
            const contents = [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I'm ready to help with Sri Balaji Traders inquiries." }]
                },
                ...messages
                    .filter((_, i) => i > 0)
                    .map(m => ({
                        role: m.role === "user" ? "user" : "model",
                        parts: [{ text: m.text }]
                    })),
                {
                    role: "user",
                    parts: [{ text: userMessage }]
                }
            ];

            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents
            });
            const text = result.text;
            setMessages(prev => [...prev, { role: "model", text: text }]);
        } catch (error) {
            console.error("AI Error:", error);
            let errorMessage = `Connection Error: ${error.message || "Unknown error"}`;
            setMessages(prev => [...prev, { role: "model", text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <>
            <button
                className="ai-chat-btn animate-pulse-attention"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    right: "5px",
                    bottom: "15px",
                    zIndex: 1100,
                    backgroundColor: "rgba(59, 115, 77, 1)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "50px",
                    padding: "5px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(71, 141, 95, 0.4)",
                    transition: "all 0.3s ease",

                }}
            >
                {isOpen ? (
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Ask me</span>
                ) : (
                    <>
                        <img
                            src="/dlogo.png"
                            alt="Chat"
                            style={{
                                width: "24px",
                                height: "24px",
                                objectFit: "contain"
                            }}
                        />
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", whiteSpace: "nowrap" }}>Ask me!</span>
                    </>
                )}
            </button>

            {isOpen && (
                <div
                    className="ai-chat-window"
                    style={{
                        position: "fixed",
                        bottom: "85px",
                        right: "20px",
                        width: "350px",
                        maxWidth: "90vw",
                        height: "500px",
                        maxHeight: "70vh",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
                        zIndex: 1100,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.1)"
                    }}
                >
                    <div className="text-white p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#81abdaff" }}>
                        <h6 className="m-0 fw-bold">AI ChatBot 🌾</h6>
                        <button
                            className="btn btn-sm text-white p-0"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close"
                        >✕</button>
                    </div>

                    <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: "#f8f9fa" }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`d-flex mb-3 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                            >
                                <div
                                    style={{
                                        maxWidth: "80%",
                                        padding: "10px 14px",
                                        borderRadius: "12px",
                                        backgroundColor: msg.role === "user" ? "var(--color-primary)" : "white",
                                        color: msg.role === "user" ? "white" : "black",
                                        boxShadow: msg.role === "model" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                        borderTopLeftRadius: msg.role === "model" ? "2px" : "12px",
                                        borderTopRightRadius: msg.role === "user" ? "2px" : "12px",
                                        fontSize: "0.9rem"
                                    }}
                                >
                                    {msg.role === "model" ? (
                                        <div className="markdown-body" style={{ fontSize: "0.9rem" }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {messages.length === 1 && (
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {["🍚 Best Rice for Daily Use?", "💰 Price List", "🌾 Compare HMT vs Karnool"].map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        className="btn btn-sm btn-outline-secondary rounded-pill"
                                        style={{ fontSize: "0.80rem" }}
                                        onClick={() => {
                                            setInput(suggestion);
                                            // Optional: Auto-send on click
                                            // setInput(suggestion); 
                                            // handleSend(suggestion); // Would need to refactor handleSend to accept args
                                        }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isLoading && (
                            <div className="text-muted small ms-2">Thinking...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-top d-flex gap-2">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Ask about rice..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            style={{ fontSize: "16px" }}
                            disabled={isLoading}
                        />
                        <button
                            className="btn btn-primary btn-sm px-3"
                            onClick={handleSend}
                            disabled={isLoading}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FoxieSideChat = ({
    chatHistory = [],
    onCommandSubmit,
    onStartVoice,
    onStopVoice,
    isListening,
    isAwake
}) => {
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        onCommandSubmit(inputText);
        setInputText('');
    };

    return (
        <div className="foxie-side-chat">
            <div className="side-chat-header">
                <span className="header-icon">🦊</span>
                <span className="header-title">Foxie Chat</span>
                <div className={`status-dot ${isAwake ? 'awake' : 'idle'}`} title={isAwake ? "Awake" : "Idle"} />
            </div>

            <div className="side-chat-history">
                {chatHistory.length === 0 ? (
                    <div className="empty-chat-state">
                        <span className="empty-icon">💭</span>
                        <p>Say "Hey Foxie" or type a command to start!</p>
                    </div>
                ) : (
                    chatHistory.map((msg, index) => (
                        <motion.div
                            key={index}
                            className={`chat-message ${msg.sender}`}
                            initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                            <span className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </motion.div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="side-chat-input-area">
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        className="chat-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type 'Hey Foxie'..."
                    />
                </form>

                <button
                    className={`voice-hold-btn ${isListening ? 'listening' : ''}`}
                    onMouseDown={onStartVoice}
                    onMouseUp={onStopVoice}
                    onMouseLeave={onStopVoice}
                    onTouchStart={onStartVoice}
                    onTouchEnd={onStopVoice}
                    title="Hold to Speak"
                >
                    {isListening ? '🎙️' : '🎤'}
                </button>
            </div>
        </div>
    );
};

export default FoxieSideChat;

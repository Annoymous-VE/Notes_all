import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Coins, 
  BookOpen, 
  CornerDownRight, 
  ExternalLink,
  MessageSquare,
  Zap,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { MOCK_CROW_PROMPTS } from '../data/notesData';

export default function CrowChatDrawer({ 
  isOpen, 
  onClose, 
  notes, 
  userCoins, 
  onSelectNote 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I'm Crow AI, your personal study assistant (just like Amazon's Rufus AI, but specialized for exam notes & coursework). Ask me for recommendations, syllabus matching, or how to spend your Gold Bars!",
      sources: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Intelligent local matcher fallback in case backend Crow orchestrator needs keys or mock answers
  const generateIntelligentAnswer = (query) => {
    const q = query.toLowerCase();
    let matchedNotes = [];
    let reply = "";

    if (q.includes('gold') || q.includes('bar') || q.includes('free') || q.includes('coin')) {
      const affordable = notes.filter(n => n.goldCoinPrice <= userCoins);
      if (affordable.length > 0) {
        matchedNotes = affordable;
        reply = `You currently have **${userCoins} Gold Bars**! You can redeem any of the following notes **100% Free** right now without paying a single Rupee:`;
      } else {
        matchedNotes = [notes[0]];
        reply = `You have ${userCoins} Gold Bars. You earn between 25 to 60 Gold Bars every time you purchase a note, or when other students buy your uploaded notes! Here is the closest match for you:`;
      }
    } else if (q.includes('gate') || q.includes('os') || q.includes('operating') || q.includes('computer')) {
      matchedNotes = notes.filter(n => n.category.includes('Computer') || n.title.includes('GATE') || n.title.includes('OS'));
      reply = "Here are our highest-rated Computer Science & GATE preparation notes. Aditya Sharma's OS notes include solved PYQs and virtual memory memory-allocation blueprints:";
    } else if (q.includes('upsc') || q.includes('history') || q.includes('civil')) {
      matchedNotes = notes.filter(n => n.category.includes('Civil') || n.title.includes('UPSC'));
      reply = "For UPSC aspirants, Pooja Verma's Modern Indian History notes are the #1 bestseller, featuring chronological mind maps and governor-general reform matrices:";
    } else if (q.includes('neet') || q.includes('chemistry') || q.includes('medical') || q.includes('biology')) {
      matchedNotes = notes.filter(n => n.category.includes('Medical') || n.title.includes('NEET'));
      reply = "For NEET revision, Dr. Rohan Deshmukh's Organic Chemistry guide covers all 72 NCERT reactions with clear electron arrow mechanisms and assertion-reason tips:";
    } else if (q.includes('dsa') || q.includes('faang') || q.includes('interview') || q.includes('system design')) {
      matchedNotes = notes.filter(n => n.tags.some(t => t.toLowerCase().includes('faang') || t.toLowerCase().includes('system')));
      reply = "If you're preparing for tech interviews, Vikram Sengupta's FAANG prep pack includes 15 recurring LeetCode patterns and scalable architecture blueprints:";
    } else {
      matchedNotes = notes.slice(0, 2);
      reply = `I searched our verified student marketplace for "${query}". Here are the most relevant verified notes curated by our top rankers:`;
    }

    return { reply, sources: matchedNotes };
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      sources: []
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // 1. Try real backend call to /crow/chat
      const res = await api.chatWithCrow(text, conversationId);
      if (res && res.message) {
        setConversationId(res.conversation_id);
        
        // Find if any sources matched from notes
        const matchedSources = notes.filter(n => 
          (res.sources && res.sources.some(s => s.title.toLowerCase() === n.title.toLowerCase())) ||
          n.title.toLowerCase().includes(text.toLowerCase())
        );

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: res.message,
            sources: matchedSources
          }
        ]);
      }
    } catch (err) {
      // Graceful fallback to rich local semantic matching with simulated typing delay
      setTimeout(() => {
        const { reply, sources } = generateIntelligentAnswer(text);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: reply,
            sources: sources
          }
        ]);
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="crow-overlay" onClick={onClose}>
      <div className="crow-sidebar glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Crow Header */}
        <div className="crow-header">
          <div className="crow-header-brand">
            <div className="crow-avatar-box">
              <Sparkles size={20} className="crow-gold-sparkle" />
            </div>
            <div>
              <div className="crow-title-row">
                <span className="crow-name">Crow AI</span>
                <span className="crow-badge">RUFUS-STYLE AI</span>
              </div>
              <span className="crow-subtitle">Your personal study material finder</span>
            </div>
          </div>
          <button className="crow-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Gold Bar Status Pill inside Crow */}
        <div className="crow-wallet-strip">
          <Coins size={15} className="gold-text" />
          <span>Your Balance: <strong>{userCoins} Gold Bars</strong>. Ask Crow to find items you can redeem for free!</span>
        </div>

        {/* Chat Messages */}
        <div className="crow-messages-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chat-avatar crow">
                  <Bot size={16} />
                </div>
              )}

              <div className="chat-bubble-card">
                <div className="bubble-text">{msg.text}</div>

                {/* Embedded Recommendations / Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="crow-sources-deck">
                    <span className="sources-label">Recommended Materials:</span>
                    <div className="sources-list">
                      {msg.sources.map((item) => (
                        <div 
                          key={item.id} 
                          className="source-item-card"
                          onClick={() => {
                            onSelectNote(item);
                            onClose();
                          }}
                        >
                          <img src={item.previewUrl} alt="" className="source-thumb" />
                          <div className="source-info">
                            <div className="source-title">{item.title}</div>
                            <div className="source-meta">
                              <span className="source-price">₹{item.price}</span>
                              <span className="source-coins">
                                <Coins size={11} className="gold-text" /> {item.goldCoinPrice} Bars
                              </span>
                            </div>
                          </div>
                          <CornerDownRight size={14} className="source-arrow" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="chat-avatar user">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-row assistant">
              <div className="chat-avatar crow">
                <Bot size={16} />
              </div>
              <div className="chat-bubble-card loading-indicator">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="crow-suggestions-container">
          <div className="suggestions-label">Suggestions:</div>
          <div className="suggestions-scroll">
            {MOCK_CROW_PROMPTS.map((prompt, index) => (
              <button 
                key={index} 
                className="suggestion-chip"
                onClick={() => handleSendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="crow-input-container">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="crow-form"
          >
            <input 
              type="text" 
              placeholder="Ask Crow (e.g., 'Show me notes I can buy with 150 gold bars')..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="crow-input-field"
            />
            <button 
              type="submit" 
              className={`crow-send-btn ${inputMessage.trim() ? 'active' : ''}`}
              disabled={!inputMessage.trim() || loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

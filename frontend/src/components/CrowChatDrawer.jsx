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
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { MOCK_CROW_PROMPTS } from '../data/notesData';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true
});

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
      text: "👋 Hi! I'm **Crow AI**, your dedicated study material advisor (built like Amazon's Rufus AI for university scholars).\n\nAsk me anything: syllabus recommendations, topper exam blueprints, or how to get notes **100% free with your Gold Bars**!",
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

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        text: "👋 Chat reset! What subject or exam are you preparing for today?",
        sources: []
      }
    ]);
    setConversationId(null);
  };

  const generateIntelligentAnswer = (query) => {
    const q = query.toLowerCase();
    let matchedNotes = [];
    let reply = "";

    if (q.includes('gold') || q.includes('bar') || q.includes('free') || q.includes('coin') || q.includes('wallet')) {
      const affordable = notes.filter(n => n.goldCoinPrice <= userCoins);
      if (affordable.length > 0) {
        matchedNotes = affordable;
        reply = `You currently hold **${userCoins} Gold Bars**! 🎁 You can redeem any of the verified study packs below **100% Free** right now without paying a single Rupee:`;
      } else {
        matchedNotes = [notes[0]];
        reply = `You have **${userCoins} Gold Bars**. You earn between 25 to 60 Gold Bars on every note download or when students purchase your materials! Here is a high-yield recommendation for you:`;
      }
    } else if (q.includes('gate') || q.includes('os') || q.includes('operating') || q.includes('computer')) {
      matchedNotes = notes.filter(n => n.category.includes('Computer') || n.title.includes('GATE') || n.title.includes('OS'));
      reply = "Here are our highest-rated **Computer Science & GATE preparation notes**. Aditya Sharma's OS notes include solved PYQs and virtual memory blueprints:";
    } else if (q.includes('upsc') || q.includes('history') || q.includes('civil')) {
      matchedNotes = notes.filter(n => n.category.includes('Civil') || n.title.includes('UPSC'));
      reply = "For UPSC CSE aspirants, Pooja Verma's **Modern Indian History** notes are the #1 bestseller, featuring chronological mind maps and governor-general reform matrices:";
    } else if (q.includes('neet') || q.includes('chemistry') || q.includes('medical') || q.includes('biology')) {
      matchedNotes = notes.filter(n => n.category.includes('Medical') || n.title.includes('NEET'));
      reply = "For NEET revision, Dr. Rohan Deshmukh's **Organic Chemistry guide** covers all 72 NCERT reactions with clear electron arrow mechanisms and assertion-reason tips:";
    } else if (q.includes('dsa') || q.includes('faang') || q.includes('interview') || q.includes('system design')) {
      matchedNotes = notes.filter(n => n.tags.some(t => t.toLowerCase().includes('faang') || t.toLowerCase().includes('system')));
      reply = "If you're preparing for tech placements and FAANG interviews, Vikram Sengupta's **DSA & System Design pack** includes 15 recurring LeetCode patterns and scalable architecture blueprints:";
    } else {
      matchedNotes = notes.slice(0, 2);
      reply = `I searched our verified student marketplace for **"${query}"**. Here are the most relevant topper-curated notes matching your query:`;
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
      const res = await api.chatWithCrow(text, conversationId);
      if (res && res.message) {
        setConversationId(res.conversation_id);
        
        const matchedSources = [];
        const seenIds = new Set();

        notes.forEach((n) => {
          const titleLower = n.title.toLowerCase();
          const userTextLower = text.toLowerCase();
          const replyLower = res.message.toLowerCase();

          const isBackendMatch = res.sources && res.sources.some(s => 
            (s.note_id && (String(s.note_id) === String(n.id) || String(s.note_id) === String(n.file_id))) ||
            (s.title && s.title.toLowerCase() === titleLower)
          );

          const isMentionedInReply = replyLower.includes(titleLower) || 
            (n.subject && replyLower.includes(n.subject.toLowerCase()) && titleLower.split(' ').some(w => w.length > 4 && replyLower.includes(w)));

          const titleKeywords = titleLower.split(/[\s,()\-]+/).filter(w => w.length >= 4);
          const isQueryMatch = titleKeywords.length > 0 && titleKeywords.some(kw => userTextLower.includes(kw));

          if ((isBackendMatch || isMentionedInReply || isQueryMatch) && !seenIds.has(n.id)) {
            seenIds.add(n.id);
            matchedSources.push(n);
          }
        });

        if (res.sources && res.sources.length > 0) {
          res.sources.forEach((src) => {
            const srcId = String(src.note_id);
            if (!seenIds.has(srcId)) {
              seenIds.add(srcId);
              matchedSources.push({
                id: srcId,
                title: src.title,
                category: src.category || 'Study Material',
                subject: src.category || 'Academic',
                description: `Verified study material: ${src.title}. Ranked high for your query.`,
                author: {
                  name: 'Verified Seller',
                  institution: 'NoteVerse Scholar',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  rating: 4.9,
                  salesCount: 120
                },
                price: src.coin_price || 199,
                originalPrice: Math.round((src.coin_price || 199) * 1.6),
                goldCoinPrice: src.coin_price || 199,
                goldBarsEarned: Math.round((src.coin_price || 199) * 0.2),
                pageCount: 42,
                fileType: 'PDF Verified',
                rating: 4.92,
                reviewsCount: 38,
                previewUrl: src.preview_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
                sampleSnippet: `Complete comprehensive concepts and questions for ${src.title}.`,
                isFeatured: false,
                isBestseller: true
              });
            }
          });
        }

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
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="crow-overlay" onClick={onClose}>
      <div className="crow-sidebar glass-panel-accent" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="crow-header">
          <div className="crow-header-brand">
            <div className="crow-avatar-box">
              <Sparkles size={20} className="crow-gold-sparkle" />
            </div>
            <div>
              <div className="crow-title-row">
                <span className="crow-name">Crow AI</span>
                <span className="crow-badge">RUFUS STUDY AI</span>
              </div>
              <span className="crow-subtitle">Your personal exam notes strategist</span>
            </div>
          </div>
          <div className="crow-header-actions">
            <button className="crow-icon-btn" onClick={handleResetChat} title="Reset Chat">
              <RotateCcw size={16} />
            </button>
            <button className="crow-close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Gold Bar Status Pill inside Crow */}
        <div className="crow-wallet-strip">
          <Coins size={15} className="gold-text" />
          <span>Wallet: <strong>{userCoins} Gold Bars</strong>. Ask me what you can redeem for free!</span>
        </div>

        {/* Messages Body */}
        <div className="crow-messages-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chat-avatar crow">
                  <Bot size={15} />
                </div>
              )}

              <div className="chat-bubble-card">
                {msg.role === 'assistant' ? (
                  <div 
                    className="bubble-text markdown-content"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(marked.parse(msg.text || ''))
                    }}
                  />
                ) : (
                  <div className="bubble-text">{msg.text}</div>
                )}

                {/* Embedded Recommendation Cards */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="crow-sources-deck">
                    <span className="sources-label">Recommended Verified Notes:</span>
                    <div className="sources-list">
                      {msg.sources.map((item) => (
                        <div 
                          key={item.id} 
                          className="source-item-card glass-panel"
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
                  <User size={15} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-row assistant">
              <div className="chat-avatar crow">
                <Bot size={15} />
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
          <div className="suggestions-scroll">
            {MOCK_CROW_PROMPTS.map((prompt, index) => (
              <button 
                key={index} 
                className="suggestion-chip"
                onClick={() => handleSendMessage(prompt)}
              >
                <Sparkles size={11} className="gold-text" />
                <span>{prompt}</span>
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
              placeholder="Ask Crow (e.g. 'Show notes I can get with 150 gold bars')..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="crow-input-field"
            />
            <button 
              type="submit" 
              className={`crow-send-btn ${inputMessage.trim() ? 'active' : ''}`}
              disabled={!inputMessage.trim() || loading}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

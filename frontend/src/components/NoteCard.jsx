import React from 'react';
import { 
  Star, 
  Coins, 
  Eye, 
  FileText, 
  CheckCircle, 
  ShoppingCart, 
  Sparkles,
  Award,
  Zap,
  Download
} from 'lucide-react';

const CATEGORY_COLORS = {
  'Computer Science': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.35)' },
  'Civil Services': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  'Medical / NEET': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  'Engineering / Software': { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.35)' },
  'Commerce / CA': { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.35)' },
  'General Science': { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.35)' },
};

export default function NoteCard({ 
  note, 
  onQuickView, 
  onAddToCart, 
  onBuyWithCoins,
  userCoins,
  isPurchased 
}) {
  const canAffordWithCoins = userCoins >= note.goldCoinPrice;
  const categoryStyle = CATEGORY_COLORS[note.category] || { 
    bg: 'rgba(99, 102, 241, 0.15)', 
    text: '#818cf8', 
    border: 'rgba(99, 102, 241, 0.35)' 
  };

  return (
    <div className="note-product-card glass-panel">
      {/* Top Banner Tags */}
      <div className="note-card-badge-container">
        <div className="left-badge-group">
          {note.isBestseller && (
            <span className="badge-tag bestseller shimmer-effect">
              👑 BESTSELLER
            </span>
          )}
          {note.isFeatured && !note.isBestseller && (
            <span className="badge-tag featured">
              ⭐ TOP RATED
            </span>
          )}
        </div>
        
        <div className="reward-gold-tag" title="Gold bars awarded upon purchasing">
          <Coins size={12} className="gold-text" />
          <span>+{note.goldBarsEarned} Bars</span>
        </div>
      </div>

      {/* Note Image & Quick Preview Trigger */}
      <div className="note-card-media" onClick={() => onQuickView(note)}>
        <img src={note.previewUrl} alt={note.title} className="note-thumbnail" loading="lazy" />
        <div className="media-overlay">
          <button className="preview-trigger-btn">
            <Eye size={15} /> Quick Preview
          </button>
        </div>
        <div className="page-count-chip">
          <FileText size={12} /> {note.pageCount} Pages
        </div>
      </div>

      {/* Content Area */}
      <div className="note-card-content">
        {/* Category Pill & Rating */}
        <div className="note-meta-header">
          <span 
            className="category-pill"
            style={{ 
              backgroundColor: categoryStyle.bg, 
              color: categoryStyle.text, 
              borderColor: categoryStyle.border 
            }}
          >
            {note.category}
          </span>
          <div className="rating-pill">
            <Star size={12} className="star-filled" />
            <span>{note.rating}</span>
            <span className="rating-count">({note.reviewsCount})</span>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="note-title" onClick={() => onQuickView(note)} title={note.title}>
          {note.title}
        </h3>

        {/* Author / Topper details */}
        <div className="author-row">
          <img src={note.author.avatar} alt={note.author.name} className="author-avatar" />
          <div className="author-info">
            <span className="author-name">{note.author.name}</span>
            <span className="author-inst">{note.author.institution}</span>
          </div>
        </div>

        {/* High-yield Tags */}
        <div className="tags-container">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="note-tag">#{tag}</span>
          ))}
        </div>

        {/* Pricing Block */}
        <div className="note-price-container">
          <div className="fiat-price-block">
            <span className="rupee-price">₹{note.price}</span>
            <span className="original-striked">₹{note.originalPrice}</span>
            <span className="discount-percent">
              {Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100)}% OFF
            </span>
          </div>

          <div className="coin-alternative-block">
            <span className="or-divider">OR</span>
            <div className={`coin-price-pill ${canAffordWithCoins ? 'affordable' : ''}`}>
              <Coins size={13} className="gold-text" />
              <span>{note.goldCoinPrice} Bars</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="note-card-actions">
          {isPurchased ? (
            <button className="purchased-btn" onClick={() => onQuickView(note)}>
              <CheckCircle size={15} /> Unlocked & Owned
            </button>
          ) : (
            <>
              <button 
                className="cart-add-btn"
                onClick={() => onAddToCart(note)}
                title="Add to study cart"
              >
                <ShoppingCart size={15} />
                <span>Add to Cart</span>
              </button>

              <button
                className={`coin-redeem-btn ${canAffordWithCoins ? 'active' : 'disabled'}`}
                onClick={() => onBuyWithCoins(note)}
                title={canAffordWithCoins ? "Redeem 100% Free with your Gold Bars!" : `Need ${note.goldCoinPrice - userCoins} more Gold Bars`}
              >
                <Coins size={14} />
                <span>{canAffordWithCoins ? "Redeem Free" : "Use Bars"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

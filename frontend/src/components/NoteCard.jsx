import React from 'react';
import { 
  Star, 
  Coins, 
  Eye, 
  FileText, 
  CheckCircle, 
  ShoppingCart,
  Download,
  Sparkles
} from 'lucide-react';

export default function NoteCard({ 
  note, 
  onQuickView, 
  onAddToCart, 
  onBuyWithCoins,
  userCoins,
  isPurchased 
}) {
  const canAffordWithCoins = userCoins >= note.goldCoinPrice;

  return (
    <div className="note-product-card glass-panel">
      {/* Top Banner Tag */}
      <div className="note-card-badge-container">
        {note.isBestseller && <span className="badge-tag bestseller">BESTSELLER</span>}
        {note.isFeatured && <span className="badge-tag featured">TOP RATED</span>}
        <div className="reward-gold-tag" title="Gold bars awarded after purchase">
          <Coins size={12} className="gold-text" />
          <span>+{note.goldBarsEarned} Bars</span>
        </div>
      </div>

      {/* Note Image & Preview Overlay */}
      <div className="note-card-media" onClick={() => onQuickView(note)}>
        <img src={note.previewUrl} alt={note.title} className="note-thumbnail" />
        <div className="media-overlay">
          <button className="preview-trigger-btn">
            <Eye size={16} /> Quick Preview
          </button>
        </div>
        <div className="page-count-chip">
          <FileText size={12} /> {note.pageCount} Pages
        </div>
      </div>

      {/* Content Area */}
      <div className="note-card-content">
        {/* Category & Rating */}
        <div className="note-meta-header">
          <span className="category-pill">{note.category}</span>
          <div className="rating-pill">
            <Star size={13} className="star-filled" />
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

        {/* Tags */}
        <div className="tags-container">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="note-tag">#{tag}</span>
          ))}
        </div>

        {/* Pricing Block - Amazon/Flipkart format */}
        <div className="note-price-container">
          <div className="fiat-price-block">
            <span className="rupee-price">₹{note.price}</span>
            <span className="original-striked">₹{note.originalPrice}</span>
            <span className="discount-percent">
              {Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100)}% off
            </span>
          </div>

          <div className="coin-alternative-block">
            <span className="or-divider">OR</span>
            <div className={`coin-price-pill ${canAffordWithCoins ? 'affordable' : ''}`}>
              <Coins size={14} className="gold-text" />
              <span>{note.goldCoinPrice} Bars</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="note-card-actions">
          {isPurchased ? (
            <button className="purchased-btn" onClick={() => onQuickView(note)}>
              <CheckCircle size={16} /> Downloaded / Owned
            </button>
          ) : (
            <>
              <button 
                className="cart-add-btn"
                onClick={() => onAddToCart(note)}
                title="Add note to cart"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>

              <button
                className={`coin-redeem-btn ${canAffordWithCoins ? 'active' : 'disabled'}`}
                onClick={() => onBuyWithCoins(note)}
                title={canAffordWithCoins ? "Buy 100% Free with Gold Bars!" : `Need ${note.goldCoinPrice - userCoins} more Gold Bars`}
              >
                <Coins size={15} />
                <span>{canAffordWithCoins ? "Redeem Free" : "Use Bars"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

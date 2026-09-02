import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Coins, 
  FileText, 
  Star, 
  CheckCircle, 
  ShieldCheck, 
  ShoppingCart, 
  Share2, 
  BookOpen, 
  Eye,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function NoteQuickViewModal({
  isOpen,
  onClose,
  note,
  userCoins,
  onAddToCart,
  onBuyWithCoins,
  isPurchased
}) {
  const [downloadInitiated, setDownloadInitiated] = useState(false);

  if (!isOpen || !note) return null;

  const canAffordWithCoins = userCoins >= note.goldCoinPrice;

  const handleDownload = () => {
    setDownloadInitiated(true);
    const element = document.createElement("a");
    const file = new Blob([
      `============================================================\n` +
      `NoteVerse Verified Study Material: ${note.title}\n` +
      `Author: ${note.author.name} (${note.author.institution})\n` +
      `Category: ${note.category} | Rating: ${note.rating}/5.0\n` +
      `============================================================\n\n` +
      `Overview:\n${note.description}\n\n` +
      `Key Exam Insights & Formulas:\n${note.sampleSnippet}\n\n` +
      `Tags: ${note.tags.join(', ')}\n\n` +
      `Verified by NoteVerse Academic Quality Control Team.`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quick-view-modal glass-panel-accent" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="quickview-grid">
          {/* Left Preview Cover & Author Card */}
          <div className="quickview-left">
            <div className="book-preview-container">
              <img src={note.previewUrl} alt={note.title} className="quickview-cover-img" />
              <div className="watermark-overlay">
                <FileCheck size={16} />
                <span>VERIFIED TOPPER SCAN</span>
              </div>
            </div>

            <div className="seller-stats-badge glass-panel">
              <img src={note.author.avatar} alt="" className="author-large-avatar" />
              <div>
                <strong>{note.author.name}</strong>
                <p>{note.author.institution}</p>
                <div className="author-rating-row">
                  <Star size={12} className="star-filled" />
                  <span>{note.author.rating} Topper Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Details & Actions */}
          <div className="quickview-right">
            <div className="quickview-category-tag">{note.category}</div>
            <h2 className="quickview-title">{note.title}</h2>

            <div className="quickview-rating-bar">
              <div className="rating-pill">
                <Star size={13} className="star-filled" />
                <strong>{note.rating}</strong>
                <span>({note.reviewsCount} reviews)</span>
              </div>
              <span className="dot-sep">•</span>
              <span className="pages-info"><FileText size={13} /> {note.pageCount} Pages</span>
              <span className="dot-sep">•</span>
              <span className="format-info">{note.fileType}</span>
            </div>

            <div className="quickview-desc">
              <p>{note.description}</p>
            </div>

            {/* High-yield Excerpt snippet */}
            <div className="snippet-preview-card glass-panel">
              <div className="snippet-header">
                <Eye size={14} className="gold-text" />
                <span>Chapter 1 High-Yield Excerpt:</span>
              </div>
              <p className="snippet-content">"{note.sampleSnippet}"</p>
            </div>

            {/* Pricing Details */}
            <div className="quickview-pricing-box">
              <div className="cash-price-box">
                <span className="main-rupee">₹{note.price}</span>
                <span className="striked-rupee">₹{note.originalPrice}</span>
                <span className="quickview-discount">Save ₹{note.originalPrice - note.price}</span>
              </div>

              <div className="gold-coins-option-box">
                <span className="or-pill">OR PAY WITH</span>
                <div className="gold-bar-tag">
                  <Coins size={15} className="gold-text" />
                  <strong>{note.goldCoinPrice} Gold Bars</strong>
                  {canAffordWithCoins && <span className="free-indicator">(Ready to Redeem!)</span>}
                </div>
              </div>
            </div>

            <div className="earning-reward-callout">
              <Coins size={15} className="gold-text" />
              <span>Buying this note credits <strong>+{note.goldBarsEarned} Gold Bars</strong> to your wallet!</span>
            </div>

            {/* Primary Action Buttons */}
            <div className="quickview-actions">
              {isPurchased ? (
                <button className="btn-download-now" onClick={handleDownload}>
                  <Download size={17} />
                  <span>{downloadInitiated ? 'Downloaded (Download Again)' : 'Download Full Unlocked Notes (PDF)'}</span>
                </button>
              ) : (
                <>
                  <button 
                    className="btn-add-cart-large"
                    onClick={() => {
                      onAddToCart(note);
                      onClose();
                    }}
                  >
                    <ShoppingCart size={17} />
                    <span>Add to Cart</span>
                  </button>

                  <button 
                    className={`btn-gold-redeem-large ${canAffordWithCoins ? 'active' : 'disabled'}`}
                    onClick={() => {
                      onBuyWithCoins(note);
                      onClose();
                    }}
                  >
                    <Coins size={17} />
                    <span>{canAffordWithCoins ? `Redeem 100% Free (${note.goldCoinPrice} Bars)` : `Need ${note.goldCoinPrice - userCoins} more Bars`}</span>
                  </button>
                </>
              )}
            </div>

            <div className="guarantee-footer">
              <ShieldCheck size={15} className="emerald-text" />
              <span>100% Verified Quality Guarantee • Instant High-Speed PDF Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

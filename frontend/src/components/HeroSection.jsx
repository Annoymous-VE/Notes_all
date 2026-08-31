import React from 'react';
import { 
  Sparkles, 
  Coins, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function HeroSection({ onOpenCrow, onExploreClick, onOpenSellModal }) {
  return (
    <section className="hero-banner-wrapper">
      <div className="hero-grid">
        {/* Left Copy */}
        <div className="hero-text-side">
          <div className="hero-pill-badge">
            <Sparkles size={14} className="gold-text" />
            <span>AI-Powered Study Exchange</span>
          </div>

          <h1 className="hero-headline">
            India's Premier <span className="gold-gradient-text">Notes Marketplace</span> Powered by AI
          </h1>

          <p className="hero-subtitle">
            Buy verified topper notes, sell your semester materials to earn, and stack 
            <strong> Gold Bars</strong> for massive discounts or free downloads. 
            Get personal recommendations from <strong>Crow AI</strong>.
          </p>

          <div className="hero-cta-group">
            <button className="primary-action-btn" onClick={onExploreClick}>
              <BookOpen size={18} />
              <span>Explore Materials</span>
              <ArrowRight size={16} />
            </button>

            <button className="secondary-action-btn" onClick={onOpenSellModal}>
              <span>Become a Seller</span>
            </button>

            <button className="crow-assistant-pill-btn" onClick={onOpenCrow}>
              <Sparkles size={16} />
              <span>Ask Crow AI</span>
            </button>
          </div>

          {/* Quick Perks / Value Props */}
          <div className="hero-perks-row">
            <div className="perk-item">
              <div className="perk-icon-circle gold">
                <Coins size={16} />
              </div>
              <div className="perk-details">
                <strong>Gold Bar Rewards</strong>
                <span>Earn on every purchase</span>
              </div>
            </div>

            <div className="perk-item">
              <div className="perk-icon-circle blue">
                <Sparkles size={16} />
              </div>
              <div className="perk-details">
                <strong>Crow AI Shopping</strong>
                <span>Instant semantic matching</span>
              </div>
            </div>

            <div className="perk-item">
              <div className="perk-icon-circle green">
                <ShieldCheck size={16} />
              </div>
              <div className="perk-details">
                <strong>Verified Quality</strong>
                <span>Peer-reviewed scan copies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Feature Showcase */}
        <div className="hero-visual-side">
          <div className="feature-card-floating glass-panel animate-float">
            <div className="card-top-row">
              <div className="topper-avatar-group">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="IIT Topper" 
                  className="topper-avatar"
                />
                <div>
                  <div className="topper-title">Aditya Sharma (AIR 42)</div>
                  <div className="topper-sub">GATE CSE • IIT Bombay</div>
                </div>
              </div>
              <span className="bestseller-badge">★ 4.9 RATED</span>
            </div>

            <h4 className="sample-note-title">GATE CSE 2025: Complete OS & Virtual Memory Masterclass</h4>
            
            <div className="sample-snippet-box">
              <span className="snippet-label">Sample Preview snippet:</span>
              <p>"Paging with TLB 2-Level Address Translation & Belady's Anomaly diagram with exact formulas..."</p>
            </div>

            <div className="card-pricing-row">
              <div className="price-tag-group">
                <span className="cur-price">₹199</span>
                <span className="old-price">₹499</span>
                <span className="discount-tag">60% OFF</span>
              </div>

              <div className="or-gold-badge">
                <Coins size={14} className="gold-text" />
                <span>OR <strong>199 Gold Bars</strong></span>
              </div>
            </div>

            <div className="coin-earning-alert">
              <span>🎁 Purchasing rewards you with <strong>+30 Gold Bars</strong></span>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="ambient-orb-gold" />
          <div className="ambient-orb-cyan" />
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { 
  Sparkles, 
  Coins, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  Award,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Users,
  Star,
  FileCheck
} from 'lucide-react';

const QUICK_EXAM_TAGS = [
  { label: 'GATE CSE', category: 'Computer Science' },
  { label: 'UPSC CSE', category: 'Civil Services' },
  { label: 'NEET 2025', category: 'Medical / NEET' },
  { label: 'FAANG SDE', category: 'Engineering / Software' },
  { label: 'CA Final', category: 'Commerce / CA' },
];

export default function HeroSection({ 
  onOpenCrow, 
  onExploreClick, 
  onOpenSellModal,
  onSelectCategory 
}) {
  return (
    <section className="hero-banner-wrapper">
      <div className="hero-grid">
        {/* Left Headline & CTAs */}
        <div className="hero-text-side">
          <div className="hero-pill-badge">
            <Sparkles size={14} className="gold-text" />
            <span>AI-Powered Study & Notes Exchange</span>
            <span className="pill-dot">•</span>
            <span className="pill-highlight">Gold Bar Rewards</span>
          </div>

          <h1 className="hero-headline">
            India's #1 Study Exchange for <span className="hero-gradient-text">Topper Notes</span> & Blueprints
          </h1>

          <p className="hero-subtitle">
            Buy verified notes with high-yield annotations, sell your semester materials for real cash + 
            <strong> Gold Bars</strong>, or redeem notes <strong>100% free</strong> with the guidance of <strong>Crow AI</strong>.
          </p>

          {/* Quick Exam Pills */}
          <div className="hero-exam-pills">
            <span className="exam-pills-label">Popular Exams:</span>
            <div className="exam-pills-row">
              {QUICK_EXAM_TAGS.map((tag, idx) => (
                <button 
                  key={idx} 
                  className="exam-pill-btn"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(tag.category);
                    onExploreClick();
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main CTAs */}
          <div className="hero-cta-group">
            <button className="primary-action-btn" onClick={onExploreClick}>
              <BookOpen size={18} />
              <span>Explore Top Notes</span>
              <ArrowRight size={16} />
            </button>

            <button className="secondary-action-btn" onClick={onOpenSellModal}>
              <UploadCloud size={17} />
              <span>List Your Notes</span>
            </button>

            <button className="crow-assistant-pill-btn" onClick={onOpenCrow}>
              <Sparkles size={16} />
              <span>Ask Crow AI</span>
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="hero-perks-row">
            <div className="perk-item">
              <div className="perk-icon-circle gold">
                <Coins size={16} />
              </div>
              <div className="perk-details">
                <strong>Gold Bar Wallet</strong>
                <span>Earn on every purchase</span>
              </div>
            </div>

            <div className="perk-item">
              <div className="perk-icon-circle indigo">
                <Sparkles size={16} />
              </div>
              <div className="perk-details">
                <strong>Crow AI Shopping</strong>
                <span>Instant semantic matching</span>
              </div>
            </div>

            <div className="perk-item">
              <div className="perk-icon-circle emerald">
                <ShieldCheck size={16} />
              </div>
              <div className="perk-details">
                <strong>100% Verified Scans</strong>
                <span>Peer-reviewed topper notes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Feature Showcase Card */}
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

            <h4 className="sample-note-title">GATE CSE 2025: Operating Systems & Virtual Memory Masterclass</h4>
            
            <div className="sample-snippet-box">
              <span className="snippet-label">High-Yield Excerpt:</span>
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
                <span>OR <strong>199 Bars (Free)</strong></span>
              </div>
            </div>

            <div className="coin-earning-alert">
              <span>🎁 Purchasing gives you <strong>+30 Gold Bars</strong> instant cashback</span>
            </div>
          </div>

          {/* Glowing background aura */}
          <div className="ambient-orb-primary" />
          <div className="ambient-orb-secondary" />
        </div>
      </div>

      {/* Live Marketplace Trust Counters */}
      <div className="hero-metrics-strip glass-panel">
        <div className="metric-item">
          <div className="metric-icon-box">
            <FileCheck size={20} className="gold-text" />
          </div>
          <div className="metric-data">
            <div className="metric-val">50,000+</div>
            <div className="metric-label">Verified Notes & Blueprints</div>
          </div>
        </div>

        <div className="metric-divider" />

        <div className="metric-item">
          <div className="metric-icon-box">
            <Users size={20} className="cyan-text" />
          </div>
          <div className="metric-data">
            <div className="metric-val">15,000+</div>
            <div className="metric-label">Rankers & University Sellers</div>
          </div>
        </div>

        <div className="metric-divider" />

        <div className="metric-item">
          <div className="metric-icon-box">
            <Coins size={20} className="gold-text" />
          </div>
          <div className="metric-data">
            <div className="metric-val">₹15 Lakh+</div>
            <div className="metric-label">Earned by Student Authors</div>
          </div>
        </div>

        <div className="metric-divider" />

        <div className="metric-item">
          <div className="metric-icon-box">
            <Star size={20} className="rose-text" />
          </div>
          <div className="metric-data">
            <div className="metric-val">4.92 / 5.0</div>
            <div className="metric-label">Average Student Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}

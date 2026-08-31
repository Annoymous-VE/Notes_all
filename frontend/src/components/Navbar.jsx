import React, { useState } from 'react';
import { 
  Coins, 
  Search, 
  Sparkles, 
  UploadCloud, 
  User, 
  ShoppingCart, 
  BookOpen, 
  LogOut, 
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';

export default function Navbar({
  backendStatus = 'checking',
  goldBars,
  cartCount,
  searchQuery,
  setSearchQuery,
  onOpenCrow,
  onOpenSellModal,
  onOpenCart,
  onOpenAuth,
  currentUser,
  onLogout
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="site-header">
      {/* Top Notification Bar */}
      <div className="top-banner">
        <div className="banner-content">
          <span className="banner-tag">🔥 EXAM SEASON OFFER</span>
          <span>Earn <strong>20% Back in Gold Bars</strong> on every study note purchase! Redeem for 100% free notes anytime.</span>
          <button className="banner-crow-hint" onClick={onOpenCrow}>
            <Sparkles size={13} className="sparkle-icon" /> Ask Crow AI for recommendations &rarr;
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar-container">
        {/* Brand Logo & Connection Badge */}
        <div className="brand-logo-area" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon-box">
            <GraduationCap className="logo-cap-icon" size={24} />
          </div>
          <div className="brand-names">
            <div className="brand-title">
              Note<span className="gold-text">Verse</span>
            </div>
            <span className="brand-tagline">Study Marketplace</span>
          </div>
        </div>

        {/* Global Search Bar with Crow AI Shortcut */}
        <div className="search-bar-wrapper">
          <div className="search-input-group">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by topic, university, exam (e.g. 'GATE OS', 'IIT Bombay', 'NEET')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          
          <button 
            className="crow-ai-search-btn"
            onClick={onOpenCrow}
            title="Open Crow AI Assistant"
          >
            <Sparkles size={16} className="sparkle-animate" />
            <span>Ask Crow AI</span>
          </button>
        </div>

        {/* Action Controls: Backend Status, Gold Bars, Sell Notes, Cart, Account */}
        <div className="nav-actions">
          {/* Backend Connection Indicator Badge */}
          <div 
            className={`connection-status-pill ${backendStatus}`}
            title={backendStatus === 'online' ? 'Backend FastAPI Server is Connected (127.0.0.1:8000)' : 'Backend API is Offline'}
          >
            <span className={`status-dot ${backendStatus}`}></span>
            <span className="status-label">
              {backendStatus === 'online' ? 'API Online' : backendStatus === 'checking' ? 'Connecting...' : 'API Offline'}
            </span>
          </div>

          {/* Gold Bars Wallet pill */}
          <div 
            className="gold-bars-pill animate-pulse-glow"
            title="Your Gold Bar Coins Balance. Earn upon buying, use to get massive discounts!"
          >
            <div className="gold-coin-symbol">
              <Coins size={17} />
            </div>
            <div className="gold-balance-text">
              <span className="gold-amount">{goldBars}</span>
              <span className="gold-label">Gold Bars</span>
            </div>
          </div>


          {/* Sell Notes Button */}
          <button 
            className="sell-notes-btn"
            onClick={onOpenSellModal}
          >
            <UploadCloud size={17} />
            <span>Sell Notes</span>
          </button>

          {/* Cart Icon */}
          <button className="nav-icon-btn" onClick={onOpenCart} title="View Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>

          {/* User Account / Login */}
          <div className="user-profile-menu">
            {currentUser ? (
              <div className="user-logged-box" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                <div className="avatar-circle">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <span className="user-name-short">{currentUser.name || 'Account'}</span>
                
                {showUserDropdown && (
                  <div className="user-dropdown-card glass-panel">
                    <div className="dropdown-user-header">
                      <div className="dropdown-user-name">{currentUser.name}</div>
                      <div className="dropdown-user-email">{currentUser.email}</div>
                    </div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-gold-row">
                      <span>Gold Bars:</span>
                      <strong className="gold-text">{goldBars} Bars</strong>
                    </div>
                    <button className="dropdown-item logout" onClick={onLogout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-trigger-btn" onClick={onOpenAuth}>
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

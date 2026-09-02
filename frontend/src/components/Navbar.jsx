import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Search, 
  Sparkles, 
  UploadCloud, 
  User, 
  ShoppingCart, 
  LogOut, 
  GraduationCap,
  Palette,
  Check,
  Menu,
  X,
  Zap,
  BookOpen
} from 'lucide-react';

const THEMES = [
  { id: 'cosmic', name: 'Cosmic Indigo', color: '#6366f1', icon: '🌌' },
  { id: 'royal', name: 'Royal Obsidian', color: '#f59e0b', icon: '👑' },
  { id: 'emerald', name: 'Emerald Cyber', color: '#10b981', icon: '🌿' },
  { id: 'sunset', name: 'Sunset Cyberpunk', color: '#f43f5e', icon: '🔮' },
];

export default function Navbar({
  goldBars,
  cartCount,
  searchQuery,
  setSearchQuery,
  onOpenCrow,
  onOpenSellModal,
  onOpenCart,
  onOpenAuth,
  currentUser,
  onLogout,
  currentTheme,
  onThemeChange
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut listener for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="site-header">
      {/* Top Notification Bar */}
      <div className="top-banner">
        <div className="banner-content">
          <span className="banner-tag">
            <Zap size={11} className="inline-icon" /> EXAM SEASON REWARDS
          </span>
          <span className="banner-text">
            Get <strong>20% Back in Gold Bars</strong> on every note. 1 Gold Bar = ₹1 instant discount!
          </span>
          <button className="banner-crow-hint" onClick={onOpenCrow}>
            <Sparkles size={13} className="sparkle-icon" /> Ask Crow AI for Study Matches &rarr;
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="brand-logo-area" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon-box">
            <GraduationCap className="logo-cap-icon" size={22} />
          </div>
          <div className="brand-names">
            <div className="brand-title">
              Note<span className="brand-gradient-text">Verse</span>
            </div>
            <span className="brand-tagline">AI Study Exchange</span>
          </div>
        </div>

        {/* Global Search Bar with Crow AI Shortcut */}
        <div className="search-bar-wrapper">
          <div className="search-input-group">
            <Search className="search-icon" size={17} />
            <input 
              id="global-search-input"
              type="text" 
              placeholder="Search subjects, exams, or universities (e.g. 'GATE CSE', 'UPSC History', 'NEET')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery ? (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
            ) : (
              <span className="kbd-shortcut-hint">Ctrl K</span>
            )}
          </div>
          
          <button 
            className="crow-ai-search-btn"
            onClick={onOpenCrow}
            title="Ask Crow AI Shopping Assistant"
          >
            <Sparkles size={15} className="sparkle-anim" />
            <span>Ask Crow AI</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Theme Switcher */}
          <div className="theme-switcher-wrapper">
            <button 
              className="nav-icon-btn theme-btn"
              onClick={() => {
                setShowThemeDropdown(!showThemeDropdown);
                setShowUserDropdown(false);
              }}
              title="Change Color Theme"
            >
              <Palette size={18} />
            </button>

            {showThemeDropdown && (
              <div className="theme-dropdown-card glass-panel-accent">
                <div className="dropdown-title">Choose Color Theme</div>
                <div className="theme-list">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-option-btn ${currentTheme === theme.id ? 'active' : ''}`}
                      onClick={() => {
                        onThemeChange(theme.id);
                        setShowThemeDropdown(false);
                      }}
                    >
                      <span className="theme-option-icon">{theme.icon}</span>
                      <span className="theme-option-name">{theme.name}</span>
                      <span className="theme-color-dot" style={{ backgroundColor: theme.color }} />
                      {currentTheme === theme.id && <Check size={14} className="theme-check" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gold Bars Wallet Pill */}
          <div 
            className="gold-bars-pill animate-pulse-glow"
            title="Your Gold Bar Balance. Earn upon buying, use to get 100% free notes!"
            onClick={onOpenCrow}
          >
            <div className="gold-coin-symbol">
              <Coins size={16} />
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
            <UploadCloud size={16} />
            <span>Sell Notes</span>
          </button>

          {/* Cart Icon */}
          <button className="nav-icon-btn cart-btn" onClick={onOpenCart} title="View Cart">
            <ShoppingCart size={19} />
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>

          {/* User Profile / Login */}
          <div className="user-profile-menu">
            {currentUser ? (
              <div className="user-logged-box" onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowThemeDropdown(false);
              }}>
                <div className="avatar-circle">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <span className="user-name-short">{currentUser.name || 'Account'}</span>
                
                {showUserDropdown && (
                  <div className="user-dropdown-card glass-panel-accent">
                    <div className="dropdown-user-header">
                      <div className="dropdown-user-name">{currentUser.name}</div>
                      <div className="dropdown-user-email">{currentUser.email}</div>
                    </div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-gold-row">
                      <span>Gold Wallet:</span>
                      <strong className="gold-text">{goldBars} Bars</strong>
                    </div>
                    <button className="dropdown-item logout" onClick={onLogout}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-trigger-btn" onClick={onOpenAuth}>
                <User size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer glass-panel">
          <div className="mobile-drawer-inner">
            <div className="mobile-gold-card">
              <Coins size={20} className="gold-text" />
              <div>
                <div className="mobile-gold-val">{goldBars} Gold Bars</div>
                <span className="mobile-gold-sub">Redeem for 100% free study materials</span>
              </div>
            </div>

            <div className="mobile-nav-links">
              <button className="mobile-nav-btn primary" onClick={() => { onOpenCrow(); setMobileMenuOpen(false); }}>
                <Sparkles size={16} /> Ask Crow AI Assistant
              </button>
              <button className="mobile-nav-btn" onClick={() => { onOpenSellModal(); setMobileMenuOpen(false); }}>
                <UploadCloud size={16} /> Publish & Sell Notes
              </button>
              <button className="mobile-nav-btn" onClick={() => { onOpenCart(); setMobileMenuOpen(false); }}>
                <ShoppingCart size={16} /> View Cart ({cartCount})
              </button>
              {currentUser ? (
                <button className="mobile-nav-btn logout" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>
                  <LogOut size={16} /> Sign Out ({currentUser.name})
                </button>
              ) : (
                <button className="mobile-nav-btn signin" onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}>
                  <User size={16} /> Sign In / Claim 150 Bars
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

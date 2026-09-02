import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import NoteCard from './components/NoteCard';
import CrowChatDrawer from './components/CrowChatDrawer';
import SellNoteModal from './components/SellNoteModal';
import CartModal from './components/CartModal';
import AuthModal from './components/AuthModal';
import NoteQuickViewModal from './components/NoteQuickViewModal';
import { INITIAL_NOTES, CATEGORIES } from './data/notesData';
import { 
  getGoldBars, 
  setGoldBars, 
  getUserData, 
  setUserData, 
  setAuthToken,
  api
} from './services/api';
import { 
  Sparkles, 
  Coins, 
  SlidersHorizontal, 
  GraduationCap, 
  Layers, 
  BookOpen, 
  Award,
  ChevronRight,
  UploadCloud,
  CheckCircle,
  Terminal,
  Scale,
  Stethoscope,
  Cpu,
  TrendingUp,
  FlaskConical,
  Filter,
  Flame,
  Star,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './App.css';

const CATEGORY_ICONS = {
  'All Materials': Sparkles,
  'Computer Science': Terminal,
  'Civil Services': Scale,
  'Medical / NEET': Stethoscope,
  'Engineering / Software': Cpu,
  'Commerce / CA': TrendingUp,
  'General Science': FlaskConical,
};

const QUICK_FILTERS = [
  { id: 'all', label: 'All Materials', icon: Sparkles },
  { id: 'bestseller', label: '👑 Bestsellers', icon: Award },
  { id: 'free_coins', label: '🔥 Free with Gold Bars', icon: Coins },
  { id: 'high_rated', label: '⭐ 4.9+ Rated', icon: Star },
];

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('noteverse_theme') || 'cosmic';
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notesall_marketplace_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [goldBars, setGoldBarsState] = useState(getGoldBars);
  const [currentUser, setCurrentUserState] = useState(getUserData);
  const [cart, setCart] = useState([]);
  const [purchasedNoteIds, setPurchasedNoteIds] = useState(() => {
    const saved = localStorage.getItem('notesall_purchased_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // UI Modals & Drawers
  const [isCrowOpen, setIsCrowOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeQuickViewNote, setActiveQuickViewNote] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Materials');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [sortBy, setSortBy] = useState('bestseller');
  const [toastMessage, setToastMessage] = useState('');

  // Handle theme persistence
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('noteverse_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync state changes
  useEffect(() => {
    localStorage.setItem('notesall_marketplace_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('notesall_purchased_ids', JSON.stringify(purchasedNoteIds));
  }, [purchasedNoteIds]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const updateGoldBars = (newVal) => {
    setGoldBarsState(newVal);
    setGoldBars(newVal);
  };

  // Add to cart
  const handleAddToCart = (note) => {
    if (!cart.some(item => item.id === note.id)) {
      setCart([...cart, note]);
      showToast(`Added "${note.title.slice(0, 30)}..." to study cart!`);
    } else {
      showToast(`Note is already in your study cart!`);
    }
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (noteId) => {
    setCart(cart.filter(item => item.id !== noteId));
  };

  // Instant direct buy with gold bars (100% discount using coins)
  const handleBuyWithCoins = (note) => {
    if (goldBars >= note.goldCoinPrice) {
      updateGoldBars(goldBars - note.goldCoinPrice);
      setPurchasedNoteIds(prev => [...prev, note.id]);
      
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
      } catch (e) {}

      showToast(`🎉 Redeemed "${note.title}" 100% Free with ${note.goldCoinPrice} Gold Bars!`);
      setActiveQuickViewNote(note);
    } else {
      showToast(`You need ${note.goldCoinPrice - goldBars} more Gold Bars to get this for free.`);
      setIsCrowOpen(true);
    }
  };

  // Cart checkout success
  const handleCheckoutSuccess = ({ purchasedNotes, coinsUsed, coinsAwarded }) => {
    const netGold = goldBars - coinsUsed + coinsAwarded;
    updateGoldBars(netGold);
    const newIds = purchasedNotes.map(n => n.id);
    setPurchasedNoteIds(prev => [...prev, ...newIds]);
    setCart([]);
    showToast(`Order complete! +${coinsAwarded} Gold Bars credited to your wallet.`);
  };

  // Published new note by seller
  const handleNotePublished = (newNote) => {
    setNotes([newNote, ...notes]);
    updateGoldBars(goldBars + 25);
    showToast(`🎉 Note published! +25 Gold Bars added to your wallet.`);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUserState(user);
    if (goldBars < 150) {
      updateGoldBars(150);
    }
    showToast(`Welcome back, ${user.name || 'Scholar'}!`);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUserData(null);
    setCurrentUserState(null);
    showToast('Signed out successfully.');
  };

  // Filter and Sort Notes
  const filteredNotes = notes.filter((n) => {
    const matchesCategory = selectedCategory === 'All Materials' || n.category === selectedCategory;
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesQuickFilter = true;
    if (activeQuickFilter === 'bestseller') {
      matchesQuickFilter = n.isBestseller;
    } else if (activeQuickFilter === 'free_coins') {
      matchesQuickFilter = n.goldCoinPrice <= goldBars;
    } else if (activeQuickFilter === 'high_rated') {
      matchesQuickFilter = n.rating >= 4.9;
    }

    return matchesCategory && matchesSearch && matchesQuickFilter;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
  });

  return (
    <div className="app-root" data-theme={theme}>
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="toast-notification-banner glass-panel-accent animate-float">
          <Sparkles size={16} className="gold-text" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        goldBars={goldBars}
        cartCount={cart.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCrow={() => setIsCrowOpen(true)}
        onOpenSellModal={() => setIsSellModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* Hero Banner Section */}
      <HeroSection 
        onOpenCrow={() => setIsCrowOpen(true)}
        onOpenSellModal={() => setIsSellModalOpen(true)}
        onExploreClick={() => {
          document.getElementById('marketplace-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Main Marketplace Section */}
      <main className="marketplace-section" id="marketplace-anchor">
        <div className="marketplace-container">
          
          {/* Category Navigation Strip with Icons and Item Counts */}
          <div className="categories-header-strip">
            <div className="categories-pills-list">
              {CATEGORIES.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat] || BookOpen;
                const count = cat === 'All Materials' 
                  ? notes.length 
                  : notes.filter(n => n.category === cat).length;

                return (
                  <button
                    key={cat}
                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <IconComponent size={15} className="cat-chip-icon" />
                    <span>{cat}</span>
                    <span className="cat-chip-count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="sort-control-group">
              <span className="sort-label">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option value="bestseller">👑 Bestsellers & Featured</option>
                <option value="rating">⭐ Highest Rated (4.9+)</option>
                <option value="price-low">₹ Price: Low to High</option>
                <option value="price-high">₹ Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Sub-toolbar */}
          <div className="quick-filter-toolbar">
            <div className="quick-filter-pills">
              <span className="quick-filter-label">Quick Filter:</span>
              {QUICK_FILTERS.map((qf) => {
                const Icon = qf.icon;
                return (
                  <button
                    key={qf.id}
                    className={`qf-chip ${activeQuickFilter === qf.id ? 'active' : ''}`}
                    onClick={() => setActiveQuickFilter(qf.id)}
                  >
                    <Icon size={13} />
                    <span>{qf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Wallet Callout */}
            <div className="quick-balance-callout" onClick={() => setIsCrowOpen(true)}>
              <Coins size={15} className="gold-text" />
              <span>Wallet: <strong>{goldBars} Gold Bars</strong></span>
              <span className="wallet-redeem-hint">Redeem Free &rarr;</span>
            </div>
          </div>

          {/* Crow AI Smart Banner inside Marketplace */}
          <div className="crow-discovery-strip glass-panel-accent">
            <div className="discovery-left">
              <div className="crow-avatar-small">
                <Sparkles size={18} className="gold-text" />
              </div>
              <div>
                <strong>Need help finding the right study material?</strong>
                <p>Crow AI matches your exam syllabus, question patterns, and finds items you can redeem for 100% Free with your Gold Bars.</p>
              </div>
            </div>
            <button className="crow-consult-btn" onClick={() => setIsCrowOpen(true)}>
              <Sparkles size={15} /> Talk to Crow AI
            </button>
          </div>

          {/* Section Header */}
          <div className="section-title-row">
            <div>
              <h2 className="section-title">
                {selectedCategory === 'All Materials' ? 'Explore Verified Study Materials' : selectedCategory}
              </h2>
              <p className="section-desc">Showing {filteredNotes.length} hand-curated notes with topper annotations & verified solution sheets</p>
            </div>
          </div>

          {/* Product Grid */}
          {filteredNotes.length > 0 ? (
            <div className="notes-marketplace-grid">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  userCoins={goldBars}
                  isPurchased={purchasedNoteIds.includes(note.id)}
                  onQuickView={(n) => setActiveQuickViewNote(n)}
                  onAddToCart={handleAddToCart}
                  onBuyWithCoins={handleBuyWithCoins}
                />
              ))}
            </div>
          ) : (
            <div className="no-results-box glass-panel">
              <h3>No study materials found for "{searchQuery}"</h3>
              <p>Try searching for different keywords or ask Crow AI for assistance.</p>
              <button 
                className="crow-consult-btn mt-4" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Materials');
                  setActiveQuickFilter('all');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Selling Callout Banner */}
          <section className="seller-callout-banner glass-panel-accent">
            <div className="seller-banner-content">
              <div className="banner-badge">EARN PASSIVE REVENUE</div>
              <h2>Have Great Semester Notes? Start Selling Today</h2>
              <p>
                Upload your handwritten PDFs or solved question banks. Set your own price in Rupees, 
                and receive a continuous stream of student earnings + Gold Bars whenever peers download your materials!
              </p>
              <div className="seller-banner-actions">
                <button className="btn-become-seller" onClick={() => setIsSellModalOpen(true)}>
                  <UploadCloud size={17} />
                  <span>List Your Notes Now</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Floating Crow AI Button (Fixed at Bottom Right) */}
      <button 
        className="floating-crow-fab animate-pulse-glow"
        onClick={() => setIsCrowOpen(true)}
        title="Chat with Crow AI (Rufus for Notes)"
      >
        <div className="fab-icon-box">
          <Sparkles size={22} className="sparkle-anim" />
        </div>
        <div className="fab-text-box">
          <span className="fab-title">Ask Crow AI</span>
          <span className="fab-sub">Study Advisor</span>
        </div>
      </button>

      {/* Modals & Drawers */}
      <CrowChatDrawer
        isOpen={isCrowOpen}
        onClose={() => setIsCrowOpen(false)}
        notes={notes}
        userCoins={goldBars}
        onSelectNote={(note) => setActiveQuickViewNote(note)}
      />

      <SellNoteModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        currentUser={currentUser}
        onNotePublished={handleNotePublished}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        userCoins={goldBars}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <NoteQuickViewModal
        isOpen={!!activeQuickViewNote}
        onClose={() => setActiveQuickViewNote(null)}
        note={activeQuickViewNote}
        userCoins={goldBars}
        onAddToCart={handleAddToCart}
        onBuyWithCoins={handleBuyWithCoins}
        isPurchased={activeQuickViewNote ? purchasedNoteIds.includes(activeQuickViewNote.id) : false}
      />

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="brand-logo-area">
              <GraduationCap className="logo-cap-icon" size={24} />
              <div className="brand-title">Note<span className="brand-gradient-text">Verse</span></div>
            </div>
            <p className="footer-desc">
              India's premier digital marketplace for university scholars to buy, sell, and learn with AI-powered study assistance.
            </p>
          </div>
          <div className="footer-links-col">
            <h4>Marketplace</h4>
            <a href="#marketplace-anchor" onClick={() => setSelectedCategory('Computer Science')}>Engineering & CS</a>
            <a href="#marketplace-anchor" onClick={() => setSelectedCategory('Civil Services')}>Civil Services / UPSC</a>
            <a href="#marketplace-anchor" onClick={() => setSelectedCategory('Medical / NEET')}>Medical / NEET</a>
            <a href="#marketplace-anchor" onClick={() => setSelectedCategory('Commerce / CA')}>CA & Commerce</a>
          </div>
          <div className="footer-links-col">
            <h4>Gold Bar Rewards</h4>
            <a href="#marketplace-anchor" onClick={() => setIsCrowOpen(true)}>How Gold Bars Work</a>
            <a href="#marketplace-anchor" onClick={() => setIsAuthOpen(true)}>Sign Up (Get 150 Bars)</a>
            <a href="#marketplace-anchor" onClick={() => setIsSellModalOpen(true)}>Earn by Selling</a>
          </div>
          <div className="footer-links-col">
            <h4>Crow AI</h4>
            <a href="#marketplace-anchor" onClick={() => setIsCrowOpen(true)}>Semantic Search</a>
            <a href="#marketplace-anchor" onClick={() => setIsCrowOpen(true)}>Personalized Recommendations</a>
            <a href="#marketplace-anchor" onClick={() => setIsCrowOpen(true)}>Syllabus Matching</a>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <span>© 2026 NoteVerse Technologies Inc. All rights reserved.</span>
          <span>FastAPI • React 19 • PgVector • Crow AI</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

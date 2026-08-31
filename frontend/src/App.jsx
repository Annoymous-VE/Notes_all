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
  setAuthToken 
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
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './App.css';

function App() {
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
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [activeQuickViewNote, setActiveQuickViewNote] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Materials');
  const [sortBy, setSortBy] = useState('bestseller');

  // Check backend connectivity on mount and every 15 seconds
  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/health');
        if (res.ok) {
          if (isMounted) setBackendStatus('online');
        } else {
          if (isMounted) setBackendStatus('offline');
        }
      } catch (e) {
        if (isMounted) setBackendStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);


  // Sync state changes
  useEffect(() => {
    localStorage.setItem('notesall_marketplace_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('notesall_purchased_ids', JSON.stringify(purchasedNoteIds));
  }, [purchasedNoteIds]);

  const updateGoldBars = (newVal) => {
    setGoldBarsState(newVal);
    setGoldBars(newVal);
  };

  // Add to cart
  const handleAddToCart = (note) => {
    if (!cart.some(item => item.id === note.id)) {
      setCart([...cart, note]);
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
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      alert(`🎉 Congratulations! You redeemed "${note.title}" for 100% free using ${note.goldCoinPrice} Gold Bars!`);
      setActiveQuickViewNote(note);
    } else {
      alert(`You need ${note.goldCoinPrice - goldBars} more Gold Bars to get this for free. You can add it to cart and pay with cash, or ask Crow AI for other notes!`);
    }
  };

  // Cart checkout success
  const handleCheckoutSuccess = ({ purchasedNotes, coinsUsed, coinsAwarded }) => {
    const netGold = goldBars - coinsUsed + coinsAwarded;
    updateGoldBars(netGold);
    const newIds = purchasedNotes.map(n => n.id);
    setPurchasedNoteIds(prev => [...prev, ...newIds]);
    setCart([]);
  };

  // Published new note by seller
  const handleNotePublished = (newNote) => {
    setNotes([newNote, ...notes]);
    // Award the user 25 gold bars for publishing their first note
    updateGoldBars(goldBars + 25);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUserState(user);
    // Give 150 welcome gold bars if user is fresh
    if (goldBars < 150) {
      updateGoldBars(150);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUserData(null);
    setCurrentUserState(null);
  };

  // Filter and Sort Notes
  const filteredNotes = notes.filter((n) => {
    const matchesCategory = selectedCategory === 'All Materials' || n.category === selectedCategory;
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
  });

  return (
    <div className="app-root">
      {/* Top Navigation */}
      <Navbar
        backendStatus={backendStatus}
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
      />


      {/* Hero Banner Section */}
      <HeroSection 
        onOpenCrow={() => setIsCrowOpen(true)}
        onOpenSellModal={() => setIsSellModalOpen(true)}
        onExploreClick={() => {
          document.getElementById('marketplace-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Marketplace Area */}
      <main className="marketplace-section" id="marketplace-anchor">
        <div className="marketplace-container">
          
          {/* Category Pills Navigation (Amazon/Flipkart Style) */}
          <div className="categories-header-strip">
            <div className="categories-pills-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="sort-control-group">
              <span className="sort-label">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option value="bestseller">Bestsellers & Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Crow AI Smart Banner inside Marketplace */}
          <div className="crow-discovery-strip glass-panel">
            <div className="discovery-left">
              <div className="crow-avatar-small">
                <Sparkles size={18} className="gold-text" />
              </div>
              <div>
                <strong>Need help picking the right study material?</strong>
                <p>Crow AI analyzes semester syllabus, past question trends, and matches your Gold Bars balance.</p>
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
                {selectedCategory === 'All Materials' ? 'Explore Top Verified Study Materials' : selectedCategory}
              </h2>
              <p className="section-desc">Showing {filteredNotes.length} hand-curated notes with topper annotations</p>
            </div>

            {/* Quick Balance Reminder */}
            <div className="quick-balance-callout">
              <Coins size={16} className="gold-text" />
              <span>Your Wallet: <strong>{goldBars} Gold Bars</strong></span>
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
              <button className="crow-consult-btn mt-4" onClick={() => setSearchQuery('')}>
                Reset Search Filters
              </button>
            </div>
          )}

          {/* Selling Promotional Banner */}
          <section className="seller-callout-banner glass-panel">
            <div className="seller-banner-content">
              <div className="banner-badge">EARN PASSIVE REVENUE</div>
              <h2>Have Great Semester Notes? Start Selling Today</h2>
              <p>
                Upload your handwritten PDFs or solved question banks. Set your own price in Rupees, 
                and receive a continuous stream of earnings + Gold Bars whenever peers download your materials!
              </p>
              <div className="seller-banner-actions">
                <button className="btn-become-seller" onClick={() => setIsSellModalOpen(true)}>
                  <UploadCloud size={18} />
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
          <Sparkles size={24} className="sparkle-anim" />
        </div>
        <div className="fab-text-box">
          <span className="fab-title">Ask Crow AI</span>
          <span className="fab-sub">Study Assistant</span>
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
              <div className="brand-title">Note<span className="gold-text">Verse</span></div>
            </div>
            <p className="footer-desc">
              India's premier digital marketplace for students and university scholars to buy, sell, and learn with AI assistance.
            </p>
          </div>
          <div className="footer-links-col">
            <h4>Marketplace</h4>
            <a href="#marketplace-anchor">Engineering & CS</a>
            <a href="#marketplace-anchor">Civil Services / UPSC</a>
            <a href="#marketplace-anchor">Medical / NEET</a>
            <a href="#marketplace-anchor">CA & Commerce</a>
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

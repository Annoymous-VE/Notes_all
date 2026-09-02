import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Coins, 
  ArrowRight, 
  CheckCircle, 
  ShoppingBag, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  userCoins,
  onCheckoutSuccess
}) {
  const [useCoinsDiscount, setUseCoinsDiscount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0);

  if (!isOpen) return null;

  const totalFiat = cartItems.reduce((acc, item) => acc + item.price, 0);
  const totalEarnableCoins = cartItems.reduce((acc, item) => acc + (item.goldBarsEarned || 25), 0);

  const maxRedeemable = Math.min(userCoins, totalFiat);
  const appliedCoins = useCoinsDiscount ? maxRedeemable : 0;
  const finalPayable = Math.max(0, totalFiat - appliedCoins);

  const handleCheckout = () => {
    setIsProcessing(true);

    setTimeout(() => {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setLastEarnedCoins(totalEarnableCoins);
      setOrderComplete(true);
      setIsProcessing(false);

      onCheckoutSuccess({
        purchasedNotes: cartItems,
        coinsUsed: appliedCoins,
        coinsAwarded: totalEarnableCoins
      });
    }, 1000);
  };

  const handleResetAndClose = () => {
    setOrderComplete(false);
    setUseCoinsDiscount(false);
    onClearCart();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cart-modal glass-panel-accent" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="modal-icon-badge">
              <ShoppingBag className="gold-text" size={20} />
            </div>
            <div>
              <h3>Your Study Cart ({cartItems.length})</h3>
              <p className="modal-sub">Instant high-speed digital download access after checkout</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {orderComplete ? (
          <div className="checkout-success-view">
            <div className="celebration-circle animate-pulse-glow">
              <CheckCircle size={52} className="gold-text" />
            </div>
            <h2>Payment Successful!</h2>
            <p className="order-lead">
              Your study notes have been unlocked and added to your permanent library with offline access.
            </p>

            <div className="gold-reward-banner animate-float glass-panel">
              <div className="reward-badge-circle">
                <Coins size={28} className="gold-text" />
              </div>
              <div>
                <span className="reward-title">Gold Bars Credited to Wallet!</span>
                <div className="reward-amount">+{lastEarnedCoins} Gold Bars</div>
                <span className="reward-sub">Redeem them for your next semester notes for 100% free!</span>
              </div>
            </div>

            <button className="btn-continue-shopping" onClick={handleResetAndClose}>
              View Library & Continue Browsing
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart-state">
            <div className="empty-icon-circle">
              <ShoppingBag size={42} className="empty-icon" />
            </div>
            <h4>Your study cart is empty</h4>
            <p>Explore topper notes and exam blueprints to supercharge your revision.</p>
            <button className="btn-explore-now" onClick={onClose}>
              Browse Notes
            </button>
          </div>
        ) : (
          <div className="cart-body-layout">
            {/* Left Items List */}
            <div className="cart-items-column">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-row glass-panel">
                  <img src={item.previewUrl} alt="" className="cart-thumb" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{item.title}</h4>
                    <span className="cart-item-author">By {item.author.name} • {item.author.institution}</span>
                    <div className="cart-item-meta">
                      <span className="cart-earn-tag">
                        <Coins size={11} className="gold-text" /> +{item.goldBarsEarned} Bars
                      </span>
                      <span className="cart-pages">{item.pageCount} Pages • {item.fileType}</span>
                    </div>
                  </div>
                  <div className="cart-item-price-side">
                    <div className="cart-item-price">₹{item.price}</div>
                    <button 
                      className="cart-remove-btn" 
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove from Cart"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Summary & Gold Bar Redemption */}
            <div className="cart-summary-column glass-panel">
              <h4 className="summary-title">Order Breakdown</h4>

              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{totalFiat}</span>
              </div>

              {/* Gold Bars Discount Toggle */}
              <div className="gold-redemption-card glass-panel">
                <div className="redemption-header">
                  <div className="redemption-label">
                    <Coins size={15} className="gold-text" />
                    <strong>Redeem Gold Bars</strong>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={useCoinsDiscount}
                      disabled={userCoins <= 0}
                      onChange={(e) => setUseCoinsDiscount(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="redemption-sub">
                  Available Balance: <strong className="gold-text">{userCoins} Bars</strong>.
                  {userCoins > 0 ? (
                    <span> 1 Bar = ₹1 instant discount.</span>
                  ) : (
                    <span> Earn bars with this purchase!</span>
                  )}
                </div>

                {useCoinsDiscount && appliedCoins > 0 && (
                  <div className="applied-discount-chip">
                    <span>Discount Applied:</span>
                    <strong className="discount-value">-₹{appliedCoins} ({appliedCoins} Bars)</strong>
                  </div>
                )}
              </div>

              <div className="summary-divider" />

              <div className="summary-row total-row">
                <span>Total Amount to Pay</span>
                <span className="final-price">
                  {finalPayable === 0 ? (
                    <span className="free-tag">100% FREE (With Bars)</span>
                  ) : (
                    `₹${finalPayable}`
                  )}
                </span>
              </div>

              {/* Earning incentive */}
              <div className="earning-incentive-box">
                <Sparkles size={15} className="gold-text" />
                <span>You will earn <strong>+{totalEarnableCoins} Gold Bars</strong> on this order!</span>
              </div>

              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Place Order {finalPayable === 0 ? '(Free)' : `• ₹${finalPayable}`}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="security-note">
                <ShieldCheck size={14} /> 256-bit Encrypted Checkout • Instant Download Link
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

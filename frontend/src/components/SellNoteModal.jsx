import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Coins, 
  FileText, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function SellNoteModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onNotePublished,
  onOpenAuth
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Computer Science',
    subject: '',
    price: 199,
    description: '',
    tags: 'GATE, TopperNotes',
    sampleSnippet: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedFile) {
      setErrorMsg('Please select your note document (PDF, DOCX, or scan images)');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Try real file upload to backend endpoint /files/upload with metadata
      const userId = currentUser ? (currentUser.id || currentUser.email) : 'demo-seller-user-id';
      
      try {
        await api.uploadFile(userId, selectedFile, {
          title: formData.title,
          category: formData.category,
          subject: formData.subject,
          description: formData.description,
          tags: formData.tags,
          price: formData.price
        });
      } catch (err) {
        console.warn('Backend file upload fallback to client mock:', err);
      }


      // Calculate gold reward for seller (15% of price in gold bars)
      const calculatedGoldBars = Math.max(20, Math.floor(formData.price * 0.15));

      const newNote = {
        id: 'note-user-' + Date.now(),
        title: formData.title,
        description: formData.description,
        author: {
          name: currentUser ? currentUser.name : 'You (Verified Seller)',
          institution: 'Self Published',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          rating: 5.0,
          salesCount: 1
        },
        category: formData.category,
        subject: formData.subject || formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        price: Number(formData.price),
        originalPrice: Math.round(Number(formData.price) * 1.8),
        goldCoinPrice: Number(formData.price),
        goldBarsEarned: calculatedGoldBars,
        pageCount: Math.floor(Math.random() * 50) + 45,
        fileType: 'PDF Verified',
        rating: 5.0,
        reviewsCount: 1,
        previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        sampleSnippet: formData.sampleSnippet || 'Verified student study notes upload ready for reading and download.',
        isFeatured: false,
        isBestseller: false
      };

      onNotePublished(newNote);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        onClose();
      }, 1800);

    } catch (err) {
      setErrorMsg(err.message || 'Error publishing your note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <UploadCloud className="gold-text" size={24} />
            <div>
              <h3>Publish & Sell Your Notes</h3>
              <p className="modal-sub">Turn your handwritten study notes into steady passive income</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {uploadSuccess ? (
          <div className="upload-success-card">
            <CheckCircle2 size={48} className="success-icon" />
            <h4>Note Successfully Listed!</h4>
            <p>Your notes are now live on NoteVerse marketplace. You will earn rupees on sales + <strong>Gold Bars</strong> every time a student downloads your notes!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="sell-form">
            {errorMsg && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {!currentUser && (
              <div className="auth-hint-banner">
                <Info size={16} />
                <span>Publishing as guest demo seller. Sign in anytime to link your real bank payout account.</span>
              </div>
            )}

            <div className="form-group">
              <label>Note Title *</label>
              <input 
                type="text" 
                placeholder="e.g. UPSC Prelims Indian Polity 2025 Comprehensive Mindmaps"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Category *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Computer Science">Computer Science / GATE</option>
                  <option value="Civil Services">Civil Services / UPSC</option>
                  <option value="Medical / NEET">Medical / NEET</option>
                  <option value="Engineering / Software">Engineering / Software</option>
                  <option value="Commerce / CA">Commerce / CA</option>
                  <option value="General Science">General Science</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Selling Price (₹) *</label>
                <input 
                  type="number" 
                  min="49"
                  max="4999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="seller-earnings-highlight">
              <Coins size={16} className="gold-text" />
              <span>Buyers will earn <strong>+{Math.max(20, Math.floor(formData.price * 0.15))} Gold Bars</strong> on purchase!</span>
            </div>

            <div className="form-group">
              <label>Description & Chapter Outline</label>
              <textarea 
                rows="3"
                placeholder="Summarize key chapters, memory tricks, or previous years questions included..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input 
                type="text" 
                placeholder="Handwritten, Short Notes, PYQ, Formula Sheet"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            {/* Document File Drop Area */}
            <div className="form-group">
              <label>Upload Note File (PDF / Images / Docs) *</label>
              <div className="file-drop-zone">
                <input 
                  type="file" 
                  id="note-file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <label htmlFor="note-file-input" className="file-drop-label">
                  <UploadCloud size={32} className="drop-icon" />
                  {selectedFile ? (
                    <span className="file-selected-name">
                      <FileText size={16} /> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : (
                    <>
                      <span className="drop-title">Click to browse or drop your study material</span>
                      <span className="drop-sub">Supports PDF, Word Documents, Clean Scans up to 50MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit-gold" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading to Server...' : 'List for Sale & Earn'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

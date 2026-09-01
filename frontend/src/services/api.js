export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://notes-all-de4p.onrender.com').replace(/\/+$/, '');

// Store current token in memory and localStorage
export const getAuthToken = () => localStorage.getItem('notesall_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('notesall_token', token);
  } else {
    localStorage.removeItem('notesall_token');
  }
};

export const getUserData = () => {
  const data = localStorage.getItem('notesall_user');
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const setUserData = (user) => {
  if (user) {
    localStorage.setItem('notesall_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('notesall_user');
  }
};

// Gold bars balance storage (client sync & simulated state)
export const getGoldBars = () => {
  const saved = localStorage.getItem('notesall_gold_bars');
  return saved ? parseInt(saved, 10) : 150; // default welcome bonus: 150 gold bars
};

export const setGoldBars = (amount) => {
  localStorage.setItem('notesall_gold_bars', amount.toString());
};

// API Client
export const api = {
  // Health check to verify backend connectivity
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return { online: false };
      const data = await res.json();
      return { online: true, data };
    } catch (e) {
      return { online: false, error: e.message };
    }
  },

  // Auth

  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return await res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Invalid credentials');
    }
    return await res.json();
  },

  // Crow AI
  async chatWithCrow(message, conversationId = null) {
    let token = getAuthToken();
    // If not authenticated, authenticate with demo credentials so guest users can seamlessly use Crow AI
    if (!token) {
      try {
        const loginRes = await this.login('teststudent@example.com', 'password123');
        token = loginRes.access_token;
        setAuthToken(token);
      } catch (e) {
        // Continue if login fails
      }
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/crow/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      })
    });


    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Crow AI request failed' }));
      throw new Error(err.detail || 'Crow AI error');
    }
    return await res.json();
  },

  // Upload file with rich metadata for automatic vector indexing
  async uploadFile(userId, file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.subject) formData.append('subject', metadata.subject);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.tags) formData.append('tags', metadata.tags);
    if (metadata.price) formData.append('price', metadata.price.toString());

    const res = await fetch(`${API_BASE_URL}/files/upload?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'File upload failed' }));
      throw new Error(err.detail || 'Upload error');
    }
    return await res.json();
  },


  // Download file
  getDownloadUrl(userId, fileName) {
    return `${API_BASE_URL}/files/download?user_id=${encodeURIComponent(userId)}&file_name=${encodeURIComponent(fileName)}`;
  }
};

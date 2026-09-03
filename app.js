/**
 * JokiLaporan.id — Core App Module (app.js)
 * Handles: Auth, Notifications, Orders, Utilities
 */

const APP = (() => {
  // ==================== CONSTANTS ====================
  const KEYS = {
    users: 'joki_users',
    currentUser: 'joki_current_user',
    orders: 'joki_orders',
    formData: 'joki_form_data',
    draftData: 'joki_draft_',
    plan: 'joki_selected_plan',
    rewardTokens: 'joki_reward_tokens',
  };

  const PLANS = {
    free: {
      id: 'free', name: 'Gratis', price: 0, priceStr: 'Gratis',
      maxReports: 1, maxActivities: 10, maxPhotos: 20,
      canDocx: false, canPdfNoWatermark: false, revisions: 0,
      rewardRequired: true
    },
    pro: {
      id: 'pro', name: 'Pro', price: 30000, priceStr: 'Rp 30.000',
      maxReports: 1, maxActivities: 50, maxPhotos: 100,
      canDocx: true, canPdfNoWatermark: true, revisions: 5,
      rewardRequired: false
    },
    premium: {
      id: 'premium', name: 'Premium', price: 50000, priceStr: 'Rp 50.000',
      maxReports: 3, maxActivities: -1, maxPhotos: -1,
      canDocx: true, canPdfNoWatermark: true, revisions: 10,
      rewardRequired: false
    }
  };

  // ==================== STORAGE HELPERS ====================
  const storage = {
    get: (key) => {
      try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    set: (key, val) => {
      try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
    },
    remove: (key) => localStorage.removeItem(key)
  };

  // ==================== AUTH ====================
  const auth = {
    register(name, email, password, role = 'student') {
      const users = storage.get(KEYS.users) || [];
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Email sudah terdaftar!' };
      }
      const newUser = {
        id: 'user_' + Date.now(),
        name, email,
        password: btoa(password), // basic encoding (not real security)
        role,
        plan: 'free',
        revisions: 0,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      storage.set(KEYS.users, users);

      // Auto login
      const { password: _, ...safeUser } = newUser;
      storage.set(KEYS.currentUser, safeUser);
      return { success: true, user: safeUser };
    },

    login(email, password) {
      // Admin shortcut
      if (email === 'admin@jokilaporan.id' && password === 'admin123') {
        const adminUser = { id: 'admin_1', name: 'Super Admin', email, role: 'admin', plan: 'premium' };
        storage.set(KEYS.currentUser, adminUser);
        return { success: true, user: adminUser };
      }

      const users = storage.get(KEYS.users) || [];
      const user = users.find(u => u.email === email);
      if (!user) return { success: false, error: 'Email tidak terdaftar!' };
      if (user.password !== btoa(password)) return { success: false, error: 'Password salah!' };

      const { password: _, ...safeUser } = user;
      storage.set(KEYS.currentUser, safeUser);
      return { success: true, user: safeUser };
    },

    logout() {
      storage.remove(KEYS.currentUser);
      window.location.href = 'index.html';
    },

    getUser() { return storage.get(KEYS.currentUser); },

    updateUser(updates) {
      const user = auth.getUser();
      if (!user) return false;
      const updated = { ...user, ...updates };
      storage.set(KEYS.currentUser, updated);

      // Also update in users array
      const users = storage.get(KEYS.users) || [];
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        storage.set(KEYS.users, users);
      }
      return true;
    },

    getPlan() {
      const user = auth.getUser();
      return PLANS[user?.plan || 'free'] || PLANS.free;
    }
  };

  // ==================== ORDERS ====================
  const orders = {
    getAll() { return storage.get(KEYS.orders) || []; },

    getById(id) {
      return orders.getAll().find(o => o.id === id) || null;
    },

    getUserOrders() {
      const user = auth.getUser();
      if (!user) return [];
      return orders.getAll().filter(o => o.userId === user.id).reverse();
    },

    create(planId, formData) {
      const user = auth.getUser();
      const plan = PLANS[planId] || PLANS.free;
      const allOrders = orders.getAll();
      const order = {
        id: 'ORD-' + Date.now(),
        userId: user?.id || 'guest',
        planId,
        planName: plan.name,
        formData,
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      allOrders.push(order);
      storage.set(KEYS.orders, allOrders);
      return order;
    }
  };

  // ==================== DRAFT / FORM DATA ====================
  const draft = {
    save(reportId, data) {
      storage.set(KEYS.draftData + reportId, { ...data, savedAt: new Date().toISOString() });
    },
    load(reportId) { return storage.get(KEYS.draftData + reportId); },
    remove(reportId) { storage.remove(KEYS.draftData + reportId); },

    saveFormData(data) { storage.set(KEYS.formData, data); },
    loadFormData() { return storage.get(KEYS.formData); },
    clearFormData() { storage.remove(KEYS.formData); }
  };

  // ==================== PLAN/CART ====================
  const cart = {
    setSelectedPlan(plan) { storage.set(KEYS.plan, plan); },
    getSelectedPlan() { return storage.get(KEYS.plan); }
  };

  // ==================== REWARD TOKENS ====================
  const reward = {
    earn(feature) {
      const tokens = storage.get(KEYS.rewardTokens) || [];
      const token = {
        id: 'tok_' + Date.now(),
        feature,
        earnedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        used: false
      };
      tokens.push(token);
      storage.set(KEYS.rewardTokens, tokens);
      return token;
    },

    consume(feature) {
      const tokens = storage.get(KEYS.rewardTokens) || [];
      const valid = tokens.find(t =>
        t.feature === feature &&
        !t.used &&
        new Date(t.expiresAt) > new Date()
      );
      if (valid) {
        valid.used = true;
        storage.set(KEYS.rewardTokens, tokens);
        return true;
      }
      return false;
    },

    hasToken(feature) {
      const tokens = storage.get(KEYS.rewardTokens) || [];
      return tokens.some(t =>
        t.feature === feature &&
        !t.used &&
        new Date(t.expiresAt) > new Date()
      );
    }
  };

  // ==================== NOTIFICATIONS ====================
  let toastContainer = null;

  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  }

  function notify(message, type = 'info', duration = 4000) {
    const container = ensureToastContainer();
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon"><triangle points="10.29 3.86 1.82 18 22.18 18" cx="12" cy="12"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==================== NAVBAR SETUP ====================
  function setupNavbar() {
    const user = auth.getUser();
    const actionsEl = document.querySelector('.navbar-actions');
    if (!actionsEl) return;

    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'superadmin';
      actionsEl.innerHTML = `
        <a href="dashboard.html" class="btn btn-ghost btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Dashboard
        </a>
        ${isAdmin ? `<a href="admin.html" class="btn btn-outline btn-sm">Admin Panel</a>` : ''}
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0.75rem;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);font-size:0.85rem;">
          <span style="width:28px;height:28px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;">${user.name.charAt(0).toUpperCase()}</span>
          <span style="color:var(--text-secondary)">${user.name.split(' ')[0]}</span>
          <button onclick="APP.logout()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 0.25rem;font-size:0.75rem;font-family:inherit;" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      `;
    } else {
      // Only set if not already set with login/register buttons
      if (!actionsEl.querySelector('[onclick*="openModal"]') && !actionsEl.querySelector('.btn-primary')) {
        actionsEl.innerHTML = `
          <button class="btn btn-ghost btn-sm" onclick="openModal('loginModal')">Masuk</button>
          <button class="btn btn-primary btn-sm" onclick="openModal('registerModal')">Daftar Gratis</button>
        `;
      }
    }
  }

  // ==================== MODAL HELPERS ====================
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });

  // ==================== FAQ TOGGLE ====================
  function initFaq() {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ==================== REVEAL ON SCROLL ====================
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ==================== SCROLL TO TOP ====================
  function initScrollTop() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ==================== CONFIRM DIALOG ====================
  function confirm(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div style="font-size:2.5rem;margin-bottom:1rem">⚠️</div>
        <h3 style="margin-bottom:0.75rem;font-size:1.1rem">${message}</h3>
        <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.5rem">
          <button id="confirm-cancel" class="btn btn-outline">Batal</button>
          <button id="confirm-ok" class="btn btn-danger">Hapus</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); onConfirm?.(); };
    overlay.querySelector('#confirm-cancel').onclick = () => { overlay.remove(); onCancel?.(); };
  }

  // ==================== AUTH HANDLERS ====================
  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value?.trim();
    const password = document.getElementById('login-password')?.value;
    if (!email || !password) { notify('Isi email dan password!', 'error'); return; }

    const result = auth.login(email, password);
    if (result.success) {
      notify(`Selamat datang, ${result.user.name}! 👋`, 'success');
      closeModal('loginModal');
      if (typeof lucide !== 'undefined') lucide.createIcons();
      setupNavbar();
      setTimeout(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        if (redirect) window.location.href = redirect;
        else if (result.user.role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'dashboard.html';
      }, 800);
    } else {
      notify(result.error, 'error');
    }
  }

  function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name')?.value?.trim();
    const email = document.getElementById('reg-email')?.value?.trim();
    const password = document.getElementById('reg-password')?.value;
    if (!name || !email || !password) { notify('Isi semua field!', 'error'); return; }
    if (password.length < 6) { notify('Password minimal 6 karakter!', 'error'); return; }

    const result = auth.register(name, email, password);
    if (result.success) {
      notify(`Akun berhasil dibuat! Selamat datang, ${result.user.name}! 🎉`, 'success');
      closeModal('registerModal');
      setupNavbar();
      if (typeof lucide !== 'undefined') lucide.createIcons();
      setTimeout(() => window.location.href = 'dashboard.html', 800);
    } else {
      notify(result.error, 'error');
    }
  }

  // ==================== UTILITIES ====================
  function formatDate(isoStr) {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function formatDateShort(isoStr) {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==================== INIT ====================
  function init() {
    setupNavbar();
    initFaq();
    initReveal();
    initScrollTop();

    // Bind login/register forms
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.closest('#loginModal')) handleLogin(e);
      else if (form.closest('#registerModal')) handleRegister(e);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==================== PUBLIC API ====================
  return {
    // Auth
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    getUser: auth.getUser,
    updateUser: auth.updateUser,
    getPlan: auth.getPlan,
    PLANS,

    // Orders
    getOrders: orders.getUserOrders,
    getAllOrders: orders.getAll,
    getOrderById: orders.getById,
    createOrder: orders.create,

    // Draft
    saveDraft: draft.save,
    loadDraft: draft.load,
    setFormData: draft.saveFormData,
    getFormData: draft.loadFormData,
    clearFormData: draft.clearFormData,

    // Cart
    setPlan: cart.setSelectedPlan,
    getSelectedPlan: cart.getSelectedPlan,

    // Reward
    earnReward: reward.earn,
    consumeReward: reward.consume,
    hasRewardToken: reward.hasToken,

    // UI
    notify,
    init,
    setupNavbar,
    openModal,
    closeModal,
    confirm,

    // Utils
    formatDate,
    formatDateShort,
    formatCurrency,
    debounce,
    generateId,
    escapeHtml,
    storage
  };
})();

// Global modal helpers (backward compat)
function openModal(id) { APP.openModal(id); }
function closeModal(id) { APP.closeModal(id); }
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  if (!email || !password) { APP.notify('Isi email dan password!', 'error'); return; }
  const result = APP.login(email, password);
  if (result.success) {
    APP.notify(`Selamat datang, ${result.user.name}! 👋`, 'success');
    closeModal('loginModal');
    APP.setupNavbar();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
      if (result.user.role === 'admin') window.location.href = 'admin.html';
      else window.location.href = 'dashboard.html';
    }, 800);
  } else { APP.notify(result.error, 'error'); }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name')?.value?.trim();
  const email = document.getElementById('reg-email')?.value?.trim();
  const password = document.getElementById('reg-password')?.value;
  if (!name || !email || !password) { APP.notify('Isi semua field!', 'error'); return; }
  if (password.length < 6) { APP.notify('Password minimal 6 karakter!', 'error'); return; }
  const result = APP.register(name, email, password);
  if (result.success) {
    APP.notify(`Akun berhasil dibuat! Selamat datang! 🎉`, 'success');
    closeModal('registerModal');
    APP.setupNavbar();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  } else { APP.notify(result.error, 'error'); }
}

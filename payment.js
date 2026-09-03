/**
 * JokiLaporan.id — Payment Module (payment.js)
 */

const PAYMENT = (() => {
  const PLAN_DATA = {
    free:    { name: 'Basic',   price: 0,     priceStr: 'Gratis',    icon: 'file',  features: ['1x Laporan PKL', 'Download PDF', 'Menonton reward 30 detik'] },
    pro:     { name: 'Pro',     price: 30000,  priceStr: 'Rp 30.000', icon: 'star',  features: ['1x Laporan PKL', 'Download PDF + DOCX', 'Tanpa Iklan', '5x Revisi', 'Tanpa Watermark'] },
    premium: { name: 'Premium', price: 50000,  priceStr: 'Rp 50.000', icon: 'crown', features: ['3x Laporan PKL', 'Download PDF + DOCX', 'Tanpa Iklan', '10x Revisi', 'Tanpa Watermark', 'Kegiatan Tak Terbatas'] }
  };

  const PAYMENT_INFO = {
    qris:    { title: 'QRIS', number: '0000-0000-0000-0000', info: 'Scan QR Code dengan aplikasi e-wallet apapun (GoPay, OVO, Dana, dll)' },
    bca:     { title: 'Transfer BCA', number: '1234567890', info: 'a.n. JokiLaporan.id — Konfirmasi transfer via WhatsApp: 0812-3456-7890' },
    mandiri: { title: 'Transfer Mandiri', number: '1370012345678', info: 'a.n. JokiLaporan.id — Konfirmasi transfer via WhatsApp: 0812-3456-7890' },
    dana:    { title: 'DANA', number: '0812-3456-7890', info: 'Transfer ke nomor DANA di atas a.n. JokiLaporan' }
  };

  let selectedMethod = null;
  let currentPlan = null;

  function init() {
    const planData = APP.getSelectedPlan();
    if (!planData) { window.location.href = 'generate.html'; return; }

    currentPlan = planData;
    const plan = PLAN_DATA[planData.id] || PLAN_DATA.pro;

    // Set summary
    const iconEl = document.getElementById('summary-plan-icon');
    if (iconEl) iconEl.innerHTML = `<i data-lucide="${plan.icon}"></i>`;

    const nameEl = document.getElementById('summary-plan-name');
    if (nameEl) nameEl.textContent = plan.name;

    const priceEl = document.getElementById('summary-price');
    if (priceEl) priceEl.textContent = plan.priceStr;

    const totalEl = document.getElementById('summary-total');
    if (totalEl) totalEl.innerHTML = `<span class="text-gradient">${plan.priceStr}</span>`;

    const featEl = document.getElementById('summary-features');
    if (featEl) {
      featEl.innerHTML = plan.features.map(f =>
        `<li style="display:flex;align-items:center;gap:0.6rem">
          <span style="color:#86efac">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </span>${f}
        </li>`
      ).join('');
    }

    // For free plan, auto-redirect to reward
    if (planData.id === 'free') {
      const confirmBtn = document.getElementById('btn-confirm-pay');
      if (confirmBtn) {
        confirmBtn.textContent = 'Lanjut ke Reward';
        confirmBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Lanjut ke Reward`;
      }
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function selectMethod(el, method) {
    selectedMethod = method;
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
    el.classList.add('selected');

    const infoEl = document.getElementById('payment-detail-info');
    if (!infoEl) return;

    const info = PAYMENT_INFO[method];
    if (!info) return;

    infoEl.style.display = 'block';
    infoEl.innerHTML = `
      <h4 style="margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        ${info.title}
      </h4>
      <div style="background:var(--bg-surface);border-radius:var(--radius-md);padding:1rem;text-align:center;margin-bottom:0.75rem">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">Nomor ${method === 'qris' ? 'QRIS' : 'Rekening/Transfer'}</div>
        <div style="font-family:monospace;font-size:1.4rem;font-weight:700;color:var(--primary-light);letter-spacing:2px">${info.number}</div>
      </div>
      <div style="font-size:0.82rem;color:var(--text-secondary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${info.info}
      </div>
    `;
  }

  function confirmPayment() {
    const planData = APP.getSelectedPlan();
    if (!planData) { APP.notify('Data paket tidak ditemukan!', 'error'); return; }

    // For free plan, redirect to reward
    if (planData.id === 'free') {
      const formData = APP.getFormData();
      const order = APP.createOrder('free', formData);
      window.location.href = `reward.html?orderId=${order.id}&feature=pdf`;
      return;
    }

    // For paid plans, simulate payment
    if (!selectedMethod) {
      APP.notify('Pilih metode pembayaran terlebih dahulu!', 'warning');
      return;
    }

    // Show verify screen
    const payForm = document.getElementById('payment-form');
    const payVerify = document.getElementById('payment-verify');
    if (payForm) payForm.style.display = 'none';
    if (payVerify) payVerify.style.display = 'block';

    // Animate verification
    let countdown = 8;
    const countEl = document.getElementById('countdown-num');
    const progressEl = document.getElementById('verify-progress');

    const timer = setInterval(() => {
      countdown--;
      if (countEl) countEl.textContent = countdown;
      const pct = ((8 - countdown) / 8) * 100;
      if (progressEl) progressEl.style.width = pct + '%';

      if (countdown <= 0) {
        clearInterval(timer);
        // Payment success
        const formData = APP.getFormData();
        const order = APP.createOrder(planData.id, formData);

        // Update user plan
        const user = APP.getUser();
        if (user) {
          const revisions = planData.id === 'pro' ? 5 : planData.id === 'premium' ? 10 : 0;
          APP.updateUser({ plan: planData.id, revisions });
        }

        // Show success
        if (payVerify) payVerify.style.display = 'none';
        const paySuccess = document.getElementById('payment-success');
        if (paySuccess) paySuccess.style.display = 'block';

        const successId = document.getElementById('success-order-id');
        if (successId) successId.textContent = order.id;

        setTimeout(() => window.location.href = `result.html?id=${order.id}`, 3000);
      }
    }, 1000);
  }

  return { init, selectMethod, confirmPayment };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  APP.setupNavbar();
  PAYMENT.init();
});

/* ============================================================
   ADVOCATE PORTFOLIO — INTERACTIVE FEATURES (Phase 4)
   Disclaimer popup · Enquiry popup · WhatsApp button ·
   Animated counters · Smooth scroll · Mobile menu extras
   ------------------------------------------------------------
   NOTE: Navbar scroll effect, hamburger toggle and back-to-top
   click are wired in app.js (initNavbarBehaviour). This file
   adds everything else + outside-click close for the menu.
   ============================================================ */

'use strict';

/* ============================================================
   0. SETTINGS ACCESS
   ------------------------------------------------------------
   app.js exposes all loaded JSON as window.__SITE_DATA__ and
   fires "site:rendered". We wait for that (no double fetch),
   but fall back to fetching settings.json directly if needed.
   ============================================================ */
function getSettings() {
  return new Promise((resolve) => {
    if (window.__SITE_DATA__?.settings) {
      return resolve(window.__SITE_DATA__.settings);
    }
    let resolved = false;
    document.addEventListener('site:rendered', (e) => {
      if (!resolved) { resolved = true; resolve(e.detail?.settings || null); }
    }, { once: true });

    // Fallback: fetch directly if app.js hasn't rendered within 4s
    setTimeout(async () => {
      if (resolved) return;
      resolved = true;
      try {
        const res = await fetch('data/settings.json');
        resolve(res.ok ? await res.json() : null);
      } catch (err) {
        console.error('[popup] settings fallback fetch failed:', err);
        resolve(null);
      }
    }, 4000);
  });
}

/* ============================================================
   1. COOKIE HELPERS
   ============================================================ */
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

/* ============================================================
   2. MODAL UTILITIES
   ============================================================ */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // lock page scroll behind overlay
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  // Only restore scroll if no other modal is open
  if (!document.querySelector('.modal.open')) {
    document.body.style.overflow = '';
  }
}

/* ============================================================
   3. DISCLAIMER POPUP (cookie-gated, blocking)
   ============================================================ */
function initDisclaimer(settings) {
  const modal = document.getElementById('disclaimer-modal');
  if (!modal) return;

  const COOKIE = 'disclaimer_accepted';
  if (getCookie(COOKIE) === 'true') return; // already accepted

  // Inject disclaimer text from settings.json
  const body = modal.querySelector('.disclaimer__text');
  if (body) {
    body.textContent = settings?.disclaimer_text ||
      'By accessing this website, you acknowledge that the information provided ' +
      'is for general purposes only and does not constitute legal advice or solicitation.';
  }

  openModal(modal);

  // "I Understand" → set 30-day cookie → close
  const agreeBtn = document.getElementById('disclaimer-agree');
  agreeBtn?.addEventListener('click', () => {
    setCookie(COOKIE, 'true', 30);
    closeModal(modal);
  });

  // Deliberately NO overlay/Escape dismissal — user must accept.
}

/* ============================================================
   4. ENQUIRY POPUP (timed, once per session)
   ============================================================ */
function initEnquiryPopup(settings) {
  const modal = document.getElementById('enquiry-modal');
  if (!modal) return;

  const SEEN_KEY = 'enquiry_popup_shown';

  // Populate subtitle + case-type dropdown
  const subtitle = modal.querySelector('.modal__subtitle');
  if (subtitle) {
    subtitle.textContent = 'Share your details and we will get back to you shortly.';
  }
  const select = modal.querySelector('#enquiry-case-type');
  if (select && select.options.length <= 1) {
    ['Civil Matter', 'Criminal Matter', 'Family Matter',
     'Property Matter', 'Corporate Matter', 'Other'].forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
  }

  // --- Close interactions (X button + overlay click + Escape) ---
  modal.querySelectorAll('[data-close-modal]').forEach((el) =>
    el.addEventListener('click', () => closeModal(modal)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(modal);
  });

  // --- Timed auto-open (once per session) ---
  const enabled = settings?.enquiry_popup_enabled !== false;
  const delay = Math.max(1, Number(settings?.enquiry_popup_delay_seconds) || 15);

  if (enabled && !sessionStorage.getItem(SEEN_KEY)) {
    setTimeout(() => {
      // Don't interrupt the disclaimer if it's still open
      const disclaimer = document.getElementById('disclaimer-modal');
      if (disclaimer?.classList.contains('open')) {
        // Re-arm: try again after the disclaimer is accepted
        const retry = setInterval(() => {
          if (!disclaimer.classList.contains('open')) {
            clearInterval(retry);
            if (!sessionStorage.getItem(SEEN_KEY)) {
              openModal(modal);
              sessionStorage.setItem(SEEN_KEY, 'true');
            }
          }
        }, 1000);
        return;
      }
      openModal(modal);
      sessionStorage.setItem(SEEN_KEY, 'true');
    }, delay * 1000);
  }

  // --- Form submit → AJAX post to Netlify → success message ---
  const form = modal.querySelector('form[name="quick-enquiry"]');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

    let ok = false;
    try {
      // Netlify Forms accept POSTs with urlencoded body to any path
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      ok = res.ok;
    } catch (err) {
      console.error('[popup] enquiry submit failed:', err);
    }

    // Show inline success/failure message
    const card = modal.querySelector('.modal__card');
    const msg = document.createElement('p');
    msg.className = 'form__status';
    msg.setAttribute('role', 'status');
    msg.style.cssText =
      `margin-top:12px;text-align:center;font-weight:600;` +
      `color:${ok ? 'var(--clr-success)' : 'var(--clr-error)'};`;
    msg.innerHTML = ok
      ? '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Thank you! Your enquiry has been sent.'
      : '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> Something went wrong. Please try WhatsApp or call us.';
    card?.appendChild(msg);

    if (ok) {
      form.reset();
      // Close after 3 seconds
      setTimeout(() => { closeModal(modal); msg.remove(); }, 3000);
    } else {
      setTimeout(() => msg.remove(), 4000);
    }

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Enquiry'; }
  });
}

/* ============================================================
   5. WHATSAPP FLOATING BUTTON
   ============================================================ */
function initWhatsApp(settings) {
  const btn = document.getElementById('whatsapp-btn');
  if (!btn || !settings) return;

  const raw = String(settings.whatsapp_number || '').replace(/\D/g, '');
  if (!raw || /^X+$/i.test(String(settings.whatsapp_number))) {
    // Placeholder number — keep button visible but log a reminder
    console.warn('[popup] whatsapp_number is still a placeholder in settings.json');
    return;
  }

  const msg = settings.whatsapp_message
    ? `?text=${encodeURIComponent(settings.whatsapp_message)}`
    : '';
  btn.href = `https://wa.me/${raw}${msg}`;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  // Pulse animation is applied via .whatsapp-btn CSS keyframes
}

/* ============================================================
   6. ANIMATED COUNTERS (IntersectionObserver + rAF)
   ============================================================ */
function initCounters() {
  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const DURATION = 2000; // ms
  const easeOutQuad = (t) => t * (2 - t);

  function animateCounter(el) {
    const target = Number(el.dataset.target) || 0;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / DURATION, 1);
      el.textContent = Math.round(easeOutQuad(progress) * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.counter').forEach(animateCounter);
      obs.disconnect(); // animate once only
    });
  }, { threshold: 0.35 });

  observer.observe(statsSection);
}

/* ============================================================
   7. SMOOTH SCROLL WITH NAVBAR OFFSET
   ------------------------------------------------------------
   CSS scroll-behavior + scroll-padding-top already cover most
   cases; this adds JS-driven smoothness with exact offset and
   works for dynamically injected anchors too (event delegation).
   ============================================================ */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    if (!id) return; // plain "#" links (e.g. disclaimer) — leave to their own handlers

    const targetEl = document.getElementById(id);
    if (!targetEl) return;

    e.preventDefault();
    const navH = document.getElementById('navbar')?.offsetHeight || 0;
    const top = targetEl.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    history.pushState(null, '', `#${id}`);
  });
}

/* ============================================================
   8. MOBILE MENU — OUTSIDE CLICK CLOSE
   ------------------------------------------------------------
   Toggle + close-on-link-click live in app.js; this adds
   closing when the user taps anywhere outside the open menu.
   ============================================================ */
function initMenuOutsideClose() {
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('nav-menu');
    const toggle = document.getElementById('nav-toggle');
    if (!menu?.classList.contains('open')) return;
    if (e.target.closest('#nav-menu') || e.target.closest('#nav-toggle')) return;

    menu.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
}

/* ============================================================
   9. FOOTER DISCLAIMER LINK → reopen disclaimer modal
   ============================================================ */
function initFooterDisclaimerLink(settings) {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('#footer-disclaimer-link');
    if (!link) return;
    e.preventDefault();

    const modal = document.getElementById('disclaimer-modal');
    const body = modal?.querySelector('.disclaimer__text');
    if (body && !body.textContent.trim()) {
      body.textContent = settings?.disclaimer_text || '';
    }
    openModal(modal);

    // Ensure the agree button still closes it
    document.getElementById('disclaimer-agree')
      ?.addEventListener('click', () => closeModal(modal), { once: true });
  });
}

/* ============================================================
   10. BOOTSTRAP
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Features that don't need settings
  initCounters();
  initSmoothScroll();
  initMenuOutsideClose();

  // Features driven by settings.json
  const settings = await getSettings();
  initDisclaimer(settings);
  initEnquiryPopup(settings);
  initWhatsApp(settings);
  initFooterDisclaimerLink(settings);
});

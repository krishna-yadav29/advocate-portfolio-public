/* ============================================================
   ADVOCATE PORTFOLIO — MAIN APP ENGINE (Phase 3)
   Fetches all JSON data files and renders every section.
   Vanilla JS — no frameworks.
   ============================================================ */

'use strict';

/* ============================================================
   1. DATA LOADER
   ============================================================ */

/**
 * Fetch a single JSON file from /data/.
 * Returns null on failure so one bad file never kills the page.
 */
async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
    return await res.json();
  } catch (err) {
    console.error(`[data] Failed to load ${path}:`, err);
    return null;
  }
}

/** Fetch all data files in parallel. */
async function loadAllData() {
  const files = [
    'hero', 'stats', 'about', 'services', 'courts', 'experience',
    'achievements', 'gallery', 'testimonials', 'faq', 'cta',
    'contact', 'settings',
  ];
  const results = await Promise.all(files.map((f) => fetchJSON(`data/${f}.json`)));
  return Object.fromEntries(files.map((f, i) => [f, results[i]]));
}

/* ============================================================
   2. HELPERS
   ============================================================ */

/** Escape a string for safe interpolation into HTML. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Shorthand query selector. */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Render a star rating row (e.g. 5 → ★★★★★). */
function starRow(rating) {
  const n = Math.max(0, Math.min(5, Number(rating) || 0));
  return Array.from({ length: 5 }, (_, i) =>
    `<i class="fa-${i < n ? 'solid' : 'regular'} fa-star" aria-hidden="true"></i>`
  ).join('');
}

/**
 * Standard performance attributes for below-the-fold images.
 * Used inside template literals: <img ${IMG_PERF} ... />
 */
const IMG_PERF = 'loading="lazy" decoding="async"';

/**
 * Replace a broken <img> with a placeholder icon block.
 * Wire with: onerror="window.imgFallback(this)"
 */
window.imgFallback = function (img) {
  const fb = document.createElement('div');
  fb.className = 'img-fallback';
  fb.setAttribute('role', 'img');
  fb.setAttribute('aria-label', img.alt || 'Image unavailable');
  fb.innerHTML = '<i class="fa-regular fa-image" aria-hidden="true"></i>';
  img.replaceWith(fb);
};

/** Show a graceful fallback message inside a container. */
function renderFallback(container, label) {
  if (container) {
    container.innerHTML =
      `<p style="text-align:center;color:var(--clr-text-faint);">` +
      `${esc(label)} content is unavailable right now.</p>`;
  }
}

/* ============================================================
   3. RENDER FUNCTIONS
   ============================================================ */

/* ---------- HERO ---------- */
function renderHero(data) {
  const section = $('#hero');
  const content = $('#hero .hero__content');
  if (!content) return;
  if (!data) return renderFallback(content, 'Hero');

  // Parallax background image (CSS handles fixed attachment + overlay)
  if (data.background_image) {
    section.style.backgroundImage =
      `linear-gradient(160deg, rgba(10,10,10,.6), rgba(26,26,46,.6)), url('${esc(data.background_image)}')`;
  }

  // Word-by-word reveal for the name (progressive: words are real text,
  // animation is pure CSS; without JS the static skeleton still shows)
  const nameWords = String(data.name || '').split(/\s+/).map((w, i) =>
    `<span class="reveal-word" style="animation-delay:${0.15 + i * 0.12}s">${esc(w)}</span>`
  ).join(' ');

  content.innerHTML = `
    ${data.profile_image ? `
      <img
        src="${esc(data.profile_image)}"
        alt="Portrait of ${esc(data.name)}"
        class="hero__photo"
        decoding="async"
        style="width:132px;height:132px;border-radius:50%;object-fit:cover;
               border:3px solid var(--clr-gold);box-shadow:var(--shadow-gold);
               margin:0 auto var(--sp-5);"
        data-aos="zoom-in"
        onerror="this.style.display='none'"
      />` : ''}
    <span class="hero__badge" data-aos="fade-up" data-aos-delay="0">
      <i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> Advocate
    </span>
    <h1 class="hero__title">
      <span class="gold">${nameWords}</span>
    </h1>
    <p class="hero__subtitle" data-aos="fade-up" data-aos-delay="200">
      <strong style="display:block;font-size:1.15em;color:var(--clr-text);margin-bottom:.35rem;">
        ${esc(data.title)}
      </strong>
      <span class="hero__tagline">${esc(data.tagline)}</span>
    </p>
    <div class="hero__actions" data-aos="fade-up" data-aos-delay="300">
      <a href="${esc(data.cta_primary_link)}" class="btn btn--gold">
        <i class="fa-solid fa-phone" aria-hidden="true"></i> ${esc(data.cta_primary_text)}
      </a>
      <a href="${esc(data.cta_secondary_link)}" class="btn btn--outline">
        <i class="fa-solid fa-briefcase" aria-hidden="true"></i> ${esc(data.cta_secondary_text)}
      </a>
    </div>
  `;

  // Subtle typing effect for the tagline (respects reduced motion)
  initTypingEffect($('.hero__tagline', content), data.tagline);

  // Preload hero background for faster paint on repeat visits
  if (data.background_image) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = data.background_image;
    document.head.appendChild(link);
  }

  // Update logo text with the advocate's name
  const logoText = $('.navbar__logo-text');
  if (logoText) logoText.textContent = data.name;
}

/* ---------- STATS ---------- */
function renderStats(data) {
  const grid = $('#stats .stats__grid');
  if (!grid) return;
  if (!data || !Array.isArray(data.counters)) return renderFallback(grid, 'Stats');

  grid.innerHTML = data.counters.map((c, i) => `
    <div class="stat__item" data-aos="fade-up" data-aos-delay="${i * 100}">
      <i class="${esc(c.icon)}" aria-hidden="true"
         style="font-size:var(--fs-xl);margin-bottom:var(--sp-2);display:inline-block;"></i>
      <div class="stat__number">
        <span class="counter" data-target="${Number(c.number) || 0}">0</span>${esc(c.suffix)}
      </div>
      <div class="stat__label">${esc(c.label)}</div>
    </div>
  `).join('');
}

/* ---------- ABOUT ---------- */
function renderAbout(data) {
  const grid = $('#about .about__grid');
  if (!grid) return;
  if (!data) return renderFallback(grid, 'About');

  const education = (data.education || []).map((e) => `
    <li style="display:flex;gap:var(--sp-3);align-items:flex-start;margin-bottom:var(--sp-3);">
      <i class="fa-solid fa-graduation-cap" aria-hidden="true"
         style="color:var(--clr-gold);margin-top:5px;"></i>
      <div>
        <strong>${esc(e.degree)}</strong><br />
        <span style="color:var(--clr-text-muted);font-size:var(--fs-sm);">
          ${esc(e.institution)} &middot; ${esc(e.year)}
        </span>
      </div>
    </li>
  `).join('');

  const specializations = (data.specializations || []).map((s) =>
    `<span class="court-badge" style="padding:.45rem 1.1rem;font-size:var(--fs-xs);">
       <i class="fa-solid fa-check" aria-hidden="true"></i> ${esc(s)}
     </span>`
  ).join('');

  grid.innerHTML = `
    <div class="about__photo-wrap" data-aos="fade-right">
      <img src="${esc(data.profile_image)}" alt="Advocate profile photograph"
           onerror="this.parentElement.style.display='none'" />
    </div>
    <div class="about__content" data-aos="fade-left">
      <h3 style="font-size:var(--fs-lg);margin-bottom:var(--sp-3);">${esc(data.heading)}</h3>
      <p style="color:var(--clr-text-muted);margin-bottom:var(--sp-5);">${esc(data.description)}</p>

      <div class="about__highlights">
        <div class="about__highlight glass-card">
          <i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>
          <div>
            <strong style="display:block;margin-bottom:var(--sp-2);">Education</strong>
            <ul style="margin:0;">${education}</ul>
          </div>
        </div>
        <div class="about__highlight glass-card">
          <i class="fa-solid fa-id-card" aria-hidden="true"></i>
          <div>
            <strong style="display:block;">Bar Council ID</strong>
            <span style="color:var(--clr-text-muted);font-size:var(--fs-sm);">
              ${esc(data.bar_council_id)}
            </span>
          </div>
        </div>
        <div class="about__highlight glass-card">
          <i class="fa-solid fa-language" aria-hidden="true"></i>
          <div>
            <strong style="display:block;">Languages</strong>
            <span style="color:var(--clr-text-muted);font-size:var(--fs-sm);">
              ${(data.languages || []).map(esc).join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div style="margin-top:var(--sp-5);">
        <strong style="display:block;margin-bottom:var(--sp-3);">Specializations</strong>
        <div style="display:flex;flex-wrap:wrap;gap:var(--sp-3);">${specializations}</div>
      </div>
    </div>
  `;
}

/* ---------- SERVICES ---------- */
function renderServices(data) {
  const grid = $('#services .services__grid');
  if (!grid) return;
  if (!data || !Array.isArray(data.services)) return renderFallback(grid, 'Services');

  // Section heading + subtitle from JSON
  const title = $('#services .section__title');
  if (title && data.heading) title.textContent = data.heading;
  const header = $('#services .section__header');
  if (header && data.subtitle && !$('.section__subtitle', header)) {
    header.insertAdjacentHTML('beforeend',
      `<p class="section__subtitle" style="color:var(--clr-text-muted);margin-top:var(--sp-3);">
         ${esc(data.subtitle)}
       </p>`);
  }

  grid.innerHTML = data.services.map((s, i) => `
    <article class="service-card glass-card" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="service-card__icon"><i class="${esc(s.icon)}" aria-hidden="true"></i></div>
      <h3 class="service-card__title">${esc(s.title)}</h3>
      <p class="service-card__desc">${esc(s.description)}</p>
    </article>
  `).join('');
}

/* ---------- COURTS ---------- */
function renderCourts(data) {
  const list = $('#courts .courts__list');
  if (!list) return;
  if (!data || !Array.isArray(data.courts)) return renderFallback(list, 'Courts');

  const title = $('#courts .section__title');
  if (title && data.heading) title.textContent = data.heading;

  list.innerHTML = data.courts.map((c, i) => `
    <span class="court-badge" data-aos="fade-up" data-aos-delay="${i * 100}">
      <i class="${esc(c.icon)}" aria-hidden="true"></i>
      <span>
        <strong>${esc(c.name)}</strong>
        <span style="color:var(--clr-text-faint);"> &middot; ${esc(c.location)}</span>
      </span>
    </span>
  `).join('');
}

/* ---------- EXPERIENCE (TIMELINE) ---------- */
function renderExperience(data) {
  const timeline = $('#experience .timeline');
  if (!timeline) return;
  if (!data || !Array.isArray(data.milestones)) return renderFallback(timeline, 'Experience');

  const title = $('#experience .section__title');
  if (title && data.heading) title.textContent = data.heading;

  timeline.innerHTML = data.milestones.map((m, i) => `
    <div class="timeline__item" data-aos="${i % 2 === 0 ? 'fade-right' : 'fade-left'}"
         data-aos-delay="${i * 100}">
      <div class="timeline__card glass-card">
        <span class="timeline__year">${esc(m.year)}</span>
        <h3 class="timeline__title">${esc(m.title)}</h3>
        <p class="timeline__desc">${esc(m.description)}</p>
      </div>
    </div>
  `).join('');
}

/* ---------- ACHIEVEMENTS ---------- */
function renderAchievements(data) {
  const grid = $('#achievements .achievements__grid');
  if (!grid) return;
  if (!data || !Array.isArray(data.achievements)) return renderFallback(grid, 'Achievements');

  const title = $('#achievements .section__title');
  if (title && data.heading) title.textContent = data.heading;

  grid.innerHTML = data.achievements.map((a, i) => `
    <article class="achievement-card glass-card" data-aos="zoom-in" data-aos-delay="${i * 100}">
      <i class="${esc(a.icon)} achievement-card__icon" aria-hidden="true"></i>
      <h3 class="achievement-card__title">${esc(a.title)}</h3>
      <span class="timeline__year" style="font-size:var(--fs-sm);">${esc(a.year)}</span>
      <p class="achievement-card__desc" style="margin-top:var(--sp-2);">${esc(a.description)}</p>
    </article>
  `).join('');
}

/* ---------- GALLERY ---------- */
function renderGallery(data) {
  const grid = $('#gallery .gallery__grid');
  if (!grid) return;
  if (!data || !Array.isArray(data.images)) return renderFallback(grid, 'Gallery');

  const title = $('#gallery .section__title');
  if (title && data.heading) title.textContent = data.heading;

  grid.innerHTML = data.images.map((img, i) => `
    <a href="${esc(img.src)}"
       class="gallery__item glightbox ${i % 5 === 0 ? 'gallery__item--tall' : ''}"
       data-gallery="portfolio-gallery"
       data-glightbox="title: ${esc(img.alt)}"
       data-aos="fade-up" data-aos-delay="${i * 100}"
       aria-label="View ${esc(img.alt)} in lightbox">
      <img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy"
           onerror="this.closest('a').style.display='none'" />
      <div class="gallery__overlay">
        <i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i>
        <span class="gallery__caption">${esc(img.category)}</span>
      </div>
    </a>
  `).join('');

  // Init GLightbox after DOM injection
  if (typeof GLightbox === 'function') {
    GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });
  }
}

/* ---------- TESTIMONIALS (SWIPER) ---------- */
function renderTestimonials(data) {
  const wrapper = $('#testimonials .swiper-wrapper');
  if (!wrapper) return;
  if (!data || !Array.isArray(data.testimonials)) return renderFallback(wrapper, 'Testimonials');

  const title = $('#testimonials .section__title');
  if (title && data.heading) title.textContent = data.heading;

  wrapper.innerHTML = data.testimonials.map((t) => `
    <div class="swiper-slide">
      <figure class="testimonial-card glass-card">
        <i class="fa-solid fa-quote-left testimonial-card__quote-icon" aria-hidden="true"></i>
        <blockquote class="testimonial-card__text">${esc(t.text)}</blockquote>
        <img class="testimonial-card__avatar" src="${esc(t.image)}"
             alt="Photo of ${esc(t.name)}" loading="lazy"
             onerror="this.style.display='none'" />
        <figcaption>
          <div class="testimonial-card__name">${esc(t.name)}</div>
          <div class="testimonial-card__role">${esc(t.role)}</div>
          <div class="testimonial-card__stars" aria-label="${esc(t.rating)} out of 5 stars">
            ${starRow(t.rating)}
          </div>
        </figcaption>
      </figure>
    </div>
  `).join('');

  // Init Swiper after slides exist
  if (typeof Swiper === 'function') {
    new Swiper('.testimonials__swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: data.testimonials.length > 1,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      keyboard: { enabled: true },
      a11y: { enabled: true },
    });
  }
}

/* ---------- FAQ (ACCORDION) ---------- */
function renderFAQ(data) {
  const list = $('#faq .faq__list');
  if (!list) return;
  if (!data || !Array.isArray(data.faqs)) return renderFallback(list, 'FAQ');

  const title = $('#faq .section__title');
  if (title && data.heading) title.textContent = data.heading;

  list.innerHTML = data.faqs.map((f, i) => `
    <div class="faq__item glass-card" data-aos="fade-up" data-aos-delay="${i * 100}">
      <button class="faq__question" aria-expanded="false" aria-controls="faq-answer-${i}">
        <span>${esc(f.question)}</span>
        <i class="fa-solid fa-chevron-down faq__icon" aria-hidden="true"></i>
      </button>
      <div class="faq__answer" id="faq-answer-${i}" role="region">
        <div class="faq__answer-inner">${esc(f.answer)}</div>
      </div>
    </div>
  `).join('');

  // Accordion behaviour — one open at a time
  list.querySelectorAll('.faq__question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = $('.faq__answer', item);
      const isOpen = item.classList.contains('open');

      // Close all
      list.querySelectorAll('.faq__item.open').forEach((openItem) => {
        openItem.classList.remove('open');
        $('.faq__question', openItem).setAttribute('aria-expanded', 'false');
        $('.faq__answer', openItem).style.maxHeight = null;
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

/* ---------- CTA BANNER ---------- */
function renderCTA(data) {
  const inner = $('#cta .cta__inner');
  if (!inner) return;
  if (!data) return renderFallback(inner, 'CTA');

  inner.innerHTML = `
    <h2 class="cta__title">${esc(data.heading)}</h2>
    <p class="cta__text">${esc(data.description)}</p>
    <div style="display:flex;flex-wrap:wrap;gap:var(--sp-4);justify-content:center;align-items:center;">
      <a href="${esc(data.button_link)}" class="btn btn--dark">
        <i class="fa-solid fa-calendar-check" aria-hidden="true"></i> ${esc(data.button_text)}
      </a>
      <span style="color:var(--clr-on-gold);font-weight:600;">
        <i class="fa-solid fa-phone" aria-hidden="true"></i> ${esc(data.phone_text)}
      </span>
    </div>
  `;
}

/* ---------- CONTACT ---------- */
function renderContact(data, settings) {
  const info = $('#contact .contact__info');
  if (!info) return;
  if (!data) return renderFallback(info, 'Contact');

  // Heading + subtitle
  const title = $('#contact .section__title');
  if (title && data.heading) title.textContent = data.heading;
  const header = $('#contact .section__header');
  if (header && data.subtitle && !$('.section__subtitle', header)) {
    header.insertAdjacentHTML('beforeend',
      `<p class="section__subtitle" style="color:var(--clr-text-muted);margin-top:var(--sp-3);">
         ${esc(data.subtitle)}
       </p>`);
  }

  // Social icon links from settings.json
  const socialIcons = { facebook: 'fa-facebook-f', linkedin: 'fa-linkedin-in', twitter: 'fa-x-twitter', instagram: 'fa-instagram' };
  const socials = Object.entries(settings?.social || {})
    .filter(([, url]) => url)
    .map(([key, url]) => `
      <a href="${esc(url)}" class="contact__social-link" target="_blank"
         rel="noopener noreferrer" aria-label="${esc(key)}">
        <i class="fa-brands ${socialIcons[key] || 'fa-globe'}" aria-hidden="true"></i>
      </a>`)
    .join('');

  const infoItem = (icon, label, value) => `
    <div class="contact__info-item glass-card">
      <div class="contact__info-icon"><i class="${icon}" aria-hidden="true"></i></div>
      <div>
        <div class="contact__info-label">${esc(label)}</div>
        <div class="contact__info-value">${value}</div>
      </div>
    </div>`;

  const isRealMap = data.map_embed_url && data.map_embed_url.includes('google.com/maps/embed?pb=') &&
                    !data.map_embed_url.endsWith('...');

  info.innerHTML = `
    ${infoItem('fa-solid fa-phone', 'Phone',
      `<a href="tel:${esc(String(data.phone).replace(/\s/g, ''))}">${esc(data.phone)}</a>`)}
    ${infoItem('fa-solid fa-envelope', 'Email',
      `<a href="mailto:${esc(data.email)}">${esc(data.email)}</a>`)}
    ${infoItem('fa-solid fa-location-dot', 'Office Address', esc(data.address))}
    ${infoItem('fa-solid fa-clock', 'Office Hours', esc(data.office_hours))}
    ${isRealMap ? `
      <div class="contact__map">
        <iframe src="${esc(data.map_embed_url)}" loading="lazy" title="Office location map"
                referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>` : ''}
    <div class="contact__socials">${socials}</div>
  `;

  // Populate case-type dropdown from form_fields config
  const select = $('#contact-case-type');
  if (select && Array.isArray(data.form_fields)) {
    const caseTypes = ['Civil Matter', 'Criminal Matter', 'Family Matter',
                       'Property Matter', 'Corporate Matter', 'Other'];
    select.innerHTML =
      `<option value="" disabled selected>Select case type</option>` +
      caseTypes.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }
}

/* ---------- BLOG PREVIEW (latest 3 posts on index.html) ---------- */
async function renderBlogPreview() {
  const grid = $('#blog .blog__grid');
  if (!grid) return;

  // blog.js exposes the shared BlogAPI (fetch, card builder, dates)
  if (!window.BlogAPI) {
    console.warn('[app] BlogAPI not available — is js/blog.js loaded?');
    return renderFallback(grid, 'Blog');
  }

  try {
    const posts = await BlogAPI.fetchAllPosts();
    if (!posts.length) return renderFallback(grid, 'Blog');

    // Latest 3 posts only
    grid.innerHTML = posts.slice(0, 3)
      .map((p, i) => BlogAPI.blogCardHTML(p, i))
      .join('');

    // "View All Articles" button below the grid (add once)
    const container = grid.parentElement;
    if (container && !$('.blog__view-all', container)) {
      container.insertAdjacentHTML('beforeend', `
        <div class="blog__view-all" style="text-align:center;margin-top:var(--sp-6);"
             data-aos="fade-up">
          <a href="blog.html" class="btn btn--outline">
            <i class="fa-regular fa-newspaper" aria-hidden="true"></i> View All Articles
          </a>
        </div>
      `);
    }
  } catch (err) {
    console.error('[app] Blog preview failed:', err);
    renderFallback(grid, 'Blog');
  }
}

/* ---------- FOOTER ---------- */
function renderFooter(settings, contact, hero) {
  const grid = $('#footer .footer__grid');
  const bottom = $('#footer .footer__bottom-inner');
  if (!grid) return;
  if (!settings) return renderFallback(grid, 'Footer');

  const name = hero?.name || 'Advocate Name Here';

  const socialIcons = { facebook: 'fa-facebook-f', linkedin: 'fa-linkedin-in', twitter: 'fa-x-twitter', instagram: 'fa-instagram' };
  const socials = Object.entries(settings.social || {})
    .filter(([, url]) => url)
    .map(([key, url]) => `
      <a href="${esc(url)}" class="contact__social-link" target="_blank"
         rel="noopener noreferrer" aria-label="${esc(key)}">
        <i class="fa-brands ${socialIcons[key] || 'fa-globe'}" aria-hidden="true"></i>
      </a>`)
    .join('');

  const quickLinks = [
    ['Home', '#hero'], ['About', '#about'], ['Services', '#services'],
    ['Experience', '#experience'], ['Blog', '#blog'], ['Contact', '#contact'],
  ].map(([label, href]) =>
    `<li><a href="${href}">${label}</a></li>`).join('');

  grid.innerHTML = `
    <div>
      <div class="footer__brand-name">
        <i class="fa-solid fa-scale-balanced" aria-hidden="true"></i>${esc(name)}
      </div>
      <p class="footer__desc">${esc(settings.site_description)}</p>
      <div class="contact__socials" style="margin-top:var(--sp-4);">${socials}</div>
    </div>
    <div>
      <h4 class="footer__heading">Quick Links</h4>
      <ul class="footer__links">${quickLinks}</ul>
    </div>
    <div>
      <h4 class="footer__heading">Legal</h4>
      <ul class="footer__links">
        <li><a href="#faq">FAQ</a></li>
        <li><a href="#testimonials">Testimonials</a></li>
        <li><a href="#" id="footer-disclaimer-link">Disclaimer</a></li>
      </ul>
    </div>
    <div>
      <h4 class="footer__heading">Contact</h4>
      <ul class="footer__links">
        ${contact?.phone ? `<li><a href="tel:${esc(String(contact.phone).replace(/\s/g, ''))}">
          <i class="fa-solid fa-phone" style="color:var(--clr-gold);margin-right:6px;"></i>${esc(contact.phone)}</a></li>` : ''}
        ${contact?.email ? `<li><a href="mailto:${esc(contact.email)}">
          <i class="fa-solid fa-envelope" style="color:var(--clr-gold);margin-right:6px;"></i>${esc(contact.email)}</a></li>` : ''}
        ${contact?.address ? `<li style="color:var(--clr-text-muted);font-size:var(--fs-sm);">
          <i class="fa-solid fa-location-dot" style="color:var(--clr-gold);margin-right:6px;"></i>${esc(contact.address)}</li>` : ''}
      </ul>
    </div>
  `;

  if (bottom) {
    bottom.innerHTML = `
      <span>${esc(settings.copyright_text)}</span>
      <span>Bar Council of India compliant &middot; This site does not solicit work.</span>
    `;
  }
}

/* ---------- NAVBAR (from settings) ---------- */
function renderNavbar(settings) {
  if (!settings) return;
  if (settings.site_title) document.title = settings.site_title;

  const metaDesc = $('meta[name="description"]');
  if (metaDesc && settings.site_description) {
    metaDesc.setAttribute('content', settings.site_description);
  }

  // WhatsApp floating button
  const wa = $('#whatsapp-btn');
  if (wa && settings.whatsapp_number) {
    const num = String(settings.whatsapp_number).replace(/\D/g, '');
    const msg = encodeURIComponent(settings.whatsapp_message || '');
    wa.href = `https://wa.me/${num}${msg ? `?text=${msg}` : ''}`;
  }
}

/* ============================================================
   3b. PHASE 7 — POLISH INTERACTIONS
   ============================================================ */

/** Reduced-motion preference (checked by every effect below). */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Subtle typing effect for the hero tagline. */
function initTypingEffect(el, fullText) {
  if (!el || !fullText || prefersReducedMotion()) return;

  const text = String(fullText);
  el.textContent = '';
  el.classList.add('typing-caret');
  el.setAttribute('aria-label', text); // full text for screen readers
  let i = 0;

  (function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i += 2; // 2 chars per tick — brisk, not gimmicky
      setTimeout(type, 24);
    } else {
      el.textContent = text;
      // Remove caret shortly after finishing
      setTimeout(() => el.classList.remove('typing-caret'), 2000);
    }
  })();
}

/** Thin gold scroll-progress bar at the top of the page. */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/** Subtle 3D tilt on service/achievement cards (desktop pointers only). */
function initCardTilt() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const MAX_TILT = 5; // degrees — subtle by design

  // Event delegation: works for all current & future cards
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.service-card, .achievement-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--tilt-y', `${(px * MAX_TILT * 2).toFixed(2)}deg`);
    card.style.setProperty('--tilt-x', `${(-py * MAX_TILT * 2).toFixed(2)}deg`);
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.service-card, .achievement-card');
    if (card && !card.contains(e.relatedTarget)) {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    }
  }, { passive: true });
}

/** Material-style ripple on button clicks (event delegation). */
function initButtonRipple() {
  if (prefersReducedMotion()) return;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText =
      `width:${size}px;height:${size}px;` +
      `left:${e.clientX - r.left - size / 2}px;` +
      `top:${e.clientY - r.top - size / 2}px;`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
}

/** Subtle gold dot cursor on desktop (grows over interactive elements). */
function initCustomCursor() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  let x = 0, y = 0, raf = null;
  const render = () => {
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    raf = null;
  };

  document.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    dot.classList.add('active');
    dot.classList.toggle('grow',
      !!e.target.closest('a, button, .glass-card, input, textarea, select'));
    if (!raf) raf = requestAnimationFrame(render);
  }, { passive: true });

  document.addEventListener('mouseleave', () => dot.classList.remove('active'));
}

/**
 * Gentle JS parallax for the hero background.
 * background-attachment:fixed already gives CSS parallax on desktop;
 * this adds a softer translate on browsers where fixed is disabled
 * (mobile uses scroll attachment — skip there too, it's janky).
 */
function initHeroParallax() {
  if (prefersReducedMotion()) return;
  const hero = $('#hero');
  if (!hero || window.matchMedia('(max-width: 768px)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        hero.style.backgroundPositionY = `calc(50% + ${y * 0.25}px)`;
      }
      ticking = false;
    });
  }, { passive: true });
}

/**
 * Performance/error sweep over ALL rendered images:
 * lazy-load + async decode below the fold, fallback icon on error.
 * (Native loading="lazy" already uses IntersectionObserver internally.)
 */
function enhanceImages() {
  document.querySelectorAll('img').forEach((img) => {
    const inHero = !!img.closest('#hero');
    if (!inHero && !img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
    // Fallback icon for images without their own onerror handler
    if (!img.hasAttribute('onerror')) {
      img.addEventListener('error', () => window.imgFallback(img), { once: true });
    }
  });
}

/* ============================================================
   4. UI BEHAVIOUR (navbar, hamburger, scroll)
   ============================================================ */

function initNavbarBehaviour() {
  const navbar = $('#navbar');
  const toggle = $('#nav-toggle');
  const menu = $('#nav-menu');
  const backToTop = $('#back-to-top');
  const links = document.querySelectorAll('.navbar__link');

  // Transparent → solid on scroll + back-to-top visibility
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 100);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close menu on link click (mobile)
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Back to top
  if (backToTop) {
    backToTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Active link highlighting via IntersectionObserver
  const sections = document.querySelectorAll('main section[id], #hero');
  const linkMap = new Map();
  links.forEach((l) => {
    const id = (l.getAttribute('href') || '').replace('#', '');
    if (id) linkMap.set(id, l);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const link = linkMap.get(entry.target.id);
        if (link) {
          links.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach((s) => observer.observe(s));
}

/** Hide the page loader once rendering is done. */
function hideLoader() {
  const loader = $('#loader');
  if (loader) loader.classList.add('hidden');
}

/* ============================================================
   5. BOOTSTRAP
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await loadAllData();

    // Render all sections
    renderNavbar(data.settings);
    renderHero(data.hero);
    renderStats(data.stats);
    renderAbout(data.about);
    renderServices(data.services);
    renderCourts(data.courts);
    renderExperience(data.experience);
    renderAchievements(data.achievements);
    renderGallery(data.gallery);
    renderTestimonials(data.testimonials);
    renderFAQ(data.faq);
    renderCTA(data.cta);
    renderContact(data.contact, data.settings);
    renderFooter(data.settings, data.contact, data.hero);
    await renderBlogPreview();

    // UI behaviour
    initNavbarBehaviour();

    // Phase 7 polish interactions
    initScrollProgress();
    initCardTilt();
    initButtonRipple();
    initCustomCursor();
    initHeroParallax();
    enhanceImages();

    // Re-scan the DOM for AOS animations on injected elements.
    // refreshHard() rebuilds AOS's element list so dynamically
    // injected [data-aos] nodes animate correctly.
    if (window.AOS) {
      AOS.refreshHard ? AOS.refreshHard() : AOS.refresh();
    }

    // Expose loaded data for popup.js (Phase 4) & blog.js (Phase 5)
    window.__SITE_DATA__ = data;
    document.dispatchEvent(new CustomEvent('site:rendered', { detail: data }));
  } catch (err) {
    console.error('[app] Fatal render error:', err);
  } finally {
    hideLoader();
  }
});

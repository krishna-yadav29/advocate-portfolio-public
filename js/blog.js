/* ============================================================
   ADVOCATE PORTFOLIO — BLOG SYSTEM (Phase 5)
   Shared engine for:
   • index.html   → latest-3 preview (used via window.BlogAPI)
   • blog.html    → full listing + category filters
   • blog-post.html → single article (?slug=...), share, related
   ------------------------------------------------------------
   Posts live as JSON files in data/blog/ and are discovered
   through the data/blog/index.json manifest. Admins add a post
   by dropping a new JSON file + listing it in the manifest.
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. HELPERS
     ========================================================== */

  /** Escape a string for safe interpolation into HTML attributes/text. */
  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Fetch JSON safely; returns null on failure. */
  async function fetchJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
      return await res.json();
    } catch (err) {
      console.error(`[blog] Failed to load ${path}:`, err);
      return null;
    }
  }

  /**
   * Render post content that may be HTML (hand-written posts) or
   * Markdown (posts created via the Decap CMS markdown widget).
   * Minimal converter — headings, bold/italic, links, lists,
   * blockquotes and paragraphs. No external library needed.
   */
  function contentToHTML(raw) {
    const src = String(raw ?? '').trim();
    if (!src) return '';
    // Already HTML? (starts with a tag) → use as-is
    if (/^</.test(src)) return src;

    const inline = (s) => s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    return src.split(/\n{2,}/).map((block) => {
      const b = block.trim();
      if (!b) return '';
      const h = b.match(/^(#{1,4})\s+(.*)$/);
      if (h) return `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
      if (/^>\s?/.test(b)) {
        return `<blockquote>${inline(b.replace(/^>\s?/gm, ''))}</blockquote>`;
      }
      if (/^[-*]\s+/m.test(b)) {
        const items = b.split(/\n/).filter((l) => /^[-*]\s+/.test(l))
          .map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      if (/^\d+\.\s+/m.test(b)) {
        const items = b.split(/\n/).filter((l) => /^\d+\.\s+/.test(l))
          .map((l) => `<li>${inline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('');
        return `<ol>${items}</ol>`;
      }
      return `<p>${inline(b).replace(/\n/g, '<br />')}</p>`;
    }).join('\n');
  }

  /**
   * Format "YYYY-MM-DD" → "12 September 2026".
   * Placeholder dates like "20XX-XX-XX" are returned unchanged.
   */
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr || '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  /* ==========================================================
     2. DATA ACCESS
     ========================================================== */

  let postsCache = null;

  /** Fetch all posts listed in the data/blog/index.json manifest. */
  async function fetchAllPosts() {
    if (postsCache) return postsCache;

    const manifest = await fetchJSON('data/blog/index.json');
    const files = manifest?.posts || ['post-1.json', 'post-2.json', 'post-3.json'];

    const posts = (await Promise.all(
      files.map((f) => fetchJSON(`data/blog/${f}`))
    )).filter((p) => p && p.slug && p.title); // skip failed loads / non-post files

    // Newest first (placeholder dates keep manifest order)
    posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

    postsCache = posts;
    return posts;
  }

  /* ==========================================================
     3. CARD RENDERING (shared by listing + preview + related)
     ========================================================== */

  /** Build one blog card. `href` lets callers control the link target. */
  function blogCardHTML(post, i, opts = {}) {
    const delay = (opts.baseDelay ?? 0) + i * 100;
    const href = `blog-post.html?slug=${encodeURIComponent(post.slug)}`;
    return `
      <article class="blog-card glass-card" data-category="${esc(post.category)}"
               data-aos="fade-up" data-aos-delay="${delay}">
        <a href="${href}" class="blog-card__img-wrap" aria-label="Read: ${esc(post.title)}">
          <img src="${esc(post.thumbnail)}" alt="${esc(post.title)}" loading="lazy" decoding="async"
               onerror="this.style.display='none'" />
          <span class="blog-card__badge">${esc(post.category)}</span>
        </a>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <span><i class="fa-regular fa-calendar" aria-hidden="true"></i>${esc(formatDate(post.date))}</span>
            <span><i class="fa-regular fa-clock" aria-hidden="true"></i>${esc(post.read_time)}</span>
          </div>
          <h3 class="blog-card__title"><a href="${href}">${esc(post.title)}</a></h3>
          <p class="blog-card__excerpt">${esc(post.excerpt)}</p>
          <a href="${href}" class="blog-card__link">
            Read More <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </article>
    `;
  }

  /* ==========================================================
     4. PAGE CHROME (navbar + footer on standalone blog pages)
     ----------------------------------------------------------
     blog.html / blog-post.html don't load app.js, so this
     provides: logo name, navbar scroll state, hamburger,
     footer content and WhatsApp link — all from JSON.
     ========================================================== */

  async function initPageChrome() {
    const [settings, hero, contact] = await Promise.all([
      fetchJSON('data/settings.json'),
      fetchJSON('data/hero.json'),
      fetchJSON('data/contact.json'),
    ]);

    const name = hero?.name || 'Advocate Name Here';

    // Logo text
    const logoText = document.querySelector('.navbar__logo-text');
    if (logoText) logoText.textContent = name;

    // Navbar scroll effect + back-to-top
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    const onScroll = () => {
      navbar?.classList.toggle('scrolled', window.scrollY > 100);
      backToTop?.classList.toggle('visible', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    backToTop?.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Hamburger
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    toggle?.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!menu?.classList.contains('open')) return;
      if (e.target.closest('#nav-menu a')) {
        menu.classList.remove('open');
        toggle?.classList.remove('open');
      } else if (!e.target.closest('#nav-menu') && !e.target.closest('#nav-toggle')) {
        menu.classList.remove('open');
        toggle?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });

    // WhatsApp button
    const wa = document.getElementById('whatsapp-btn');
    if (wa && settings?.whatsapp_number) {
      const num = String(settings.whatsapp_number).replace(/\D/g, '');
      if (num && !/^X+$/i.test(String(settings.whatsapp_number))) {
        const msg = settings.whatsapp_message
          ? `?text=${encodeURIComponent(settings.whatsapp_message)}` : '';
        wa.href = `https://wa.me/${num}${msg}`;
      }
    }

    // Footer
    const grid = document.querySelector('#footer .footer__grid');
    if (grid && settings) {
      grid.innerHTML = `
        <div>
          <div class="footer__brand-name">
            <i class="fa-solid fa-scale-balanced" aria-hidden="true"></i>${esc(name)}
          </div>
          <p class="footer__desc">${esc(settings.site_description)}</p>
        </div>
        <div>
          <h4 class="footer__heading">Quick Links</h4>
          <ul class="footer__links">
            <li><a href="index.html">Home</a></li>
            <li><a href="index.html#about">About</a></li>
            <li><a href="index.html#services">Services</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__heading">Contact</h4>
          <ul class="footer__links">
            ${contact?.phone ? `<li><a href="tel:${esc(String(contact.phone).replace(/\s/g, ''))}">${esc(contact.phone)}</a></li>` : ''}
            ${contact?.email ? `<li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>` : ''}
          </ul>
        </div>
      `;
    }
    const bottom = document.querySelector('#footer .footer__bottom-inner');
    if (bottom && settings) {
      bottom.innerHTML = `<span>${esc(settings.copyright_text)}</span>`;
    }

    return { settings, hero, contact };
  }

  /* ==========================================================
     5. BLOG LISTING PAGE (blog.html)
     ========================================================== */

  async function initBlogListing() {
    const grid = document.getElementById('blog-listing-grid');
    const filters = document.getElementById('blog-filters');
    if (!grid) return;

    const posts = await fetchAllPosts();

    if (!posts.length) {
      grid.innerHTML = `<p class="blog-empty">No articles published yet. Please check back soon.</p>`;
      return;
    }

    // --- Category filter buttons ---
    const categories = ['All', ...new Set(posts.map((p) => p.category))];
    if (filters) {
      filters.innerHTML = categories.map((c, i) => `
        <button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${esc(c)}">
          ${esc(c)}
        </button>
      `).join('');

      filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filters.querySelectorAll('.filter-btn').forEach((b) =>
          b.classList.toggle('active', b === btn));

        const cat = btn.dataset.filter;
        grid.querySelectorAll('.blog-card').forEach((card) => {
          const show = cat === 'All' || card.dataset.category === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    }

    // --- Render all cards ---
    grid.innerHTML = posts.map((p, i) => blogCardHTML(p, i)).join('');
    if (window.AOS) { AOS.refreshHard ? AOS.refreshHard() : AOS.refresh(); }
  }

  /* ==========================================================
     6. SINGLE POST PAGE (blog-post.html)
     ========================================================== */

  function renderPost404(container) {
    container.innerHTML = `
      <div class="post-404" data-aos="fade-up">
        <i class="fa-solid fa-file-circle-question" aria-hidden="true"></i>
        <h1>Article Not Found</h1>
        <p>The article you're looking for doesn't exist or may have been moved.</p>
        <a href="blog.html" class="btn btn--gold">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to Blog
        </a>
      </div>
    `;
  }

  /** Update SEO/OG meta tags from post data. */
  function setPostMeta(post) {
    document.title = `${post.title} | Blog`;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', post.excerpt);
    setMeta('meta[property="og:title"]', 'content', post.title);
    setMeta('meta[property="og:description"]', 'content', post.excerpt);
    setMeta('meta[property="og:image"]', 'content', post.thumbnail);
    setMeta('meta[property="og:url"]', 'content', location.href);
    setMeta('meta[name="twitter:title"]', 'content', post.title);
    setMeta('meta[name="twitter:description"]', 'content', post.excerpt);
    setMeta('meta[name="twitter:image"]', 'content', post.thumbnail);
  }

  /** Build the social share buttons row. */
  function shareButtonsHTML(post) {
    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(post.title);
    const links = [
      { icon: 'fa-brands fa-whatsapp', label: 'Share on WhatsApp',
        href: `https://wa.me/?text=${text}%20${url}` },
      { icon: 'fa-brands fa-facebook-f', label: 'Share on Facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
      { icon: 'fa-brands fa-linkedin-in', label: 'Share on LinkedIn',
        href: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}` },
      { icon: 'fa-brands fa-x-twitter', label: 'Share on X (Twitter)',
        href: `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
    ];
    return links.map((l) => `
      <a href="${l.href}" class="share-btn" target="_blank"
         rel="noopener noreferrer" aria-label="${l.label}" title="${l.label}">
        <i class="${l.icon}" aria-hidden="true"></i>
      </a>
    `).join('');
  }

  async function initBlogPost() {
    const container = document.getElementById('blog-post-container');
    if (!container) return;

    // Parse ?slug= from URL
    const slug = new URLSearchParams(location.search).get('slug');
    const posts = await fetchAllPosts();
    const post = slug ? posts.find((p) => p.slug === slug) : null;

    if (!post) {
      renderPost404(container);
      if (window.AOS) { AOS.refreshHard ? AOS.refreshHard() : AOS.refresh(); }
      return;
    }

    setPostMeta(post);

    // NOTE: post.content is admin-controlled HTML from our own JSON
    // files, so rendering with innerHTML is acceptable here.
    container.innerHTML = `
      <header class="post__header" data-aos="fade-up">
        <a href="blog.html" class="post__back link-underline">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to Blog
        </a>
        <span class="blog-card__badge post__badge">${esc(post.category)}</span>
        <h1 class="post__title">${esc(post.title)}</h1>
        <div class="post__meta">
          <span><i class="fa-solid fa-user-tie" aria-hidden="true"></i> ${esc(post.author)}</span>
          <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${esc(formatDate(post.date))}</span>
          <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${esc(post.read_time)} read</span>
        </div>
      </header>

      <figure class="post__thumb" data-aos="fade-up" data-aos-delay="100">
        <img src="${esc(post.thumbnail)}" alt="${esc(post.title)}" decoding="async"
             onerror="this.parentElement.style.display='none'" />
      </figure>

      <div class="post__content" data-aos="fade-up" data-aos-delay="150">
        ${contentToHTML(post.content)}
      </div>

      <div class="post__share glass-card" data-aos="fade-up">
        <span class="post__share-label">Share this article:</span>
        <div class="post__share-buttons">${shareButtonsHTML(post)}</div>
      </div>
    `;

    // --- Related posts (2 others) ---
    const relatedWrap = document.getElementById('related-posts');
    if (relatedWrap) {
      const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
      if (related.length) {
        relatedWrap.innerHTML = `
          <h2 class="related__title" data-aos="fade-up">Related Articles</h2>
          <div class="related__grid">
            ${related.map((p, i) => blogCardHTML(p, i)).join('')}
          </div>
        `;
      }
    }

    if (window.AOS) { AOS.refreshHard ? AOS.refreshHard() : AOS.refresh(); }
  }

  /* ==========================================================
     7. PUBLIC API + BOOTSTRAP
     ========================================================== */

  // Expose for app.js (renderBlogPreview on index.html)
  window.BlogAPI = { fetchAllPosts, formatDate, blogCardHTML, esc };

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'blog' || page === 'blog-post') {
      initPageChrome();
    }
    initBlogListing(); // no-ops unless #blog-listing-grid exists
    initBlogPost();    // no-ops unless #blog-post-container exists
  });
})();

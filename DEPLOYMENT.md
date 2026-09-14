# 🚀 Deployment Guide — Advocate Portfolio Website

This guide covers:
- **Part A** — Deploying the site live on Netlify (with sample data)
- **Part B** — Making the Admin Panel (Decap CMS) work
- **Part C** — Making the Enquiry Forms work
- **Part D** — Replacing sample data with real data

> ⚠️ IMPORTANT: Do NOT use Netlify's "drag & drop" deploy. The admin panel
> (Decap CMS) saves content by committing to a Git repository, so the site
> MUST be deployed from a GitHub repo.

---

## PART A — Deploy the site (15 minutes)

### Step 1 — Create a GitHub repository
1. Go to https://github.com/new
2. Repository name: `advocate-portfolio` (any name works)
3. Visibility: **Private** (recommended — CMS works fine with private repos)
4. Do NOT initialize with README/gitignore (we have files already)
5. Click **Create repository**

### Step 2 — Push the project code
Download/copy the project folder to your computer, then in a terminal
inside the project folder (where `index.html` is):

```bash
git init
git add .
git commit -m "Initial deploy: advocate portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/advocate-portfolio.git
git push -u origin main
```

> The branch MUST be named `main` — admin/config.yml points to it.

### Step 3 — Create the Netlify site
1. Go to https://app.netlify.com → sign up / log in (use "Sign up with GitHub" — easiest)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** → authorize Netlify → select your `advocate-portfolio` repo
4. Build settings (Netlify reads netlify.toml automatically, but verify):
   - Branch to deploy: `main`
   - Build command: *(leave empty)*
   - Publish directory: `.`
5. Click **Deploy site**
6. Wait ~30 seconds. Your site is LIVE at a URL like:
   `https://random-name-123456.netlify.app`

### Step 4 — Rename your site (optional but recommended)
1. Site configuration → **Site details** → **Change site name**
2. Pick something like `adv-yourname` → site becomes
   `https://adv-yourname.netlify.app`

✅ **CHECKPOINT:** Open the URL. You should see: disclaimer popup → accept →
dark+gold site with all sections, animations, counters, gallery lightbox,
testimonial slider, blog pages.

---

## PART B — Make the Admin Panel work (10 minutes)

### Step 5 — Enable Netlify Identity
1. In your Netlify site dashboard → **Site configuration → Identity** (or the "Integrations" tab → Identity on newer UI)
2. Click **Enable Identity**

### Step 6 — Set registration to Invite-only  🔒
1. Identity → **Registration** → set to **Invite only**
2. (Never leave it "Open" — anyone could register and edit your site)

### Step 7 — Enable Git Gateway
1. Identity → **Services** → **Git Gateway** → click **Enable Git Gateway**
2. This lets the CMS commit to your repo on behalf of logged-in users
   without giving them GitHub access.

### Step 8 — Invite yourself as admin
1. Go to the **Identity** tab → click **Invite users**
2. Enter your email → **Send invite**
3. Open the invitation email → click **Accept the invite**
   - The link opens your live site with a token; a popup asks you to set a password
   - After setting the password, `js/identity.js` redirects you to `/admin/`
4. Log in at `https://YOUR-SITE.netlify.app/admin/` with that email + password

✅ **CHECKPOINT:** You should see the Decap CMS dashboard with 15 collections:
Site Settings, Hero, About, Stats, Practice Areas, Courts, Experience,
Achievements, Gallery, Testimonials, FAQ, Contact, CTA Banner, Blog Index,
Blog Posts.

Test it: open **Hero Section** → change "Advocate Name Here" to anything →
**Publish**. Netlify auto-redeploys (~30s) and the live site updates.

---

## PART C — Make the Enquiry Forms work (5 minutes)

Netlify auto-detects both forms (`enquiry` in Contact section, `quick-enquiry`
popup) at deploy time — no code changes needed. Just verify + set notifications:

### Step 9 — Verify forms were detected
1. Netlify dashboard → **Forms** tab
2. You should see two forms: **enquiry** and **quick-enquiry**
   - If missing, trigger a redeploy: Deploys → Trigger deploy → Deploy site

### Step 10 — Enable email notifications
1. Forms → **Form notifications** (Site configuration → Notifications → Form submissions)
2. **Add notification → Email notification**
3. Event: New form submission • Form: enquiry • Email: your email
4. Repeat for the **quick-enquiry** form

### Step 11 — Test both forms on the live site
1. Fill the Contact section form → Send Enquiry → you should land on a
   Netlify "Thank you" page (and receive an email)
2. Wait 15s for the enquiry popup (or clear sessionStorage) → submit →
   green success message appears → popup closes after 3s
3. Check Forms tab — both submissions should be listed

> 💡 Free tier: 100 form submissions/month — plenty for an advocate site.
> Spam is filtered by the built-in honeypot field + Netlify's Akismet.

### Step 12 — Final security checklist
- [x] Identity = Invite only          (Step 6)
- [x] GitHub repo = Private           (Step 1)
- [x] Git Gateway enabled             (Step 7)
- [x] No API keys in frontend code    (verified in QA)
- [x] Honeypot on both forms          (built in)

🎉 **The site is now fully live and working with sample data.**

---

## PART D — Replace sample data with REAL data

You can do everything from the **Admin Panel** (`/admin/`) — no code editing
needed. Go collection by collection:

### D1. Site Settings  (start here)
| Field | Replace with |
|---|---|
| Site Title | `Adv. Full Name | Advocate & Legal Consultant` |
| Site Description | 1–2 sentence real description (used in Google results) |
| WhatsApp Number | Full number with country code, digits only: `919812345678` |
| WhatsApp Message | e.g. `Hello, I would like to consult regarding a legal matter.` |
| Social Links | Real profile URLs (leave blank to hide an icon) |
| Disclaimer Text | Bar Council of India compliant disclaimer (see template below) |
| Enquiry Popup Delay | 15–20 seconds recommended |
| Copyright Text | `© 2026 Adv. Full Name. All rights reserved.` |

**BCI disclaimer template** (edit with your lawyer's judgment):
> As per the rules of the Bar Council of India, advocates are not permitted
> to solicit work or advertise. By clicking "I Understand", you acknowledge
> that you are seeking information about the Advocate voluntarily, that no
> solicitation or advertisement has been made, and that the content of this
> website is for informational purposes only and shall not be construed as
> legal advice.

### D2. Hero Section
- Name, professional title, tagline (2 lines max)
- CTA texts: e.g. `Book Consultation` (→ #contact) and `View Services` (→ #services)
- Upload real **background image** (courthouse/office, ≥1920px wide, <400 KB)
  and **profile photo** (square, ≥600px) — the CMS uploads them to `images/uploads/`

### D3. About Section
- Real bio (150–250 words), profile photo
- Education entries (degree, university, year)
- Bar Council enrollment ID (format: `MH/1234/2010`)
- Languages, specializations

### D4. Stats Counter
- Real numbers: cases handled, years of practice, courts, success metric
- Keep icons or pick others from https://fontawesome.com/icons (free, solid)

### D5. Practice Areas (Services)
- 6 real services with title + 2–3 sentence description each
- Icon suggestions: `fas fa-gavel` (criminal), `fas fa-house` (property),
  `fas fa-users` (family), `fas fa-file-contract` (documentation),
  `fas fa-building` (corporate), `fas fa-landmark` (civil)

### D6–D9. Courts, Experience, Achievements, Gallery
- Courts: real court names + cities
- Experience: real career milestones, oldest → newest
- Achievements: awards, memberships, notable recognitions
- Gallery: 6–12 real photos (office, events, felicitations), pick proper
  categories (Court/Events/Office/Awards), write meaningful alt text

### D10. Testimonials
- 3–6 real client reviews (get written consent!), name, role, rating
- Client photos optional — leave empty to show text-only

### D11. FAQ
- 5–8 real questions clients actually ask (fees, first consultation,
  documents needed, case duration, confidentiality)

### D12. Contact Details
- Real phone (with +91), email, full office address, office hours
- **Google Maps embed:** maps.google.com → search your office → Share →
  Embed a map → copy ONLY the URL inside `src="..."` → paste into the
  "Google Maps Embed URL" field

### D13. CTA Banner
- e.g. Heading: `Need Legal Assistance?` • Button: `Book a Consultation`

### D14. Blog Posts (workflow for every new article)
1. **Blog Posts → New Blog Post** → fill all fields
   - Slug: lowercase-with-hyphens, e.g. `understanding-bail-provisions`
   - Content: write in the rich text editor (Markdown — converted automatically)
2. **Publish**
3. **Blog Index** → add the new file name `understanding-bail-provisions.json`
   to the Post Files list → **Publish**
4. Site rebuilds; article appears in the blog listing and homepage preview.

Also: replace the 3 sample posts (edit them or delete + remove from Blog Index).

### D15. Final code-level replacements (one-time, in the repo)
These few placeholders live in code, not JSON — edit on GitHub (or locally + push):

| File | What to change |
|---|---|
| `index.html` | `<title>`, meta description, OG tags, canonical `https://example.com/` → your real URL; the JSON-LD block (name, phone, address, socials) |
| `robots.txt` | `yourdomain.com` → real domain |
| `sitemap.xml` | `yourdomain.com` → real domain |
| `admin/config.yml` | Remove `"Lorem", "Ipsum"` from gallery category options |
| `images/` folders | The placeholder JPGs can be deleted once all JSON references point to real uploads |

### D16. Custom domain (optional)
1. Netlify → Domain management → **Add a domain** → enter `advyourname.in`
2. Follow DNS instructions (point nameservers to Netlify, or add A/CNAME records)
3. HTTPS certificate is provisioned automatically (Let's Encrypt)
4. Update canonical/OG/robots/sitemap URLs to the new domain

---

## Quick reference

| Task | Where |
|---|---|
| Edit any content | `https://YOUR-SITE.netlify.app/admin/` |
| View form submissions | Netlify dashboard → Forms |
| Invite another admin | Netlify dashboard → Identity → Invite users |
| Deploy logs / redeploy | Netlify dashboard → Deploys |
| Code changes | GitHub repo → push → auto-deploys |

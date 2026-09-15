## Replace sample data with REAL data

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

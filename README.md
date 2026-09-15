PART A — Deploy the site (15 minutes)
Step 1 — Create a GitHub repository
Go to https://github.com/new
Repository name: advocate-portfolio (any name works)
Visibility: Private (recommended — CMS works fine with private repos)
Do NOT initialize with README/gitignore (we have files already)
Click Create repository
Step 2 — Push the project code
Download/copy the project folder to your computer, then in a terminal
inside the project folder (where 
index.html
 is):

Bash

git init
git add .
git commit -m "Initial deploy: advocate portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/advocate-portfolio.git
git push -u origin main
The branch MUST be named main — admin/config.yml points to it.

Step 3 — Create the Netlify site
Go to https://app.netlify.com → sign up / log in (use "Sign up with GitHub" — easiest)
Click Add new site → Import an existing project
Choose GitHub → authorize Netlify → select your advocate-portfolio repo
Build settings (Netlify reads netlify.toml automatically, but verify):
Branch to deploy: main
Build command: (leave empty)
Publish directory: .
Click Deploy site
Wait ~30 seconds. Your site is LIVE at a URL like:
https://random-name-123456.netlify.app
Step 4 — Rename your site (optional but recommended)
Site configuration → Site details → Change site name
Pick something like adv-yourname → site becomes
https://adv-yourname.netlify.app
✅ CHECKPOINT: Open the URL. You should see: disclaimer popup → accept →
dark+gold site with all sections, animations, counters, gallery lightbox,
testimonial slider, blog pages.

PART B — Make the Admin Panel work (10 minutes)
Step 5 — Enable Netlify Identity
In your Netlify site dashboard → Site configuration → Identity (or the "Integrations" tab → Identity on newer UI)
Click Enable Identity
Step 6 — Set registration to Invite-only 🔒
Identity → Registration → set to Invite only
(Never leave it "Open" — anyone could register and edit your site)
Step 7 — Enable Git Gateway
Identity → Services → Git Gateway → click Enable Git Gateway
This lets the CMS commit to your repo on behalf of logged-in users
without giving them GitHub access.
Step 8 — Invite yourself as admin
Go to the Identity tab → click Invite users
Enter your email → Send invite
Open the invitation email → click Accept the invite
The link opens your live site with a token; a popup asks you to set a password
After setting the password, 
identity.js
 redirects you to /admin/
Log in at https://YOUR-SITE.netlify.app/admin/ with that email + password
✅ CHECKPOINT: You should see the Decap CMS dashboard with 15 collections:
Site Settings, Hero, About, Stats, Practice Areas, Courts, Experience,
Achievements, Gallery, Testimonials, FAQ, Contact, CTA Banner, Blog Index,
Blog Posts.

Test it: open Hero Section → change "Advocate Name Here" to anything →
Publish. Netlify auto-redeploys (~30s) and the live site updates.

PART C — Make the Enquiry Forms work (5 minutes)
Netlify auto-detects both forms (enquiry in Contact section, quick-enquiry
popup) at deploy time — no code changes needed. Just verify + set notifications:

Step 9 — Verify forms were detected
Netlify dashboard → Forms tab
You should see two forms: enquiry and quick-enquiry
If missing, trigger a redeploy: Deploys → Trigger deploy → Deploy site
Step 10 — Enable email notifications
Forms → Form notifications (Site configuration → Notifications → Form submissions)
Add notification → Email notification
Event: New form submission • Form: enquiry • Email: your email
Repeat for the quick-enquiry form
Step 11 — Test both forms on the live site
Fill the Contact section form → Send Enquiry → you should land on a
Netlify "Thank you" page (and receive an email)
Wait 15s for the enquiry popup (or clear sessionStorage) → submit →
green success message appears → popup closes after 3s
Check Forms tab — both submissions should be listed
💡 Free tier: 100 form submissions/month — plenty for an advocate site.
Spam is filtered by the built-in honeypot field + Netlify's Akismet.

Step 12 — Final security checklist
 Identity = Invite only (Step 6)
 GitHub repo = Private (Step 1)
 Git Gateway enabled (Step 7)
 No API keys in frontend code (verified in QA)
 Honeypot on both forms (built in)
🎉 The site is now fully live and working with sample data.

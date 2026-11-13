# CLAUDE.md — Sea Yachts website

Read this first. **This repo is public**, so keep secrets, admin passwords, private business terms and plans out of this file.

## Who you're working with
- Owner: Garry, licensed Florida yacht broker, **beginner at coding**.
- Explain plainly. Do one change per session. Test before saying it works.
- When editing by hand he uses the GitHub web editor and pastes **whole files**.

## What it is
seayachts.net is the website for Sea Yachts LLC, Garry's Florida yacht brokerage. It's a separate business from BoatClosers. Keep it separate in code, branding and data. It has a luxury nautical look (navy, paper white, teak accents; Newsreader + Albert Sans fonts).

## How it's built
Plain static HTML (no framework, no build step) on Vercel, with Supabase for data.
- `index.html`: home page
- `selling.html`, `buyer-representation.html`, `exports.html`: service pages
- `admin.html`: password-protected listing/deal management (uses Supabase in the browser)
- `api/deal.js`: renders a searchable page for each published deal at `/deals/<slug>`
- `api/sitemap.js`: sitemap
- `vercel.json`: clean URLs and rewrites
- `.github/workflows/keep-supabase-awake.yml`: keeps the free Supabase project from pausing
Only the public "publishable" Supabase key belongs in the front end. Never put the service key in these files.

## Related
- `boatclosers/boatclosers-v4` holds a Sea Yachts escrow/closing option that is **on hold**. If it's ever revived, the plan is to send BoatClosers customers to a dedicated section of this site. Don't build it until Garry says so.

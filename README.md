# COLLAB Scanner

A web app that analyses any URL for AI search visibility. Paste a URL and get an overall score /100 plus four sub-scores across the COLLAB framework:

- **Findable /25** — Can AI crawlers reach and index your content?
- **Quotable /25** — Is your content structured so AI can extract and cite it?
- **Understandable /25** — Is the page semantically clear to machines?
- **Trustworthy /25** — Are authority and credibility signals present?

Results are saved to Supabase and shareable via link.

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd collab-scanner
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
BROWSERLESS_API_KEY=your-browserless-key-here
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

### Create a project

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and fill in your project details.
3. Once created, go to **Settings → API** to find your:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Run the migration

In your Supabase project dashboard:

1. Go to the **SQL Editor**.
2. Copy the contents of `supabase/migration.sql`.
3. Paste and click **Run**.

This creates the `scans` table with Row Level Security policies that allow public reads and inserts (no auth required).

---

## Browserless API Key

COLLAB Scanner uses [Browserless](https://www.browserless.io) to render JavaScript-heavy pages and detect rendering type (SSR / CSR / Hybrid).

1. Go to [browserless.io](https://www.browserless.io) and sign up for an account.
2. The free tier includes 1,000 units/month — enough for development.
3. Copy your API key from the dashboard and add it to `.env.local` as `BROWSERLESS_API_KEY`.

**Note:** Browserless is optional. If no API key is provided, the app falls back to raw HTML analysis with rendering type shown as `Estimated`.

---

## Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual deploy

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore`).
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Add your environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `BROWSERLESS_API_KEY`
4. Click **Deploy**.

---

## Fonts

COLLAB Scanner uses two Google Fonts (free, loaded via CDN):

- **Space Grotesk** (700, 800) — headings, scores, labels
- **Inter** (400, 500, 600) — body text, UI

These are COLLAB's development/open-source font stack. For production brand work, COLLAB's official typefaces are:

- **Grozen Medical Bold** — requires a commercial licence from its foundry.
- **Nexa** — requires a commercial licence from Fontfabric (or another licensed distributor).

To swap fonts for production, update the `@import` in `src/app/globals.css` and the `fontFamily` values in `tailwind.config.ts`.

---

## Architecture

```
src/
  app/
    api/scan/route.ts   # Core scoring engine (POST /api/scan)
    scan/[id]/page.tsx  # Results page (Server Component)
    page.tsx            # Home page (Server Component)
    layout.tsx          # Root layout
    globals.css         # Tailwind + CSS variables
  components/
    ScanForm.tsx        # URL input + submit (Client Component)
    ScanResultHeader.tsx
    RenderingBanner.tsx
    PillarCard.tsx      # Collapsible pillar result card
    CheckItem.tsx       # Individual check row
    StatusPill.tsx      # GOOD / NEEDS WORK / CRITICAL badge
    EqualizerViz.tsx    # Animated bar visualisation
    EmptyState.tsx
    RecentScans.tsx
  lib/
    supabase.ts         # Supabase client
    types.ts            # TypeScript interfaces
supabase/
  migration.sql         # Database schema + RLS policies
```

---

## Scoring Reference

| Pillar | Max | Key signals |
|---|---|---|
| Findable | 25 | HTTPS, robots.txt, sitemap.xml, canonical, meta robots |
| Quotable | 25 | Word count, H1, heading hierarchy, lists/tables, paragraph length, FAQ |
| Understandable | 25 | Title, meta description, Open Graph, image alt text, lang attribute |
| Trustworthy | 25 | JSON-LD, schema types, author/publisher, favicon |
| **Overall** | **100** | Sum of all four pillars |

# BusBook Content Machine

A modular Content Operating System for SaaS launch campaigns. One core idea → multiplies into platform-native posts (TikTok, YouTube, Instagram, Facebook). Built for the BusBook bus booking app launch, but modular enough for any niche.

## Quick Start

```bash
# 1. Install
cd busbook-content-machine
npm install --legacy-peer-deps

# 2. Set up Supabase
# Create a project at https://supabase.com
# Copy your URL and anon key
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run database migrations
# In Supabase SQL Editor, paste and run supabase/migrations/001_initial_schema.sql

# 4. Set up Auth
# In Supabase Dashboard → Authentication → Settings
# Enable "Email OTP" (Magic Link) provider

# 5. Run
npm run dev
# → http://localhost:3000

# 6. Login
# Visit http://localhost:3000/login
# Enter your email → check inbox for magic link
```

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial"
gh repo create busbook-content-machine --public --push

# 2. Import in Vercel
# https://vercel.com/new
# Connect repo → add env vars from .env.local → deploy

# 3. Update Supabase Auth
# In Supabase → Authentication → URL Configuration
# Add Vercel deployment URL to Site URL and Redirect URLs
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Magic link auth
│   ├── dashboard/          # Overview + launch progress
│   ├── ideas/              # Idea Vault CRUD
│   ├── multiplier/         # Content repurposing engine
│   ├── calendar/           # Visual drag-and-drop calendar
│   ├── analytics/          # Performance tracking + insights
│   └── settings/           # Brand config (modular)
├── components/
│   ├── ui/                 # shadcn-style components
│   └── layout/             # Sidebar, mobile nav
├── lib/
│   ├── supabase/           # Client, server, middleware
│   ├── prompts.ts          # AI prompt templates (editable)
│   └── utils.ts            # Shared helpers
├── types/                  # TypeScript interfaces
└── providers/              # React Query, Theme
```

## Key Files

| File | What |
|------|------|
| `src/lib/prompts.ts` | AI prompt templates — edit to refine generation quality |
| `supabase/migrations/001_initial_schema.sql` | Full DB schema + RLS policies |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/app/multiplier/page.tsx` | Core repurposing engine |

## Modularity

Swap to a different project/niche:

1. **Settings** → change brand name, voice, audience, pillars, platforms
2. **Prompts** → update `src/lib/prompts.ts` for your industry
3. **Supabase** → create new project, run same migration
4. **Pages** → all content driven by config, no hardcoded niches

## Supabase Schema (5 tables)

- `brands` — multi-project settings
- `content_ideas` — core idea vault
- `repurposed_posts` — platform variants linked to ideas
- `scheduled_posts` — calendar entries
- `performance_logs` — analytics tracking

RLS isolates all data by `user_id`. Storage bucket `screenshots` for uploading images.

## V2 Roadmap

- [ ] **Real scheduling** — webhook integration to auto-publish (Buffer/TikTok API)
- [ ] **Advanced analytics** — charts (Recharts), CSV export, trend detection
- [ ] **AI integration** — connect to OpenAI/Anthropic API for real generation
- [ ] **Multi-brand** — switch between projects without redeploy
- [ ] **Team collaboration** — invite users, approval workflows
- [ ] **ICS/CSV export** — download calendar
- [ ] **Onboarding tour** — first-time user walkthrough
- [ ] **Mobile push** — reminders for scheduled posts

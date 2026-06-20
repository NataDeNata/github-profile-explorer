# GitHub Profile Explorer

A full-featured GitHub profile analytics app built with React and Vite. Search any GitHub username to get a deep breakdown of their repositories, commit patterns, language usage, and an AI-generated developer summary — all with live GitHub API data.

Live: [gitsearchhub.vercel.app](https://gitsearchhub.vercel.app)

---

## Tech Stack

### Core
| Layer | Library / Version |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| HTTP | Axios |
| Icons | Heroicons v2 |

### Data & Visualization
| Purpose | Library |
|---|---|
| Charts (radar, bar, scatter, pie) | Recharts |
| Markdown rendering | react-markdown + remark-gfm |
| Card image export | html-to-image |

### AI
| Purpose | Service |
|---|---|
| AI profile summary | Google Gemini 2.5 Flash (server-side Vercel function) |

### Deployment
| Layer | Platform |
|---|---|
| Hosting & CDN | Vercel |
| AI endpoint | Vercel Serverless Function (`/api/generate-resume`) |

---

## Features

### Profile View
- Search any public GitHub username
- **Profile card** — avatar, bio, follower/following counts, location, company, blog
- **Download card** — exports a styled PNG snapshot via `html-to-image`
- URL state — search is reflected in `?user=` query param, shareable and browser-back-compatible

### Repository Analysis
- **Featured repos** — top 4 by star count, pinned above the directory
- **Full repo directory** — all repositories in a sortable, filterable table
- **Filters** — language toggle chips, keyword search, sort by stars / last updated / size
- **Repo modal (drawer)** — slides in with README (rendered Markdown), recent commits, and top contributors; prefetched on hover so it opens instantly

### Charts & Developer DNA
| Chart | What it shows |
|---|---|
| Language chart | Donut chart of aggregated byte counts across all non-fork repos |
| Commit activity | Weekly commit frequency for the user's most-starred repo |
| Stars chart | Cumulative star distribution across repos |
| Commit heatmap | GitHub-style 90-day push activity grid (day x week) |
| Peak hours chart | Bar chart of commit frequency by hour of day |
| Repo scatter | Stars vs. forks bubble chart across all repos |

### AI Profile Summary
- Generates a 3-paragraph professional developer summary using **Gemini 2.5 Flash**
- Includes a highlighted "Project Spotlight" callout for the most notable repo
- Runs server-side through a Vercel function — the API key is never exposed to the client
- One-click copy to clipboard

### VS Compare Mode
- Compare any two GitHub profiles side by side
- Stat table (stars, followers, repos, forks, account age) with winner highlighted
- Language overlap **radar chart** with a calculated compatibility score (0-100%)
- Activated via the Compare button; second profile added in a second search bar

### Landing Page
- **Cycling typewriter** in the search bar cycles through 4 placeholder phrases with configurable timing
- **Featured profiles** — 6 notable open-source developers as quick-launch chips
- **Trending on GitHub** — repos born this week with the fastest-rising stars, pulled live from the GitHub Search API; includes total new repo count, all-time most-starred repo, and hottest language
- **Meet the Creator** — live creator profile section showing real stats, top languages, and latest project

### Contributed Repos
- Detects repos the user has pushed to that they don't own (external contributions)
- Sourced from the public events API, ranked by push frequency

### UX Details
- Dark / light mode toggle, persisted to `localStorage`
- Skeleton loading states on every async section
- Animated "Compare" tooltip on first profile load, auto-dismissed after 5 s
- Escape key and backdrop click close the repo drawer
- All requests use `AbortController` — navigating away cancels in-flight fetches

---

## Caching Architecture

The app has three independent caching layers, each serving a different purpose.

### Layer 1 — GitHub API dual cache (`githubService.js`)

Every GitHub API call goes through `withCache(key, fn)`, which checks two stores before hitting the network:

```
Request
  └── In-memory Map (L1)       resets on page refresh, zero latency
        └── localStorage (L2)  10-minute TTL, survives refresh
              └── GitHub REST API  network call, result stored in both
```

**Cached keys:**

| Key pattern | Data |
|---|---|
| `ghex:user:{username}` | User profile object |
| `ghex:repos:{username}` | All public repos (up to 100) |
| `ghex:langs:{owner}/{repo}` | Language byte counts per repo |
| `ghex:commits:{owner}/{repo}` | Weekly commit activity |
| `ghex:readme:{owner}/{repo}` | Base64-encoded README |
| `ghex:commit-list:{owner}/{repo}` | 20 most recent commits |
| `ghex:contributors:{owner}/{repo}` | Top 10 contributors |
| `ghex:repo:{owner}/{repo}` | Single repo metadata |
| `ghex:events:{username}` | Up to 300 public events (3 pages) |
| `ghex:trending:week` | This week's trending repos |
| `ghex:github:top-repo` | All-time most starred repo |

TTL is **10 minutes** for all GitHub data. On `QuotaExceededError` (full localStorage), the write silently skips — the in-memory cache still works for the session.

### Layer 2 — AI resume cache (`AiResume.jsx`)

Gemini calls are expensive and rate-limited (20 req/min on the free tier). Results are cached per-user in localStorage for **24 hours**:

```
Key:  ghex:resume:{login}
Value: { data: { paragraph1, paragraph2, paragraph3, spotlight }, savedAt: timestamp }
```

On page load for a profile, the cache is checked first. If valid, the resume renders immediately with no API call. When the Gemini quota is hit, the error message is parsed for the `retry in Xs` delay and a live countdown is shown on the button.

### Layer 3 — Repo prefetch (`prefetchRepo`)

When the user hovers over or selects a repository card, `prefetchRepo(owner, repo)` fires three parallel requests (README, commits, contributors) as fire-and-forget. Results land in the shared `withCache` store. When the modal opens a moment later, all data is already cached — the drawer appears to load instantly.

---

## Project Structure

```
src/
├── App.jsx                    # Root layout, routing state, search logic
├── main.jsx                   # React entry point
│
├── components/
│   ├── SearchBar.jsx          # Input with cycling typewriter placeholder
│   ├── ProfileCard.jsx        # User card + PNG download trigger
│   ├── SnapshotCard.jsx       # Off-screen card rendered to PNG (html-to-image)
│   ├── AiResume.jsx           # Gemini summary with caching + rate-limit countdown
│   ├── FeaturedRepos.jsx      # Top 4 repos by stars
│   ├── RepoTable.jsx          # Full repo directory table
│   ├── RepoFilters.jsx        # Language chips + search + sort controls
│   ├── RepoModal.jsx          # Slide-in drawer: README / commits / contributors
│   ├── RepoGrid.jsx           # Grid layout wrapper for repo cards
│   ├── LanguageChart.jsx      # Donut chart of language distribution
│   ├── CommitActivityChart.jsx  # Weekly commit bar chart
│   ├── StarsChart.jsx         # Cumulative stars chart
│   ├── CommitHeatmap.jsx      # 90-day push activity heatmap
│   ├── PeakHoursChart.jsx     # Commits by hour of day
│   ├── RepoScatterChart.jsx   # Stars vs forks bubble chart
│   ├── VsMode.jsx             # Side-by-side comparison + radar chart
│   ├── ContributedRepos.jsx   # External repos the user has contributed to
│   ├── TrendingSection.jsx    # Trending GitHub repos this week
│   ├── FeaturedProfiles.jsx   # Landing page quick-launch profile chips
│   ├── HostCard.jsx           # Creator profile section
│   ├── EmptyState.jsx         # Reusable empty/error placeholder
│   ├── ProfileCardSkeleton.jsx
│   └── RepoGridSkeleton.jsx
│
├── hooks/
│   ├── useGithubUser.js       # Fetches user + repos + aggregated languages
│   ├── useUserEvents.js       # Fetches events → commit heatmap + peak hours
│   ├── useContributedRepos.js # Events → external repo contributions
│   ├── useRepoFilters.js      # Filter/sort/search logic over repo list
│   ├── useRepoDetails.js      # README + commits + contributors for modal
│   ├── useTrending.js         # Trending repos + all-time most starred
│   ├── useDarkMode.js         # Dark mode toggle persisted to localStorage
│   └── useIsDark.js           # Reads current dark mode state
│
├── services/
│   └── githubService.js       # Axios client, withCache, all API functions
│
└── utils/
    ├── langColors.js          # Language name → hex color map
    └── format.js              # Number formatting (1.2k, 3.4M)
```

---

## Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `VITE_GITHUB_TOKEN` | `.env.local` (client-side) | Optional GitHub PAT — raises rate limit from 60 to 5,000 req/hr |
| `GEMINI_API_KEY` | Vercel env vars (server-side only) | Google Gemini API key for AI resume generation |

`GEMINI_API_KEY` must **not** have the `VITE_` prefix — it must stay server-side only and never be bundled into the client build.

---

## Local Development

```bash
# Install dependencies
npm install

# Add your GitHub token to .env.local (optional but recommended)
echo "VITE_GITHUB_TOKEN=ghp_your_token_here" >> .env.local

# Start dev server
npm run dev

# Build for production
npm run build
```

The Gemini AI feature requires `GEMINI_API_KEY` set as a Vercel environment variable. It will not work locally without a serverless function runner such as `vercel dev`.

---

## API Rate Limits

| API | Unauthenticated | With PAT |
|---|---|---|
| GitHub REST | 60 req/hr | 5,000 req/hr |
| Gemini 2.5 Flash (free tier) | 20 req/min | — |

The dual-layer cache significantly reduces GitHub API consumption. A full profile load (user + repos + all language breakdowns) is only fetched once per 10 minutes, even across page refreshes.

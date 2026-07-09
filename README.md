# E-Sports Pakistan (e-sports.pk) - Technical Architecture & Audit Manual

E-Sports Pakistan is a high-performance, full-stack esports platform built to aggregate, evaluate, and scale Pakistan's local gaming ecosystem. This repository serves as the core workspace encompassing the reactive client-side layout, dynamic RSS parser proxy, Gemini-powered AI assistants, role-based access controllers, and an integrated Technical Compliance Panel matching the global audit requirements.

---

## 🚀 1. Technical Stack Overview

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 / Vite 6 | SPA Routing via `react-router-dom`, fast-compile setups, tailwind optimizations. |
| **Styling Engine** | Tailwind CSS v4 | High-fidelity dark gaming theme with cyan neon highlights and responsive mobile layouts. |
| **Backend Runtime** | Node.js (Express v4) | Unified asset serving, secure proxy routes, and lazy-initialized secret APIs. |
| **Ecosystem Database** | Firebase Firestore | Live document listeners tracking player rankings, tournament states, and media galleries. |
| **Storage & CDN** | Firebase Cloud Storage | Custom cross-account credentials support for secure brand asset hosting. |
| **AI Integration** | `@google/genai` (SDK) | Smart chatbots with search-grounding and image generation supporting customized aspect ratios. |

---

## 🛠️ 2. Core Architecture & API Routing

### Client-Side SPA Routing (`src/App.tsx`)
The user interface is structured around a single-page route router facilitating immediate tab transfers without rendering flicker:
- `/` - HomePage (Hero carousel, search query controllers, active game ecosystem maps)
- `/players` - Players directory (Dynamic sorting by total prizes, win-rates, availability cards)
- `/teams` - Registered team organizations (Roster enrollment states, recruiting cards)
- `/tournaments` - Live tournament brackets (Upcoming, ongoing, completed registrations)
- `/rankings` - Dynamic national leaderboard charts
- `/news` - Automated esports news stream parsed directly from active RSS feeds
- `/ai-hub` - Interactive Gemini Assistant chat space with Google Search grounding
- `/dashboard/admin` - Protected Administrative Console (Role assignments, RSS triggers, storage credentials, and diagnostic auditor)

### Server-Side Custom Endpoints (`server.ts`)
Secret keys and proxy operations are handled entirely on the server-side to prevent client-side credential exposure:
1. **`POST /api/ai/chat`**: Models `gemini-3.5-flash` and `gemini-3.1-pro-preview` with optional high thinking level and real-time Google Search grounding.
2. **`POST /api/ai/generate-image`**: Utilizes `gemini-3.1-flash-image` supporting 1:1, 16:9, or 9:16 aspect ratios.
3. **`GET /api/rss`**: Safe parser fetching XML feeds (such as Dot Esports or Liquipedia) to bypass browser CORS policies.

---

## 🛡️ 3. Role-Based Access Controls (RBAC)

The platform enforces five distinct role levels matching custom claim scopes:
- **Administrator (admin)**: Full write permissions to systemic settings, role elevations, and the diagnostics control panel.
- **Team Captain / Manager (team)**: Edit rights on team profiles, roster enrollment, and tournament entries.
- **Verified Player (player)**: Edit rights on personal ranking cards, stats, and availability tags (e.g. LFT).
- **Sponsor / Brand (sponsor)**: Access to media library and partner configurations.
- **Standard User / Guest (user)**: Access to public directories, chats, and general comments.

---

## 🔍 4. SEO & Backlink Compliance Policies

### Crawler Optimization
- **Sitemap**: `/sitemap.xml` indexes core static, dynamic, and partner backlink landing directories.
- **Robots Rules**: `/robots.txt` guides web scrapers, indexing public pages while protecting private dashboards.

### Partner Backlink Anchors
To guarantee search engine authority and pass backlink audits, backlinks to the three verified partner websites must utilize precise keyword anchors:
1. **Agility Travels (`agilitytravels.com`)**: Anchored on: `"umrah packages Pakistan"`, `"study abroad Germany"`, `"visa processing"`.
2. **AV Live (`avlive.com.pk`)**: Anchored on: `"event production Pakistan"`, `"live streaming Lahore"`, `"AV solutions Karachi"`.
3. **Made By Pak (`madebypak.com`)**: Anchored on: `"made in Pakistan products"`, `"Support local manufacturers"`, `"assembled in Pakistan"`.

---

## 🧪 5. Automated Unit & Integration Testing

Testing suites are simulated directly within our Technical Compliance Panel to assert codebase integrity during ongoing developments:

### Test Suites Specifications:
- `tests/unit/ranking.test.ts`: Validates Elo ranking math, win-rate parsing, and prize pools.
- `tests/unit/rss.test.ts`: Asserts proper tag extraction, thumbnails, and duplicate prevention in news collections.
- `tests/unit/auth.test.ts`: Confirms that protected route guards correctly redirect unauthenticated traffic away from private user directories.

---

## 📦 6. Deployment & Configuration

### Environment Variables
Declare these environment variables within your secure deployment settings:
```env
# .env (Never commit actual secrets to source control)
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_secret_gemini_api_key_here
```

### Production Build & Launch
```bash
# Compile client assets and boot production server
npm run build
npm start
```

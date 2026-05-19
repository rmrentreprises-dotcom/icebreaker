# Icebreaker AI - Product Requirements Document

## Overview
Mobile-first React Native Expo app that helps users come up with personalized icebreaker lines for any social setting, powered by Claude Sonnet 4.5 AI.

## Stack
- **Frontend**: Expo Router 6 (React Native), lucide-react-native icons, expo-linear-gradient, AsyncStorage
- **Backend**: FastAPI + Motor (async MongoDB)
- **AI**: Claude Sonnet 4.5 via emergentintegrations (Emergent LLM Key)
- **Payments**: Stripe (test mode key sk_test_emergent)
- **i18n**: English + French throughout

## Core Features
1. **Auth**: Email/password JWT register & login, plus anonymous Guest mode (no account)
2. **Curated Library**: 540 seeded icebreakers across 15 categories × 6 tones × 2 languages (EN+FR)
   - Categories: beach, club, café, gym, park, travel, bar, restaurant, bookstore, concert, gallery, coworking, wedding, hotel, transit
   - Tones: funny, romantic, casual, bold, witty, sweet
3. **Daily Spark**: One free random icebreaker per user per day (cached)
4. **AI Live Assistant**: User describes context (location + scene + person details + language). Claude Sonnet 4.5 returns 5 personalized lines with tones + delivery tip
5. **Free tier limits**: 3 AI calls/day for free users; **7-day free trial** auto-granted on register; Premium = unlimited
6. **Favorites**: Save & remove (library + AI lines)
7. **History**: Last 30 AI requests
8. **Stripe Checkout**: $9.99/month or $79.99/year (test mode), via WebBrowser flow
9. **Profile**: Subscription status, daily call stats, language toggle (EN/FR), sign out

## Backend Endpoints (`/api`)
- POST `/auth/register`, `/auth/login`, `/auth/guest`, `/auth/language`
- GET `/auth/me`
- GET `/icebreakers/categories`, `/icebreakers/library`, `/icebreakers/daily`, `/icebreakers/favorites`, `/icebreakers/history`
- POST `/icebreakers/generate`, `/icebreakers/favorite`
- DELETE `/icebreakers/favorite/{id}`
- POST `/checkout/session`
- GET `/checkout/status/{session_id}`

## Design
- **Theme**: Light primary + Dark luxury paywall
- **Accent**: Spark Orange `#FF5A36`
- **Typography**: System sans-serif with bold heading weights, tight tracking
- **Navigation**: Bottom glassmorphism floating tab bar (Home / Library / AI / Saved / Profile)
- **Layout**: Bento grid for categories on Home, full-image hero on Category detail

## Smart Business Hooks
- 7-day premium trial seeds habit before paywall
- Daily card brings free users back every day (retention)
- Free tier bottlenecks AI to drive conversion
- Yearly plan saves 33% (best-value anchor)

## Security & resilience
- **API key is server-side only.** The Anthropic / Emergent LLM key lives in `/app/backend/.env` and is never shipped to the mobile/web bundle. The mobile app only ever calls `/api/*` endpoints, which proxy to Claude on the server.
- **AI errors handled gracefully**: backend maps Anthropic 429 (rate limit), 529 (overload), timeout, and auth/credit failures to friendly 429/503/504 responses with localized EN+FR messages and `Retry-After` headers. Frontend displays a card with a "Try again" button (no crashes).
- **Burst limit**: 8 AI calls / minute / user (in addition to the 3/day free-tier cap) softens viral spikes.
- **Retry with backoff**: backend transparently retries once with jittered backoff on transient upstream errors before surfacing to the user.
- **Account funds**: managed by Emergent Universal Key — top up in **Profile → Universal Key → Add Balance** (auto top-up recommended) so AI calls never silently fail.
- **Prompt caching**: prepared in code but not enabled (system prompt is ~250 tokens, below Anthropic's 1024-token cache minimum). Worth wiring when the system prompt grows past that threshold.

## File Map
- `/app/backend/server.py` - main FastAPI app
- `/app/backend/icebreakers_seed.py` - 540 curated icebreakers
- `/app/frontend/app/_layout.tsx` - root + AuthProvider
- `/app/frontend/app/index.tsx` - onboarding/auth
- `/app/frontend/app/(tabs)/{home,library,assistant,favorites,profile}.tsx` - tabs
- `/app/frontend/app/paywall.tsx` - Stripe upgrade modal
- `/app/frontend/app/category/[id].tsx` - category detail
- `/app/frontend/src/{api,auth,theme,IcebreakerCard}.tsx` - shared logic

## Future
- Apple/Google sign-in (Emergent-managed Google currently deferred)
- Push notifications for daily spark
- Conversation-style multi-turn AI follow-ups
- Streak gamification

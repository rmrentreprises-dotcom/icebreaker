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

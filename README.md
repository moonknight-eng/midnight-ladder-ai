# Midnight Ladder AI App

This repo contains a deployable scaffold for the Midnight 6-13-25-36 Ladder strategy (EUR/USD).
It includes:
- React front-end dashboard (src/App.jsx)
- Serverless webhook (api/tradingview-webhook.js)
- Broker adapter with both simulation and OANDA skeleton (api/brokerAdapter.js)
- Pine Script for TradingView (pine/midnight_ladder.pine)
- .env.example showing required env vars

**IMPORTANT:** Default mode is simulation. Do NOT enable live trading until you have fully tested with historical backtests and a demo account.

## Quickstart (local)
1. Install deps: `npm install`
2. Run dev server: `npm run dev`
3. Deploy to Vercel: push to GitHub and import project. Add environment variables in Vercel: see .env.example

## Environment variables (.env or Vercel project settings)
- EMAIL_USER (Gmail user for notifications)
- EMAIL_PASS (Gmail app password)
- EMAIL_TO
- LIVE_TRADING ("false" or "true")
- WEBHOOK_SECRET (optional)
- BROKER (e.g. OANDA)
- OANDA_API_KEY (if using OANDA)
- OANDA_ACCOUNT (if using OANDA)

## Notes
- Pine script alertmessages should post to /api/tradingview-webhook
- Keep EMAIL_PASS secure; use Vercel env vars for production.

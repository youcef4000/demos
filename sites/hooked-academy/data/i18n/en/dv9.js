// Traduction (en) du module dv9 — Building a real application.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv9": {
      "title": "Building a real application",
      "pitch": "From spec to product: generator or Claude Code, payments (Chargily, international), emails, analytics, PWA and mobile."
    }
  },
  "lessons": {
    "dv9-l1": {
      "title": "From the client’s need to the spec",
      "key": [
        "Spec: users, problem, MVP, screens and data, out of scope.",
        "User stories: as a… I want… so that… + a testable criterion.",
        "Approved in writing before coding; basis of the quote; new requests = version 2."
      ]
    },
    "dv9-l2": {
      "title": "The fast lane: generator + Supabase",
      "key": [
        "Spec → page-by-page generation → Supabase (tables + RLS) → GitHub from the start.",
        "Check: RLS on every table, no secret key in the front end, credits, code up to date on GitHub.",
        "Then a review with Claude Code before delivering."
      ]
    },
    "dv9-l3": {
      "title": "Hands-on · The pro lane with Claude Code",
      "key": [
        "npm create vite@latest my-app (Vite 8, create-vite 9); npm install; npm run build.",
        "Add from the start: CLAUDE.md, spec.md, .env.example, a place for tests.",
        "Screen by screen: plan mode → build → test (npm run dev + phone) → commit."
      ]
    },
    "dv9-l4": {
      "title": "Getting paid: Chargily in Algeria, and international",
      "key": [
        "Algeria: Chargily Pay (CIB, Edahabia, test mode); international: Stripe, Paddle, Lemon Squeezy; plan for cash on delivery.",
        "Flow: server creates the payment → provider’s page → signed webhook confirms.",
        "Never validate in the browser; check the signature; idempotent processing."
      ]
    },
    "dv9-l5": {
      "title": "Forms, emails and analytics",
      "key": [
        "Forms: Tally, Formspree; emails: Resend, Brevo; analytics: Plausible, Umami, Clarity; Search Console.",
        "Delivered emails: SPF, DKIM, DMARC, a clear sender.",
        "Automatic reminder the day before and a WhatsApp link in the email."
      ]
    },
    "dv9-l6": {
      "title": "PWA and mobile apps",
      "key": [
        "PWA = web app + manifest + service worker: installable without a store, at no cost.",
        "Capacitor (wrap a web app) or Expo (native app) for the stores: Apple $99/year, Google $25 once.",
        "Stores: review delays, accounts in the client’s name, every update reviewed again."
      ]
    }
  }
};

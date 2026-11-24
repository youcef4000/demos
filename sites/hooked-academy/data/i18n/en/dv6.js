// Traduction (en) du module dv6 — Going live.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv6": {
      "title": "Going live",
      "pitch": "GitHub Pages, Vercel, Netlify, Cloudflare, Railway, Render, domain name and DNS: online in a few clicks."
    }
  },
  "lessons": {
    "dv6-l1": {
      "title": "The families of hosting",
      "key": [
        "Static (Pages, Cloudflare, Netlify, Vercel), PaaS (Railway, Render), BaaS (Supabase).",
        "Tree: no server → static; data → + Supabase; server → Railway/Render; client → accounts in their name.",
        "Total cost: movable solutions, accounts in the client’s name, spending limits."
      ]
    },
    "dv6-l2": {
      "title": "Hands-on · GitHub Pages step by step",
      "key": [
        "Public repository → Settings → Pages → Deploy from a branch → main / (root) → Save, or one request to your agent.",
        "Address: account.github.io/repo; republished on every push, in 1 to 2 minutes.",
        "Relative paths everywhere: the site lives in a subfolder (a rule to put in CLAUDE.md)."
      ]
    },
    "dv6-l3": {
      "title": "Vercel, Netlify, Cloudflare Pages",
      "key": [
        "Vercel (Next.js, Hobby non-commercial), Netlify (credits), Cloudflare Pages (generous).",
        "GitHub import → build detected → variables → live; a preview address per branch.",
        "VITE_ and NEXT_PUBLIC_ = public: never a secret key with that prefix."
      ]
    },
    "dv6-l4": {
      "title": "Hands-on · A server online on Railway",
      "key": [
        "Your agent creates the API, tests it itself (health address, 404 for the rest) and prepares it for Railway.",
        "Railway: New Project → Deploy from GitHub → Variables → Generate Domain → spending limit.",
        "Railway: $5 trial, Free $1/month, Hobby $5/month; Render: sleeps after ~15 min, free database deleted after 30 days."
      ]
    },
    "dv6-l5": {
      "title": "Domain name and DNS",
      "key": [
        "Buy: Cloudflare Registrar, Namecheap, Porkbun; .dz through a NIC.dz accredited registrar.",
        "DNS: A (IP), CNAME (another name), TXT (verifications, SPF), MX (emails).",
        "Client: domain in their name, auto-renewal, social handles checked, DNS at Cloudflare."
      ]
    }
  }
};

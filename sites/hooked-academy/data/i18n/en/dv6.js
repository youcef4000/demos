// Traduction (en) du module dv6 — Going live.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv6": {
      "title": "Going live",
      "pitch": "GitHub Pages, Vercel, Netlify, Cloudflare, Railway, Render, domain name, DNS, and the VPS for pros."
    }
  },
  "lessons": {
    "dv6-l1": {
      "title": "The families of hosting",
      "key": [
        "Static (Pages, Cloudflare, Netlify, Vercel), PaaS (Railway, Render), BaaS (Supabase), VPS (+ Coolify).",
        "Tree: no server → static; data → + Supabase; server → Railway/Render; many apps → VPS.",
        "Total cost: movable solutions, accounts in the client’s name, spending limits."
      ]
    },
    "dv6-l2": {
      "title": "Hands-on · GitHub Pages step by step",
      "key": [
        "Public repo → Settings → Pages → Deploy from a branch → main / (root) → Save.",
        "Address: account.github.io/repo; republished on every push, in 1 to 2 minutes.",
        "Relative paths (./css/style.css): the site lives in a subfolder."
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
      "title": "Hands-on · A real server on Railway or Render",
      "key": [
        "The server listens on process.env.PORT; a health route; 404 for everything else.",
        "Test locally: npm start then curl -i localhost:3000/api/sante → 200 {\"ok\":true}.",
        "Railway: $5 trial, Free $1/month, Hobby $5/month; Render: sleeps after ~15 min, free database deleted after 30 days. Always a spending limit."
      ]
    },
    "dv6-l5": {
      "title": "Domain name and DNS",
      "key": [
        "Buy: Cloudflare Registrar, Namecheap, Porkbun; .dz through a NIC.dz accredited registrar.",
        "DNS: A (IP), CNAME (another name), TXT (verifications, SPF), MX (emails).",
        "Client: domain in their name, auto-renewal, social handles checked, DNS at Cloudflare."
      ]
    },
    "dv6-l6": {
      "title": "Pro level: VPS, Docker, Caddy, Coolify",
      "key": [
        "VPS ($5–20/month) + Docker (one box per app) + Caddy (automatic HTTPS); Coolify or Dokploy for the interface.",
        "Caddyfile: domain { reverse_proxy localhost:3000 }.",
        "Responsibilities: SSH keys, firewall 22/80/443, updates, off-server backups."
      ]
    }
  }
};

// Traduction (en) du module dv2 — How the web works.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv2": {
      "title": "How the web works",
      "pitch": "Domain, DNS, front end, back end, database, API and the 2026 tech stack, without jargon."
    }
  },
  "lessons": {
    "dv2-l1": {
      "title": "Domain, DNS, hosting: what happens when you type an address",
      "key": [
        "Domain = the shop sign; hosting = the premises; DNS = the directory linking the two.",
        "The browser asks the DNS, then downloads the files from the server.",
        "HTTPS (the padlock) encrypts the exchanges: free and mandatory."
      ]
    },
    "dv2-l2": {
      "title": "Front end, back end, database, API",
      "key": [
        "Front end = the dining room; API = the waiter; back end = the kitchen; database = the fridge.",
        "Everything in the front end is visible and editable: no secrets, no security decisions.",
        "Data travels as JSON between the front end and the API."
      ]
    },
    "dv2-l3": {
      "title": "Static site, web app, PWA or mobile app?",
      "key": [
        "Static (showcase), web app (accounts and data), PWA (installable without a store), mobile app (stores).",
        "Most shop owners: a fast showcase + a WhatsApp button.",
        "Login, data, notifications, stores: if all are no, it’s a static site."
      ]
    },
    "dv2-l4": {
      "title": "HTML, CSS, JavaScript: learning to read them",
      "key": [
        "HTML = structure; CSS = appearance; JavaScript = behaviour.",
        "Reading is enough to check: find the title, the colour, the button.",
        "CSS variables change the whole style in one line."
      ]
    },
    "dv2-l5": {
      "title": "The 2026 tech stack",
      "key": [
        "React 19, Next.js 16, Vite 8, Tailwind CSS 4, shadcn/ui, TypeScript: the modern stack (November 2026).",
        "Showcase and demo: HTML/CSS/JS; app: React/Next.js + TypeScript + Tailwind + Supabase.",
        "Latest stable version, up-to-date docs for the AI, pinned versions."
      ]
    }
  }
};

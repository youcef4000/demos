// Traduction (en) du module dv13 — Demos that get signed.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv13": {
      "title": "Demos that get signed",
      "pitch": "The demo strategy, the €0/month system, the serverless “app” demo, the budget, the pitch and the contract."
    }
  },
  "lessons": {
    "dv13-l1": {
      "title": "The demo strategy",
      "key": [
        "The prospect buys what they see with their name on it: show before you sell.",
        "Honest demo: public info, labelled examples, private link; never fake reviews, figures or logos.",
        "Arrive with a diagnosis: current site, Google profile, competitors, then the demo."
      ]
    },
    "dv13-l2": {
      "title": "Hands-on · The €0/month demo system",
      "key": [
        "One public repo + GitHub Pages + a subdomain (CNAME) + one folder per demo.",
        "demos.json: public: false = private link, out of the gallery.",
        "git push → live in 1 to 2 minutes; public repo: no keys, no real data."
      ]
    },
    "dv13-l3": {
      "title": "A serverless “app” demo",
      "key": [
        "App demo: data in localStorage, every visitor has their own copy, zero servers.",
        "All data goes through store.js: after signing, rewrite it for Supabase.",
        "Admin area, labelled simulated payments, Reset button, perfect on mobile."
      ]
    },
    "dv13-l4": {
      "title": "The budget: what’s free, what costs",
      "key": [
        "Demo: €0 hosting; signed client: everything in the client’s name.",
        "Safeguards: limits and caps, alerts, dedicated card, monthly clean-up.",
        "The real cost is your time: reusable templates, skills and demos."
      ]
    },
    "dv13-l5": {
      "title": "Presenting the demo and following up",
      "key": [
        "Short personal message + 30–60 s video + link + their benefit + one small step.",
        "Check the preview, follow up at D+3 and D+7, then stop; demo on their own phone.",
        "Three offers: showcase, showcase + admin, application."
      ]
    },
    "dv13-l6": {
      "title": "From demo to contract",
      "key": [
        "Quote (spec) → deposit → content with a deadline → delivery (accounts in the client’s name) → maintenance.",
        "Quote: scope, out of scope, included revisions, deadlines, payment schedule, ownership.",
        "Whatever isn’t written down will be asked for free."
      ]
    }
  }
};

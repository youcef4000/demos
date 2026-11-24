// Traduction (en) du module dv3 — The platform tour.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv3": {
      "title": "The platform tour",
      "pitch": "Claude, Claude Code, Codex, GitHub, Supabase, hosts and app generators: where to click and why."
    }
  },
  "lessons": {
    "dv3-l1": {
      "title": "Claude.ai: chat, projects, artifacts, skills, connectors",
      "key": [
        "Claude.ai: chat, projects, artifacts, skills, connectors, memory.",
        "One project per client: instructions + files = permanent context.",
        "Artifacts: a mock-up shareable by link in minutes."
      ]
    },
    "dv3-l2": {
      "title": "Claude Code: the agent that builds with you",
      "key": [
        "Claude Code: desktop app (Code tab), claude.ai/code (cloud + GitHub), phone.",
        "/init, plan mode, /clear, /compact, go back, /mcp, /plugin, /skills.",
        "Read before accepting, never a password in the chat, always in the project folder."
      ]
    },
    "dv3-l3": {
      "title": "Codex: the other agent",
      "key": [
        "Codex: OpenAI’s coding agent, included with ChatGPT Plus; desktop app, cloud linked to GitHub, phone.",
        "Codex reads AGENTS.md the way Claude Code reads CLAUDE.md.",
        "Same method with both; one agent can review the other’s work."
      ]
    },
    "dv3-l4": {
      "title": "Git and GitHub: the tour",
      "key": [
        "A repository: Code, Commits, Branches, Pull requests, Issues, Actions, Pages, Settings.",
        "Edit → commit → push → automatic publishing.",
        "Security: 2FA, secret scanning and push protection, private client repos, a pro organisation."
      ]
    },
    "dv3-l5": {
      "title": "Supabase: the tour",
      "key": [
        "Supabase: Table Editor, SQL Editor, Authentication, Storage, Edge Functions, Advisors, API Keys, Logs.",
        "Free: 2 active projects, ≈ 500 MB, paused after 7 inactive days; Pro ≈ $25/month.",
        "Security is configured: RLS on every table, Advisors, secret key on the server side."
      ]
    },
    "dv3-l6": {
      "title": "Vercel, Netlify, Cloudflare, Railway: the tour",
      "key": [
        "Shared principle: New project → GitHub import → variables → Deploy; every push republishes.",
        "Pages (demos), Cloudflare/Netlify (sites), Vercel (Next.js, Hobby non-commercial), Railway/Render (servers).",
        "Always a spending limit on usage-billed services."
      ]
    },
    "dv3-l7": {
      "title": "Lovable, Bolt, v0, Replit: app generators",
      "key": [
        "Lovable (simple, Supabase), Bolt (fast, mobile), v0 (React interfaces), Replit (all-in-one).",
        "Pitfalls: credits, messy code, security not guaranteed.",
        "Fixes: precise requests, GitHub from the start, review with Claude Code."
      ]
    }
  }
};

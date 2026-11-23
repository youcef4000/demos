// Traduction (en) du module dv8 — Cybersecurity.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv8": {
      "title": "Cybersecurity",
      "pitch": "Why AI-built apps get hacked, the OWASP Top 10 2025, secrets, access, injections, dependencies, AI agents, and the audit before going live."
    }
  },
  "lessons": {
    "dv8-l1": {
      "title": "Why AI-built apps get hacked",
      "key": [
        "Vibe-coded apps leak mostly through: open access (RLS), exposed secrets, booby-trapped dependencies.",
        "February 2026: about 1.5 million tokens exposed by an app without RLS.",
        "AI writes code that works, not necessarily code that resists: you have to ask for it and check."
      ]
    },
    "dv8-l2": {
      "title": "The OWASP Top 10 2025 in plain words",
      "key": [
        "A01 Access control, A02 Configuration, A03 Supply chain, A04 Cryptography, A05 Injection.",
        "A06 Design, A07 Authentication, A08 Integrity, A09 Logging and alerting, A10 Exceptional conditions.",
        "2025 additions: supply chain (A03) and mishandled errors (A10); number one is still access."
      ]
    },
    "dv8-l3": {
      "title": "Secrets and API keys",
      "key": [
        "A secret key in the browser can be read with F12: it must live on the server side.",
        "The browser calls your /api/… route, which reads the key from its environment variables.",
        "Ignored .env, host variables, push protection, revocation after a leak, spending limits."
      ]
    },
    "dv8-l4": {
      "title": "Access control, IDOR and roles",
      "key": [
        "IDOR: changing an ID to read someone else’s data; always check the owner.",
        "Roles checked in the database (profiles + RLS), never by hiding a button.",
        "Test: two accounts, logged out, changed IDs, API called directly."
      ]
    },
    "dv8-l5": {
      "title": "Injections, XSS and security policy",
      "key": [
        "XSS: display with textContent, never innerHTML with user data.",
        "SQL: supabase-js or parameterised queries, never concatenated text.",
        "Content-Security-Policy: a closed list of script sources and network calls."
      ]
    },
    "dv8-l6": {
      "title": "Hands-on · Dependencies, npm audit and slopsquatting",
      "key": [
        "npm audit lists known vulnerabilities; npm audit fix suggests updates.",
        "Slopsquatting: check any unknown package on npmjs.com; npm install --ignore-scripts.",
        "Fewer dependencies, lockfile, Dependabot, fast updates for critical flaws."
      ]
    },
    "dv8-l7": {
      "title": "Securing AI agents and MCPs",
      "key": [
        "Prompt injection: hidden instructions in a page, a file or an MCP tool.",
        "Read permissions, trusted sources, least privilege, remove unused MCPs.",
        "App with AI: human confirmation of sensitive actions, limited access, answers displayed as text."
      ]
    },
    "dv8-l8": {
      "title": "Hands-on · The security audit before going live",
      "key": [
        "Check: git check-ignore -v .env, git grep, headers (curl -sI); CSP in a meta tag on GitHub Pages.",
        "Checklist: secrets, tested RLS, npm audit, validated inputs, headers, 2FA.",
        "/security-review in Claude Code + read-only Supabase MCP; approve fixes one by one."
      ]
    }
  }
};

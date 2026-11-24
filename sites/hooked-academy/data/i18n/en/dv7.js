// Traduction (en) du module dv7 — Back end and Supabase.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv7": {
      "title": "Back end and Supabase",
      "pitch": "Understand the back end, design tables, connect, manage accounts, lock down with RLS, and the mistakes every beginner makes."
    }
  },
  "lessons": {
    "dv7-l1": {
      "title": "What is a back end?",
      "key": [
        "The back end checks (who, what, right, availability) before saving.",
        "Authentication = who are you? Authorisation = are you allowed? Both are mandatory.",
        "Verbs: GET read, POST create, PATCH update, DELETE delete."
      ]
    },
    "dv7-l2": {
      "title": "Designing your tables",
      "key": [
        "One table per kind of thing; relations between tables.",
        "Types: text, numeric (prices), timestamptz (dates), boolean, uuid.",
        "You describe the tables in plain words; the agent creates them with constraints and saves every change (migrations)."
      ]
    },
    "dv7-l3": {
      "title": "Connecting Supabase: your agent and your site",
      "key": [
        "Connect your agent: Supabase connector (official MCP), a single project, read-only on real data.",
        "One request: create the brief’s tables, display the data, save the form, with the publishable key only.",
        "Publishable (ex-anon) in the browser, safe with RLS; Secret (ex-service_role) server only; a new table is no longer exposed automatically (2026)."
      ]
    },
    "dv7-l4": {
      "title": "User accounts (Auth)",
      "key": [
        "Methods: email + password, magic link, Google, passkeys.",
        "One request: sign-in, protected page, profiles table, and the list of Supabase settings.",
        "Settings: redirect URLs, emails in your language, SMTP in production, profiles table."
      ]
    },
    "dv7-l5": {
      "title": "RLS: the most important lesson",
      "key": [
        "RLS enabled on every table, no exceptions; one rule per action (read, create, update, delete).",
        "You write the rules in plain words, your agent translates them: everyone only sees and creates their own rows.",
        "Test with two accounts; an August 2026 analysis found 57% of vibe-coded Supabase apps readable without signing in."
      ]
    },
    "dv7-l6": {
      "title": "Files, Edge Functions and Claude checking your database",
      "key": [
        "Storage: public buckets (photos) or private ones (documents) with their rules.",
        "Edge Functions: server code that keeps secrets; always check before acting.",
        "Supabase connector: the agent reads the schema, writes migrations and checks RLS; read-only on real data."
      ]
    },
    "dv7-l7": {
      "title": "The 12 back-end mistakes beginners make",
      "key": [
        "Never trust the browser: prices, roles, identifiers re-checked on the server.",
        "Rate limiting, signed webhooks, server-side data validation, idempotent processing, errors without details.",
        "timestamptz, versioned migrations, separate test database, tested backups."
      ]
    }
  }
};

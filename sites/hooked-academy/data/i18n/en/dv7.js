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
        "One table per kind of thing; relations (references) between tables.",
        "Types: text, numeric (prices), timestamptz (dates), boolean, uuid.",
        "Schema in versioned SQL (migrations), not null / check / references constraints."
      ]
    },
    "dv7-l3": {
      "title": "Connecting the site to Supabase",
      "key": [
        "createClient(URL, publishable key); select / insert / update; always handle error.",
        "Publishable (ex-anon) in the browser, safe with RLS; Secret (ex-service_role) server only.",
        "Since 2026, a new table is no longer exposed to the API automatically: check that setting."
      ]
    },
    "dv7-l4": {
      "title": "User accounts (Auth)",
      "key": [
        "Methods: email + password, magic link, Google, passkeys.",
        "signUp, signInWithOtp, signInWithOAuth, getUser.",
        "Settings: redirect URLs, emails in French, SMTP in production, profiles table."
      ]
    },
    "dv7-l5": {
      "title": "RLS: the most important lesson",
      "key": [
        "RLS enabled on every table, no exceptions; one policy per action (select, insert, update, delete).",
        "(select auth.uid()) = user_id: everyone only sees and creates their own rows.",
        "Test with two accounts; an August 2026 analysis found 57% of vibe-coded Supabase apps readable without logging in."
      ]
    },
    "dv7-l6": {
      "title": "Files, Edge Functions and Claude connected to Supabase",
      "key": [
        "Storage: public buckets (photos) or private (documents) with their rules.",
        "Edge Functions: server code that keeps the secrets; always check before acting.",
        "Supabase MCP: claude mcp add --transport http supabase https://mcp.supabase.com/mcp; read-only on real data."
      ]
    },
    "dv7-l7": {
      "title": "The 12 back-end mistakes beginners make",
      "key": [
        "Never trust the browser: prices, roles, IDs re-checked on the server side.",
        "Rate limiting, signed webhooks, validation (Zod), idempotent processing, errors without details.",
        "timestamptz, versioned migrations, separate test database, tested backups."
      ]
    }
  }
};

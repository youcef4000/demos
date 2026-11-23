// Traduction (en) du module dv10 — Stabilising your application.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv10": {
      "title": "Stabilising your application",
      "pitch": "Why a vibe-coded app breaks, and how to make it reliable: tests, types and validation, safety nets, monitoring."
    }
  },
  "lessons": {
    "dv10-l1": {
      "title": "Why a vibe-coded app breaks",
      "key": [
        "Causes: regressions, lost context, dependencies, unexpected real data.",
        "Defence: tests, types and validation, small commits + CI, monitoring.",
        "The bigger the app, the more these layers become mandatory."
      ]
    },
    "dv10-l2": {
      "title": "Hands-on · Getting the AI to write tests",
      "key": [
        "Test critical calculations and rules: normal cases and forbidden cases.",
        "npx vitest run: 3 green tests in ~120 ms (real session).",
        "A test catches the regression (−27,000 instead of 2,700) before production."
      ]
    },
    "dv10-l3": {
      "title": "Types and validation: TypeScript and Zod",
      "key": [
        "Zod: a schema describes the accepted data; safeParse rejects the rest before the database.",
        "Validate every input on the server side (forms, API, webhooks).",
        "TypeScript: errors show up in the editor and the AI knows the exact shape of the data."
      ]
    },
    "dv10-l4": {
      "title": "Safety nets: small commits, CI, rollback",
      "key": [
        "One branch per feature, small commits, green tests, merge; a tagged version per release.",
        "CI: tests on every pull request (GitHub Actions); red = no merge.",
        "Rollback: git revert, previous deployment, reverse migration, tested backup."
      ]
    },
    "dv10-l5": {
      "title": "Monitoring: errors, logs, uptime",
      "key": [
        "Uptime (UptimeRobot, Better Stack), errors (Sentry), logs (host, Supabase).",
        "Log errors, failed logins, payments; never secrets in the logs.",
        "Monitoring sells as a monthly maintenance plan with a report."
      ]
    }
  }
};

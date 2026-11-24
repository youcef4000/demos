// Traduction (en) du module dv10 — Stabilising your application.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv10": {
      "title": "Stabilising your application",
      "pitch": "Why a vibe-coded app breaks, and how to make it reliable: tests written by the AI, safety nets, monitoring."
    }
  },
  "lessons": {
    "dv10-l1": {
      "title": "Why a vibe-coded app breaks",
      "key": [
        "Causes: regressions, lost context, dependencies, unexpected real data.",
        "Defence: tests written by the agent, data validation, small saves + automatic checks, monitoring.",
        "The more the app grows, the more these layers become mandatory."
      ]
    },
    "dv10-l2": {
      "title": "Hands-on · Getting the AI to write tests",
      "key": [
        "Describe in plain words what must work and what must be forbidden; the agent writes and runs the tests.",
        "A test catches the regression (−27,000 instead of 2,700) before it goes live.",
        "In CLAUDE.md: “run the tests before every save”."
      ]
    },
    "dv10-l4": {
      "title": "Safety nets: small saves, automatic checks, rollback",
      "key": [
        "One branch per feature, small saves, green tests, merge; a tagged version per release.",
        "Automatic checks: tests on every pull request (GitHub Actions), requested from your agent; red = no merge.",
        "Rollback: revert, previous deployment, reverse migration, tested backup."
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

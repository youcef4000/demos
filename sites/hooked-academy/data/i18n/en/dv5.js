// Traduction (en) du module dv5 — Saving with GitHub.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv5": {
      "title": "Saving with GitHub",
      "pitch": "Save, go back, experiment safely, protect your secrets and publish automatically: just by asking your agent."
    }
  },
  "lessons": {
    "dv5-l1": {
      "title": "Git explained simply",
      "key": [
        "Git = save points (commits) you can go back to; your agent uses it for you.",
        "The cycle: you ask → you test → the agent commits → then pushes to GitHub.",
        "A commit message says what changed."
      ]
    },
    "dv5-l2": {
      "title": "Hands-on · Your first repository, without a single command",
      "key": [
        "Request 1: “turn this folder into a repository and make a first save”, checking for secrets.",
        "Request 2: “create a private repository on GitHub and send the project”; sign-in is one click on Authorize.",
        "Check on GitHub: the files, the Commits tab, no .env, private repository."
      ]
    },
    "dv5-l3": {
      "title": "Hands-on · Experiment, merge, go back",
      "key": [
        "A branch to experiment without touching the main version; merge it if you like it.",
        "To undo, ask for a “revert”: the agent adds a reverse save, the history stays complete.",
        "Pull request = a branch reviewed before merging; a preview per branch on Vercel, Netlify, Cloudflare."
      ]
    },
    "dv5-l4": {
      "title": "Hands-on · Secrets: never publish a key",
      "key": [
        "Keys go in .env, which Git ignores; .env.example only publishes the names.",
        "Ask for the check: .env ignored, no secret in the files or in the history.",
        "Key published: revoke it and create a new one; deleting the commit is not enough."
      ]
    },
    "dv5-l5": {
      "title": "Finding the best GitHub repositories",
      "key": [
        "Search filters: stars:>500, pushed:>date, topic:, license:mit, archived:false; or ask your agent to search.",
        "References: shadcn-ui/ui, supabase/supabase, anthropics/skills, github/spec-kit, OWASP/CheatSheetSeries.",
        "Before using: licence, recent maintenance, active issues, an audit by Claude."
      ]
    },
    "dv5-l6": {
      "title": "GitHub Actions and Pages: publish automatically",
      "key": [
        "Push → GitHub Actions → site built → online in 1 to 2 minutes.",
        "Your agent writes the robot’s file (.github/workflows) in one request, and explains what it does.",
        "Actions publish, test, check security and send reports."
      ]
    }
  }
};

// Traduction (en) du module dv5 — Git and GitHub.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv5": {
      "title": "Git and GitHub",
      "pitch": "Save, go back, work in branches, protect secrets, find the best repositories, publish automatically."
    }
  },
  "lessons": {
    "dv5-l1": {
      "title": "Git explained simply",
      "key": [
        "Git = save points (commits) you can go back to.",
        "The cycle: edit → git add → git commit → git push.",
        "A commit message says what changed."
      ]
    },
    "dv5-l2": {
      "title": "Hands-on · Your first repository",
      "key": [
        "git init -b main, git status, git add ., git commit -m \"…\", git log --oneline.",
        "“??” = untracked file; after the commit, it’s saved.",
        "To GitHub: git remote add origin … then git push -u origin main (or gh repo create … --push)."
      ]
    },
    "dv5-l3": {
      "title": "Hands-on · Branches, merging and undoing",
      "key": [
        "git checkout -b <branch> to try, git merge to merge.",
        "git revert undoes a commit by adding a reverse commit: the history stays complete.",
        "Pull request = a branch reviewed before merging; a preview per branch on Vercel, Netlify, Cloudflare."
      ]
    },
    "dv5-l4": {
      "title": "Hands-on · Secrets: .gitignore and .env",
      "key": [
        "Keys go in .env, listed in .gitignore; .env.example only publishes the names.",
        "Check: git check-ignore -v .env, git ls-files, git grep.",
        "Leaked key: revoke it and create a new one; deleting the commit is not enough."
      ]
    },
    "dv5-l5": {
      "title": "Finding the best GitHub repositories",
      "key": [
        "Filters: stars:>500, pushed:>date, topic:, license:mit, archived:false; gh search repos.",
        "References: shadcn-ui/ui, supabase/supabase, anthropics/skills, github/spec-kit, OWASP/CheatSheetSeries.",
        "Before using one: licence, recent maintenance, active issues, an audit by Claude."
      ]
    },
    "dv5-l6": {
      "title": "GitHub Actions and Pages: publish automatically",
      "key": [
        "git push → GitHub Actions → site built → live in 1 to 2 minutes.",
        "A .github/workflows/*.yml file describes the robot (trigger, steps).",
        "Actions publish, test, check security and send reports."
      ]
    }
  }
};

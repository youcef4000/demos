// Traduction (en) du module dv1 — Vibe coding.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv1": {
      "title": "Vibe coding",
      "pitch": "What vibe coding is, its tools, its pro method and the mistakes to avoid."
    }
  },
  "lessons": {
    "dv1-l1": {
      "title": "What is vibe coding?",
      "key": [
        "Vibe coding: describe what you want, the AI writes the code, you judge the result (Karpathy, February 2025).",
        "Collins Dictionary’s word of the year 2025.",
        "Your role: decide, describe, check, deliver — the AI types, you lead."
      ]
    },
    "dv1-l2": {
      "title": "From prototype to production",
      "key": [
        "Prototype: free vibe coding; demo: review; production: spec, tests and security.",
        "Rigour is mandatory as soon as there is money, personal data, accounts or API keys.",
        "Vibe coding makes it fast; the pro makes it reliable."
      ]
    },
    "dv1-l3": {
      "title": "The four families of tools",
      "key": [
        "Four families: chat, generators (Lovable, Bolt, v0, Replit), agents (Claude Code, Codex), platforms (GitHub, Supabase, hosts).",
        "Winning combo: generator → GitHub → Claude Code → online.",
        "Before adopting a tool: GitHub export, a way out, credit prices, where the data lives."
      ]
    },
    "dv1-l4": {
      "title": "The pro loop: spec, plan, build, test, save",
      "key": [
        "The loop: spec → approved plan → small step → real test → commit.",
        "A spec: for whom, what we want, testable criteria, out of scope. Fix the spec when the result is wrong.",
        "Plan mode: fixing a plan costs far less than fixing code."
      ]
    },
    "dv1-l5": {
      "title": "Context: what the AI needs to know",
      "key": [
        "Context engineering: give the right information at the right time.",
        "Four sources: CLAUDE.md or AGENTS.md, up-to-date docs, exact screenshots and errors, short sessions.",
        "A short CLAUDE.md: stack, commands, non-negotiable rules."
      ]
    },
    "dv1-l6": {
      "title": "The 10 mistakes of the beginner vibe coder",
      "key": [
        "Method mistakes: asking for everything at once, no commits, believing “it’s done”, summarising the error.",
        "Security mistakes: keys in the code, no RLS, made-up packages, validation only in the browser.",
        "Understand what you ship and back up the data."
      ]
    }
  }
};

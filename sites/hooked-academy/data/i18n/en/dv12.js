// Traduction (en) du module dv12 — Supercharging Claude.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv12": {
      "title": "Supercharging Claude",
      "pitch": "CLAUDE.md and AGENTS.md, skills, plugins, MCP and connectors, subagents, hooks and parallel sessions."
    }
  },
  "lessons": {
    "dv12-l1": {
      "title": "CLAUDE.md and AGENTS.md: the projects’ memory",
      "key": [
        "~/.claude/CLAUDE.md (personal), the project CLAUDE.md, AGENTS.md (open standard also read by Claude Code).",
        "Shared rules in AGENTS.md, imported into CLAUDE.md with @AGENTS.md.",
        "One more line for every repeated mistake; checkable rules; under 100 lines."
      ]
    },
    "dv12-l2": {
      "title": "Hands-on · Creating and installing a skill",
      "key": [
        "A skill = a folder with SKILL.md (+ templates, scripts); ~/.claude/skills/ (personal) or .claude/skills/ (project).",
        "The header: name and description (what + when); Claude loads it by itself or via /name.",
        "claude.ai: Capabilities (code execution) → Customize → Skills → Upload (ZIP); synced with Claude Code."
      ]
    },
    "dv12-l3": {
      "title": "Plugins: superpowers in one command",
      "key": [
        "/plugin: the official catalogue is already added; install, disable, uninstall; /plugin marketplace add for another catalogue.",
        "Scopes: just me (all my projects), project (the whole team), local (me, on this project).",
        "A plugin can run code: read the details, trusted sources, uninstall what you don’t use."
      ]
    },
    "dv12-l4": {
      "title": "MCP and connectors: plugging Claude into your tools",
      "key": [
        "Useful MCPs: Supabase, GitHub, Playwright, Context7, Figma, Sentry.",
        "Connect: ask your agent to add the MCP server, or Settings → Connectors; check with /mcp.",
        "Least privilege: read-only, one project, no token in plain text."
      ]
    },
    "dv12-l5": {
      "title": "Advanced workflows: subagents, hooks, parallel sessions",
      "key": [
        "Sub-agents (/agents), hooks (/hooks), parallel sessions on branches, claude.ai/code and @claude on GitHub.",
        "Hook: an automatic action after every change, requested in one sentence; /hooks to see it.",
        "@claude in GitHub (/install-github-app): start a task from an issue or a pull request."
      ]
    }
  }
};

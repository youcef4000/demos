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
        "/plugin (catalogue), /plugin install <plugin>@claude-plugins-official, /plugin marketplace add, /reload-plugins.",
        "Scopes: user (~/.claude/settings.json), project (.claude/settings.json), local (.claude/settings.local.json).",
        "A plugin can run code: read the details, trusted sources, uninstall what’s unused."
      ]
    },
    "dv12-l4": {
      "title": "MCP and connectors: plugging Claude into your tools",
      "key": [
        "Useful MCPs: Supabase, GitHub, Playwright, Context7, Figma, Sentry.",
        "claude mcp add --transport http <name> <url>; claude mcp add <name> -- <command>; --scope project; /mcp; claude mcp list.",
        "Least privilege: read-only, one project, no token in plain text; Connectors in claude.ai."
      ]
    },
    "dv12-l5": {
      "title": "Advanced workflows: subagents, hooks, parallel sessions",
      "key": [
        "Subagents (/agents), hooks (/hooks), parallel sessions on branches, claude.ai/code and @claude on GitHub.",
        "PostToolUse hook + matcher \"Edit|Write\": an automatic action after every edit.",
        "/install-github-app for @claude in GitHub; claude -p for scripts and Actions."
      ]
    }
  }
};

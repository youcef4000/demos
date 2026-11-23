// Traduction (en) du module dv4 — Your first showcase website.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv4": {
      "title": "Your first showcase website",
      "pitch": "A page that makes people want more, a clean design, light images, a nice share preview and 100 on Lighthouse."
    }
  },
  "lessons": {
    "dv4-l1": {
      "title": "The structure of a page that converts",
      "key": [
        "Six blocks: hero, proof, offer, steps, FAQ, contact.",
        "On mobile: understood in 3 seconds and the call-to-action visible without scrolling.",
        "Never fake reviews or fake figures; examples are labelled."
      ]
    },
    "dv4-l2": {
      "title": "A clean design without being a designer",
      "key": [
        "2 fonts, 1 colour + neutrals, regular spacing, mobile first.",
        "All colours and sizes in CSS variables; clamp() to adapt.",
        "Realtime Colors, Google Fonts, Fontshare; inspiration screenshots for the rhythm, not the content."
      ]
    },
    "dv4-l3": {
      "title": "Light images, icons and media",
      "key": [
        "Compressed WebP/AVIF (< 200 KB), width/height, loading=\"lazy\", alt text.",
        "Icons: Lucide, Phosphor, Iconify; photos: Unsplash, Pexels; compression: Squoosh.",
        "AI images presented as illustrations until the real photos arrive."
      ]
    },
    "dv4-l4": {
      "title": "SEO and share previews",
      "key": [
        "title < 60 characters, description < 155, Open Graph with a 1200 × 630 image as a full URL.",
        "Local SEO: one h1, the customers’ real words, Google Business Profile, identical contact details everywhere.",
        "Test the preview: opengraph.xyz, LinkedIn Post Inspector, a test WhatsApp message."
      ]
    },
    "dv4-l5": {
      "title": "Quality: Lighthouse, accessibility, mobile",
      "key": [
        "Lighthouse scores performance, accessibility, best practices and SEO: aim for 90+ on mobile.",
        "The course’s example site scores 100 everywhere (real measurement).",
        "F12 → Lighthouse → Mobile → Analyze, then fix with the AI and run it again."
      ]
    },
    "dv4-l6": {
      "title": "Hands-on · Build the showcase with Claude Code",
      "key": [
        "Starting prompt: read CLAUDE.md and brief.md, task, constraints, labelled sample content, plan first.",
        "Test locally: python3 -m http.server 8000 then http://localhost:8000; 200 = OK.",
        "Improve in small steps: one request, one test (computer + phone), one commit."
      ]
    }
  }
};

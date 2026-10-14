// Traduction (en) du module ia3 — Video generation.
// Générée depuis les textes extraits, relue ; voir tools/hooked-academy/glossaire-i18n.md.
export default {
  "modules": {
    "ia3": {
      "title": "Video generation",
      "pitch": "Animate a packshot, master camera moves, keep the product identical from one shot to the next."
    }
  },
  "lessons": {
    "ia3-l1": {
      "title": "Text → video or image → video?",
      "scenes": [
        {
          "sub": "Two ways to generate"
        },
        {
          "title": "The two paths",
          "left": {
            "title": "Text → video",
            "items": [
              "Quick for exploring",
              "Little control over the product"
            ]
          },
          "right": {
            "title": "Image → video",
            "items": [
              "You approve the image first",
              "The product stays true"
            ]
          }
        },
        {
          "title": "The recommended path",
          "nodes": [
            {
              "label": "Your photo"
            },
            {
              "label": "Approved image"
            },
            {
              "label": "Animation",
              "sub": "5 seconds"
            },
            {
              "label": "Editing"
            }
          ]
        },
        {}
      ],
      "key": [
        "Text → video: quick exploring, little control.",
        "Image → video: approve the image, then animate it — the way to go for ads.",
        "Work in short shots of a few seconds."
      ],
      "quiz": [
        {
          "q": "To keep your product true to life, you choose…",
          "a": [
            "Image → video",
            "Text → video",
            "Neither"
          ],
          "why": "The starting image locks in how the product looks."
        }
      ]
    },
    "ia3-l2": {
      "title": "Camera moves",
      "scenes": [
        {
          "sub": "Push-in · Orbit · Tracking · Crane"
        },
        {
          "title": "Four moves that work",
          "moves": [
            "push",
            "orbit",
            "pan",
            "crane"
          ]
        },
        {
          "title": "Which move for which emotion?",
          "items": [
            {
              "label": "Push-in",
              "sub": "Focus, desire"
            },
            {
              "label": "Orbit",
              "sub": "Luxury, detail"
            },
            {
              "label": "Tracking",
              "sub": "Discovery, flow"
            }
          ]
        },
        {}
      ],
      "key": [
        "Push-in: tension and desire. Orbit: premium feel. Tracking: flow. Crane: the big picture.",
        "Just one move per shot.",
        "Name the move in your prompt with the exact term."
      ],
      "quiz": [
        {
          "q": "Which move gives a perfume a premium feel?",
          "a": [
            "Orbit",
            "Blurry static shot",
            "Fast, jerky zoom"
          ],
          "why": "Circling the product shows it off from every angle."
        }
      ]
    },
    "ia3-l3": {
      "title": "Keeping the product identical",
      "scenes": [
        {
          "sub": "Consistency from shot to shot"
        },
        {
          "title": "The 5 habits",
          "items": [
            "Always start from the *same approved image*",
            "*Short* shots (5 s)",
            "*Slow* moves",
            "Don’t *turn the label* toward the camera",
            "Swap label close-ups for *your real footage*"
          ]
        },
        {
          "text": "Mix AI and real footage: *the best of both*."
        },
        {}
      ],
      "key": [
        "Same starting image, short shots, slow moves.",
        "Avoid turning the label toward the camera.",
        "Mix AI shots with real footage of the product."
      ],
      "quiz": [
        {
          "q": "For a close-up of the label, the safest option is…",
          "a": [
            "Your real product video",
            "A quick AI shot",
            "A drawing"
          ],
          "why": "The label must be exactly the one the customer will receive."
        }
      ]
    },
    "ia3-l4": {
      "title": "Animate a packshot in 5 seconds",
      "scenes": [
        {
          "sub": "The best-value shot"
        },
        {
          "title": "5 seconds, 4 beats",
          "frames": [
            {
              "label": "0 s",
              "sub": "Starting image",
              "shot": "detail",
              "dur": "0:00"
            },
            {
              "label": "1–2 s",
              "sub": "Light glides across",
              "shot": "detail",
              "dur": "0:01"
            },
            {
              "label": "3 s",
              "sub": "A drop, a reflection",
              "shot": "detail",
              "dur": "0:03"
            },
            {
              "label": "5 s",
              "sub": "Sharp final shot",
              "shot": "detail",
              "dur": "0:05"
            }
          ]
        },
        {
          "segments": [
            {
              "text": "Keep the bottle exactly identical. A glint of light glides slowly from left to right, subtle push-in, 5 seconds, black background."
            }
          ]
        },
        {}
      ],
      "key": [
        "A 5-second animated packshot: gliding light, a detail, a sharp final shot.",
        "Always start the prompt with “keep the product identical”.",
        "End on a clean shot so you can add the text and CTA."
      ],
      "quiz": [
        {
          "q": "How does an animated packshot prompt start?",
          "a": [
            "“Keep the product identical”",
            "“Do something crazy”",
            "“Change the color”"
          ],
          "why": "You protect the product before adding movement."
        }
      ]
    },
    "ia3-l5": {
      "title": "Assembling AI shots in CapCut",
      "scenes": [
        {
          "sub": "From 5 shots to one ad"
        },
        {
          "title": "The hybrid edit",
          "clips": [
            {
              "label": "AI hook"
            },
            {
              "label": "Real demo"
            },
            {
              "label": "AI packshot"
            },
            {
              "label": "Real detail"
            },
            {
              "label": "CTA"
            }
          ],
          "tracks": [
            {
              "label": "Voice-over"
            },
            {
              "label": "Music"
            }
          ],
          "steps": [
            {
              "label": "AI shots for impact"
            },
            {
              "label": "Real footage for proof"
            },
            {
              "label": "Your voice for trust"
            }
          ]
        },
        {
          "text": "AI grabs attention. *The real thing* reassures and sells."
        },
        {}
      ],
      "key": [
        "Hybrid edit: AI shots for impact, real footage for proof.",
        "Your voice builds trust.",
        "Same rules as producing without AI: pacing, captions, CTA."
      ],
      "quiz": [
        {
          "q": "What is real footage for in an AI edit?",
          "a": [
            "Proving and reassuring",
            "Nothing",
            "Making it longer"
          ],
          "why": "Customers want to see the real product."
        }
      ]
    }
  }
};

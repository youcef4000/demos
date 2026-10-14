// Traduction (en) du module ia6 — Cinematic ads.
// Générée depuis les textes extraits, relue ; voir tools/hooked-academy/glossaire-i18n.md.
export default {
  "modules": {
    "ia6": {
      "title": "Cinematic ads",
      "pitch": "The next level: film language, storyboarding, visual consistency and sound design."
    }
  },
  "lessons": {
    "ia6-l1": {
      "title": "The language of film",
      "scenes": [
        {
          "sub": "Shots · angles · light"
        },
        {
          "title": "Shot sizes",
          "frames": [
            {
              "label": "Wide shot",
              "sub": "The setting, the context"
            },
            {
              "label": "Medium shot",
              "sub": "The character, the action"
            },
            {
              "label": "Close-up",
              "sub": "The emotion"
            },
            {
              "label": "Insert",
              "sub": "The product detail"
            }
          ]
        },
        {
          "title": "Three kinds of light",
          "items": [
            {
              "label": "Soft",
              "sub": "Beauty, trust"
            },
            {
              "label": "High-contrast",
              "sub": "Mystery, luxury"
            },
            {
              "label": "Backlight",
              "sub": "Silhouette, emotion"
            }
          ]
        },
        {}
      ],
      "key": [
        "Wide shot, medium shot, close-up, insert.",
        "Soft light, high-contrast light, backlight: each one creates an emotion.",
        "These words go straight into your prompts."
      ],
      "quiz": [
        {
          "q": "Which shot shows emotion?",
          "a": [
            "The close-up",
            "The wide shot",
            "None"
          ],
          "why": "A face up close conveys emotion."
        }
      ]
    },
    "ia6-l2": {
      "title": "The storyboard",
      "scenes": [
        {
          "sub": "Writing the ad shot by shot"
        },
        {
          "title": "A 15-second spot",
          "frames": [
            {
              "label": "Hook",
              "sub": "Close-up, eyes",
              "dur": "0:02"
            },
            {
              "label": "Context",
              "sub": "Wide shot, city at night",
              "dur": "0:03"
            },
            {
              "label": "Product",
              "sub": "Bottle insert, orbit",
              "dur": "0:03"
            },
            {
              "label": "Emotion",
              "sub": "Medium shot, smile",
              "dur": "0:04"
            },
            {
              "label": "CTA",
              "sub": "Packshot + text",
              "dur": "0:03"
            }
          ]
        },
        {
          "segments": [
            {
              "text": "Turn this script into a 5-shot storyboard. For each shot, give the shot size, camera move, lighting, duration and an image prompt."
            }
          ],
          "result": {
            "lines": [
              "Shot 1 — Close-up, slow push-in, golden backlight, 2 s",
              "Shot 2 — Wide shot, tracking, neon, 3 s",
              "Shot 3 — Insert, orbit, high-contrast light, 3 s…"
            ]
          }
        },
        {}
      ],
      "key": [
        "The storyboard breaks the ad down shot by shot before you generate anything.",
        "For each shot: size, move, light, duration, prompt.",
        "AI can turn a script into a storyboard."
      ],
      "quiz": [
        {
          "q": "When do you make the storyboard?",
          "a": [
            "Before generating",
            "After posting",
            "Never"
          ],
          "why": "It stops you from generating at random."
        }
      ]
    },
    "ia6-l3": {
      "title": "Consistency: characters, settings, colors",
      "scenes": [
        {
          "sub": "A film, not a collage"
        },
        {
          "title": "One palette for the whole spot",
          "items": [
            {
              "swatch": "#0d1b2a",
              "label": "Night"
            },
            {
              "swatch": "#c9a227",
              "label": "Gold"
            },
            {
              "swatch": "#e08c3a",
              "label": "Amber"
            },
            {
              "swatch": "#f6f2ea",
              "label": "Cream"
            }
          ]
        },
        {
          "title": "What locks the look",
          "items": [
            "The *same character sheet*",
            "The *same style line* in every prompt",
            "The same *color grade* in the edit"
          ]
        },
        {}
      ],
      "key": [
        "One color palette for the whole spot.",
        "Same character sheet and same style line in every prompt.",
        "A single color grade in the edit."
      ],
      "quiz": [
        {
          "q": "For consistency, you repeat in every prompt…",
          "a": [
            "The same style line",
            "Different styles",
            "Nothing"
          ],
          "why": "The style line locks in the mood."
        }
      ]
    },
    "ia6-l4": {
      "title": "Sound design and pacing",
      "scenes": [
        {
          "sub": "Edit with your ears"
        },
        {
          "title": "Cut on the beat",
          "lanes": [
            {
              "label": "Music",
              "style": "music",
              "marks": [
                {
                  "label": "cut"
                },
                {
                  "label": "cut"
                },
                {
                  "label": "cut"
                },
                {
                  "label": "CTA"
                }
              ]
            },
            {
              "label": "Ambience",
              "style": "flat"
            },
            {
              "label": "Effects",
              "style": "flat"
            }
          ]
        },
        {
          "text": "Mute it: if the emotion disappears, *the sound was doing the work*."
        },
        {}
      ],
      "key": [
        "Cut shots on the music’s strong beats.",
        "Add ambience and sound effects.",
        "Sound carries a big part of the emotion."
      ],
      "quiz": [
        {
          "q": "Where do you cut the shots?",
          "a": [
            "On the music’s strong beats",
            "At random",
            "Never"
          ],
          "why": "The visual rhythm follows the rhythm of the sound."
        }
      ]
    },
    "ia6-l5": {
      "title": "Project: a 15-second cinematic spot",
      "scenes": [
        {
          "sub": "Your turn"
        },
        {
          "title": "The steps",
          "items": [
            {
              "label": "Script",
              "sub": "Hook, emotion, product, CTA"
            },
            {
              "label": "Storyboard",
              "sub": "5 shots"
            },
            {
              "label": "Images",
              "sub": "One per shot, approved"
            },
            {
              "label": "Animation",
              "sub": "Shots of 3 to 5 s"
            },
            {
              "label": "Sound edit",
              "sub": "Music, ambience, effects"
            }
          ]
        },
        {
          "title": "To hand in",
          "items": [
            "The MP4 in *9:16*",
            "The storyboard",
            "The prompts you used",
            "Your analysis: what you’d change"
          ]
        },
        {}
      ],
      "key": [
        "Script → storyboard → images → animation → sound edit.",
        "To hand in: 9:16 MP4, storyboard, prompts, analysis.",
        "You improve faster by analysing than by producing."
      ],
      "quiz": [
        {
          "q": "How many shots for a 15-second spot?",
          "a": [
            "About 5",
            "50",
            "1"
          ],
          "why": "About 3 seconds per shot."
        }
      ]
    }
  }
};

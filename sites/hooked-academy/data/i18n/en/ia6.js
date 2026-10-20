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
      ],
      "todo": [
        "Watch a cinematic ad and name each shot: wide, medium, close-up, insert",
        "Note the light in each shot: soft, high-contrast or backlight",
        "Write 4 image prompts for your product, one per shot size",
        "Generate your close-up in soft light, then high-contrast, and compare the emotion",
        "Add these film terms to your library, ready for your prompts"
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
      ],
      "todo": [
        "Write or reuse a 15-second script for your product",
        "Paste it into ChatGPT with the video’s storyboard prompt: 5 shots",
        "Check each shot: size, move, light, duration, image prompt",
        "Check that the total is 15 seconds and the last shot carries the CTA",
        "Keep this storyboard: you’ll use it for your end-of-module cinematic spot"
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
      ],
      "todo": [
        "Choose a 4-color palette for your spot, like night, gold, amber, cream",
        "Write your style line: palette, light, mood, type of image",
        "Paste it into every prompt in your storyboard, with your character sheet",
        "Generate 3 shots and put them side by side: film or collage?",
        "In CapCut, apply the same color grade to every shot"
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
      ],
      "todo": [
        "Pick royalty-free music with clearly marked strong beats",
        "Line up every cut in your edit on a strong beat",
        "Add ambience under the whole spot: city, wind, indoor room tone",
        "Add a sound effect on each movement: whoosh, rush of air, impact",
        "Do the test: mute the sound and note what the emotion loses"
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
      ],
      "todo": [
        "Write your 15-second script: hook, emotion, product, CTA",
        "Break it down into a 5-shot storyboard",
        "Generate and approve one image per shot, with your style line",
        "Animate each image into a 3- to 5-second shot",
        "Edit with music, ambience and effects, then export the MP4 in 9:16",
        "Gather the storyboard, prompts and a short analysis of what you’d change"
      ]
    },
    "ia6-l6": {
      "title": "Workshop: Higgsfield — Cinema Studio and Marketing Studio",
      "scenes": [
        {
          "sub": "Cinematic shots and product ads"
        },
        {
          "title": "Three *areas*",
          "items": [
            {
              "label": "Cinema Studio",
              "sub": "Camera, lens, movement"
            },
            {
              "label": "The apps",
              "sub": "Ready-to-use effects"
            },
            {
              "label": "Marketing Studio",
              "sub": "Product ads, UGC style"
            }
          ]
        },
        {
          "title": "A *cinematic* shot, step by step",
          "items": [
            {
              "label": "Start from your storyboard",
              "sub": "One shot, one intention"
            },
            {
              "label": "Pick a preset",
              "sub": "Push-in, orbit, tracking…"
            },
            {
              "label": "Add your approved image",
              "sub": "Made from your real photo"
            },
            {
              "label": "Generate and compare",
              "sub": "One variable at a time"
            }
          ]
        },
        {
          "title": "Marketing Studio: a *time-saver*, not autopilot",
          "left": {
            "title": "The trap",
            "items": [
              "Posting the video as is",
              "An avatar passed off as a real customer"
            ]
          },
          "right": {
            "title": "The pro habit",
            "items": [
              "Check the product shot by shot",
              "AI disclosure, no fake reviews"
            ]
          }
        },
        {
          "title": "*Credits*",
          "items": [
            "Every generation *uses up credits*",
            "Test with a *cheaper* model",
            "Premium for the *final version*",
            {
              "t": "Running a premium model for a simple test"
            }
          ]
        },
        {}
      ],
      "key": [
        "Higgsfield brings several models together: Cinema Studio for cinematic shots (camera, lens, movement), ready-to-use apps, Marketing Studio for product ads and UGC — depending on your plan.",
        "Always start from your approved image and check the product shot by shot; an avatar is never presented as a real customer.",
        "Credit system: test with a cheaper model, keep premium for the final version, check the pricing page."
      ],
      "quiz": [
        {
          "q": "Marketing Studio generates a UGC-style video for you. Before delivering it, you…",
          "a": [
            "Post it straight away",
            "Check the product shot by shot and what’s being said",
            "Add a made-up customer review"
          ],
          "why": "The tool saves you time, but you’re the one who guarantees an accurate product and an honest message."
        },
        {
          "q": "To test a shot idea, you use…",
          "a": [
            "The most expensive model",
            "A cheaper model, then premium for the final version",
            "Every model at once"
          ],
          "why": "Your credits go first to validating the idea, then to polishing the look."
        }
      ],
      "res": [
        {
          "title": "Higgsfield shot sheet",
          "text": "Storyboard shot #[  ] · intention: [desire / luxury / discovery…]\nStarting image: [your approved image, made from your real photo]\nCamera preset: [push-in / orbit / tracking…]\nPrompt: [subject] [one simple action], [lighting], [mood]. The product and its label stay exactly the same.\nModel: [test model] → [final model] · planned credits: [  ]\n\nCheck before delivery:\n• Product shape, label and color identical to the real photo\n• Hands, faces, on-screen text\n• No avatar presented as a real customer · AI disclosure if the platform requires it"
        }
      ],
      "todo": [
        "Fill in the “Higgsfield shot sheet” (Prompts tab) for one shot of your storyboard",
        "In Cinema Studio, pick a camera preset that fits the shot’s intent",
        "Add your approved image and test with your free credits, on a cheaper model",
        "Check the product: shape, label, color, hands, on-screen text",
        "If you try Marketing Studio, check what’s said and add the AI disclosure",
        "Note the credits used in your sheet, for your next quote"
      ]
    }
  }
};

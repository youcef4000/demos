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
              "The product stays accurate"
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
        "Text → video: quick to explore, little control.",
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
              "dur": "0:00"
            },
            {
              "label": "1–2 s",
              "sub": "Light glides across",
              "dur": "0:01"
            },
            {
              "label": "3 s",
              "sub": "A drop, a reflection",
              "dur": "0:03"
            },
            {
              "label": "5 s",
              "sub": "Sharp final shot",
              "dur": "0:05"
            }
          ]
        },
        {
          "segments": [
            {
              "text": "Keep the bottle perfectly identical. A glint of light glides slowly from left to right, subtle push-in, 5 seconds, black background."
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
    },
    "ia3-l6": {
      "title": "Workshop: Veo 3.1 — frames and ingredients",
      "scenes": [
        {
          "sub": "Two modes to stay in control"
        },
        {
          "title": "Two modes, *two uses*",
          "items": [
            {
              "label": "Frames → video",
              "sub": "A start frame, an end frame: Veo creates the transition"
            },
            {
              "label": "Ingredients → video",
              "sub": "References: product, character, setting"
            }
          ]
        },
        {
          "title": "Frames → video, *step by step*",
          "nodes": [
            {
              "label": "Start frame",
              "sub": "The closed bottle"
            },
            {
              "label": "The movement",
              "sub": "Described in the prompt"
            },
            {
              "label": "End frame",
              "sub": "The same bottle, open"
            }
          ]
        },
        {
          "title": "The *motion* prompt",
          "segments": [
            {
              "text": "Static camera, close-up.",
              "tag": "Camera"
            },
            {
              "text": "A hand slowly removes the cap, a fine mist escapes.",
              "tag": "Action"
            },
            {
              "text": "The bottle and the label stay identical.",
              "tag": "Lock"
            },
            {
              "text": "Sound: soft click of the cap, no music.",
              "tag": "Sound"
            }
          ],
          "result": {
            "lines": [
              "Short shot: the hand opens the bottle, the mist rises",
              "Check frame by frame: shape, label, color",
              "Bottle warped? Simpler action, regenerate"
            ]
          }
        },
        {
          "title": "Ingredients → video: *the rules*",
          "items": [
            "*Sharp* references, on a plain background",
            "Your *real product*, never a made-up one",
            "The prompt *names* each ingredient",
            "*Short* shots, checked one by one"
          ]
        },
        {}
      ],
      "key": [
        "Frames → video: a start frame and an end frame, Veo creates the transition; prepare them from your real photo, with the same framing.",
        "Ingredients → video: sharp references (product, character, setting) that Veo keeps consistent; name each ingredient in the prompt.",
        "The motion prompt: camera, action, product lock, sound (depending on the mode). Short shots, checked frame by frame. Modes and names change from version to version."
      ],
      "quiz": [
        {
          "q": "You want to show the bottle going from closed to open. Which mode?",
          "a": [
            "Frames → video",
            "Ingredients → video",
            "Text only, no image"
          ],
          "why": "You set the start and the end, Veo creates the transition between them."
        },
        {
          "q": "In ingredients mode, which product image do you use?",
          "a": [
            "A product made up by AI",
            "Your real product photo, sharp, on a plain background",
            "A blurry screenshot found online"
          ],
          "why": "The reference locks in how the product looks: it must be the one the customer will receive."
        }
      ],
      "res": [
        {
          "title": "Veo 3.1 prompts (frames and ingredients)",
          "text": "FRAMES → VIDEO\nStart frame: [description] · End frame: [description]\n(Same framing, same light, prepared from your real photo.)\nPrompt: Camera [static / slow push-in / slow orbit], shot [close-up / medium]. [The action linking the two frames, in one sentence]. The product and its label stay identical. Sound: [ambience, specific effect / no music].\n\nINGREDIENTS → VIDEO\nReferences: [1: your product photo] [2: the character] [3: the setting]\nPrompt: [The character from the reference] [action] with [the product from the reference] in [the setting from the reference]. Camera [movement], lighting [  ]. The product stays exactly the same.\n\nSettings: short duration, format [9:16 / 16:9] depending on what the tool offers.\nCHECK: frame by frame → shape, label, color, hands."
        }
      ]
    },
    "ia3-l7": {
      "title": "Workshop: Kling — from image to video",
      "scenes": [
        {
          "sub": "Animate your approved image"
        },
        {
          "title": "Image → video in *4 steps*",
          "items": [
            {
              "label": "Upload your approved image",
              "sub": "Already in the right format, 9:16 for Reels"
            },
            {
              "label": "Write the movement",
              "sub": "One action, one camera move"
            },
            {
              "label": "Add a negative prompt",
              "sub": "What you don’t want to see"
            },
            {
              "label": "Pick a short duration",
              "sub": "You assemble afterwards"
            }
          ]
        },
        {
          "title": "The prompt *and* the negative prompt",
          "segments": [
            {
              "text": "The woman lifts the cream jar toward the camera and smiles,",
              "tag": "Action"
            },
            {
              "text": "slow push-in, steady camera,",
              "tag": "Camera"
            },
            {
              "text": "the jar and its label stay identical.",
              "tag": "Lock"
            },
            {
              "text": "Negative: distortion, changing text, extra fingers, blur.",
              "tag": "Negative"
            }
          ],
          "result": {
            "lines": [
              "Short shot: the jar rises toward the camera, natural smile",
              "To check: hands, fingers, the jar’s label",
              "Too much movement? Simpler action, regenerate"
            ]
          }
        },
        {
          "title": "One long shot *or* short shots?",
          "left": {
            "title": "A single long shot",
            "items": [
              "The product may get distorted",
              "Everything to redo at the slightest flaw"
            ]
          },
          "right": {
            "title": "Short shots",
            "items": [
              "Each shot checked, kept or redone",
              "Assembled afterwards in CapCut"
            ]
          }
        },
        {
          "title": "Save your *credits*",
          "items": [
            "Test in the *cheapest* mode",
            "*Only one* thing changes between two tries",
            "The prompt that works goes *into your library*",
            {
              "t": "Launching ten generations without rereading the prompt"
            }
          ]
        },
        {}
      ],
      "key": [
        "Kling: approved image (already in the right format) → motion prompt → negative prompt if your version offers it → short duration. Use the latest version.",
        "The prompt: one action, one camera move, a product lock; the negative prompt lists what you reject (distortion, changing text, extra fingers).",
        "Short shots, checked one by one, assembled in CapCut; test in the cheapest mode to save your credits."
      ],
      "quiz": [
        {
          "q": "What’s the negative prompt for?",
          "a": [
            "Describing the main action",
            "Listing what you don’t want to see",
            "Choosing the music"
          ],
          "why": "Naming the flaws to avoid reduces the risk without removing it: you still check."
        },
        {
          "q": "For a 15-second ad, you generate…",
          "a": [
            "A single long shot",
            "Several short shots, assembled in the edit",
            "A single still image"
          ],
          "why": "A short shot can be checked and redone without losing everything else."
        }
      ],
      "res": [
        {
          "title": "Kling prompt (image → video)",
          "text": "Starting image: [your approved image, already in the right format]\n\nPrompt: [Subject] [a single action, slow and simple], [one camera move: slow push-in / slow orbit / static camera], [mood, lighting]. The product and its label stay exactly the same.\n\nNegative prompt (if your version offers it): distortion, product changing shape, changing text, extra fingers, distorted face, blur, flickering.\n\nSettings: short duration · cheapest mode for testing · only one thing changes between two tries.\n\nCheck: shape, label, color, hands → keep or regenerate."
        }
      ]
    }
  }
};

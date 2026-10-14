// Traduction (en) du module ia2 — Image generation.
// Générée depuis les textes extraits, relue ; voir tools/hooked-academy/glossaire-i18n.md.
export default {
  "modules": {
    "ia2": {
      "title": "Image generation",
      "pitch": "Packshots, lifestyle shots, consistent characters, retouching: pro visuals without a studio."
    }
  },
  "lessons": {
    "ia2-l1": {
      "title": "Choosing your image tool",
      "scenes": [
        {
          "sub": "One job, one tool"
        },
        {
          "title": "Four jobs",
          "items": [
            {
              "label": "Photorealism",
              "sub": "E.g. Midjourney, Flux, Seedream"
            },
            {
              "label": "Text in the image",
              "sub": "E.g. Ideogram, GPT Image"
            },
            {
              "label": "Editing a photo",
              "sub": "E.g. Nano Banana (Gemini), GPT Image"
            },
            {
              "label": "Keeping your real product",
              "sub": "Start from your photo + edit"
            }
          ]
        },
        {
          "text": "Tools change every month. *The method stays.*"
        },
        {
          "title": "Before you choose",
          "items": [
            "The tool’s *commercial usage rights*",
            "The output format (4:5, 9:16)",
            "Whether you can upload *your* product photo"
          ]
        },
        {}
      ],
      "key": [
        "Pick the tool for the job: photorealism, text, editing, staying true to the product.",
        "To sell a real product, start from your real photo.",
        "Check the commercial usage rights."
      ],
      "quiz": [
        {
          "q": "To sell your real product, you start from…",
          "a": [
            "Your real product photo",
            "A product made up by AI",
            "A photo found online"
          ],
          "why": "Customers must receive what they saw in the ad."
        }
      ]
    },
    "ia2-l2": {
      "title": "Packshot: from phone to studio",
      "scenes": [
        {
          "sub": "A studio photo, no studio needed"
        },
        {
          "title": "Before / after",
          "left": {
            "title": "Phone photo",
            "items": [
              "Cluttered background",
              "Yellow light"
            ]
          },
          "right": {
            "title": "AI packshot",
            "items": [
              "Clean background",
              "Studio light, soft shadow"
            ]
          }
        },
        {
          "title": "The method",
          "items": [
            {
              "label": "Sharp product photo",
              "sub": "Daylight, no glare"
            },
            {
              "label": "Cutout",
              "sub": "Remove the background"
            },
            {
              "label": "New setting from a prompt",
              "sub": "Surface, light, shadow"
            },
            {
              "label": "Check",
              "sub": "Same label, shape and color"
            }
          ]
        },
        {
          "text": "AI enhances the *setting*, never the *product*."
        },
        {}
      ],
      "key": [
        "Start from a sharp photo, cut it out, then generate the setting.",
        "Always check the label, shape and color.",
        "AI enhances the setting, never the product."
      ],
      "quiz": [
        {
          "q": "What do you check after generating?",
          "a": [
            "That the product matches the real one",
            "That the image is big",
            "Nothing"
          ],
          "why": "An altered product misleads the customer."
        }
      ]
    },
    "ia2-l3": {
      "title": "Lifestyle shots",
      "scenes": [
        {
          "sub": "Showing the product in real life"
        },
        {
          "title": "One product, many settings",
          "items": [
            {
              "swatch": "linear-gradient(180deg,#e9eef0,#9fb0b6)",
              "label": "Bathroom",
              "sub": "The morning routine"
            },
            {
              "swatch": "linear-gradient(180deg,#f2e6d6,#8c6f4f)",
              "label": "Kitchen",
              "sub": "Everyday life"
            },
            {
              "swatch": "linear-gradient(180deg,#2b3350,#07060a)",
              "label": "Night out",
              "sub": "The special occasion"
            },
            {
              "swatch": "linear-gradient(180deg,#f3e3c4,#8a6a45)",
              "label": "Beach",
              "sub": "Summer"
            },
            {
              "swatch": "linear-gradient(180deg,#f5cfc6,#6c3b3a)",
              "label": "Gift",
              "sub": "Holidays, Eid"
            },
            {
              "swatch": "linear-gradient(180deg,#7fd3c3,#1c4b45)",
              "label": "Sport",
              "sub": "On the move"
            }
          ]
        },
        {
          "title": "Keeping it believable",
          "items": [
            "A setting that *fits* your audience",
            "A *realistic* product scale",
            "Hands and faces *checked* (fingers, reflections)"
          ]
        },
        {}
      ],
      "key": [
        "Each setting matches a moment in the customer’s life.",
        "Product size and setting must stay realistic.",
        "Check hands, fingers and reflections before posting."
      ],
      "quiz": [
        {
          "q": "Why vary the settings?",
          "a": [
            "To speak to different moments in life",
            "To fill up the account",
            "No reason"
          ],
          "why": "Each setting is a creative angle to test."
        }
      ]
    },
    "ia2-l4": {
      "title": "A consistent character",
      "scenes": [
        {
          "sub": "The same face across 10 images"
        },
        {
          "title": "The character sheet",
          "frames": [
            {
              "label": "Front",
              "sub": "Reference image",
              "shot": "gros",
              "mood": "smile"
            },
            {
              "label": "Profile",
              "sub": "Same lighting",
              "shot": "gros",
              "mood": "neutral"
            },
            {
              "label": "Medium shot",
              "sub": "Reference outfit",
              "shot": "moyen"
            },
            {
              "label": "In context",
              "sub": "Reuse the sheet",
              "shot": "moyen"
            }
          ]
        },
        {
          "title": "What keeps it consistent",
          "items": [
            "A *reference image* uploaded with every generation",
            "A *fixed description* copied word for word",
            "Same clothes, same hairstyle"
          ]
        },
        {
          "text": "An AI character must never pose as *a real customer*."
        },
        {}
      ],
      "key": [
        "Create a character sheet (front, profile, medium shot) and reuse it as a reference.",
        "A fixed description copied word for word, same clothes and hairstyle.",
        "An AI character never poses as a real customer."
      ],
      "quiz": [
        {
          "q": "What’s the foundation of a consistent character?",
          "a": [
            "A reused reference image",
            "A different prompt every time",
            "Luck"
          ],
          "why": "The reference locks in the face."
        }
      ]
    },
    "ia2-l5": {
      "title": "Retouching: background, details, expanding",
      "scenes": [
        {
          "sub": "Fix it without regenerating everything"
        },
        {
          "title": "Three fixes to know",
          "items": [
            {
              "label": "Local edit",
              "sub": "Select an area and describe it (inpainting)"
            },
            {
              "label": "Expand the frame",
              "sub": "Go from square to 9:16 (outpainting)"
            },
            {
              "label": "Boost sharpness",
              "sub": "Upscale before exporting"
            }
          ]
        },
        {
          "items": [
            {
              "r": "1:1",
              "use": "Original image"
            },
            {
              "r": "4:5",
              "use": "Frame expanded for the feed"
            },
            {
              "r": "9:16",
              "use": "Frame expanded for Reels"
            }
          ]
        },
        {}
      ],
      "key": [
        "Local edits (inpainting) to fix one area.",
        "Frame expansion (outpainting) to change format.",
        "Upscaling for sharpness before you export."
      ],
      "quiz": [
        {
          "q": "To go from square to 9:16 without cropping the product, you use…",
          "a": [
            "Frame expansion",
            "Cropping",
            "The black-and-white filter"
          ],
          "why": "AI makes up the missing setting around it."
        }
      ]
    },
    "ia2-l6": {
      "title": "From AI visual to finished ad",
      "scenes": [
        {
          "sub": "Putting it together in Canva"
        },
        {
          "title": "AI image + sales structure",
          "headline": "Perfume that lasts *till evening*",
          "layers": [
            {
              "label": "AI image",
              "sub": "The generated setting"
            },
            {
              "label": "Your real product photo"
            },
            {
              "label": "The written hook"
            },
            {
              "label": "The proof"
            },
            {
              "label": "The CTA"
            }
          ]
        },
        {
          "text": "AI makes the *image*. The sales structure makes the *ad*."
        },
        {}
      ],
      "key": [
        "An AI image becomes an ad with a hook, proof and a CTA.",
        "Put it together in Canva: AI image, real product photo, text, CTA.",
        "The sales structure stays the same: Hook, Body, CTA."
      ],
      "quiz": [
        {
          "q": "What turns an image into an ad?",
          "a": [
            "The sales structure (hook, proof, CTA)",
            "A filter",
            "The resolution"
          ],
          "why": "Without a message or a call to action, it’s just an image."
        }
      ]
    }
  }
};

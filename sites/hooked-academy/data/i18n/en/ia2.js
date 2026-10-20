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
      ],
      "todo": [
        "For each of the 4 uses, note a tool you can try for free",
        "Open a tool’s terms and check whether it allows commercial use",
        "Check whether it offers 4:5 and 9:16, and accepts your own photo",
        "Take a photo of your real product: it’s your starting point for this module",
        "Note in your toolbox the image tool you’re keeping, and why"
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
              "Messy background",
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
              "sub": "Remove background"
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
      ],
      "todo": [
        "Photograph your product in daylight: sharp, with no reflections",
        "Remove the background, for example with Nano Banana in Gemini",
        "Generate a new setting with a prompt: material, studio light, soft shadow",
        "Put the result next to the real photo: same label, shape and color?",
        "Try 3 settings and keep the best packshot in your portfolio",
        "Save your setting prompt in your library, under Packshots"
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
      ],
      "todo": [
        "Pick 3 moments in your audience’s life: morning routine, Eid gift, evening out…",
        "Generate one lifestyle shot per moment, starting from your product photo",
        "Check each image: product size, hands, fingers, reflections",
        "Regenerate the ones that fail the check",
        "Keep the most believable one in your portfolio, with the moment it targets"
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
              "mood": "smile"
            },
            {
              "label": "Profile",
              "sub": "Same lighting",
              "mood": "neutral"
            },
            {
              "label": "Medium shot",
              "sub": "Reference outfit"
            },
            {
              "label": "In context",
              "sub": "Reuse the sheet"
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
      ],
      "todo": [
        "Write your character’s fixed description: age, face, hairstyle, outfit",
        "Generate the character sheet: front, profile, medium shot, same light",
        "Using that sheet as a reference, create 3 images of the character with your product",
        "Compare the face from one image to the next and note what changed",
        "Save the description and the sheet in your library to reuse them"
      ]
    },
    "ia2-l5": {
      "title": "Retouching: background, details, enlarging",
      "scenes": [
        {
          "sub": "Fix it without starting over"
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
              "use": "Original image"
            },
            {
              "use": "Frame expanded for the feed"
            },
            {
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
      ],
      "todo": [
        "Pick an almost-perfect image and spot the area to fix",
        "Fix it with a local edit, without regenerating the whole image",
        "Expand the frame from square to 4:5, then 9:16, without cutting the product",
        "Upscale the final version for sharpness before you export",
        "Save the 1:1, 4:5 and 9:16 versions in your portfolio, named by format"
      ]
    },
    "ia2-l6": {
      "title": "From AI visual to finished ad",
      "scenes": [
        {
          "sub": "Assemble it in Canva"
        },
        {
          "title": "AI image + sales structure",
          "headline": "Your perfume, *till evening*",
          "layers": [
            {
              "label": "AI image",
              "sub": "Generated setting"
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
      ],
      "todo": [
        "In Canva, create a 4:5 design (1080 × 1350) for the feed",
        "Place your best AI visual in the background, then your real product photo",
        "Add your hook at the top, big and easy to read",
        "Add a true proof point about your product, then a clear CTA",
        "Export it and look at it on your phone: can you read it at a glance?"
      ]
    },
    "ia2-l7": {
      "title": "Workshop: Nano Banana step by step",
      "scenes": [
        {
          "sub": "Edit your real photo with one sentence"
        },
        {
          "title": "Two *versions*",
          "items": [
            {
              "label": "Nano Banana",
              "sub": "In the Gemini app · quick for edits"
            },
            {
              "label": "Nano Banana Pro",
              "sub": "More advanced: text, details · depending on your plan"
            }
          ]
        },
        {
          "title": "Edit *your* photo",
          "segments": [
            {
              "text": "[Your bottle photo attached]",
              "tag": "Your photo"
            },
            {
              "text": "Keep the bottle exactly the same: shape, color, label.",
              "tag": "Lock"
            },
            {
              "text": "Replace the background with beige marble, soft light coming from the left.",
              "tag": "Change"
            },
            {
              "text": "4:5 format.",
              "tag": "Format"
            }
          ],
          "result": {
            "lines": [
              "The same bottle, sitting on beige marble",
              "Soft light from the left, a light shadow",
              "To check: label, cap, color"
            ]
          }
        },
        {
          "title": "Three more *edits*",
          "items": [
            {
              "label": "Fix a text",
              "sub": "“Replace this word, same font, same color”"
            },
            {
              "label": "Change the angle",
              "sub": "“The same scene, seen from above”"
            },
            {
              "label": "Change niche",
              "sub": "“The same product, in a gym”"
            }
          ]
        },
        {
          "title": "Before you keep it, *compare*",
          "items": [
            "The *label*: same words, same logo",
            "The *shape* and proportions",
            "The exact *color*",
            "Every *letter* of the added text",
            {
              "t": "Posting without comparing to the real photo"
            }
          ]
        },
        {}
      ],
      "key": [
        "Nano Banana, in Gemini, edits your real photo with one sentence; the Pro version goes further on text and details, depending on your plan.",
        "An edit prompt = your photo + a lock (“keep the product exactly the same”) + a single change + the format.",
        "Fix a text, change the angle, change niche: always with the lock, and always compared to the real photo (label, shape, color, text)."
      ],
      "quiz": [
        {
          "q": "What does an edit prompt for your product photo start with?",
          "a": [
            "The dream setting",
            "The lock: keep the product exactly the same",
            "The product’s price"
          ],
          "why": "You protect the product before changing anything around it."
        },
        {
          "q": "The result is almost right, except for the light. You…",
          "a": [
            "Start over with a brand-new prompt",
            "Continue the chat: “keep everything, but more light”",
            "Post it anyway"
          ],
          "why": "A single fix, in the same chat, keeps everything that already works."
        }
      ],
      "res": [
        {
          "title": "Nano Banana prompts (editing)",
          "text": "SETTING EDIT\n[Attach your photo] Keep the product exactly the same: shape, color, label, text. Replace the background with [setting], lighting [direction, softness], shadow [light / crisp]. Format [4:5 / 9:16].\n\nFIX A TEXT\nIn this image, replace the text “[old text]” with “[new text]”, same font, same color, same position. Don’t change anything else.\n\nCHANGE THE ANGLE\nShow exactly the same scene, with the same product, seen [from above / from the front / from a slightly high angle]. Same light, same setting.\n\nCHANGE NICHE\nKeep the product exactly the same. Place it in [new setting: gym, kitchen, party table…], for [new audience]. Lighting [  ], format [  ].\n\nCHECK: next to the real photo → label, shape, color, every letter of the text."
        }
      ],
      "todo": [
        "Attach your real photo in Gemini and paste “Setting edit” (Prompts tab)",
        "Almost right? Keep the chat going: “keep everything, but more light”",
        "Try “Change the angle”: the same scene, seen from above",
        "Try “Change niche”: your product in another setting, for another audience",
        "Compare each image with the real photo: label, shape, color, every letter",
        "Save the prompts that worked in your library, with the lock first"
      ]
    }
  }
};

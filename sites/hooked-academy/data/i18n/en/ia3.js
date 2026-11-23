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
      ],
      "todo": [
        "With Kling’s free credits, generate a text → video shot of your product",
        "Generate the same shot as image → video, from your approved image",
        "Compare: in which shot does your product stay true to life?",
        "List the short shots your next ad would need",
        "Save the image → video prompt that worked in your library"
      ],
      "res": [
        {
          "title": "Image → video, short shot",
          "text": "From the attached (approved) image, animate a [4 to 6]-second shot: [one single action, e.g. steam rises from the coffee], camera [one single slow move, e.g. gentle push-in], [warm] mood, the product and its label stay identical. No text, no distortion."
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
      ],
      "todo": [
        "Watch 3 ads in your niche and name the camera move in each shot",
        "Write 4 prompts for your product: push-in, orbit, tracking, crane",
        "Generate the 2 that suit your product best, from your approved image",
        "Compare the emotion of each: desire, luxury or discovery?",
        "Save each prompt in your library, with the exact name of the move"
      ],
      "res": [
        {
          "title": "Choose the camera move",
          "text": "My shot: [description of the image and product]. The emotion I want: [desire / luxury / fluidity / overview].\nSuggest the most suitable camera move among push-in, orbit, tracking shot, high-angle, and write the full video prompt with that exact word, one single move, duration [5 s]."
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
      ],
      "todo": [
        "Film a slow close-up of your real product’s label on your phone",
        "Generate 2 short shots from the same approved image, with slow moves",
        "Check each shot frame by frame: shape, label, color",
        "Replace any shot where the label gets distorted with your real footage",
        "Write the 5 reflexes at the top of your Video shots section"
      ],
      "res": [
        {
          "title": "Keep the product identical in video",
          "text": "Keep the product exactly identical to the starting image: shape, label, colours and text never change. [4]-second shot, slow move [gentle sideways tracking], the label does not turn towards the camera, no distortion, no text appearing."
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
      ],
      "todo": [
        "Pick your best packshot as the starting image",
        "Adapt the video’s prompt: product lock, gliding reflection, slight push-in, 5 s",
        "Generate the shot with Kling’s free credits, or in Veo if you have access",
        "Check that it ends on a sharp shot, with room for the text and the CTA",
        "Try another detail, a drop or a reflection, and keep the best version",
        "Save the winning prompt in your library, under Video shots"
      ],
      "res": [
        {
          "title": "The lesson prompt",
          "text": "Keep the bottle perfectly identical. A glint of light glides slowly from left to right, subtle push-in, 5 seconds, black background."
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
      ],
      "todo": [
        "Gather your AI shots and film 2 or 3 real shots of your product on your phone",
        "Record the voice-over for your script on your phone",
        "In CapCut, alternate AI shots for impact and real shots for proof",
        "Add auto captions, fix them, then put the music under the voice",
        "Export in 9:16 and watch with the sound off: does the message get through?"
      ],
      "res": [
        {
          "title": "CapCut edit plan",
          "text": "I have these elements: [list of AI shots], [list of real product videos], my [duration] s voice-over, a music track.\nGive me a [20]-second edit plan for CapCut: order of shots with start and end, where to put the real video (proof), the subtitles, the final CTA card and the cuts on the beat."
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
      ],
      "todo": [
        "With Nano Banana, prepare a start frame and an end frame, same framing",
        "Fill in the “Frames → video” prompt from the Prompts tab for these two frames",
        "Run it in Flow if you have access; if not, keep it ready for later",
        "Check the result frame by frame: shape, label, color, hands",
        "Write an “Ingredients → video” prompt that names each reference",
        "Save your two Veo prompts in your library, under Video shots"
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
      ],
      "todo": [
        "Open Kling and upload your approved image, already in 9:16",
        "Fill in the “Kling prompt” from the Prompts tab: one action, one move",
        "Add the negative prompt, if your version offers it",
        "Generate a short shot in the cheapest mode, with your free credits",
        "Check shape, label and hands; if needed, change one thing and regenerate",
        "Save the prompt that worked in your library, under Video shots"
      ]
    },
    "ia3-l8": {
      "title": "Kill the “AI look”",
      "scenes": [
        {
          "sub": "An ad that smells of AI loses trust"
        },
        {
          "title": "What *gives away* AI",
          "left": {
            "title": "AI look",
            "items": [
              "Skin too smooth, perfect light everywhere",
              "Oversaturated colours, movements too fluid"
            ]
          },
          "right": {
            "title": "Real look",
            "items": [
              "Grain, small flaws, natural light",
              "Handheld camera"
            ]
          }
        },
        {
          "title": "The *realism* block",
          "items": [
            "In the prompt: *photo taken on a phone*, natural light",
            "Small *imperfections*: skin, creases, dust",
            "In editing: *lower* contrast and saturation",
            "Add *grain* and a slight shake"
          ]
        },
        {
          "segments": [
            {
              "text": "[your prompt], photo taken with a smartphone, natural window light, real skin texture with pores and small imperfections, slight motion blur, slightly imperfect framing, no 3D render, no smooth skin."
            }
          ],
          "result": {
            "lines": [
              "Block to paste at the end of every image prompt",
              "Same idea for video: “handheld camera, slight shakes”"
            ]
          }
        },
        {}
      ],
      "key": [
        "Skin too smooth, perfect light and saturated colours give AI away.",
        "Add a realism block to every prompt.",
        "In editing: less contrast and saturation, a little grain."
      ],
      "quiz": [
        {
          "q": "Which of these details looks the most “AI”?",
          "a": [
            "A light grain",
            "Perfectly smooth skin",
            "A handheld camera"
          ],
          "why": "Flawless skin doesn’t exist: the eye notices it right away."
        }
      ],
      "todo": [
        "Add the realism block at the end of one of your image prompts",
        "Generate the same image with and without the block",
        "In CapCut, lower contrast and saturation, add grain",
        "Show both versions to someone: which one looks “real”?",
        "Save the realism block in your library"
      ],
      "res": [
        {
          "title": "Realism block",
          "text": "IMAGE (end of the prompt):\nphoto taken with a smartphone, natural window light, real skin texture with pores and small imperfections, slight motion blur, slightly imperfect framing, no 3D render, no smooth skin.\n\nVIDEO (end of the prompt):\nhandheld camera, slight shakes, natural light, slow and realistic movements.\n\nEDITING (CapCut):\ncontrast −10 · saturation −10 · light grain · slight sharpening"
        }
      ]
    },
    "ia3-l9": {
      "title": "Edit a video instead of remaking it",
      "scenes": [
        {
          "sub": "A video that works can be turned into variants"
        },
        {
          "title": "What you can *change*",
          "items": [
            {
              "label": "The background",
              "sub": "Studio, kitchen, street"
            },
            {
              "label": "The outfit",
              "sub": "Season, style"
            },
            {
              "label": "The text",
              "sub": "Price, offer, language"
            },
            {
              "label": "The light",
              "sub": "Day, evening"
            }
          ]
        },
        {
          "title": "The method",
          "items": [
            {
              "label": "Keep the clip",
              "sub": "The one that already worked"
            },
            {
              "label": "One single change",
              "sub": "Stated clearly in the prompt"
            },
            {
              "label": "Compare",
              "sub": "Frame by frame, especially the product"
            },
            {
              "label": "The product moves?",
              "sub": "Go back to the starting image"
            }
          ]
        },
        {
          "segments": [
            {
              "text": "In this video, replace only the background with [new setting]. Do not change the person, the product, its label or the movements. Keep the same light on the product."
            }
          ],
          "result": {
            "lines": [
              "Background changed · person and product identical",
              "New variant ready to test"
            ]
          }
        },
        {}
      ],
      "key": [
        "A video that works can be turned into variants: background, outfit, text, light.",
        "One change per request, and say what must not move.",
        "If the product changes, go back to the starting image."
      ],
      "quiz": [
        {
          "q": "In an editing prompt, what must you state besides the change?",
          "a": [
            "The music",
            "What must not change",
            "The edit length"
          ],
          "why": "Without it, the model may also alter the product or the person."
        }
      ],
      "todo": [
        "Choose one of your finished clips",
        "Write a prompt that changes only the background",
        "Compare the product frame by frame with the original",
        "Make a second variant: the outfit or the text",
        "Note the cost of each edit in your table"
      ],
      "res": [
        {
          "title": "The lesson prompt",
          "text": "In this video, replace only the background with [new setting]. Do not change the person, the product, its label or the movements. Keep the same light on the product."
        }
      ]
    },
    "ia3-l10": {
      "title": "The right model at the right price",
      "scenes": [
        {
          "sub": "Your credits are your margin"
        },
        {
          "title": "Test, then *finalise*",
          "left": {
            "title": "To test",
            "items": [
              "Fast, cheaper model",
              "Low resolution, several tries"
            ]
          },
          "right": {
            "title": "To deliver",
            "items": [
              "Top-tier model",
              "Once the prompt is validated"
            ]
          }
        },
        {
          "parts": [
            {
              "t": "Tries"
            },
            {
              "t": "Price per try"
            },
            {
              "t": "Final version"
            }
          ],
          "result": {
            "t": "Cost of your ad"
          }
        },
        {
          "title": "Your *cost table*",
          "items": [
            "Note the credit price of *each generation*",
            "Test in *low resolution*",
            "Finalise in *1080p*",
            "Put this cost into *your client price*"
          ]
        },
        {}
      ],
      "key": [
        "Test with a fast, cheap model; finalise with the best.",
        "Cost of an ad = tries × price per try + final version.",
        "That cost goes into the price you charge."
      ],
      "quiz": [
        {
          "q": "When should you use the most expensive model?",
          "a": [
            "For every try",
            "Once the prompt is validated",
            "Never"
          ],
          "why": "You only pay for top tier once you know the prompt works."
        }
      ],
      "todo": [
        "Create a table: tool, model, resolution, credits per generation",
        "Make 3 tries of one shot with the cheapest model",
        "Generate the final version with the best model",
        "Calculate the total cost of that shot",
        "Carry that cost into your price grid (Client acquisition module)"
      ],
      "res": [
        {
          "title": "Cost table",
          "text": "Tool | Model | Resolution | Credits per generation | Use (test / final)\n[  ] | [  ] | [  ] | [  ] | [  ]\n\nCost of a shot = (number of tries × credits per try) + credits of the final version\nCost of an ad = sum of the shots + voice + music\nPrice of 1 credit: [  ] DA (depending on your plan)"
        }
      ]
    },
    "ia3-l11": {
      "title": "Export for TikTok, Instagram and Facebook",
      "scenes": [
        {
          "sub": "Don’t lose your quality at the last moment"
        },
        {
          "title": "The *right settings*",
          "items": [
            {
              "label": "9:16",
              "sub": "1080 × 1920"
            },
            {
              "label": "30 fps",
              "sub": "High bitrate"
            },
            {
              "label": "Safe zone",
              "sub": "Text away from the buttons"
            },
            {
              "label": "AI content",
              "sub": "Turn on the provided label"
            }
          ]
        },
        {
          "title": "Before *posting*",
          "items": [
            "CapCut export: *1080p, 30 fps*",
            "Subtitles clear of the *buttons* and caption",
            "*AI content* label when the platform asks for it",
            "Watch the video *on a phone*"
          ]
        },
        {}
      ],
      "key": [
        "Format 9:16, 1080 × 1920, 30 frames per second.",
        "Text stays in the safe zone, away from the buttons.",
        "Realistic AI-generated content gets labelled when the platform asks."
      ],
      "quiz": [
        {
          "q": "Where should subtitles go on TikTok?",
          "a": [
            "At the very bottom",
            "In the safe zone, away from the buttons",
            "On the right side"
          ],
          "why": "The bottom and right are covered by the caption and buttons."
        }
      ],
      "todo": [
        "Export your latest video in 1080p, 30 fps",
        "Check that subtitles don’t sit under the buttons",
        "Watch the whole video on your phone",
        "Find where the “AI content” label is on TikTok, Instagram and Facebook",
        "Note these settings in your library"
      ],
      "res": [
        {
          "title": "Export checklist by platform",
          "text": "I’m posting this video on [TikTok / Instagram Reels / Facebook]: duration [duration], [9:16] format, burned-in subtitles, content [realistic AI-generated / not].\nGive me the export settings (resolution, frames per second, bitrate), the safe zone for text on this platform and what I must turn on to label AI-generated content."
        }
      ]
    }
  }
};

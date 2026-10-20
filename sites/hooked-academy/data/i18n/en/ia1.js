// Traduction (en) du module ia1 — Prompting : parler à l’IA.
export default {
  "modules": {
    "ia1": {
      "title": "Prompting: talking to AI",
      "pitch": "The skill every other one depends on: writing instructions AI understands."
    }
  },
  "lessons": {
    "ia1-l1": {
      "title": "What is a prompt?",
      "scenes": [
        {
          "sub": "And why most of them are bad"
        },
        {
          "text": "A prompt is an *instruction*. AI doesn’t guess: it *completes*."
        },
        {
          "title": "Vague or specific?",
          "left": {
            "title": "Vague prompt",
            "text": "“Make me an ad for my perfume.”",
            "items": [
              "For whom? What format?",
              "Generic result"
            ]
          },
          "right": {
            "title": "Specific prompt",
            "text": "“You’re a copywriter. Write 3 eight-word hooks for a TikTok perfume video. Audience: women 25-35 in Algiers, friendly insider tone.”",
            "items": [
              "Role, audience, format, tone",
              "Usable result"
            ]
          }
        },
        {
          "text": "The quality of the answer depends on the quality of *the question*."
        },
        {}
      ],
      "key": [
        "A prompt is an instruction: AI completes what you give it, it doesn’t guess.",
        "A vague prompt gets you a generic result.",
        "Role, audience, format and tone make the result usable."
      ],
      "quiz": [
        {
          "q": "Why does a vague prompt give a bad result?",
          "a": [
            "AI fills the gaps with generic choices",
            "AI is broken",
            "You have to pay more"
          ],
          "why": "Without details, AI goes for the most common options."
        }
      ],
      "todo": [
        "In ChatGPT, send a vague prompt: “Write an ad for my product”",
        "Rewrite it for your real product, with a role, an audience, a format and a tone",
        "Compare the two answers and note what makes the second one usable",
        "Run the test again in Claude or Gemini: is the difference the same?",
        "Paste your precise prompt into your prompt library"
      ]
    },
    "ia1-l2": {
      "title": "The structure of a good prompt",
      "scenes": [
        {
          "sub": "Role · Context · Task · Format · Constraints"
        },
        {
          "parts": [
            {
              "t": "Role"
            },
            {
              "t": "Context"
            },
            {
              "t": "Task"
            },
            {
              "t": "Format"
            },
            {
              "t": "Limits"
            }
          ],
          "result": {
            "t": "Pro prompt"
          }
        },
        {
          "title": "Example, block by block",
          "segments": [
            {
              "text": "You’re an e-commerce copywriter in Algeria.",
              "tag": "Role"
            },
            {
              "text": "I sell an anti-frizz serum at 2,900 DA, delivery to 58 wilayas.",
              "tag": "Context"
            },
            {
              "text": "Write a 20-second video script.",
              "tag": "Task"
            },
            {
              "text": "Format: Hook / Body / CTA, with the on-screen text.",
              "tag": "Format"
            },
            {
              "text": "Simple Darija, no medical claims.",
              "tag": "Limits"
            }
          ],
          "result": {
            "lines": [
              "HOOK — “Is humidity ruining your hair?”",
              "BODY — 2 drops in the morning… frizz under control till evening.",
              "CTA — “Order now, cash on delivery.”"
            ]
          }
        },
        {
          "title": "Tips",
          "items": [
            "Give an *example* of what you want",
            "Ask for *several versions*",
            "Say what you *don’t want*"
          ]
        },
        {}
      ],
      "key": [
        "Five blocks: Role, Context, Task, Format, Constraints.",
        "Give an example, ask for several versions, say what you don’t want.",
        "Context (product, price, audience, delivery) makes all the difference."
      ],
      "quiz": [
        {
          "q": "“Write a 20-second script” fits which block?",
          "a": [
            "Role",
            "Task",
            "Format"
          ],
          "why": "It’s what AI has to do: the task."
        },
        {
          "q": "“No medical claims” is…",
          "a": [
            "A constraint",
            "A role",
            "Context"
          ],
          "why": "A limit AI has to respect."
        }
      ],
      "res": [
        {
          "title": "RCTFC template",
          "text": "Role: You’re [role].\nContext: [product, price, audience, city, delivery, what makes it different].\nTask: [what you want].\nFormat: [list, table, Hook/Body/CTA, number of versions].\nConstraints: [tone, language, length, what not to say]."
        }
      ],
      "todo": [
        "Copy the RCTFC template from the Prompts tab into your library",
        "Fill in the five blocks for your product: price, audience, city, delivery",
        "Send it to ChatGPT for a 20-second script: Hook / Body / CTA",
        "Add an example of what you want and ask for 3 versions",
        "Say what you don’t want (medical claims, fake reviews) and run it again",
        "Save the best version, with its filled-in prompt, in your library"
      ]
    },
    "ia1-l3": {
      "title": "Prompts for hooks, scripts and ad copy",
      "scenes": [
        {
          "sub": "Ask for 10, keep 1"
        },
        {
          "segments": [
            {
              "text": "Here’s my script. Give me 10 different hooks, ranked from strongest to weakest, and explain in one sentence why #1 works."
            }
          ],
          "result": {
            "lines": [
              "1. “Everyone makes this mistake with their perfume…”",
              "2. “3 seconds, and you smell the difference”",
              "3. “Why doesn’t your perfume last?”",
              "→ #1 sparks curiosity without promising anything false."
            ]
          }
        },
        {
          "title": "Three texts AI can draft",
          "items": [
            {
              "label": "Hooks",
              "sub": "10 variations to test"
            },
            {
              "label": "Scripts",
              "sub": "Timed Hook / Body / CTA"
            },
            {
              "label": "Ad copy",
              "sub": "Primary text, headline, description"
            }
          ]
        },
        {
          "text": "AI writes the first draft. *You* choose, fix and sign off."
        },
        {}
      ],
      "key": [
        "Always ask for several versions (10 hooks), ranked and explained.",
        "Three texts: hooks, timed scripts, ad copy.",
        "AI writes the first draft; you choose and fix it."
      ],
      "quiz": [
        {
          "q": "How many hooks should you ask AI for?",
          "a": [
            "Just one",
            "Several (10, for example)",
            "None"
          ],
          "why": "More options, better odds of finding the right one."
        }
      ],
      "res": [
        {
          "title": "Prompt — Meta ad copy",
          "text": "You’re a Meta ads expert. For [product] sold at [price] with [delivery/payment], write 3 versions of: primary text (max 125 characters), headline (max 40 characters), description (max 30 characters). Tone: [tone], language: [language]. No claims that can’t be verified."
        }
      ],
      "todo": [
        "Give ChatGPT your script and ask for 10 ranked hooks, with why the top one works",
        "Pick the best hook and fix it using what you know about the customer",
        "Ask for a timed Hook / Body / CTA script built on that hook",
        "Copy the “Meta ad copy” prompt from the Prompts tab and fill in the brackets",
        "Check the character limits and remove any claim that can’t be verified",
        "Save your 3 best hooks in your library, under Hooks"
      ]
    },
    "ia1-l4": {
      "title": "The image prompt",
      "scenes": [
        {
          "sub": "Describing a photo that doesn’t exist"
        },
        {
          "parts": [
            {
              "t": "Subject"
            },
            {
              "t": "Setting"
            },
            {
              "t": "Lighting"
            },
            {
              "t": "Framing"
            },
            {
              "t": "Style"
            }
          ],
          "result": {
            "t": "Image"
          }
        },
        {
          "segments": [
            {
              "text": "Amber perfume bottle, gold cap,",
              "tag": "Subject"
            },
            {
              "text": "resting on black marble,",
              "tag": "Setting"
            },
            {
              "text": "soft light coming from the left,",
              "tag": "Lighting"
            },
            {
              "text": "close-up, slight low angle,",
              "tag": "Framing"
            },
            {
              "text": "luxury product photo, 4:5 format.",
              "tag": "Style"
            }
          ]
        },
        {
          "title": "Classic mistakes",
          "items": [
            {
              "t": "Writing “beautiful quality image”"
            },
            {
              "t": "Forgetting the format"
            },
            "Describe the *light* like a photographer",
            "Just one idea per image"
          ]
        },
        {}
      ],
      "key": [
        "Subject, setting, lighting, framing, style — and always the format.",
        "“Beautiful quality image” means nothing: describe what you can see.",
        "Generate several images and pick the best."
      ],
      "quiz": [
        {
          "q": "Which one is a good image prompt element?",
          "a": [
            "“Beautiful image”",
            "“Soft light coming from the left”",
            "“Very quality”"
          ],
          "why": "A precise description of the light changes the whole look."
        }
      ],
      "res": [
        {
          "title": "Image prompt template",
          "text": "[Precise subject: product, material, color], [action or position], [setting], [lighting: direction, softness, time of day], [framing: shot, angle, focal length], [style: product photo, lifestyle, editorial], format [4:5 / 9:16 / 1:1]."
        }
      ],
      "todo": [
        "Copy the image prompt template from the Prompts tab and fill it in for your product",
        "Generate the image in Gemini with Nano Banana, in 4:5 format",
        "Also try “beautiful quality image” and compare the two results",
        "Describe the light better (direction, softness, time of day) and regenerate",
        "Keep the best image in your portfolio, and the prompt in your library"
      ]
    },
    "ia1-l5": {
      "title": "The video prompt",
      "scenes": [
        {
          "sub": "Adding movement and time"
        },
        {
          "parts": [
            {
              "t": "Starting image"
            },
            {
              "t": "Action"
            },
            {
              "t": "Camera"
            },
            {
              "t": "Duration"
            }
          ],
          "result": {
            "t": "Video shot"
          }
        },
        {
          "segments": [
            {
              "text": "Starting from the bottle image:",
              "tag": "Start"
            },
            {
              "text": "a drop slides down the glass,",
              "tag": "Action"
            },
            {
              "text": "slow push-in toward the cap,",
              "tag": "Camera"
            },
            {
              "text": "5 seconds, warm mood.",
              "tag": "Duration"
            }
          ]
        },
        {
          "text": "One shot = *one* action and *one* camera move."
        },
        {}
      ],
      "key": [
        "Starting image + action + camera move + duration.",
        "One shot = one action and one camera move.",
        "Starting from an approved image gives you more control than text alone."
      ],
      "quiz": [
        {
          "q": "How many camera moves per shot?",
          "a": [
            "One",
            "Three",
            "As many as possible"
          ],
          "why": "One intention per shot, otherwise the result gets messy."
        }
      ],
      "todo": [
        "Pick an approved image from the previous lesson as your starting image",
        "Write your prompt: starting image, one action, one camera move, duration",
        "Generate a 5-second shot with Kling’s free credits",
        "Write 3 more shot prompts for your product, with just one move each",
        "Save the prompt that worked in your library, under Video shots"
      ]
    },
    "ia1-l6": {
      "title": "Iterate and build your library",
      "scenes": [
        {
          "sub": "Fix it instead of starting over"
        },
        {
          "loopLabel": "Repeat until you get the right result",
          "title": "The iteration loop",
          "nodes": [
            {
              "label": "Prompt"
            },
            {
              "label": "Result"
            },
            {
              "label": "Diagnosis",
              "sub": "What’s off?"
            },
            {
              "label": "Fix",
              "sub": "One variable only"
            }
          ]
        },
        {
          "text": "Change *one variable* at a time.",
          "sub": "Otherwise you won’t know what improved the result."
        },
        {
          "title": "Your prompt library",
          "items": [
            {
              "label": "Hooks"
            },
            {
              "label": "Scripts"
            },
            {
              "label": "Packshots"
            },
            {
              "label": "Video shots"
            }
          ]
        },
        {}
      ],
      "key": [
        "Loop: prompt → result → diagnosis → fix.",
        "Change only one variable at a time.",
        "Save every prompt that works in a library sorted by use."
      ],
      "quiz": [
        {
          "q": "Why change only one variable at a time?",
          "a": [
            "To know what improved the result",
            "Because it’s mandatory",
            "To go faster"
          ],
          "why": "Otherwise you can’t tell which change worked."
        }
      ],
      "todo": [
        "Take your image prompt and write in one sentence what’s wrong with the result",
        "Fix just one variable (light, framing or style) and regenerate",
        "Go around the loop 3 times, noting each change and its effect",
        "Sort your library into 4 sections: Hooks, Scripts, Packshots, Video shots",
        "For every prompt that works, add an example of the result"
      ]
    },
    "ia1-l7": {
      "title": "Workshop: ChatGPT and Claude in practice",
      "scenes": [
        {
          "sub": "Projects, files, images, variations"
        },
        {
          "title": "One *project* per client",
          "items": [
            {
              "label": "Fixed instructions",
              "sub": "Niche, language, tone, what never to say"
            },
            {
              "label": "Attached files",
              "sub": "Product sheet, brief, approved scripts"
            },
            {
              "label": "Everything in one place",
              "sub": "No more explaining it all again"
            }
          ]
        },
        {
          "title": "Break down a *competitor’s* ad",
          "segments": [
            {
              "text": "[Screenshot of the ad attached]",
              "tag": "Image"
            },
            {
              "text": "Analyse this ad: the hook, the angle, the shot-by-shot structure, the CTA.",
              "tag": "Task"
            },
            {
              "text": "Then suggest 3 hooks for my product, without reusing its text.",
              "tag": "Adaptation"
            }
          ],
          "result": {
            "lines": [
              "HOOK — A question about an everyday problem",
              "ANGLE — Time saved, not price",
              "STRUCTURE — Problem → demo → proof → offer",
              "CTA — The offer repeated on screen and out loud"
            ]
          }
        },
        {
          "title": "Ask for *variations*",
          "items": [
            {
              "label": "Ask for 10 versions",
              "sub": "Numbered, each with a different angle"
            },
            {
              "label": "Reply by number",
              "sub": "“Keep 3 and 7, but shorter”"
            },
            {
              "label": "Only one thing changes",
              "sub": "Tone, length or angle"
            },
            {
              "label": "Proofread everything",
              "sub": "Prices, claims, Darija"
            }
          ]
        },
        {
          "title": "Your prompt *library*",
          "items": [
            "One document, sorted *by use*",
            "The prompt *and* a sample result",
            "*Brackets* to fill in for each client",
            {
              "t": "Rewriting the same prompt from memory"
            }
          ]
        },
        {}
      ],
      "key": [
        "One project per client: fixed instructions (niche, language, tone, no-gos) and attached files (product sheet, brief, approved scripts). Depending on the tool’s plan.",
        "Vision: attach a screenshot of a competitor’s ad, ask for the hook, angle, structure and CTA, then adapt it to your product without reusing the text. Check what the AI actually read.",
        "Numbered variations, only one thing changing; every prompt that works goes into your library, with [brackets] to fill in."
      ],
      "quiz": [
        {
          "q": "You attach a screenshot of a competitor’s ad. What do you ask for?",
          "a": [
            "Its text, copied word for word",
            "The hook, angle, structure and CTA",
            "The brand’s ad budget"
          ],
          "why": "You analyse the structure to adapt it to your product; the text and visuals belong to the brand."
        },
        {
          "q": "What’s a project with fixed instructions for?",
          "a": [
            "Not re-explaining the client in every chat",
            "Paying less",
            "Getting longer answers"
          ],
          "why": "The niche, tone, no-gos and files stay available in every new chat in the project."
        }
      ],
      "res": [
        {
          "title": "Project instructions (one client)",
          "text": "Client: [shop name] · Niche: [beauty, fashion, home…]\nProducts: [names, prices, delivery, payment method]\nAudience: [who, age, city, problem or desire]\nLanguage and tone: [Darija / French / Arabic] · [friendly insider, expert, warm…]\nDefault answer format: [Hook / Body / CTA, several numbered versions]\nNever write: [medical claims, fake reviews, unverified numbers, unconfirmed prices]\nAttached files: [product sheet, brief, approved scripts]"
        },
        {
          "title": "Prompt — analysing a competitor’s ad",
          "text": "[Attach the screenshot or the key frames of the ad]\nAnalyse this ad:\n1. The hook: what you see, read and hear in the first 3 seconds.\n2. The angle: problem, desire, price, gift, something new…\n3. The structure, shot by shot.\n4. The offer and the CTA.\nThen suggest 3 hooks for [my product], aimed at [my audience], reusing the structure, never the text or the visuals.\nIf any part of the image is unreadable, say so instead of guessing."
        }
      ],
      "todo": [
        "Fill in the “Project instructions” from the Prompts tab for your product",
        "Paste them into a ChatGPT or Claude project, or at the start of a chat",
        "Take a screenshot of a competitor’s ad in your niche",
        "Analyse it with the “analysing a competitor’s ad” prompt, then check what the AI read",
        "Ask for 10 numbered hooks, then reply: “keep 3 and 7, but shorter”",
        "Save these prompts in your library, with [brackets] to fill in"
      ]
    },
    "ia1-l8": {
      "title": "Ethical AI: what we do, what we don’t",
      "scenes": [
        {
          "sub": "What protects your clients and your reputation"
        },
        {
          "title": "What we *don’t do*",
          "items": [
            {
              "t": "Fake reviews or fake testimonials"
            },
            {
              "t": "A fake before / after"
            },
            {
              "t": "Medical or healing claims"
            },
            {
              "t": "A real person’s face or voice without their consent"
            }
          ]
        },
        {
          "title": "What we *do*",
          "items": [
            {
              "label": "Follow ad rules",
              "sub": "Health, before / after, claims"
            },
            {
              "label": "Disclose AI",
              "sub": "When the platform requires it"
            },
            {
              "label": "Protect data",
              "sub": "The client’s and their buyers’"
            },
            {
              "label": "Be transparent",
              "sub": "The client knows what AI made"
            }
          ]
        },
        {
          "title": "Your client’s *data*",
          "left": {
            "title": "Risky",
            "items": [
              "Pasting their order list as is",
              "Names, phone numbers and addresses in an AI tool"
            ]
          },
          "right": {
            "title": "Pro",
            "items": [
              "Remove personal data first",
              "Check the privacy settings"
            ]
          }
        },
        {
          "kicker": "With your client",
          "text": "Say *what AI made*. It reassures them, and it protects you.",
          "sub": "In writing, in the quote: tools, usage rights, limits"
        },
        {
          "text": "If you wouldn’t dare explain it to your client, *don’t do it*."
        },
        {}
      ],
      "key": [
        "Never: fake reviews, fake testimonials, fake before/after, medical claims, a real person’s face or voice without their written consent.",
        "Always: follow the platforms’ ad rules and disclose AI content when they require it.",
        "Your clients’ and their buyers’ data removed before anything goes to an AI, privacy settings checked, AI use written into the quote."
      ],
      "quiz": [
        {
          "q": "A client asks you for a “customer testimonial” performed by an AI avatar. You…",
          "a": [
            "Do it: nobody will notice",
            "Refuse, and suggest an honest product demo",
            "Do it, but without captions"
          ],
          "why": "A fake testimonial misleads buyers and breaks platform rules."
        },
        {
          "q": "Before sending a client’s order file to an AI, you…",
          "a": [
            "Remove names, phone numbers and addresses",
            "Send it as is",
            "Post it to show off your results"
          ],
          "why": "Buyers’ personal data must not end up in tools you don’t control."
        }
      ],
      "res": [
        {
          "title": "Ethics checklist before delivery",
          "text": "• No made-up reviews, testimonials or numbers\n• No fabricated before / after\n• No medical or healing claims\n• No real person’s face or voice without written consent\n• Platform ad rules reread (health, before / after, claims)\n• AI content disclosed if the platform requires it\n• Personal data removed before anything goes to an AI\n• The client knows what was made with AI (written in the quote or at delivery)"
        }
      ],
      "todo": [
        "Copy the “Ethics checklist before delivery” from the Prompts tab into your notes",
        "Reread your latest script with this checklist and fix what doesn’t pass",
        "Read Meta’s advertising rules on health and before / after",
        "Check whether ChatGPT or Claude uses your chats for training",
        "Write the sentence in your quote that says what is made with AI"
      ]
    },
    "ia1-l9": {
      "title": "A creative from A to Z with Claude (1/2): from product sheet to script",
      "scenes": [
        {
          "sub": "Product sheet → avatar → angles → hooks → script"
        },
        {
          "title": "Step 1: the sheet in a *container*",
          "segments": [
            {
              "text": "<product>",
              "tag": "Container"
            },
            {
              "text": "Oriental amber perfume, 50 ml. Notes: amber, vanilla, woods. Gift box. Delivery to all wilayas, cash on delivery.",
              "tag": "Product sheet"
            },
            {
              "text": "</product>",
              "tag": "Container"
            },
            {
              "text": "Read the sheet between the tags. Don’t make up any information that isn’t in it, and list what’s missing.",
              "tag": "Instruction"
            }
          ],
          "result": {
            "lines": [
              "SHEET — Amber perfume, 50 ml, gift box",
              "STRENGTHS — Warm notes, ready to gift, cash on delivery",
              "MISSING — The price and delivery time: can you add them?"
            ]
          }
        },
        {
          "title": "Step 2: the *avatar* and the *angles*",
          "segments": [
            {
              "text": "Based on <product>, describe the ideal buyer: age, situation, desires, hesitations.",
              "tag": "Avatar"
            },
            {
              "text": "Then suggest 5 angles, each with its reason to buy.",
              "tag": "Angles"
            },
            {
              "text": "Format: table. Language: Darija and French, the way people talk in Algeria.",
              "tag": "Format"
            }
          ],
          "result": {
            "lines": [
              "AVATAR — Woman, 25–35, buying a gift or treating herself",
              "HESITATION — “Is it the original? Does the scent last?”",
              "ANGLE 1 — The gift: the ready-to-give box",
              "ANGLE 2 — Desire: a warm signature scent for evenings out"
            ]
          }
        },
        {
          "title": "Step 3: *10 hooks*, then just one",
          "segments": [
            {
              "text": "Chosen angle: the gift.",
              "tag": "Choice"
            },
            {
              "text": "Write 10 hooks under 10 words, numbered, all different.",
              "tag": "Task"
            },
            {
              "text": "Rank them and explain in one sentence why #1 stops the scroll.",
              "tag": "Format"
            }
          ],
          "result": {
            "lines": [
              "1. “Still looking for their gift?”",
              "2. “Give them a scent, not an object”",
              "3. “The box they open with a smile”",
              "→ #1 speaks to someone who’s looking, right now."
            ]
          }
        },
        {
          "title": "Step 4: the 30-second *script*",
          "segments": [
            {
              "text": "Using hook #1, write a 30-second script.",
              "tag": "Task"
            },
            {
              "text": "Format: HOOK (0–3 s) / BODY (3–25 s) / CTA (25–30 s), with the voice-over and the on-screen text for each line.",
              "tag": "Format"
            },
            {
              "text": "No promise that isn’t in <product>, no made-up reviews.",
              "tag": "Limits"
            }
          ],
          "result": {
            "lines": [
              "HOOK — VO: “Still looking for their gift?” · SCREEN: Their gift?",
              "BODY — VO: “An amber perfume, in a ready-to-give box…”",
              "CTA — VO: “Order here, cash on delivery.” · SCREEN: Order here"
            ]
          }
        },
        {
          "title": "Before the *storyboard*",
          "items": [
            "The hook fits in *3 seconds*",
            "Every fact comes from *the sheet*",
            "Read out loud: *30 seconds* max",
            {
              "t": "A promise you can’t prove"
            }
          ]
        },
        {}
      ],
      "key": [
        "Paste the product page between <product> and </product> and ask it not to make anything up: Claude knows where the sheet is, and it flags what’s missing.",
        "In the same conversation: the avatar (desires, hesitations), 5 angles, then 10 numbered, ranked hooks. The AI suggests; you choose.",
        "The 30 s script: HOOK (0–3 s), BODY, CTA, with voice-over and on-screen text, with no promise that isn’t in the sheet and no made-up reviews. The method also works with another assistant."
      ],
      "quiz": [
        {
          "q": "Why put the product sheet between <product> and </product>?",
          "a": [
            "So Claude knows exactly where the sheet is and sticks to it",
            "So the answer is longer",
            "Because without tags, Claude refuses"
          ],
          "why": "Tags separate your data from your instructions; you can then refer to it in every prompt."
        },
        {
          "q": "The script says “lasts 24 hours”, but the sheet doesn’t say so. You…",
          "a": [
            "Keep it, it sells",
            "Delete it: no promise that isn’t in the sheet",
            "Write it bigger"
          ],
          "why": "A made-up promise deceives the buyer, and you’re the one who signs off on the creative."
        }
      ],
      "todo": [
        "Choose a real product and copy its entire product page",
        "Paste it into Claude between <product> and </product>, with the instruction not to make anything up",
        "Ask for the avatar and 5 angles, then choose one angle",
        "Ask for 10 numbered hooks and keep the best one",
        "Have it write the 30-second script, then read it out loud while timing yourself",
        "Keep the conversation open: you’ll use it in the next lesson"
      ],
      "res": [
        {
          "title": "Prompt chain (1/2): from sheet to script",
          "text": "Use in a single conversation, in order (Claude, or another assistant).\n\n1. THE SHEET\n<product>\n[paste the whole product page here: name, description, volume, price, delivery, payment, exchange terms]\n</product>\nRead the sheet between the <product> tags. Summarize it in 5 lines, then list the information missing to write an ad. Don’t make up any information that isn’t in it.\n\n2. THE AVATAR AND THE ANGLES\nBased on <product>, describe the ideal buyer in Algeria: age, situation, what they want, what makes them hesitate before ordering. Then suggest 5 marketing angles from: problem, desire, price or offer, gift, authority, comparison. For each one: the reason to buy and the target audience. Format: table. Language: [Darija / French / Arabic].\n\n3. THE HOOKS\nChosen angle: [angle]. Write 10 hooks under 10 words, numbered, all different, in the target audience’s language. Rank them from strongest to weakest and explain in one sentence why #1 stops the scroll.\n\n4. THE SCRIPT\nUsing hook #[  ], write a 30-second script.\nFormat: HOOK (0–3 s) / BODY (3–25 s: problem or desire, product, real proof) / CTA (25–30 s).\nFor each line: the voice-over + the on-screen text (6 words max).\nLimits: no promise that isn’t in <product>, no made-up reviews or numbers, no medical claims."
        }
      ]
    },
    "ia1-l10": {
      "title": "A creative from A to Z with Claude (2/2): storyboard, image and video prompts",
      "scenes": [
        {
          "sub": "Storyboard → images → motion → voice → edit"
        },
        {
          "title": "Step 5: the 6-shot *storyboard*",
          "segments": [
            {
              "text": "Turn this script into a 6-shot storyboard.",
              "tag": "Task"
            },
            {
              "text": "Table: #, duration, what we see, framing, movement, on-screen text, voice-over.",
              "tag": "Format"
            },
            {
              "text": "Total: 30 seconds. The <product> bottle stays identical in every shot.",
              "tag": "Limits"
            }
          ],
          "result": {
            "lines": [
              "1 · 3 s · Hands hesitating over gifts · close-up · static",
              "2 · 5 s · The box on dark satin · medium close-up · slow push-in",
              "3 · 6 s · The bottle comes out of the box · detail · slow orbit",
              "… 6 · 4 s · CTA card: “Order here”"
            ]
          }
        },
        {
          "title": "Step 6: one *image* prompt per shot",
          "segments": [
            {
              "text": "For each shot, write an image prompt for Nano Banana, to use with my real photo of the bottle.",
              "tag": "Task"
            },
            {
              "text": "Subject, setting, lighting, framing, style, 9:16 format.",
              "tag": "Format"
            },
            {
              "text": "Each prompt starts with: keep the bottle exactly identical.",
              "tag": "Lock"
            }
          ],
          "result": {
            "lines": [
              "SHOT 2 — Keep the bottle exactly identical.",
              "Open box on dark satin, warm light coming from the left,",
              "medium close-up, slight low angle, luxury product photo, 9:16."
            ]
          }
        },
        {
          "title": "Step 7: one *motion* prompt per image",
          "segments": [
            {
              "text": "For each approved image, write a video prompt for Veo or Kling:",
              "tag": "Task"
            },
            {
              "text": "a single action, a single camera movement, one mood,",
              "tag": "Motion"
            },
            {
              "text": "the bottle and the label stay identical, no generated text.",
              "tag": "Lock"
            }
          ],
          "result": {
            "lines": [
              "SHOT 3 — A hand slowly takes the bottle out of the box,",
              "slow orbit around the bottle, warm light.",
              "The bottle and the label stay identical."
            ]
          }
        },
        {
          "title": "Step 8: the *voice* and the *edit*",
          "items": [
            {
              "label": "The voice-over",
              "sub": "The script text, punctuated for ElevenLabs"
            },
            {
              "label": "The CapCut edit",
              "sub": "Voice first, shots timed to it"
            },
            {
              "label": "Final touches",
              "sub": "Proofread subtitles, CTA card, low music"
            }
          ]
        },
        {
          "title": "The final *check*",
          "items": [
            "The bottle *identical* in every shot",
            "No *distorted* text in the image",
            "Length: *30 seconds* max",
            {
              "t": "A “customer review” acted out by an avatar"
            }
          ]
        },
        {}
      ],
      "key": [
        "The storyboard: a table of 6 shots (duration, image, framing, movement, text, voice-over) adding up to 30 s, with the CTA card as the last shot.",
        "For each shot: an image prompt for Nano Banana based on your real photo, with the product lock; then a motion prompt for Veo or Kling (one action, one camera movement), in short clips trimmed in the edit.",
        "The voice-over punctuated for ElevenLabs (with a voice you have the right to use), then the CapCut edit: voice first, shots timed to it, proofread subtitles, CTA card, low music. The tools change; the chain stays."
      ],
      "quiz": [
        {
          "q": "What does every image prompt in the storyboard start with?",
          "a": [
            "“Make a beautiful image”",
            "“Keep the bottle exactly identical”",
            "“Invent a new bottle”"
          ],
          "why": "The product lock protects what the customer will actually receive."
        },
        {
          "q": "In CapCut, what do you lay down first?",
          "a": [
            "The voice-over, then the shots timed to it",
            "The music, then we’ll see",
            "The CTA card at the start"
          ],
          "why": "The voice sets the pace: each shot is timed to its sentence."
        }
      ],
      "todo": [
        "Turn your script into a 6-shot storyboard that runs 30 seconds",
        "Generate each shot’s image with Nano Banana, from your real product photo",
        "Animate each approved image with Veo or Kling, in short clips",
        "Generate the voice-over with ElevenLabs, using a voice you have the right to use",
        "Edit everything in CapCut following the edit plan, then export in 9:16",
        "Save the prompts that worked in your library"
      ],
      "res": [
        {
          "title": "Prompt chain (2/2): from script to edit",
          "text": "Continue the same conversation, once the script is approved (see the previous lesson for steps 1 to 4).\n\n5. THE STORYBOARD\nTurn this script into a 6-shot storyboard. Table: # · duration · what we see · framing · camera movement · on-screen text · voice-over. Total: 30 seconds. The product from <product> stays identical in every shot; the last shot is the CTA card.\n\n6. THE IMAGE PROMPTS (Nano Banana, your real product photo attached)\nFor each shot, write an image prompt. Each prompt starts with “Keep the product exactly identical (shape, label, colors)”, then describes: subject, setting, lighting, framing, style, 9:16 format. No text in the image.\n\n7. THE MOTION PROMPTS (Veo or Kling, from each approved image)\nFor each image, write a video prompt: a single slow action, a single camera movement, the mood, and “the product and its label stay identical”. Add a negative prompt: distortion, changing text, extra fingers, blur.\n\n8. THE VOICE-OVER AND THE EDIT\nWrite the voice-over text for ElevenLabs: the script’s sentences, punctuated to mark the pauses (commas, periods, ellipses), with no stage directions that would be read out loud. Then give the CapCut edit plan: the voice-over track, each shot with its start and end, the subtitles, the CTA card and the music.\n\nAfter each step: reread, correct, and keep only what’s true."
        },
        {
          "title": "CapCut edit plan (30 s, 9:16)",
          "text": "Track 1, voice-over: the ElevenLabs file, laid down first (0 to 30 s)\n\nTrack 2, video shots, timed to the sentences:\n  Shot 1 · 0–3 s · [hook]\n  Shot 2 · 3–8 s · [  ]\n  Shot 3 · 8–14 s · [  ]\n  Shot 4 · 14–20 s · [  ]\n  Shot 5 · 20–26 s · [  ]\n  Shot 6 · 26–30 s · CTA card (Canva, 1080 × 1920)\n  In the longest shots: a zoom or a text to lift the pace every 2 to 3 s.\n\nTrack 3, subtitles: automatic, then proofread line by line\nTrack 4, music: under the voice, without drowning it out\n\nCheck: product identical in every shot · no distorted text · length 30 s max · test with and without sound"
        }
      ]
    }
  }
};

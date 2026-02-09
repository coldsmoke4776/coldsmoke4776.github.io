---
title: "Why Agentic Programming Feels Hollow, And Why I Stopped Caring"
description: "Reflecting on getting back into personal projects after an exceptionally stressful time, with the help of OpenAI's Codex."
pubDate: "Feb 08 2026"
slug: "agentic-programming-hollow"
heroImage: "imagesforarticles/openaicodex.jpg"
---

### Introduction

I've been wanting to write here again for a while, but just couldn't find a topic I wanted to talk about enough that didn't feel like it was either:

- Reactionary "Can we stop whining about this shit now?" cynicism,
- Saying something that didn't need to be said because other people already had.

So, rather than trying to kick that off with something polished or ambitious, I figured I’d just say where I’m at right now.

Work has been stressful. <em>Really</em> stressful, if I'm being 100% with you. 

It's that kind of sustained, background stress that slowly drains your energy if you’re not paying attention. The kind that makes even things you <strong>like</strong> start to feel heavy if you’re not careful. That’s been shaping how I build lately more than I realized.

I <em>adored</em> digging into the absolute weeds when I was doing the C roadmap but felt like I'd burnt out a little on being deep in the grass.

Plus, I had some little projects I wanted to try out, and I'd be lying if I said the march of AI coding and the army of people who won't shut the <strong>fuck</strong> up about it didn't have a part to play, too.

I figured doing something was better than doing nothing, and I'd always wanted to start playing around with OpenAI's agentic coding assistant, Codex. My Bishop Fox colleague was an early AI adopter and has recommended it for projects for a while, so I spent the last couple of weekends playing around with it. 

Figured I should at least "know my enemy" if this is the thing that's going to drive me out of work (checks notes)...2 years ago? 

Next year?
Tommorow? 
Honestly, I lose track of when I'm meant to become unemployable, these days.

So, I've been using it to build a set of CLI-launched helper tools that I've wanted for a while, in tech stacks I have no intention of diving deep into. 

The feelings have been...interesting, to say the least.

---

### chmod +x ./senseofownership.sh

My first impressions of Codex are good, after I managed to assuage my fear that I wasn't going to receive a $9k API bill from using it.

Legitimately, it's genuinely impressive what Codex can do in terms of turning natural language input into actual usable code.
There are a few caveats to that judgement, though - which I'll go through as I tour the three projects I've used Codex to build recently.

#### Flynus Torvalds: The Actual Rubberduck Syntax Helper

![personalhud](/imagesforarticles/rubberduckshot.png)

The first project I utilized agentic programming for was something I've wanted to have for a while - an AI-powered "rubberduck" coding assistant.

I've always felt a weird bit of "craftman's guilt" utilizing AI code or heavily working from it, but I fundamentally don't see asking ChatGPT for language syntax help or checking Linux commands as any different from what we used StackOverflow for back in the day.

I've really enjoyed utilizing Ollama since I first tried it building Dashi the chess app, and wanted to use it again here.
I also really wanted to make something that was <strong>entirely local</strong> with no API integrations, so I could never get priced out of using it.

You know, for when the entire financial model of consumer AI collapses and it costs a billion dollars a month to use Claude Code.

This is where I came upon my first real observation about agentic programming tools like Codex:

> These tools genuinely cannot creatively "think" the way AI boosters want you to believe. They are AWFUL when you don't have a strong idea of what you want the outcome of your project to be. They need tight scope and a strong impression from you on what "good" looks like.

Once you do have that scope tightened up though? <em>Hoo boy</em>, are you off to the races!

I had a fairly locked down idea of what I wanted this project to be:

- Entirely locally stored and run on my Macbook (and thus MacOS),
- Single user (no auth needed)
- Rapid load time and little to no latency
- LLM/natural-language input
- NO WRITING CODE FOR ME, just answer coding syntax and conceptual questions.

Once I'd arrived at this general set of functional requirements, building a detailed prompt to Codex was the next step.

Based on what I mentioned as requirements, it suggested the following:

- Python FastAPI backend plys pydantic and some other libraries,
- Ollama (I already had it) and a small Qwen-1.5b model that is good at short coding questions, but won't crush my 2021 M1 Macbook Pro.
- Tauri, a framework for MacOS apps I'd never heard of, but apparently works well for the purpose.

It's a little slower, but I wanted to review each change as it happened to ensure I knew what was happening. And honestly, Codex did a great job of explaining why it makes a given change, if you ask in the following part of the chat.

It genuinely took about 40 minutes from front to back to arrive at something that I legitimately use all the time and wanted to exist, with some minor UI tweaks taking most of that.









![personalhud](/imagesforarticles/personalhudshot.png)




![personalhud](/imagesforarticles/resumeengineshot.png)












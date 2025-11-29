---
title: "AI, Take The Wheel - Lessons Learned from my First AI-Driven Project"
description: "I wanted to see what AI-led programming for a whole project was like, play with Ollama a bit too and see what I learnt along the way."
pubDate: "Nov 28 2025"
slug: "ai-take-the-wheel"
heroImage: "/openai.png"
---

### Introduction - Why I Built Dashi

1. Introduction — Why I Built Dashi
Set the tone. Talk about:
wanting a project to stretch your full-stack skills
curiosity about local LLMs
wanting to build something actually fun
deciding to let AI “drive” just to see what would happen
This section should feel personal and light.
Goal: establish the mission: a playful experiment that turned into a real app.

I've spent the last couple months really drilling through system-level fundamentals, in a drive to really pour in concrete foundations into my technical skillset. It was a lot of fun, I learnt so, so much - and I even wrote an article about it, which you can read on this site!

But I'd be lying if I said I didn't want to do something else after living at the byte level for that long. I wanted to use one project and experiment with a range of technologies and approaches that I wasn't comfortable with:

- Implementing Local LLMs and using Ollama
- FastAPI, something I'd heard a lot about but never used yet
- Frontend UI work in React (I'm no frontend engineer)
- AI-first programming - instead of avoiding cargo-culting at any cost, I wanted to see what would happen if I let AI drive instead.

Where had AI gotten to in terms of coding in the last couple years?

Was I being unfair when I said that I wanted to avoid using it as much as possible?

My approach now with tech I don't understand is to run at it head-first and dive into the dirt as quickly as possible, so I came up with an experimental project that utilized all of these things - Dashi.

Dashi is an LLM-enabled chess tutor that you can use to mirror the moves on a real board. The idea was that Dashi would be able to suggest a next move based on real analysis from the Stockfish engine, and explain whether your last one was good or bad using a local LLM.

The frontend would be written in React to get some practice, and the backend would utilize FastAPI to get practice there. With the major architectural decisions made, we were off to the races.

---






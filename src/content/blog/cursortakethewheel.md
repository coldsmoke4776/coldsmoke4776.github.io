---
title: "AI, Take The Wheel - Lessons Learned from my First AI-Driven Project"
description: "I wanted to see what AI-led programming for a whole project was like, play with Ollama a bit too and see what I learnt along the way."
pubDate: "Nov 28 2025"
slug: "ai-take-the-wheel"
heroImage: "/openai.png"
---

### Introduction - Why I Built Dashi

I've spent the last couple months really drilling through system-level fundamentals, in a drive to really pour in concrete foundations into my technical skillset. It was a lot of fun, I learnt so, so much - and I even [wrote an article about it](https://matttwells.com/blog/breakingthecodingbarrier.md/), which you can read on this site!

But I'd be lying if I said I didn't want to do something else after living at the byte level for that long. I wanted to use one project and experiment with a range of technologies and approaches that I wasn't comfortable with:

- Implementing Local LLMs and using Ollama
- FastAPI, something I'd heard a lot about but never used yet
- Frontend UI work in React (I'm no frontend engineer)
- AI-first programming - instead of avoiding cargo-culting at any cost, I wanted to see what would happen if I let AI drive instead.

Where had AI gotten to in terms of coding in the last couple years?

Was I being unfair when I said that I wanted to avoid using it as much as possible?

My approach now with tech I don't understand is to run at it head-first and dive into the dirt as quickly as possible, so I came up with an experimental project that utilized all of these things - **Dashi**.


---

### What is Dashi?

![Dashi](/dashi.png)

Dashi is an LLM-enabled chess tutor that you can use to mirror the moves on a real board. 

For anyone interested, the name is a pun on the Stockfish chess engine, a computer chess engine that has been refined by professionals. Stockfish > Fish Stock > Dashi is Japanese fish stock.

The idea was that Dashi would be able to suggest a next move based on real analysis from the **Stockfish** engine, and explain whether your last one was good or bad using a **local LLM**. The frontend would be written in **React** to get some practice, and the backend would utilize **FastAPI** to get practice there. 

With the major architectural decisions made, we were off to the races.


---

### The Tech Stack (What We Ended Up With)

![Ollama](/imagesforarticles/ollama.jpeg)

From the very start, this was designed to be an experimental project that was designed as a vehicle to play with new technologies, so naturally the stack for this project involves a lot of tech I'd never seen before. 

I figured if this was openly an AI-first project, I could be pretty free with asking for help implementing and setting up new things, right?

---

#### The Chess Engine Itself - Stockfish

![Stockfish](/imagesforarticles/stockfish_17.1.jpg)

**Stockfish** (as well as inspiring the name of the app) is a free and open-source chess engine. It's been one of the strongest engines in the world for years now, and is written primarily in C++.

A fish after my own heart, truly.

You feed it a chess position, it computes the optimal next move along with an array of other evaluation scores that I didn't use in Dashi v1.0, lest it ship in 2041.

**PROS**

- Free, open-source (bueno!)
- Integration is pretty dev-friendly!
- Docs are [readily available](https://official-stockfish.github.io/docs/stockfish-wiki/Home.html) and easy to understand

**CONS**

- If Stockfish crashes, so does Dashi if you're not careful.
- Mistakes in FEN or SAN being sent to the backend will result in hallucinations from the LLM (we'll get to that, don't you worry!)

---

#### The Frontend - React

![ReactLogo](/imagesforarticles/reactlogo.png)

Adding yet more fuel to the fire of *"on a long enough timescale, anything that can be written in JavaScript, will be written in JavaScript"*, my eventual choice of frontend/UI technology was **React**.

It wasn't my first choice, however! 

That trophy belongs to **Astro**, a [fantastic web framework](https://astro.build) that is designed for content-first websites. This very site runs on an Astro template, and I'm a big fan of it. 

Astro is easy to work with, and the docs are fantastic. During development though, we quickly found that it struggles rendering proper React components nested within it. Plus, the app just never...looked or felt right?

Eventually, we ripped the band-aid off, tore down the frontend and did it again in plain React - which worked great!

**PROS**

- [react-chessboard](https://github.com/Clariity/react-chessboard) is designed to work with React, and surprising no-one, we needed a chessboard that worked!
- npm run dev and uvicorn made it super easy to do quick iterations and see updates to the app.
- JSX just made a lot of natural sense to me, and I grasped how the pieces went together with functions and rendering at the bottom more than I ever thought I would.
- **useState** f**king rocks, dude. Used it to track game pieces, captures, all sorts of stuff.
- React aligns with the hybrid dev I want to become (**React, Python, C++**)


**CONS**

- Context window blowup made AI-assisted programming an *unmitigated nightmare* at times. Multiple working builds ended up wrecked due to GPT 5.1 missing a component and not making consistent decisions across prompts.
- I had to cargo-cult large chunks of React towards the end, which I hated, but made a decision to do anyway. I am no full-stack developer or frontend wizard, but I still hated how much I had to rely on code I didn't write to get this over the line as fast as we did. 
- Breaking one piece of state logic can absolutely wreck your life.
- **Damn. CSS. To. Hell. All of it.**

---

#### The Backend - FastAPI and Python/python-chess

![FastAPI](/imagesforarticles/fastapi.png)

Stockfish is our chess evaluation engine to give recommendation, but the native tongue for most chess-engines is absolutely **Python**.

**Python** and **FastAPI** were two technologies that this project was built around getting some hands-on practice with, so the choice here was pretty simple!

**PROS**

- FastAPI is [well supported](https://fastapi.tiangolo.com) and *stupidly easy* to scaffold. The name is well earned!
- Async calls to the LLM were a big part of this app, and FastAPI can handle them.
- I saw FastAPI a lot in the course of my SE work, and I really wanted to play around with it!
- Dev-friendly, fantastic choice for a JSON-in, JSON-out service like this that was always going to output the same type of data (a chess position/recommendation, an explanation string etc.)
- Pydantic made validation and request handling really clean - if it didn't match the spec, it didn't go in.
- Type hints reminded me of C a lot, and I really liked them.

**CONS**

- Bad indentation, and the lights are **out** for you, son! C doesn't care about indentation AT ALL, and I missed it *hard* in this project.
- File structure needs to begin and stay clean, or it gets confusing very quickly. That's just prudent software design, anyway.
- Stockfish didn't play well with FastAPI to start with, but we got there in the end!


Python-chess was less a choice and more the only thing that made sense based on the use of FastAPI and Stockfish. 

FastAPI is for Python APIs, [python-chess](https://python-chess.readthedocs.io/en/latest/) is a great chess library for Python that can handle chess notation, move validation etc.

Python-chess also cleanly integrates with Stockfish!

React handled the visuals, Stockfish handled move recommendations, FastAPI orchestrated the movements between it all. 

Python-chess is the brainstem that saved me from having to write a rules engine from scratch.
Imagine having to write consistent rules in Python for:

- legal moves and illegal moves
- en passant
- pins
- skewers
- forks
- promotion handling
- 50-rule move
- castling

Yeah, f**k that, dude. 

People write PhDs on chess engines, I just like watching GothamChess and getting my ass handed to me on Chess.com by Eastern European teenagers.

Here's a little taste of how python-chess works in practice:

```python

>>> import chess

>>> board = chess.Board()

>>> board.legal_moves  
<LegalMoveGenerator at ... (Nh3, Nf3, Nc3, Na3, h3, g3, f3, e3, d3, c3, ...)>
>>> chess.Move.from_uci("a8a1") in board.legal_moves
False

>>> board.push_san("e4")
Move.from_uci('e2e4')
>>> board.push_san("e5")
Move.from_uci('e7e5')
>>> board.push_san("Qh5")
Move.from_uci('d1h5')
>>> board.push_san("Nc6")
Move.from_uci('b8c6')
>>> board.push_san("Bc4")
Move.from_uci('f1c4')
>>> board.push_san("Nf6")
Move.from_uci('g8f6')
>>> board.push_san("Qxf7")
Move.from_uci('h5f7')

>>> board.is_checkmate()
True

>>> board
Board('r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4')
```

> Sidebar: The minute you start working with chess in your code, you'll need to understand the different types of chess notation that components use. The type you see in the code snippet above from the python-chess site is in UCI (Universal Chess Interface) format. UCI works in "from square > to square" so e2e4 means "piece moved from e2 to e4". SAN stands for Standard Algebraic Notation and is human-readable shorthand for a move. Qxd5+ for example is SAN shorthand for "Queen (Q) captures (x) something on (d5) and gives check (+)". FEN (Forsyth-Edwards Notation) is like a single-line photo of the entire board position and captures which pieces are where, whose turn it is, everything. FEN strings look like this "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2".

Dashi uses FEN, SAN, and UCI at different times to integrate with various different components.















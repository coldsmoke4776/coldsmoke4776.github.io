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

**Sidebar:** The minute you start working with chess in your code, you'll need to understand the different types of chess notation that components use. 

- The type you see in the code snippet above from the python-chess site is in **UCI (Universal Chess Interface) format**. UCI works in "from square > to square" so **e2e4** means *"piece moved from e2 to e4".* 
- **SAN** stands for **Standard Algebraic Notation** and is human-readable shorthand for a move. **Qxd5+** for example, is SAN shorthand for *"Queen (Q) captures (x) something on (d5) and gives check (+)".*
- **FEN (Forsyth-Edwards Notation)** is like a single-line photo of the entire board position and captures which pieces are where, whose turn it is, everything. FEN strings look like this: *"rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2".*

Dashi uses FEN, SAN, and UCI at different times to integrate with various different components.

---

### Local LLM/Inference - Ollama and Qwen (qwen2.5:1.5b)

![Qwen](/imagesforarticles/qwen.jpeg)

Playing around with locally run LLMs and using Ollama for the first time was a big part of why this project even happened in the first place.

Running everything locally forced a tight scope and kept things free, but also required some strict tradeoffs.

Installing Ollama, pulling down my first model was **SHOCKINGLY** easy. Literally, you can just do this to get your first answer:

```bash
echo "Explain the chess move Qxd5" | ollama run deepseek-r1:1.5b
```
Calling Ollama and my chosen model from Dashi's code turned out to be *much* easier than I thought it would be, too.

**PROS**

- Free, fun, and integrations are easy.
- Experimenting with model selection was really interesting and a new experience!
- No tokens, no billing drama, no "someone finds this site and bankrupts me by DOSing the API".
- Fits my interest in hands-on AI/ML tech without expensive cloud infra or spending a used Honda Civic for a GPU cluster the size OF a used Honda Civic.

**CONS**

- Hardware limitations (I run a 2021 M1 Macbook Pro currently with 8GB RAM) caused model crashes and blank responses.
- Larger models just simply will NOT run on machines that can't handle them, requiring tradeoffs from a design perspective.
- LLMs lie confidently unless your prompting is **iron-clad** - this was a f**king nightmare to troubleshoot and took some of the most time to fix.
- For example, phi-3-mini said that a Queen captured a pawn through en passant, which is...literally impossible.

The model I ended up choosing was [Qwen's](https://qwen.ai/home) qwen2.5:1.5b model, after cycling through some other alternatives that didn't work for various reasons:

**OpenAI GPT-5.1**, integrated through an API key, was the most powerful option that didn't require new hardware. But, it can get expensive if left running and didn't really align with the whole "you can run this on a laptop for free" philosophy I wanted to keep.

**Deepseek 7B** crashed my Macbook *instantly*. That's more a problem with my hardware than Deepseek, but ruled it out immediately for consideration for Dashi. I am *not* buying a GPU or a new laptop for a side project.

**Phi-3-mini** wins the trophy for "most confident bollocks" for sure. Made up complete nonsense and is not well suited for chess as an application. Made up rules, made up illegal moves, hallucinations were a nightmare.

---

### Controlled Chaos: The Build Journey

![disastergirl](/imagesforarticles/disastergirl.jpg)

This article is already pretty damn long, so I'll truncate the *hero's journey-ass* trip that building Dashi Ai-first was into a few important chunks.

---

#### I: Getting The Board Online

It all started so simple:

- Render chessboard
- Move some pieces
- See things light up

Easy, right? React-chessboard handles most of the heavy lifting there, anyway!

Sure, it *does* do that, but the moment you start adding **state tracking, captures, ordering moves, overlaying arrows for suggested moves** - it turns into a garage full of raccoons real quick.

This was my first time living within React's state management as opposed to glancing off it during tutorials and it clicked so much faster than I thought. I think using chess as a vehicle to learn it helped state management make sense in context. 

Various components need to know what the game looks like as of **that turn**, not start from scratch every time. We need to know what pieces are and aren't on the board - and the only way to manage that through the app is through state management.

Having something I actually wanted to use really helped the concepts click and with some liberal help from GPT-5.1 to help put the UI components together, Dashi started to feel real.

Transparently, I am no frontend wizard and this was my first time working entirely within React, so to make this app happen at all I made a decision early on that this part was going to be *heavily AI-driven*.

---

#### II: Enter Stockfish

Stockfish integration was where Dashi went from "Ooh, cute UI, bro..." to "Oh s**t, this is actually useful!"

FastAPI came in *clutch* for this piece, too.  One endpoint for "give me the best move", another for explaining the move. Pydantic for validation, clean routing - it worked great.

I've truncated the **stockfish_engine.py** file for brevity's sake, but I learnt a lot about how Python backend code worked from Socratically working through each function piece by piece with GPT 5.1.

```python
from copyreg import constructor
import chess 
import chess.engine
from pathlib import Path

#declares a blueprint for objects of type StockfishEngine.
class StockfishEngine:
    #def defines function, init is constructor
    #self is instance youre building, engine_path is a parameter with :Path as a type hint that it should be a Path object
    def __init__(self, engine_path: Path):
        self.engine_path = engine_path
        self.engine = None

    def start(self):
        self.engine = chess.engine.SimpleEngine.popen_uci(str(self.engine_path))

    def send_command(self, command: str) -> None:
        if not self.engine:
            raise RuntimeError("Engine not started.")
        
        self.engine.stdin.write((command + '\n').encode('utf-8'))
        self.engine.stdin.flush()
    
    def set_position(self, moves=None, fen=None):
        if fen:
            self.board = chess.Board(fen)
        else:
            self.board = chess.Board()
            if moves:
                for move in moves:
                    self.board.push_uci(move)
    
    def get_best_move(self, depth: int = 12) -> str:
        if not self.engine:
            raise RuntimeError("Engine not started")

        result = self.engine.analyse(self.board, chess.engine.Limit(depth=depth))
        best_move = result["pv"][0]   # principle variation = best line
        return best_move.uci()

```

**set_position** and **get_best_move** are the secret sauce behind Dashi's ability to suggest the "next move", and became a core part of the FastAPI router that makes Dashi work in practice:

```python
# ---------------------------------------------------------
# BEST MOVE (STOCKFISH)
# ---------------------------------------------------------
@router.post("/best-move")
def analyze_position(req: BestMoveRequest):

    # Handle standard / startpos
    if req.fen == "startpos":
        fen = chess.STARTING_FEN
    elif req.fen:
        fen = req.fen
    else:
        fen = None

    if fen and not is_valid_fen(fen):
        return {"error": "Invalid FEN provided."}

    if fen:
        engine.set_position(fen=fen)
    elif req.moves:
        engine.set_position(moves=req.moves)
    else:
        engine.set_position(fen=chess.STARTING_FEN)

    best_move = engine.get_best_move(depth=req.depth)
    return {"best_move": best_move}

```

It's really not that complicated once you look at it and understand the moving parts that make the proverbial "gun" fire:

- **@router.post** is the FastAPI syntax for declaring an endpoint, with POST being the HTTP method. We're **sending** data to Stockfish, after all.
- **/best-move** is the endpoint we're declaring, so our URL would be *"/analysis/best-move".*
- **startpos** is shorthand for every chess game's starting position, with all pieces on their corresponding sides. The first if block is essentially handling the situation of either being given "startpos" as a situation, an entire FEN string **(req.fen)** or **nothing.**
- The next part handles invalid FEN strings. Something that surprised me was how *strict* FEN strings are. You either need a full FEN or a full move history - this requires real data discipline.
- Based on either a FEN string or a list of moves, the "board position" is set through **engine.set_position**, and we can ask Stockfish what the best move is.
- **engine.get_best_move** gets Stockfish to run an analysis request on the board state, limiting the depth of its analysis to keep responses quick. The get_best_move function takes the first piece of data that comes after **"pv"** in Stockfish's response, which stands for **principal variation**.
- The PV is basically "Stockfish's suggested optimum move" and gets returned to us as a **UCI string,** which other Dashi components can handle.

---

#### III: Qwen My Macbook Gently Weeps 

You can integrate Ollama into your project once installed like so:

```python
import ollama
```

You pull the model you like, which might require some experimentation (or some shopping, dependent on model choice!) and you can call it via FastAPI. Done!

To help reduce hallucinations, we elected to strictly declare what data we were sending to the model to explain. This meant declaring what an "ExplainRequest" (ask for the LLM to explain a move as good or bad) looked like:

```python
class ExplainRequest(BaseModel):
    fen: str
    move_san: str
    from_: str
    to: str
    piece: str
    color: str
    captured: str | None = None
```

Then, you follow a similar structure to calling Stockfish via a FastAPI route:

```python
# ---------------------------------------------------------
# EXPLAIN MOVE (LLM)
# ---------------------------------------------------------
@router.post("/explain")
async def explain_move(req: ExplainRequest):

    prompt = f"""
You are a precise chess move explainer.
You will be given structured data and must ONLY use that data.

MOVE:
- SAN: {req.move_san}
- Piece: {req.piece}
- Color: {req.color}
- From: {req.from_}
- To: {req.to}
- Capture: {"yes" if req.captured else "no"}
- Captured piece: {req.captured or "none"}

Write one short, factual paragraph explaining only what is given.
No guessing. No strategy. No theory. No embellishment.
"""

    try:
        response = ollama.generate(
            model="qwen2.5:1.5b",
            prompt=prompt,
            options={"temperature": 0.1}
        )
        explanation = response["response"].strip()
        return {"explanation": explanation}

    except Exception as e:
        return {"error": f"LLM error: {str(e)}"}
```

This....*this* made me want to put a revolver in my mouth, getting this to work.

The call itself is shockingly simple:
- We need to wait for the LLM to respond, which is why explaining the move is an **async** (asynchronous) call.
- The parameter **req** is structured as an **ExplainRequest**, as detailed above.
- The **prompt** variable contains the literal prompt we're sending to the model, and will be the thing you spend BY FAR the most time troubleshooting. Your first try WILL spout absolute shite.
- We use a **try/except** block to do the actual call, sending the model we chose to Ollama, the prompt as well as other information.
- The response is a stripped down version of what the LLM spits out, storing only the "response" field and value in the **explanation** variable, and stripping everything else out.
- We then return **explanation** to the app as JSON, which React can handle just fine.

Prompt engineering is half science, half witchcraft and half being bad at fractions. You will change models a few times and the quirks and hardware limitations were...eye-opening, to say the least. 

Overall, the smaller the model, the stricter your prompt will need to be and they hallucinate shockingly quickly.

This part was some of the most fun of the whole project though, and I'll definitely be experimenting more with local LLM inference in the future.

---

#### IV: Breaking The App (Twice)

This is probably where I hated AI-first programming and ran into its limitations the hardest.
GPT 5.1 writes great, functional blocks of React when you have a *single, discrete task* for it to do.

Get it to write too much React at once, or rewrite whole files and you'll find quickly that the context window fills up fast and the lack of deterministic response means you'll get a different response each time.

AI is really great at fixing **small, discrete problems** and helping with syntax, but it's awful at rewriting **large, complex files** in a moving codebase.

It's shockingly bad at any **poorly-defined task that requires consistency across files**, at least in this instance.

We had to nuke the frontend twice and rewrite it, spending hours troubleshooting errors - making it far slower than probably just writing it yourself - and was a big lesson I took from this ecperience.

"Sure, rewrite the whole component" is a dangerous game to play - and you should keep backup copies of working code for WHEN (not IF) this happens to you.

---

### What I Liked, Learned, Hated & Would Do Again

This was great fun to do, but also felt surprisingly hollow and unearned at times. I learned *a lot* from this experience.




















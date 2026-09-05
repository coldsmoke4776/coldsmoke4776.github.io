---
title: "Learning The Low-Level Stuff : Building Something Worth Breaking"
description: "A deliberately vulnerable C++ app became my training ground for low-level security and reverse engineering"
pubDate: "Sep 04 2026"
slug: "building-something-worth-breaking"
heroImage: "/imagesforarticles/ghidra-reverse-engineering-tool.png"
---

### Introduction

I started a new job at a defensive cybersecurity company after over half a decade plying my trade in various offensive security roles. It's done something I wasn't really expecting: <em>it's made me want to get my hands dirty again.</em>

The better I understand the field — the products, the architectures I work with, but also what’s <strong>actually happening</strong> underneath them — the better I can be at my job. 
That’s turned into a fairly simple ambition: learn as much of the technical side of security as I reasonably can, particularly the areas where I’ve historically had less depth. 

And apparently the part of my brain that really wanted feeding was the low-level stuff - debuggers, memory, binaries, assembly, reverse engineering, vulnerability research.

These are the kinds of things where eventually you stop looking at what software <strong>claims</strong> it’s doing and start looking at what the machine is <strong>actually</strong> doing.

The problem is that reverse engineering has a pretty brutal on-ramp. If you start with a completely unfamiliar binary, you’re potentially trying to learn assembly, calling conventions, debugger navigation, compiler behavior and somebody else’s program logic at the same time.

So I decided to remove at least <em>one</em> of those variables. I built my first binary myself.

Enter <strong>Workweek: The HR System for Scoundrels and Villains of All Stripes.</strong>

---

### Why Do This To Myself, I Hear You Ask?

Well, dismbodied reader's voice - good question!

The real reason is that RE and learning it from scratch has a notoriously vicious initial learning curve, and I didn't want my first target to be completely opaque. Quite the opposite, actually.

I figured if I wrote the program myself, knew how the functions were meant to work, and put the vulnerablities in <em>myself</em> - then finding them in a debugger would be that much easier.

C++ made sense because its:

a) something I use for game-dev projects outside of work, and 
b) something that sits in exactly the territory I wanted to explore: manual memory concerns, integer widths, low-level behavior, compiled native binaries, and
c) gives you enough rope to make bad decisions in interesting ways.

The goal wasn’t and isn't to become a C++ expert or a professional software developer. 

Instead, it was to build something small enough that I understood the source code cold, then later remove the source and see whether I could recover that understanding from the binary.

The result was <strong>Workweek</strong>, a deliberately vulnerable command-line HR system for fantasy villains, because I'm an incurable dork.

I kept the scope intentionally small and chose four different bug classes:
- a stack buffer overflow using an unsafe copy into a fixed-size buffer,
- unsafe path handling that allows access outside the intended document directory,
- an integer-width bug in payroll logic,
- an authorization flaw where the program trusts the wrong user context.

That gave me four different kinds of failure to investigate without turning the C++ part into a six-month software project.

Plus, it was just a blast to do because it was connected directly to the nerdy shit I love.

---

#### Vulnerability 1: The Stack Buffer Overflow

![mainmenu](/imagesforarticles/workweekmainmenu.png)

Once a user has logged in to Workweek, they're presented with a main menu where they can choose from one of four functions:

- Looking up an employee record,
- Looking up a company document,
- Reading pay information and making an adjustment to said pay,
- Exiting the program.

The first vulnerability I wanted to work on lies within option 1: <strong>looking up an employee record.</strong>

![opt1](/imagesforarticles/workweekopt1.png)

This functionality is pretty simple: you enter the ID of the employee whose data you want to lookup. 

Then, Workweek prints the contents to console, extracts the name of the employee whose data you've read into a std::string, and then copies it into a fixed-size "backup" buffer.

This is about when I found out: it's <em>way harder</em> to intentionally write unsafe code than you'd initially think. A lot of the language is trying to stop you doing dumb shit by default these days.

I had to actively <strong>decide</strong> to implement an unsafe bit of code to create this vulnerability, which you can see below:

```c++
char employeeNameBackup[16];
std::strcpy(employeeNameBackup, employeeName.c_str());
```

The buffer I created (employeeNameBackup) has room to store 16 bytes of information, because that's how large I decided to make it.

The function I'm using to do the copying <em>into that buffer</em> (std::strcpy) is from the C++ standard library. The fun part is that strcpy does not care one bit about how much space is <strong>in</strong> the buffer, nor does it care how much space is <strong>left</strong> in said buffer.

Strcpy just copies bytes into the destination until it reaches the source's <strong> null terminator</strong>, which is just the null byte (\0) that marks the end of a C-style string. Null terminator bytes are what tells C++ that the string has "ended" and it can therefore move on to other things.

Let's pretend that the developer (me) doesn't really know what he's doing (an enormous leap, I know) and was using the employeeNameBackup buffer to store the name of the employee being looked up in case Workweek crashed. 
As long as the employee's name being stored is <strong>less than 16 bytes</strong>, this is entirely legitimate and working functionality.

Unsafe, to be sure. But it <em>does work.</em>

Enter our newest and most tentacled employee: Emrakuul, the Aeons Torn.

![opt1](/imagesforarticles/emrakuul.png)

I've been playing Magic: The Gathering for about 15 years now and I absolutely love both the game and the surrounding lore. 

In Magic's universe, Emrakul is one of the titans of the Eldrazi, an unknowable eldtrich race of beings that destroy and warp reality as they touch it.

I could not resist making the specific record that broke the employee lookup function an Eldrazi famous for warping things and breaking anything she comes into contact with.

Especially because her card literally says she can't be countered.

I also picked her because her card's name "Emrakul, the Aeons Torn" is <strong>deliberately longer than 16 bytes.</strong>

Let's log in as our best be-tentacled gal and see what happens:

![opt1](/imagesforarticles/workweekemrakul.png)

It <em>looks</em> like nothing has happened at all.

Authentication went off without a hitch, I asked to see Emrakul's record and it showed me it. All is bueno in the neighborhood. 

<em>Or, is it?</em>

The fun truly starts when you load up Workweek in a debugger and see what happens when you do this again. I'm using the native MacOS debugger LLDB, because I'm using a Macbook Pro M1 2021.

Before we do that, though, let's take a look at the code that just executed:

```c++
void lookupEmployee(const std::string& currentUserID) {
    std::string employeeID;
    std::string employeeName;

    // ...

    while (std::getline(file, line)) {
        if (line.rfind("Password:", 0) == 0) {
            continue;
        }

        std::cout << line << '\n';

        // [1] Employee name is read into a dynamically-sized std::string.
        if (line.rfind("Name:", 0) == 0) {
            employeeName = line.substr(6);
        }
    }

    // [2] A fixed-size 16-byte stack buffer is created.
    char employeeNameBackup[16];

    // [3] strcpy copies the entire C-string without knowing
    //     how large employeeNameBackup actually is.
    std::strcpy(employeeNameBackup, employeeName.c_str());
}
```

Comment number 1 is right next to where we read the name of the employee into a std::string called <strong>employeeName</strong>. Std::strings are <strong>dynamically sized</strong>, so Workweek can happily go about storing a name longer than 16 characters, like "Emrakul, the Aeons Torn" which is that value for eldrazi_001.

Comment number 2 is right above the <strong>fixed-size destination</strong> that we're going to store that name in. It's <strong>16 bytes of space</strong> and that's the hard boundary on the stack that we're about to violate.

Comment number 3 is a function <strong>std::strcpy</strong> we're using that is a <strong>deliberately unsafe</strong> way to copy that name from employeeName (the string, longer than 16 bytes) into employeeNameBackup (the buffer that's 16 bytes long). Strcpy is going to copy bytes until it encounters the string's null terminatory byte (\0) that tells it to stop.

Let's do some quick math:

"Emrakuul, the Aeons Torn" = 24 characters
Null terminator           =  1 byte
                             --------
Total copied              = 25 bytes

Destination               = 16 bytes
Overflow                  =  9 bytes

In a real application, an out-of-bounds write like this can corrupt nearby stack data and potentially alter how the program behaves. In the worst case, a well-controlled overflow can be turned into control-flow hijacking or code execution.

For Workweek, though - I just wanted to see the memory corruption itself happen in real-time, so I fired up LLDB:

![opt1](/imagesforarticles/lldbvuln1atbreak.png)

To make things Swarovski-clear: Workweek has extracted a <strong>24-character</strong> employee name. The next operation will copy that name, plus its null terminator, into a <strong>16-byte</strong> stack buffer.

Next, let's take a look at the exact memory boundary we're trying to overflow:

![opt1](/imagesforarticles/lldbvuln1beforestrcpy.png)

This is where you make the debugger evidence concrete.
You already have:
employeeName = "Emrakuul, the Aeons Torn"

(char (*)[16]) 0x000000016fdfe6d8
Highlight the address and add:
Buffer begins: 0x16fdfe6d8
Then immediately underneath the image, give the reader the arithmetic:
Start:           0x16fdfe6d8
16-byte buffer:  0x16fdfe6d8 – 0x16fdfe6e7
Overflow starts: 0x16fdfe6e8
I would absolutely include that. It removes any “trust me bro” quality from the next screenshot.
Also point at line 129:
strcpy has no destination-size argument. It copies until \0.
That’s the actual flaw.







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

- Python FastAPI backend plus pydantic and some other libraries,
- Ollama (I already had it) and a small Qwen-1.5b model that is good at short coding questions, but won't crush my 2021 M1 Macbook Pro.
- Tauri, a framework for MacOS apps I'd never heard of, but apparently works well for the purpose.

It's a little slower, but I wanted to review each change as it happened to ensure I knew what was happening. And honestly, Codex did a great job of explaining why it makes a given change, if you ask in the following part of the chat.

It genuinely took about 40 minutes from front to back to arrive at something that I legitimately use all the time and wanted to exist, with some minor UI tweaks taking most of that.

---

#### Personal HUD: Integrating Outside Data

![personalhud](/imagesforarticles/personalhudshot.png)

This next one was something I'd been noodling on for a while, mostly after having to pay my annual renewals for two apps I use daily:

- MyFitnessPal (for food logging)
- Strava (for exercise logging)

I also wanted somewhere I could just pull up a quick view of "where I'm at" in terms of nutrition, exercise and general financial situation.

BUT, I also didn't want to spend months trying to troubleshoot a custom API integration for two different platforms, plus working out how to safely get my financial information into there.

In an Ouroboros-esque move, I actually utilized ChatGPT 5.2 to give me an extremely detailed Codex prompt for this, a truncated version is below:

``` python
You are implementing a MyFitnessPal CSV ingestion module for a single-user, local-first personal HUD.

Constraints
No authentication
No multi-user logic
No external APIs
No mutation of historical data
Append-only storage
Deterministic behavior

Input Files
The user provides exactly three CSV files exported from MyFitnessPal:
Nutrition-Summary-*.csv
Exercise-Summary-*.csv
Measurement-Summary-*.csv

Canonical Output Model
Normalize all data into daily snapshots of the following shape:
type DailySnapshot = {
  date: string; // YYYY-MM-DD

  nutrition: {
    protein?: number;
    caloriesGross?: number;
    caloriesNet?: number;
    hydration?: boolean;
    fiber?: number;
    logged: boolean;
  };

  exercise: {
    active: boolean;
    workouts?: number;
  };

  After ingestion:
    The system must be able to query snapshots by date
    Partial days are valid
    Missing data must not be treated as failure
    Philosophy
    This ingestion pipeline exists to support trend and direction, not precision.
    Simplicity and determinism are more important than accuracy.
```

Codex did a great job with this one, because ChatGPT's web interface works great with structured information and standardized output. Because that's what it got trained on when it hoovered up everything anyone ever wrote and uploaded.

The fact that this is entirely CLI-launched meant no local app, either. Just a quick launch of a React page for a UI in the browser at localhost to see some rough data!

Which again, was all I ever needed. Tight scopes make for great Codex projects. 

It's a shitty UI/UX designer though, and will often break more than it fixes in that regard.

I will say though, this took a lot longer than the rubber duck app and I think that mostly came down to the UI/UX troubleshooting, which brings me to my second observation on agentic programing:

> Use stuff like Codex and Claude Code for "glue" and "plumbing" code, do the UI parts yourself. Play to the tool's strengths instead of forcing your way through something not suited for the purpose. Your output will be better for it.

---

#### Resume Engine: By Far My Favorite

This one, Codex knocked out of the absolute ballpark.

The prompt looked a little something like this, after some massaging from ChatGPT's web client. It worked great last time, so figured I'd do it again here:

```python
You are acting as a deterministic code generator.

Context:
- I have a YAML file open containing a role with claims.
- Each claim has fields like id, text, tags, metrics.

Task:
- Write a simple Python script named render_bishop_fox.py.
- The script should:
  1. Load data/bishop_fox.yaml.
  2. Extract the first role.
  3. Print a Markdown section with:
     - A header containing company and title.
     - A bullet list of each claim.text value.
- Do not invent, summarize, or reorder content.
- Keep the code simple: no classes, no frameworks.

Output:
- Provide only the Python code.
```

Because the functional requirements were so simple, Codex <strong>ate this up</strong>.

- Decompose my resume into one YAML file, with each bullet becoming a claim with tags etc.
- Write a Python script that prints out customizable chunks of that YAML file for different roles, for different topics etc.
- No frameworks, no classes, no generative content.

![resumeengine](/imagesforarticles/resumeengineshot.png)

As you can see, within about 30 minutes, I was able to get something usable up and running, in a format that I can basically just update ad infinitum with new claims.

Speaking of adding new claims, Codex is great at adding additional features if you're able to strictly define what you want the outcome to be. The more detail the better.

I asked for a feature where I can add a <strong>--jd-text</strong> flag to the tool <strong>render.py</strong> Codex built, through the following prompt:

```python
I wonder if we can use the flag --jd-text to then start a wizard of sorts, kinda like when you SSH into a host for the first time, so you can copy in the JD text from a web page, like we did in the chat here (as a test).
```

Codex took the ball and ran with it, adding this --jd-text feature functionally in seconds.

I asked for a feature to make sure I can add extra claims (resume bullets) as I gain experience and do projects, without adjusting the YAML file and ensure data normalization, so render.py doesn't break. This was the prompt:

```python
What would be the best method long-term for adding extra content to the YAML file? I wondered if a simple web form could work? Actually, I think a cli-based helper would be the move - means we do not have to worry about APIs and handoffs etc. I mostly just wanted to make sure that whatever I typed in got normalized properly to add to the data set.
```

Codex one-shotted this very specific ask, doubly proving my point that this tool works way better when you know exactly what you want and what the desired outcome. It's a plumber, not a designer.

However, to give credit where credit is due: I use this tool <em>all the time.</em>

Codex built something legitimately useful for me, in a timescale I couldn't have hit in my wildest dreams.

This brought up a lot of weird feelings, which I'll go into next as I tie this article up.

---

### Sometimes It's The Vending Machine, Sometimes It's The Beef Wellington

![beefwellington](/imagesforarticles/beefwellington.jpg)

The Codex projects all work, let me clear. They were fast to build. 

But when I was done… I felt...basically nothing. For a bit, that bothered me. 

I thought maybe I was doing something wrong, or missing out on the “real” experience of building.
But I think what was actually happening is simpler.

I was using AI-assisted projects to keep moving without risking something I cared about more.

The truth is, I’d been avoiding my more craft-heavy projects — game experiments, low-level C/C++ work, math notebooks, a narrative card game I’ve been tinkering with. 

Not because I didn’t value them, but because I didn’t want them to start feeling like work.
I didn’t want stress, expectations, or productivity pressure leaking into the things I use to recharge. 

So I kept them at arm’s length for a while. And I’ve learned that this is actually completely okay.
Right now, I’m mentally splitting my projects into two buckets:

- There are <strong>utility projects</strong>, where the goal is speed and outcome. These are allowed to be AI-assisted, boring, and unromantic. They exist to make my life easier, nothing else.
- Then, there are <strong>craft projects</strong>, where the point IS the process. These are allowed to be slow, inefficient, and stubbornly manual. They exist almost entirely because I ENJOY wrestling with them.

Once I stopped expecting utility to feel meaningful — and stopped expecting craft to be efficient — a lot of that guilt disappeared.

Sometimes you grab something from a vending machine because you’re hungry and tired and you just need fuel.

Other times you spend an entire evening cooking something unnecessary and imperfect like a Beef Wellington, because you want to point at something and go "LOOK I MADE THIS!".

Both are valid. Confusing them is what causes friction.

So that’s where I’m at.

I’m building what I need to build, protecting what I care about, and giving myself permission to let those be different things for a while.

I think I'm going to head back to the low-level mines for a long while next though, but with a new-found perspective and far less self-flagellation, self-imposed rigidity, or the need to justify why I build the way I do.

Alright, peace!

Matt/jawndeere
















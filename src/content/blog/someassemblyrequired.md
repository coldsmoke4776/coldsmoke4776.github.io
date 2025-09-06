---
title: "Properly Understanding Memory in x86_64: Some Assembly Is Required"
description: "Using memory_dungeon.c to explain how memory works when you run a program!"
pubDate: "Sep 05 2025"
slug: "some-assembly-required"
heroImage: "/buffalo.png"
---

If you've ever wanted to tackle OSCP, or been interested in how computers work at the lowest levels, you've likely bumped into memory.

It's scary, it's intimidating, difficult to visualize - honestly, I get it.

*Heaps*, *stacks*, *buffers*, *buffer overflows*, *opcodes* - what the actual hell does any of this **mean**?

That's the intent of this deep dive article - making this scary, abstract concept easy to understand.

Getting your head around this has implications across all sorts of applications - especially if you've got aspirations to write your own exploits and shellcode one day!

---

### Memory Dungeon

Instead of a dry wall of text, we're going to use **Memory Dungeon**, a simple and modular program I put together to help teach people about memory.

You can find it and use it yourself along with the article [here on GitHub](https://www.github.com/coldsmoke4776/memory_dungeon.git).

Memory Dungeon is an interactive demo of heap memory, a stack frame and a disassembler - so you can see how these concepts work in real life, instead of just trying to visualize it all in your head. 

If you can't or don't want to run Memory Dungeon yourself, that's fine - we'll be using a bunch of output and screenshots from running it on my computer, so you'll be able to follow along.

---

### Quest 1: Understanding How Memory is Laid Out in X86_64 Systems

![RAM Memory](/imagesforarticles/RAM-memory.jpg)

Before we jump into the gnarly shit, let's make sure we understand the basics.

Your computer will have both **physical memory**, like the stick of RAM memory pictured above, and **virtual memory** which is what your programs see.

What's the difference, then?

When we talk about *physical* memory, we're talkimg about how much physical, actual memory a computer has at its disposal to store data and handle programs/processes. You can add more physical memory by adding another stick of RAM if you have an open slot for it or by wholesale replacing the RAM stick you currently have if your device allows it.

Fundamentally, when you run a program, it's all living in RAM for the most part - stored as bits.

When we talk about *virtual* memory, what we're really talking about is a logical construct that presents RAM to your programs as this big, continuous address space it can use, even if in truth the data is spread physically all across the stick of RAM. Virtual memory allows for your OS to **isolate processes* from one another so they can't stomp on each other's memory allocations.

It also lets your OS offer the same consistent "map" or "architectural plan" to each process (which we'll go through), which makes programming a lot easier. 

So, when we describe the heap later on as *growing upward* or the stack as *growing downward*, we're referring to this logical concept of **virtual memory** as opposed to the stick of RAM itself.


#### So what does the "map" look like?

```sql
High addresses
+----------------------------+ <- Kernel space (off-limits to user code)
|                            |
|        (unused gap)        |
|                            |
+----------------------------+ <- Stack (grows downward)
|     Local variables        |
|     Saved frame pointers   |
|     Return addresses       |
+----------------------------+
|     Memory-mapped files,   |
|     shared libraries       |
+----------------------------+
|     Heap (grows upward)    |
|     malloc/new allocations |
+----------------------------+
|     BSS (uninitialized     |
|     global/static vars)    |
+----------------------------+
|     Data (initialized      |
|     global/static vars)    |
+----------------------------+
|     Text / Code segment    |
|     Machine instructions   |
|     (e.g., 0x90 = NOP,     |
|            0xC3 = RET)     |
+----------------------------+ <- Low addresses
```

You're probably looking at that and going "wait, what the actual f**k?"

Don't worry, we're going to break each part of it down from top to bottom so you get what **each and every part** is doing.


#### Kernel Space...Why's it off limits to me? I thought this was America?

When you install an operating system (OS) on your device, one of the most core pieces of that operating system (whether you're a priest of the Church of Microsoft, or a disciple of the Church of GNU/Linux) is the **kernel**. 

The operating system kernel is the core part of your OS that handles the actual hardware interactions that make your computer run, make sure your keystrokes actually do anything, handle physical memory and device drivers etc. 

If any old program could touch this space, it could crash the entire computer just by poking into the wrong bit of memory - and that is no bueno if you were planning on using it.

So, a very strict *boundary* is drawn around what we call **kernel space** where the OS lives and handles its business, and **user space** or **user land** where the programs you write and use live and handle their business. If your program tries to touch kernel space, the OS raises a fault and kills it stone dead. 

So, that's why it's off limits at the top of our diagram, here!


#### The Stack - I've been framed, I tells ya!

We met the stack briefly in the memory map above, but let’s zoom in.

If a single line of code is an *instruction*, then a collection of instructions that do a certain conceptual *thing* is a **function**. Calling a function like `swap()` or `run_heap_demo()` means: “hey computer, jump over there, do this little subroutine, then come back.”

The stack keeps track of all those calls by storing each one inside a **stack frame**.

A stack frame is like a little apartment with a few important floors:
- One for **local variables** (e.g., `char buf[16]`).
- One for a **saved frame pointer**, which links this frame to the one below it.
- One for a **return address**, so when the function finishes the CPU isn’t just like *“Uh… now what?”*

Each new frame goes **on top** of the previous one. The stack starts at high memory addresses and grows **downward** as functions are called. When a function finishes, its frame vanishes and the stack shrinks back upward.

Think of it like pancakes: new pancakes go on top, you eat the ones that came first. If a diner slid fresh pancakes underneath the stack, you’d call the cops.

💡 Here’s the kicker: if you put *too much data* into one of those local variable floors, it can spill into the floors above it — smashing the saved frame pointer and return address. That’s where the term *stack smashing* comes from… but we’ll get to that in Quest 3.


#### Memory-Mapped Region and Shared Libraries: It's all libc, baby!

So between the **stack** which grows *downwards* and the **heap** which grows *upwards*, there's this space in-between.

This space is kinda like a "shared housing block" where your OS drops in extra stuff your program needs, and that your program files are utilizing to get their jobs done.

We call this part of memory the **memory-mapped region**. It's the rent-controlled apartment building of RAM!

When you call **printf("Go Birds!")** you're using the *printf()* function which is part of the **libc** library. This is a library of code provided by your system so that multiple files can use it, instead of having multiple copies inside each file.

That's why they're called *shared libraries* - because they are!

Think of it like giving everyone in the apartment building the key to the same laundry room and community room that anyone can use should they need it.

#### The Heap - Growing Ever Upwards, Much Like My Caffeine Intake

#### The Heap – Growing Ever Upwards, Much Like My Caffeine Intake

Further down the diagram, we arrive at **the heap**.

Think of the heap like a long hotel hallway, with rooms off to both sides. Your operating system is the hotel manager, and whenever you ask for memory with `malloc()`, it hands you the key to a set of rooms. When you’re done, you’re supposed to check out with `free()` so those rooms can be reused.

Unlike the stack, memory here doesn’t automatically disappear when a function ends. The heap requires **active management**. If you forget to free memory, the hotel manager can’t give those rooms to anyone else — that’s a memory leak. If you free them twice, you’ve caused corruption in the hotel’s booking system. And if you wander into a room you didn’t rent… well, that’s how segfaults happen.

This explicit responsibility is one of the biggest cultural shocks when moving from higher-level languages like Python or JavaScript (which have garbage collectors to clean up after you). In C, you *are* the garbage collector.

[Trashman](/imagesforarticles/trashman.jpg)

The heap starts at lower-number memory addresses and **grows upward** the more your program requests at runtime. If that program happens to be Google Chrome, you can safely assume the entire hotel is booked solid (hayooooo).

We’ll dive into the heap in more detail in **Quest 2: Heap Hallway**, where you’ll get to walk the corridor yourself.


####






---

### Quest 2: Heap Hallway - How Many Rooms Do We Have and How Many Are Left?


----

### Quest 3: Stack Playground - Causing the Buffer Overflow By Yelling Too Much At It


---

### Quest 4: I Love Magic Scrolls, Disassemble Another Opcode For The Jukebox, Baby  

----

### Wrapping Up: Memory Is Dope, You Can Do Dope Stuff With It, Such as...

----
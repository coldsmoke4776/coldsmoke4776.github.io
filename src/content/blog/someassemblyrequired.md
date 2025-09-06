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



---

### Quest 2: Heap Hallway - How Many Rooms Do We Have and How Many Are Left?


----

### Quest 3: Stack Playground - Causing the Buffer Overflow By Yelling Too Much At It


---

### Quest 4: I Love Magic Scrolls, Disassemble Another Opcode For The Jukebox, Baby  

----

### Wrapping Up: Memory Is Dope, You Can Do Dope Stuff With It, Such as...

----
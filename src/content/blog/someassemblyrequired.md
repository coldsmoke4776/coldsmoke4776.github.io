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

under construction...

---

### Quest 2: Heap Hallway - How Many Rooms Do We Have and How Many Are Left?


----

### Quest 3: Stack Playground - Causing the Buffer Overflow By Yelling Too Much At It


---

### Quest 4: I Love Magic Scrolls, Disassemble Another Opcode For The Jukebox, Baby  

----

### Wrapping Up: Memory Is Dope, You Can Do Dope Stuff With It, Such as...

----
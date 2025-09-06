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

When we talk about *virtual* memory, what we're really talking about is a logical construct that presents RAM to your programs as this big, continuous address space it can use, even if in truth the data is spread physically all across the stick of RAM. Virtual memory allows for your OS to *isolate processes* from one another so they can't stomp on each other's memory allocations.

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

--- 

## 🏰 Kernel Space – “What Do You Mean I Can't Touch It? I Thought This Was America?”

When you install an operating system (OS) on your device, one of the most core pieces of that operating system (whether you're a priest of the Church of Microsoft, or a disciple of the Church of GNU/Linux) is the **kernel**. 

The operating system kernel is the core part of your OS that handles the actual hardware interactions that make your computer run, make sure your keystrokes actually do anything, handle physical memory and device drivers etc. 

> ⚔️ Why it’s off-limits: If any old program could touch this space, it could crash the entire computer just by poking into the wrong bit of memory - and that is no bueno if you were planning on using it.

So, a very strict *boundary* is drawn around what we call **kernel space** where the OS lives and handles its business, and **user space** or **user land** where the programs you write and use live and handle their business. If your program tries to touch kernel space, the OS raises a fault and kills it stone dead. 

So, that's why it's off limits at the top of our diagram, here!

---

## 🥞 The Stack – I've Been Framed, I Tells Ya!

We met the stack briefly in the memory map above, but let’s zoom in.

If a single line of code is an *instruction*, then a collection of instructions that do a certain conceptual *thing* is a **function**. Calling a function like `swap()` or `run_heap_demo()` means: “hey computer, jump over there, do this little subroutine, then come back.”

The stack keeps track of all those calls by storing each one inside a **stack frame**.

A stack frame is like a little apartment with a few important floors:
- One for **local variables** (e.g., `char buf[16]`).
- One for a **saved frame pointer**, which links this frame to the one below it.
- One for a **return address**, so when the function finishes the CPU isn’t just like *“Uh… now what?”*

Each new frame goes **on top** of the previous one. The stack starts at high memory addresses and grows **downward** as functions are called. When a function finishes, its frame vanishes and the stack shrinks back upward.

Think of it like pancakes: new pancakes go on top, you eat the ones that came first. If a diner slid fresh pancakes underneath the stack, you’d call the cops.

> 💡 Here’s the kicker: if you put *too much data* into one of those local variable floors, it can spill into the floors above it — smashing the saved frame pointer and return address. That’s where the term *stack smashing* comes from… but we’ll get to that in Quest 3.


---

## 🏢 Memory-Mapped Region – It's All libc, Baby!

So between the **stack** which grows *downwards* and the **heap** which grows *upwards*, there's this space in-between.

This space is kinda like a "shared housing block" where your OS drops in extra stuff your program needs, and that your program files are utilizing to get their jobs done.

We call this part of memory the **memory-mapped region**. It's the rent-controlled apartment building of RAM!

When you call **printf("Go Birds!")** you're using the *printf()* function which is part of the **libc** library. This is a library of code provided by your system so that multiple files can use it, instead of having multiple copies inside each file.

> That's why they're called *shared libraries* - because they are! Think of it like giving everyone in the apartment building the key to the same laundry room and community room that anyone can use should they need it.


---

## 🛎️ The Heap – Growing Ever Upwards, Much Like My Caffeine Intake

Further down the diagram, we arrive at **the heap**.

Think of the heap like a long hotel hallway, with rooms off to both sides. Your operating system is the hotel manager, and whenever you ask for memory with `malloc()`, it hands you the key to a set of rooms. When you’re done, you’re supposed to check out with `free()` so those rooms can be reused.

Unlike the stack, memory here doesn’t automatically disappear when a function ends. The heap requires **active management**. If you forget to free memory, the hotel manager can’t give those rooms to anyone else — that’s a memory leak. If you free them twice, you’ve caused corruption in the hotel’s booking system. And if you wander into a room you didn’t rent… well, that’s how segfaults happen.

> This explicit responsibility is one of the biggest cultural shocks when moving from higher-level languages like Python or JavaScript (which have garbage collectors to clean up after you). In C, you *are* the garbage collector.

![Trashman](/imagesforarticles/trashman.jpg)

The heap starts at lower-number memory addresses and **grows upward** the more your program requests at runtime. If that program happens to be Google Chrome, you can safely assume the entire hotel is booked solid (hayooooo).

We’ll dive into the heap in more detail in **Quest 2: Heap Hallway**, where you’ll get to walk the corridor yourself.


---

## 🗄️ BSS Segment – The Junk Drawer. Nobody Knows What It Means, But It's Provocative

We *do* actually know what BSS stands for (Block Started by Symbol), and it's a reference to old-school disassembler programs that kinda stuck.

But, I wanted to make the *Blades of Glory* reference, so that took precedence here 😂

This part of memory is actually pretty simple to understand - it's where **uninitialized** global (program-wide) and static variables live.

If I declare **static int counter**, but don't give it a value - it would get stored in the BSS segment, and the OS will initialize it at 0 when we run the program.

The BSS Segment is the junk drawer full of stuff you swore you'd use but just haven't gotten around to yet.

You're absolutely going to use those 8 dead batteries and a key to a house you don't own any more, right?


---

## 📦 Data Segment – Does What It Says on the Box

This is where **initialized** global and static variables live that have actually been given a value.

So if you instead declared **static int counter = 42**, it'd live here in the Data Segment of memory.

Not really all that much to this one, to be honest!


---

## 📜 Text Segment – Mom, Come Pick Me Up, There's A Scary Man Here Offering Me Opcodes

Welcome to the *bottom* of the memory diagram - this is where the fun part is!

This segment of memory is also sometimes called the **code segment** of memory.

The text or code segment is where the actual instructions you write in your programs live once they've been **compiled** into a single **executable** file that the computer can actually run.

Your computer doesn't store things here in a language you or I understand, though.

It stores what we call raw bytes or **opcodes** that correspond to a specific instruction that the CPU gets sent.

Those opcodes are normally associated with a human-readable mnemonic so in general, we can understand and trace the flow of executing instructions through the program.

We call that human-readable language **assembly language** and it's about as close as we're able to get to speaking raw machine language ourselves.

> 📜 Opcodes, not assembly: The CPU doesn’t see NOP or RET. It sees bytes like 0x90 or 0xC3 and decodes them into actions. Assembly is just our human-readable shorthand for what those bytes mean. We can transform these **raw bytes** back into human-readable assembly language using a program called a **disassembler** and we'll be going through how it works in Quest 4!


---

### Quest 2: Heap Hallway - How Many Rooms Do We Have and How Many Are Left?

Alright, now it's time to break out **Memory Dungeon** and dive a little deeper into the main sections of memory you're gonna be playing in.

![heaphallway](/imagesforarticles/heaphallway1.png)

Like we referenced above, the heap is a section of memory that we can **dynamically allocate and free** in our program and needs *active management* on our part to avoid problems at runtime.

If you're running Memory Dungeon yourself, make sure you've followed the build instructions and then run the following command:

```c
./memory_dungeon
```

This will bring up the main menu of Memory Dungeon (as you can see in the screenshot), where you can pick which demonstration you want to see.

You want to pick **number 1** - **Heap Hallway**.

Remember when we said that the heap grows *upwards* in memory as we ask for more of it? 
Well, this is where you'll get to see that happen in real-time!

Heap Hallway has a "heap" of 1024 bytes available for you to allocate - so if you remember our hotel hallway analogy from before, that's *one hallway* with **1024 rooms** to allocate.

The program then asks you how many bytes you want to allocate from the heap - I put 50 here, but any number between 1 and 1024 would work.

Whenever a program calls **malloc()**, this is the equivalent of what you're doing when you type in your first number. 
You're asking the OS (the hotel manager in our analogy) to book and take up 50 rooms accessible via the hallway.

You can see once I type in 50 and hit enter, 50 **#** symbols appear in our block of **.** symbols, representing 50 bytes of heap memory being taken up. The heap has *grown upwards* by 50 bytes!

![heaphallway](/imagesforarticles/heaphallway2.png)

The program will then ask you again for a number of bytes to allocate - I chose 250 here, but again, any number between 1 and 974 would work here (because we allocated 50 already). 

You can easily see that a *lot more* **#** symbols appear in the grid, representing the 300 bytes of heap memory we've allocated. The heap has grown upwards by 250 bytes!

What about if we want to allocate another *800 bytes?*

Anyone who has finished basic math will go *"Hang on a sec, 300 + 800 = 1100. 1100 > 1024, so what happens when we run out of rooms?"*

![heaphallway2](/imagesforarticles/heaphallway3.png)


If you keep asking for more and more rooms, eventually the hotel manager (your OS) will throw up their hands, like so:

```yaml
Enter the number of bytes you want to allocate: 
800
Error: Out of memory 
Allocation of 800 bytes failed. 
Heap usage: 300 / 1024 bytes (29.0%)
```

Notice how the heap usage percentage and amount stayed the same? 
The allocation didn't succeed and the program threw an error, so the hallway allocation didn't change.

If we **free()**-d up some rooms, we'd have been able to allocate the rooms and the allocation would have been successful. But we didn't, so we weren't able to - hence the error.

> If you don't clean up after yourself with free(), the hallway/heap fills up over time. If you ask for more rooms/bytes than are available, you get NULL back. If you haven't accounted for that in your code, you'll start getting weird behavior or errors in your programs.

It's a simple demo, but there's real world security implications for this!

If you ever find yourself looking at something called a "heap exploit", what it's likely taking advantage of is a flaw in the "booking system" for hotel rooms in the heap. If the computer can't keep track of which rooms are occupied, maybe the attacker can trick the OS into handing the keys to a specific room that they shouldn't be allowed into...

Understanding this isn't just academic, it's the foundation to modern exploitation!


----

### Quest 3: Stack Playground - Causing the Buffer Overflow By Yelling Too Much At It


---

### Quest 4: I Love Magic Scrolls, Disassemble Another Opcode For The Jukebox, Baby  

----

### Wrapping Up: Memory Is Dope, You Can Do Dope Stuff With It, Such as...

----
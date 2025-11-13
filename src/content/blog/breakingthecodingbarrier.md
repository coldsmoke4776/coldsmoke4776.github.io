---
title: "Breaking the Coding Barrier: A Self-Taught Roadmap to Thinking in C"
description: "Part voluntary CompSci syllabus, part masochistic art project: enter the Proficiency Roadmap"
pubDate: "Nov 09 2025"
slug: "breaking-the-coding-barrier"
heroImage: "/wall.jpg"
---

### Introduction

For years, code felt like a glass wall between what I understood in my head and what I could actually do with my hands.
I could read it, talk about it, explain the concepts — but I couldn’t make it work myself.
I was tired of it.

I’ve been in and around security, architecture, and engineering for over a decade, but writing code always felt like peering through the window at a party I wasn’t invited to. I knew what was happening inside, but I couldn’t quite cross the threshold.

Earlier this year, I decided to do something I’d avoided for far too long: start from scratch and teach myself to code like a systems engineer, not a script writer.

No tutorials, no hand-holding, no frameworks. Just C, a text editor, and a roadmap I wrote myself — a kind of homebrewed computer science degree built out of stubbornness and curiosity. ChatGPT has been an excellent teacher and resource, but this isn't cargo-culted. Being able to brief back how every function worked was a non-negotiable.

I called it the C Proficiency Roadmap, and it’s been equal parts study plan, creative challenge, and masochistic art project.

- Stage 1 was about understanding how data moves.
- Stage 2 was about understanding how memory works.

Three months later, I can confidently say: I broke through the barrier.
Not because I can write C fluently yet — but because I finally understand what’s happening underneath every line I write.

---

### Stage 1 - How Data Moves

The idea was to "earn my way back to using helpers and abstractions" by learning things from the <em>ground up</em>.

The things engineers and coders <strong>should</strong> know, but rarely have to implement anymore, I wanted to at least have an example of in my roadmap so I could refer back to them in the future. 

As well as learning data structures, I wanted to build a couple myself!


---

#### The Vector

![VectorVictor](/imagesforarticles/vectorvictor.jpg)

I'd written a bunch of smaller "toy" projects before this, but working through writing a <strong>vector</strong> was the first time I felt like I was really, properly learning how software worked under the hood.

At their simplest, a vector is a generic, resizable array that stores data in it. When it's full, it grows to make sure whatever you're wanting to store in it fits.

If you've ever written something like the following in a higher-level language like JavaScript:

```js
let arr = []

arr.push(10)
arr.push(20)
arr.push(30)

```

Then you've unwittingly used a C-style vector! 

When you use a method like <strong>.push</strong> in JavaScript to add data to an array, the runtime for JavaScript that runs your program does a check  similar to the following, under the hood:

```c
if (length == capacity){
    capacity *= 2;
    data = realloc(data, capacity * sizeof(element))
}
data[length++] = element 

```

The runtime for your JavaScript code checks whether there's enough capacity in the array to store what you're trying to place in it.
If there isn't enough space, it silently expands the memory allotted for your array, copies over your old elements and updates the internal "pointer" that tells your computer where the next free spot is.

You don't see any of this happening, but it <em>is</em> happening. We call this sleight of hand an <strong>abstraction</strong>.

High-level languages like Python or JavaScript are full of abstractions — they make hard things easy and hide the machinery that makes them work.

In my wisdom, however...I decided abstractions were for cowards and wanted to at least once do it by hand.

The .push method doesn't exist in C, so all of those checks and logic needed to be written explicitly. This is what ended up becoming a helper function within my <strong>vector.c</strong> program, <strong>vector_push_back()</strong>.

```c
void vector_push_back(vector_t *vec, void *element){
    // Defensive programming check to handle NULL input.
    if (vec == NULL || element == NULL){
        fprintf(stderr, "function failed to append element\n");
        return;
    }
    //Capacity check to handle the "If length == capacity, double the capacity and realloc before inserting" task
    if (vec->length == vec->capacity){
        vec->capacity = (vec->capacity) * 2; //Double capacity
        // Reallocate data
        void *new_data = realloc(vec->data, vec->capacity * vec->element_size);
        if (new_data == NULL){
            fprintf(stderr, "reallocation failed\n"); //Checking if reallocation failed
            return;
        }
        vec->data = new_data;
        // We don't know the size of data because its a void, so we can't do pointer arithmetic on it. So, we cast to char which advances in bytes.
    }
    void *destination = (char*)vec->data + (vec->length * vec->element_size); // Jump forward length * element_size bytes to find next free slot.
    memcpy(destination, element, vec->element_size); // Copy element_size bytes into that slot we just made.
    vec->length++; //Increment length
    return;
}

```

Let's break this down into byte-sized chunks (boom, dad joke) and see what we had to do to get this to work:

```c
 // Defensive programming check to handle NULL input.
    if (vec == NULL || element == NULL){
        fprintf(stderr, "function failed to append element\n");
        return;
    }
```
This is what we call a <strong>defensive programming check</strong>. The defensive checks are there to catch mistakes early — the kind that’ll otherwise blow up 200 lines later and ruin your day.

This process of fault-finding after the fact is what we call <em>debugging</em>.

The check here defends against either there being no vector to put data in (vec == NULL) or no element to put in the vector (element == NULL).

The || symbol is what we call an OR operator and can be read as follows: "If vec is equal to NULL OR element is equal to NULL, do the following code in the curly braces".  

Asking our programs to do something only if certain things or combinations of things are true is called <strong>conditional logic</strong> and are a core part of ensuring proper control flow throughout a program.

Next, let's look at the core body of the vector_push_back() function:

```c
 //Capacity check to handle the "If length == capacity, double the capacity and realloc before inserting" task
    if (vec->length == vec->capacity){
        vec->capacity = (vec->capacity) * 2; //Double capacity
        // Reallocate data
        void *new_data = realloc(vec->data, vec->capacity * vec->element_size);
        if (new_data == NULL){
            fprintf(stderr, "reallocation failed\n"); //Checking if reallocation failed
            return;
        }
        vec->data = new_data;
        // We don't know the size of data because its a void, so we can't do pointer arithmetic on it. So, we cast to char which advances in bytes.
    }

```

Remember, we can't just use vec.push because it doesn't exist in C - we have to do that check, double and copy work ourselves!
The vector <em>type</em> didn't even exist, we had to define our own type (vector_t) which we then take in as a parameter (vec)!

We use the if statement at the top to check whether the value of the length property of our vector (an instance of our vector type) was equal to its capacity. If it is, the following happens:

- The capacity property's value doubles, doubling the space within the vector.
- A temporary variable *new_data is created and the old data copied into it using a built-in function of C called realloc.
- A defensive programming check occurs to see if that reallocation actually worked or not.
- The vector we're working with's data property has its value changed to that of new_data. 

Lastly, let's look at the last chunk of that vector_push_back() function:

```c
void *destination = (char*)vec->data + (vec->length * vec->element_size); // Jump forward length * element_size bytes to find next free slot.
    memcpy(destination, element, vec->element_size); // Copy element_size bytes into that slot we just made.
    vec->length++; //Increment length
    return;

```

To take it home, what we need to do is tell the computer where the next free block is, so we can place the information we want to store in the vector (element) there.

To do that we create a pointer (which points to a location in memory) and assign it the value of wherever the vector's data property was before, and then "jump forward" a number of bytes equal to the vector's length property multiplied by the element_size.

So if data's value was 12 bytes, length was 6 bytes,  and element_size was 2 bytes, the value of * destination would be 12 + (6*2), which is 24.
That's our first free slot.

Then, we use C's built-in memcpy function to copy the element we want to store into the vector at that free slot and increment the length property to ensure we're doing all the bookkeeping right.

Writing my own vector taught me that most “data structures” are just memory with rules. Once you see that, it all starts feeling a lot more sensible and fair.

---

#### The Linked List

The vector taught me how data moves, the linked list taught me how it connects.

Linked lists are chains of individual structures called <strong>nodes</strong>. Each node holds data and a pointer to the next node in the list.

After a while, you get something that looks like this:

```css

[HEAD] → [DATA|NEXT] → [DATA|NEXT] → [DATA|NULL]

```

No indexing, no magic - just a bunch of node structures holding hands under the hood!

Fun part - C doesn't have a linked list OR a node type out of the box, so we have to create both types as structures to get this to work, like so:

```c
typedef struct node {
    void *data;
    struct node *next;
} node_t;

```

A lot of the time, you have to explicitly <em>create</em> the things you need to get C code to do specific things you want it to do.
This can be a triple-edged sword, though. I know triangular swords don't exist, but bear with me here.

It gives you an insane amount of control, it runs absurdly fast, but it also lets you fuck up in a range of ways that would be legitimately hard to do in higher-level languages.

With a pointer linking each node to the next, I'd created what we call a <strong>recursive data structure</strong>, a structure that points to itself.

Removing a given element from the list, adding an element to the front or back of it - it's all just pointer surgery, reconnecting the links and making sure it all works afterwards.

This involves a lot of walking through memory and I learnt so, so much.

Linked lists sounded like witchcraft a few months back, now I know that they're just friendship bracelets made out of memory chunks.

---

#### Stringlib

![char](/imagesforarticles/char.jpg)

To complete the Masochism World Tour for Stage 1 of my roadmap, I decided to tackle something that I'd worked with in higher-level languages, but never in C - <strong>strings</strong>.

In languages like Python and Javascript, you can create a string really easily:

```js

const string1 = "I have a theory about strings";
const string2 = "Ooh, sounds complicated..."

```

Print them, pass them, stick 'em in a stew - do whatever you like with them!

But in C, there is no built-in string type like there is in languages like Python and JavaScript. A "string" in C is just a series of bytes that happens to end with '\0'.

We use a type called <strong>char</strong> to indicate that we're storing characters in that data structure, like 'apple' or 'dog'. We then <strong>have</strong> to place a special character at the end called a <strong>null terminator</strong> to tell the computer that that's the end of the string.

So in C, string1 would look like so:

```c
const char *string1 = "I have a theory about strings\0";

```

If you don't null terminate, you can cause all sorts of memory problems down the line - but that's a story for another article!

You can include a pre-built set of standard functionality to work with strings by adding <strong>#include < string.h ></strong> at the top of your C file. This includes the string.h <em>header file</em> and allows you access to functions like strcpy and strlen to do common string operations. 

Just once though, I wanted to write my own version, so I know how they work on the inside. Earning my way back to abstractions, and all that.
Here's a simplified version of my matt_strcpy function:

```c
char *matt_strcpy(char *dest, const char *src) {
    if (!dest || !src) return NULL;

    char *d = dest;
    const char *s = src;

    while (*s != '\0') {
        *d++ = *s++;
    }
    *d = '\0';
    return dest;
}

```

We take in a destination string dest, and a source string src as parameters for the function and do the following:

- Check for no destination string OR source string,
- Establish a temporary variable called *d and copy the destination string into it.
- Do the same thing for the source string, in a temporary variable called *s.
- Cycle through the *s string and copy each byte into the *d string until we hit the null terminator '\0\.
- Add the '\0' to *d and return the destination string we wanted the source string copied into.

You wanna know how easy this is to do in Python?

```python
src = "Hello, world!"
dest = src

```

Two lines. Two f**king lines, dude.

![Python](/imagesforarticles/twilight.jpg)
<strong> Python when you need to copy a string's contents</strong>

![BenAffleck](/imagesforarticles/benafflecksmoking.jpg)
<strong> C when you need to do the same thing</strong>

---

### Stage 2 - How Memory Works

If Stage 1 taught me how data <strong>moves</strong>, Stage 2 taught me where it <strong>lives</strong>. 

This was where I stopped thinking about “variables” and started thinking about addresses, blocks, and bytes. Every allocation, every pointer, every malloc felt like a deal I was making directly with my computer’s memory.

It was the first time I truly understood what manual memory management really meant — and for me, it marked the point where I broke the coding barrier. 

I wasn’t just learning to code anymore; I was starting to see the Matrix behind it. This stage was a quantum leap in understanding <strong>why</strong> my code worked, not just <strong>that</strong> it did.

---

#### The Allocator

![Lego](/imagesforarticles/lego.jpeg)

One of the scariest things about learning C is that it doesn't do a process called <strong>garbage-collection</strong>.

Higher-level languages like Python and JavaScript quietly manage memory for you — allocating and freeing it behind the scenes so your code doesn’t eat shit immediately.

With C, that low-level Lego is <em>all yours</em> to manage. Oooh, fun!

Instead of asking the OS for memory every time you need it, you allocate a chunk up front and slice it up into smaller <strong>blocks</strong>.
When you're done with a block, you free it up and throw it back onto the free list for something else to use it.

You'd normally use an <strong>allocator</strong> function like malloc() and free() that comes in C's standard library of functionality (libc) to do this.

As a training tool though, I wanted to know <em>how malloc worked</em> underneath the hood.

The following lines are the heartbeat of my allocator:

```c
// capture the first block/head of the linked list - we are storing the pointer we'll return to the caller
void *block = allocator->free_list;
// Now, we need to advance the list safely - we're going to use memcpy
void *next;
memcpy(&next, allocator->free_list, sizeof(next));
allocator->free_list = next;

```
Let's break down what this code is saying:

"Take the first free block of memory, then move the list forward to the next one."

If that looks familiar — it should. It’s basically the linked list from Stage 1, but now it’s managing chunks of raw memory instead of nodes.
It works like so:

- Each free block points to the next one in line.
- When you allocate, you pop a block off the front.
- When you free, you push it back on top.

Once I saw that, everything clicked — C's memory management genuinely <em>isn't that scary</em> once you understand the most basic parts.
Everything else is built on top of stuff like this, and the rest is just book-keeping!

---

#### The Memory Pool

![Pool](/imagesforarticles/pool.jpg)

Different from an allocator, a <strong>memory pool</strong> is one of the simplest, fastest forms of memory managemen.

It’s basically a big, pre-allocated buffer of memory that you carve up as you go. 

No recycling, no free list, no drama. Just a straight line through memory until you run out of space. Love it!

Instead of juggling all of those reusable blocks like we had to with the allocator, we just have to keep track of one movable "bookmark" to know how far into our pre-allocated buffer we are. This is called an <strong>offset</strong>.

The allocator was all about organizing memory, the memory pool was about <em>aligning it properly</em>.
At first glance, this code looks like arcane witchcraft:

```c
uintptr_t cur = (uintptr_t)p->buffer + p->offset;
uintptr_t aligned = (cur + (align - 1)) & ~(uintptr_t)(align - 1);

```

But it's genuinely a lot simpler than it looks!
Let's start by breaking down what we mean by "alignment".

When you store data in memory, it turns out that <strong>where</strong> you put it matters. Your CPU doesn’t like it when data that spans multiple bytes of memory (like integers or pointers) starts like...halfway between memory boundaries.

CPUs expect things to be neatly lined up. You know how a core part of you just immediately goes "f**k that guy" when you see someone parking their truck sideways across two spaces instead of parking properly in a marked bay?

Alignment is how we ensure we're not <em>that dickhead</em> in RAM.

The math in the above code took me longer than I'd like to admit to get my head around, but here's the analogy that really made the penny drop for me:

> Imagine a ruler laid along memory with tick marks every align bytes (like fence posts every 8 bytes). You have a current pointer cur (somewhere between two posts). You want to snap cur forward to the next fence post (or stay on it if you’re already on one). 

> We do two simple moves to snap to a post: Step forward a little (cur + (align - 1)) so you’re guaranteed PAST the post if you were partway through a block. Chop off the remainder by clearing the low bits — that drops you down to the start of the post gap you landed in. Now, you're aligned properly.

That really is all those two lines are doing:

- (cur + (align - 1)) moves the pointer forward past the next aligned address - to ensure we're between the NEXT two fence posts.
- ~(uintptr_t)(align - 1) snaps the pointer back to exactly that aligned address.
- Now, we're neatly aligned with the block boundaries and the CPU won't throw a fit!

![Interstellar](/imagesforarticles/interstellar.jpg)

The result is lightning-fast memory management with almost no overhead! 

Realistically, I still use malloc() and free() but I learnt a LOT from doing it the hard way on this one.

This was where I truly "crossed the Rubicon" and felt like I was actually getting somewhere.

---

### Wrapping Up - How I Learned To Stop Worrying And Love The Malloc()

I didn’t learn all this by locking myself in a cave with a box of scraps and a compiler.

This was a three-pronged attack: a mix of judicious AI usage, old-school textbooks, and a whole lot of straight-up rapid-fire failure.

---

#### Using ChatGPT as a Partner, not a subordinate

Working with ChatGPT wasn’t about getting answers and copying the code — it was about learning to <strong>think in code.</strong>

Use ChatGPT's "Study and Learn Mode" and explicitly tell it to only write pseudocode for you. Don't use ChatGPT to spit out code; use it like a Socratic sparring partner.  

If you don't understand what you wrote, then it doesn't go in your code. The reasoning, the debugging, the trying - it has to be yours. The model is there to check your instincts, it's not there to tell you the answer.

We’d build functions line by line, with me writing the code from a function "contract" starting point, breaking down what the function was meant to do. I'd give it a complete blind try with no help at first, and then ChatGPT acted like a grizzled mentor pointing out logic gaps, nudging me toward better structure. Never did it just print out the whole answer, and I never copied and pasted anything wholesale.

No cargo-culting, no blind copy-paste. Every line I wrote, I understood and actively back-briefed back at the end of every program.
That zero-shortcut rule was the <strong>whole point</strong>. 

I didn’t want to learn what to type, I wanted to learn how to think like an engineer.

<strong>Try the following prompt to do this yourself:</strong>

> "You are my coding mentor for [LANGUAGE/TECH]. Teach me step-by-step. Do not write full solutions; give me pseudocode, small hints, and feedback on my reasoning. Work one small change at a time and stop to ask me questions before proceeding. Ask me to explain each line and to predict outputs/edge cases before we run. Keep any code snippets under 10–15 lines unless I ask otherwise. Treat this like a Socratic workshop, not a tutorial. If I can’t explain my own code out loud, assume I don’t understand it yet — test me early and often and make me earn it."

---

#### Stacking Paper Up To The Ceiling, Yo

![effectivec](/imagesforarticles/effectivec.jpg)


Books like Effective C, Head First C and The C Programming Language grounded me in actual theory. 

They gave me the “why” behind the syntax — the theory, the patterns, and the rules that make C (and by extension, every language I want to learn) tick.

The best way to describe it: ChatGPT helped me move faster, the books helped me understand what I was doing at the bedrock.

For C, I cannot recommend Robert Seacord's <em>Effective C</em> highly enough, and also frequently refer back to the following online resources that I class as "basically books at this point":

- [Beej's Guide to C Programming](https://beej.us/guide/bgc/html/split/index.html)
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/html/split/index.html)
- [DevDocs.io for C](https://devdocs.io/c/)

---

#### Seize the keys to production systems, all you have to lose are your chains! (or whatever Marx said)

And then there was the third leg of the stool: trying a LOT of shit and failing a LOT.
I broke things constantly. Nothing worked first time.

Who the f**k cares?

Every bug is a breadcrumb — a tiny lesson in how computers really work under the hood. Once you get it this way, you <strong>really</strong> get it in a way that no Youtube video or lesson will ever manage.

By the end of Stage 2, I wasn’t afraid to fail anymore. I started chasing bigger, more interesting routes to failure <em>on purpose</em>, because that’s where the fun hides.

---

This roadmap has been one of the most impactful things I think I've ever done for myself, and I cannot recommend doing something similar for yourself enough.

Happy bug hunting, and sláinte!

Matt/jawndeere



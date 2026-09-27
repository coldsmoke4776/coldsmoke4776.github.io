---
title: "Learning the Low-Level Stuff: Following File Descriptor 3 from `strace` to eBPF"
description: "One tiny C++ program, a repeatedly reused file descriptor, and my first stateful eBPF probe—from strace output to security telemetry."
pubDate: "Sep 25 2026"
slug: "from-strace-to-ebpf"
heroImage: "/imagesforarticles/ebpf.png"
---

# From Syscalls to Signals: Building a Tiny eBPF File-Lifecycle Tracer

## Introduction

Since I really fell in love with coding and engineering, I've consistently been asking "Oh <strong>SHIT</strong>, that's cool - how does <em>that</em> work?" and diving down that next layer:

- JavaScript/React for web design which was my original desire to learn to code,
- Python to try and learn to script (which I still need to do),
- Raw C, which for some reason I just <strong>got</strong> and fell in love with.
- C++, when I wanted to really bed down and pick one language to try and master, usable both for normal software and the game dev I've become really passionate about the last year or so.

I'm sure the levee will break eventually and I'll start working on learning x86 assembly, and I will then become truly insufferable.

Also, my roles over the last half-decade or so spanning both offensive security and defensive security have driven this growing desire to dive deeper and deeper down the toolchain towards the CPU itself.

Starting work at a company specializing in EDR,network telemetry and detection in general has given me this whole new playground of cool shit to research, and I've developed a deep fascination with how the computer actually tracks activity.

The hackers try and avoid being caught, the analysts try to catch them - it's detective work in its purest form. 

In this writeup, we're going to follow one little program from source code to the syscall boundary, looking at both strace and eBPF.


## The Intentionally Boring Program

Much like the previous writeup, I needed to write something to instrument if I was going to learn to interface with traces and eBPF. 

This was all about watching syscalls, and those calls don't need to be complicated for this experiment to be valuable, so I just focused on writing something that did a few really simple things:

- Includes,
- Opening a file that wasn't embedded in the source,
- Printing out those lines to console.

Intentionally boring, intentionally easy to trace exactly what each action looked like in the traces. The code is below, if you're interested or want to copy it:

```cpp
#include <fstream>
#include <iostream>
#include <string>

int main(){
    std::ifstream file("message.txt");

    if (file.is_open()){
        std::string line;
        while (std::getline(file, line)){
            std::cout << line << "\n";
        }
    }
}
```

Here's what message.txt says:

```text
Hello from userspace, friends!
This is the second line of the file, lets see if the program reads it?
Maybe even...a third?
```

<!-- Briefly describe ifstream, getline, cout, and the initial expectation of simple file I/O. -->

For those not fully C++ pilled:

<strong>std::ifstream</strong> is the standard library's input file stream type. Constructing `file` with `"message.txt"` asks it to open that path for reading and gives the program a stream
interface for consuming its contents.

<strong>std::getline</strong> is a standard-library function. It reads characters from an input stream into a `std::string` until it reaches a newline. In this program, it keeps reusing the
same `line` string on each pass through the loop.

<strong>std::cout</strong> is the standard output stream object. The `<<` operator inserts each line—and then a newline—into that output stream.

The `std::ifstream` object is created before the `if` statement. `file.is_open()` checks whether the file was opened successfully. If it was, `std::getline` reads one line at a time and
`std::cout` writes each line to standard output until the stream reaches EOF.

If the open fails, the body never executes and the program exits silently. 

That seemingly boring behavior becomes useful later when we deliberately run the program from the wrong directory.

<em>oooooooh.....foreshadowing.....</em>


## First Angle: `strace`

<!-- Explain that the first surprise was how much happened before main/source-level file handling. -->
First, we're gonna take a look at our boring program with a utility called <strong>strace</strong>. 

strace observes the system calls and signals exchanged between a Linux process and the
kernel. It can also inject faults deliberately, but here I’m using it purely for
observation.

You'd think that such a simple program wouldn't generate all that much in terms of activity. And you'd be wrong.

It generated a crap-ton of it, as you can see below:

```text
openat(AT_FDCWD</home/matt/Documents/Labs/syscall-lab>, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3</etc/ld.so.cache>
mmap(NULL, 70111, PROT_READ, MAP_PRIVATE, 3</etc/ld.so.cache>, 0) = 0xed4cc8597000
close(3</etc/ld.so.cache>) = 0

openat(AT_FDCWD</home/matt/Documents/Labs/syscall-lab>, "/usr/lib/aarch64-linux-gnu/libstdc++.so.6", O_RDONLY|O_CLOEXEC) = 3</usr/lib/aarch64-linux-gnu/libstdc++.so.6.0.35>
read(3</usr/lib/aarch64-linux-gnu/libstdc++.so.6.0.35>, "\177ELF...", 832) = 832
mmap(0xed4cc82f0000, 2715784, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3</usr/lib/aarch64-linux-gnu/libstdc++.so.6.0.35>, 0) = 0xed4cc82f0000
mmap(0xed4cc8571000, 73728, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3</usr/lib/aarch64-linux-gnu/libstdc++.so.6.0.35>, 0x281000) = 0xed4cc8571000
close(3</usr/lib/aarch64-linux-gnu/libstdc++.so.6.0.35>) = 0
```

The entry point for the C++ I wrote is the int main() function, which contains the real "application" - if you can call it that.

Before we ever reach int main() though, an absolute ton is happening behind the scenes.

When the program is built, the compiler and linker record which shared libraries the
executable depends on. When the program actually starts, the dynamic linker locates and
maps those libraries before control ever reaches `main()`.

Without those shared libraries, every executable would need to carry its own copy of a lot of common functionality, like reading files, doing math, printing to console etc. Instead, libraries such as the C++ standard library can be mapped into multiple processes as needed.

In the Linux operating system, the dynamic linker consults a binary cache (a lot like caching content, where previous results are stored for quicker lookup) at /etc/ld.so.cache. This is not a repository OF libraries, it simply helps locate libraries.

Then we move on to the next set of syscalls:

- <strong>openat</strong> opens the cache and gives it a file descriptor (FD) of 3.
- A <strong>file descriptor</strong> or FD for short, is an integer local to the process it's assigned to (for example, the one running our program) that is used as a reassignable indicator of what that given FD number refers to <em>right there and then.</em>
- FD 3 could be being used all over the place, it's not a globally unique value, it's just referring to this process and this time.
- <strong>mmap</strong> maps the contents of the cache into the process's virtual address space.
- <strong>close</strong> releases FD 3, making that descriptor-table slot available again.

We then see the same set of syscalls being done again on the C++ standard library, with a few extras.

- The linker opens up /usr/lib/aarch64-linux-gnu/libstdc++.so.6 and because it is the lowest available file descriptor, we get FD 3 again!
- The <strong>read</strong> syscall returns the beginning of the file, including the `\177ELF` signature that identifies it as an ELF binary. I'm sure I'll do an article on ELF binaries at some point, but for now, just remember that ELF is the standard format used for Linux executables and shared libraries.
- The dynamic linker parses the ELF metadata and uses <strong>mmap</strong> to create memory regions with the required permissions. In this trace, one region is readable and executable while another is readable and writable.
- <strong>close</strong> then releases FD 3 again. The library mappings can remain in
place after the descriptor closes.

You're seeing 3 repeatedly as a file descriptor because that slot as lowest available is closed and reused over and over.

Also, it's really important to remember that just because mmap worked successfully as a syscall, all that really means is that the mapping worked, not that any code ever got successfully executed.

Then, the source-level file operation appears:

```text
openat(AT_FDCWD</home/matt/Documents/Labs/syscall-lab>, "message.txt", O_RDONLY) = 3</home/matt/Documents/Labs/syscall-lab/message.txt>
read(3</home/matt/Documents/Labs/syscall-lab/message.txt>, "Hello from userspace, friends!\nThis is the second line...", 8191) = 124
read(3</home/matt/Documents/Labs/syscall-lab/message.txt>, "", 8191) = 0
close(3</home/matt/Documents/Labs/syscall-lab/message.txt>) = 0
```

Something super interesting happened here. The program prints three lines, so the loop body runs three times—but `std::getline` is actually called a fourth time to discover that there's nothing left to read.

That still doesn't require four kernel reads. The stream buffer requested up to 8,191 bytes, and the kernel returned the entire 124-byte file at once. The first three successful `std::getline` calls consumed lines from that userspace buffer.

The fourth call exhausted the buffer and caused another `read`. This time the kernel returned 0, indicating end-of-file, so the loop stopped.


## From a Broad Trace to a Specific Capture

Strace and bpftrace are similar programs, and you can think of them as showing two sides of the same coin, though they don't hand off execution to one another.

One is <strong>process-centric</strong> (strace) and the other is <strong>event-centric</strong> (bpftrace).

The below diagram is a really good way to think about where strace "ends" and bpftrace "begins":

```text
  userspace program
        │
        │ syscall request
        ▼
  syscall boundary       ← both tools can observe this
        │
        ▼
  kernel implementation  ← bpftrace can also attach deeper here
```

Both programs observe the <strong>syscall boundary</strong> - the point at which my userspace program begins making requests of services within the Linux operating system kernel.

Strace is what you use when you want "Follow THIS *process*, and show me the chronological timeline of the syscalls it makes".

Bpftrace is what you use when you want "Attach yourself to THIS *event*, show me ONLY the stuff I tell you to, preserve the state that I actually care about".

One gives you the process narrative, the other lets you design the sensor - see what I mean about two sides of the same coin?

There are some tradeoffs involved in using both tools:
- strace gives you broad visibility automatically, but it can be super noisy.
- bpftrace can look deeper into the kernel using tracepoints, kprobes and hooks, but if you don't tell the probe to capture an event, it absolutely will not capture it and that activity remains invisible.

If you're familiar with how a SIEM works, think of it this way.

Bpftrace is way closer to writing a sensor than it is doing a SIEM query. SIEM queries are for data already collected and stored, bpftrace predicates decide which events leave the kernel as output for your probe. 

You can't run a query over data you never collected!  *taps forehead*


## Entry Is Intent; Exit Is Outcome

I briefly mentioned tracepoints in the previous section, so it's worth defining exactly
what they are.

A tracepoint is basically a predetermined "hook" point built into the Linux kernel at a specific event, kinda like the specific rocks on a bouldering wall that tell you which way a given route goes.

When program execution reaches a tracepoint, programs like bpftrace can attach a BPF program and observe the information the kernel exposes at those tracepoints.

Tracepoints are a little different from breakpoints in debuggers, like the one I used in the last article. Debugger breakpoints pause the process, tracepoints merely observe the events as they pass by, like a battleship leaving a port.

Linux exposes separate tracepoints for <strong>entering</strong> and <strong>exiting</strong> the <strong>openat</strong> syscall:

- `tracepoint:syscalls:sys_enter_openat`
- `tracepoint:syscalls:sys_exit_openat`

"sys_enter_openat" shows what the process representing my program requested, and fired before anything like path determination or even permission checks happened by the kernel.

By itself, that proves only that the operation was *attempted*, not that it **succeeded.**


"sys_exit_openat" shows how the operation concluded, and contains the return value, but not the original filename telling us we're dealing with the same file.

By itself, that tells us how an `openat` call **concluded**, but not which entry-time pathname *produced* that outcome.

To truly connect the request to its result, we need to preserve the filename from entry until the same thread reaches the exit tracepoint:

Here's how we do that in the BPF probe:

```bpftrace
tracepoint:syscalls:sys_enter_openat
/comm == "syscall_lab"/
{
    @tracked[tid] = 1;
    @filename[tid] = str(args.filename);

    printf("dfd=%d file=%s flags=0x%x mode=0%o\n",
            args.dfd, str(args.filename), args.flags, args.mode);
}

tracepoint:syscalls:sys_exit_openat
/@tracked[tid] == 1/
{
    printf("file=%s ret=%d\n", @filename[tid], args.ret);

    delete(@filename[tid]);
    delete(@tracked[tid]);
}
```

At entry, the probe stores the filename and a numeric tracking marker under the current
**thread ID (TID/tid)**. 

When that thread reaches `sys_exit_openat`, the probe retrieves the filename and prints it beside the return value.

TID is the correct key for this short-lived state because modern processors commonly use multiple execution threads at once (unsurprisingly called **multithreading**) so multiple *threads* in the same *process* can have different syscalls in flight simultaneously. 

Once the request and result have been paired, both temporary map entries are deleted.

Now we've got the request and the result paired up and we know for sure we're dealing with both ends of the same entity, we can run a little experiment.

Same executable, just a different working directory. Let's see what happens!

First, I ran the executable from the directory that included "message.txt" and got the following:

```text
dfd=-100 file=message.txt flags=0x0 mode=00
file=message.txt ret=3
```

- The first line comes from **sys_enter_openat** where it recorded the request and captured the filename like we asked.
- The second line comes from **sys_exit_openat** where it recovered the saved filename we asked it to and printed it out beside the result (ret = 3).

Ret = 3 just means the open *succeeded* and Linux gave it the FD (file descriptor) of 3.

ret=3 answered whether the open succeeded, but it created another question: why did
every successful open seem to return the same file descriptor?


## Following FD 3


We've mentioned **file descriptors** a lot in this article, but let's flesh out our understanding.

A file descriptor isn't a permanent identity for a file, it's a numbered slot in one process's descriptor table. At different times, that slot can refer to a bunch of different kernel objects.

Think of it this way, your name travels with you permanently wherever you go until you change it yourself. When you're at the DMV or the doctor's office, you get given a number that refers to you *while you're waiting to be seen*.

You may be 86 while you're waiting to find out why your knee hurts, but someone else will be 86 tomorrow. It's not a permanent descriptor of you.

The TID-keyed filename map from the previous section only needed to last for the one **openat** call. I need something more long-lived so I can follow the file descriptor until it closes.

We need to track something called a **state lifetime**, which is simply the period through which a saved piece of information is useful. State describing one syscall just needs a lifetime from entry through to exit. State describing an open file descriptor needs to survive until that file descriptor closes.

That means the probe needs three different state lifetimes:

```text
@filename[tid]       one openat syscall
@fd_name[pid, fd]    one live descriptor lifetime
@close_fd[tid]       one close syscall
```

`@filename[tid]` connects one single `openat` entry to the exit. If that open succeeds, the
probe promotes the filename into `@fd_name[pid, fd]`, where it remains associated with
that process and descriptor.

That's how we're tracking the descriptor over the course of its lifetime until it closes.

When `close` begins, its entry tracepoint exposes the FD but not the filename. Because we stored it that way, the probe uses `(PID, FD)` to recover the correct name.

The probe then stores the closing descriptor under TID so it can be paired with the eventual `close` return value we get when the syscall finishes.

```text
pid=4512 comm=syscall_lab dfd=-100 file=/etc/ld.so.cache flags=0x80000 mode=00
tid=4512 file=/etc/ld.so.cache ret=3
close-enter pid=4512 tid=4512 fd=3 file=/etc/ld.so.cache
close-exit tid=4512 fd=3 ret=0
```

This first section shows the complete lifetime of '/etc/ld.so.cache'.

- **openat** successfully returned (ret value) **FD=3** for /etc/ld.so.cache.
- The later **close** targeted that *same* file descriptor (fd=3), recovered the associated filename ("/etc/ld.so.cache").
- Then, it returned 0 (ret=0), indicating the file descriptor has been closed successfully.

Now, FD=3 is free to be reused again.

```text
pid=4512 comm=syscall_lab dfd=-100 file=/usr/lib/aarch64-linux-gnu/libstdc++.so.6 flags=0x80000 mode=00
tid=4512 file=/usr/lib/aarch64-linux-gnu/libstdc++.so.6 ret=3
close-enter pid=4512 tid=4512 fd=3 file=/usr/lib/aarch64-linux-gnu/libstdc++.so.6
close-exit tid=4512 fd=3 ret=0
```

This second section shows the lifetime of '/usr/lib/aarch64-linux-gnu/libstdc++.so.6', or the C++ standard library.

Notice we got ret=3 again, indicating we got FD=3 assigned again? 

Even though we're not opening the same file? What gives?

We got assigned FD=3 again because it was the lowest-available descriptor-table slot, and that's the one that gets reached for first.

Descriptors 0, 1 and 2 were already occupied by standard input, standard output and
standard error, making 3 the lowest available slot in this process.

```text
pid=4512 comm=syscall_lab dfd=-100 file=message.txt flags=0x0 mode=00
tid=4512 file=message.txt ret=3
close-enter pid=4512 tid=4512 fd=3 file=message.txt
close-exit tid=4512 fd=3 ret=0
```

This last section is the lifetime of the file-lifecycle, where my program opens up "message.txt".

Finally, FD 3 was assigned to message.txt. My C++ source never explicitly called close; reaching EOF only stopped the std::getline loop. When the automatic std::ifstream object later left scope (i.e. it left main()), the underlying descriptor got released.

FD 3 was never the permanent identity for any file, it was the doctor's office ticket number for one descriptor lifetime, ready to be reused again once released.

Cool, huh?


## What the Evidence Supports

Now we've reached the "why, as a security person, do I need to give a shit about this?" section.

Building this probe is surprisingly similar to building security telemetry in the MDR/SIEM space.

- The **tracepoints** determine which events were available. 
- The **'comm' predicate** acts a filter before anything gets stored for output - so you're not getting EVERYTHING.
- The **mapping** joined all the short lived events into a full descriptor lifecycle we can trace, like we just did.
- The **printf statements** determine what a consumer downstream of the probe receives as information.

In SIEM terms, this all happened at **collection time**. A query can pore over the information that a sensor produced or a collector gathered. What it *can't* do though, is recover or query information that never got gathered in the first place!

This means any claims I make from a security perspective need to be **bounded** to what I actually observed, not what I can infer from my background knowledge, if I want to be able to directly prove it. Which I do.

My bounded claim is this:

" For the observed `syscall_lab` execution, the probe shows that the process
  successfully opened each reported pathname using `openat`, received the reported
  process-local file descriptor, and later successfully closed that tracked descriptor."

That's narrower (deliberately so) than claiming "This probe proves that `syscall_lab` loaded and executed every library shown, read and acted on the contents of `message.txt`, or performed malicious file-access activity".

Those conclusions would require additional evidence that this probe did not collect.

That's because the probe does not:

- establish *whether* file contents were read or *how* they were used,
- establish whether any of this behavior was *malicious*,
- establish whether any mapped library code actually *executed*.

It just watches the **specific openat** and **close** paths that I selected. It doesn't include any alternatives to them, or any inherited descriptors.

It's just a learning probe, not a production-ready sensor, but it proves what I wanted it to prove!

The lesson here is this: learn the gap between what you **think** happened, what you
**think** you know, and what the evidence from your tooling **actually proves**.

The distinction is important and can save a lot of wasted time and resources.
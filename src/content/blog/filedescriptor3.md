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


## From a Broad Trace to a Specific Question

<!--
Introduce bpftrace and the shift in mindset:
- strace showed the process's broad syscall activity.
- bpftrace let you choose exact kernel tracepoints, fields, predicates, and state.
- Tie source-side filtering to SIEM collection without calling it merely another query.
-->

The kernel exposed these entry fields:

```text
tracepoint:syscalls:sys_enter_openat
    int __syscall_nr
    int dfd
    const char * filename
    int flags
    umode_t mode
    __data_loc char[] __filename_val
```

<!-- Explain why filename requires str(), why dfd is signed, and why flags are useful in hex. -->

## Entry Is Intent; Exit Is Outcome

<!-- Explain TID-keyed state and why an entry event alone cannot establish success. -->

Successful run:

```text
dfd=-100 file=message.txt flags=0x0 mode=00
file=message.txt ret=3
```

Controlled run from `/tmp`:

```text
openat(AT_FDCWD</tmp>, "message.txt", O_RDONLY) = -1 ENOENT (No such file or directory)
+++ exited with 0 +++
```

<!--
Explain:
- AT_FDCWD means relative to current working directory.
- Same request, different resolution context, different result.
- Program silently exits 0 because source has no error branch.
-->

## Making FD 3 Mean Something

<!-- Introduce the four-probe design and the distinction between TID syscall state and PID/FD lifetime state. -->

```text
@filename[tid]       one openat syscall
@fd_name[pid, fd]    one live descriptor lifetime
@close_fd[tid]       one close syscall
```

```text
pid=4512 comm=syscall_lab dfd=-100 file=/etc/ld.so.cache flags=0x80000 mode=00
tid=4512 file=/etc/ld.so.cache ret=3
close-enter pid=4512 tid=4512 fd=3 file=/etc/ld.so.cache
close-exit tid=4512 fd=3 ret=0

pid=4512 comm=syscall_lab dfd=-100 file=/usr/lib/aarch64-linux-gnu/libstdc++.so.6 flags=0x80000 mode=00
tid=4512 file=/usr/lib/aarch64-linux-gnu/libstdc++.so.6 ret=3
close-enter pid=4512 tid=4512 fd=3 file=/usr/lib/aarch64-linux-gnu/libstdc++.so.6
close-exit tid=4512 fd=3 ret=0

pid=4512 comm=syscall_lab dfd=-100 file=message.txt flags=0x0 mode=00
tid=4512 file=message.txt ret=3
close-enter pid=4512 tid=4512 fd=3 file=message.txt
close-exit tid=4512 fd=3 ret=0
```

<!--
Interleave explanation:
- successful open installs a process-local FD,
- successful close frees the lowest slot for reuse,
- mappings can outlive the FD,
- ifstream destructor makes RAII visible as close(3).
-->

## The Bug That Kept the Probe Running

<!-- Tell this as a compact debugging story. The interesting point is a semantically valid but logically wrong pipeline. -->

Before correction:

```text
close-enter pid=4325 tid=4325 fd=3 file=
```

After correction:

```text
close-enter pid=4377 tid=4377 fd=3 file=message.txt
```

<!--
Explain:
- filename state was deleted before promotion,
- missing string lookup returned empty/default value,
- numeric fd_live remained valid,
- verifier-safe does not mean logically correct,
- cleanup belongs after the last downstream consumer.
-->

## What This Means for Security Telemetry

<!--
Develop the MDR/SIEM connection:
- hook selection defines the evidence source,
- predicates filter before storage,
- maps act as stateful enrichment/joins,
- entry/outcome distinction prevents overclaiming,
- omitted events cannot be recovered by a later query.
-->

## What the Probe Proves—and What It Does Not

The bounded claim:

> For the observed `syscall_lab` execution, the probe shows that the process successfully opened each reported pathname using `openat`, received the reported process-local file descriptor, and later successfully closed that tracked descriptor lifetime.

<!-- Explain the limits in prose rather than dumping an enormous list. Include at least: -->

- It does not prove how much content was read or how it was used.
- The open/close probe alone does not prove a library was mapped or executed.
- It does not establish malicious intent.
- It does not cover every file-access mechanism.
- It is a learning probe, not production-safe telemetry collection.

## Conclusion

<!--
Return to the personal arc:
- one week earlier, eBPF and kernel tracepoints were opaque,
- the valuable habit is following evidence and bounding claims,
- the next lab moves to process lifecycle rather than endlessly extending this probe.
End in Matt's voice, not with a generic tutorial conclusion.
-->
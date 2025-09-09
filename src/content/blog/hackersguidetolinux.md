---
title: "The Hacker's Guide To Understanding Linux"
description: "A practical map of Linux’s cryptic folders, explained with a hacker’s eye."
pubDate: "Sep 05 2025"
slug: "hackers-guide-linux"
heroImage: "/imagesforarticles/penguin.jpg"
---

There's always been a running joke between people who use Windows as their daily driver OS and those who use Linux:

- **Windows** holds your hand a lot of the time, and there are a lot of protections to stop you running with scissors.
- **Linux** will happily let you run with scissors, enthusiastically gives you them and pulls out its cellphone to film the aftermath.

Joking aside though, the level of control that Linux lets you have over your filesystem, plus the wide array of free and open-source software/tooling available to those brave enough makes exploring Linux both exciting *and* intimidating to newcomers.

The Linux filesystem does **not** look like the Windows setup 99% of people are familiar with growing up, with unfamilar directory names like **/opt/**, **/var/**, **/bin/**, and **/etc/** having no obvious analog to the unfamiliar.

Don't even get me started on the knifefight that'll occur if you're foolish enough to ask "Which distribution should I try first?" on an online forum...

This guide is for the Linux newbie but also the security professional that needs a refresher on the internals of one of the world's most powerful and widespread operating systems. Any penetration tester will be interacting with Linux systems on near every engagement, as it powers 90% of the world's servers.

Suffice to say, the knowledge is **very** useful! 

In this article, we're gonna take a tour of:

- What a distro(distribution) is, 
- What the main distributions are,
- The main directories in the Linux Filesystem,
- A refresher on Linux file permissions,
- Interesting places to look on engagements.

---

### What *is* Linux and what's a distro?

The story of Linux really starts with an earlier operating system called **Unix**.

![unixlogo](/imagesforarticles/UNIX_logo.png)

Unix was originally written by a group of researchers at AT&T Bell Labs back in the 1960s, involving both Dennis Ritchie and Brian Kernighan. Fun fact, these too were big parts of the development of my favorite language, **C!**.

The idea was that it was a convenient platform for *programmers* to develop and run software on, rather than being expressly aimed at consumer/non-programmers as an audience. AT&T licensed Unix out in the 1970s, leading to a wide variety of paid and academic variants of the operating system becoming available.

Richard Stallman, a programmer then at MIT's Artificial Intelligence Lab, had a goal of creating an entirely free operating systems. He felt users should be able to study the source code of the software they put to use on their devices, and in addition modify and share that software. 

Stallman wrote a collection of free software/software components called GNU, which stands for *"GNU's Not Unix"* and was launched/announced in 1983. The core components that you'll likely bump into are:

- The **GNU Compiler Collection**, also known as **gcc**,
- The **GNU C Library**, also known as **glibc**,
- The **GNU Core Utilities (coreutils)**, which gives us a lot of our commands Linux users are familiar with like **ls** or **chmod**,
- The **GNU Debugger**, also known as **gdb**,
- The **GNU Binary Utilities**, also known as **binutils**, used a lot with assembly and executable code,
- The **GNU Bash Shell**, which is the primary command shell and interpreter for Linux, as well as a programming language in its own right.

One thing GNU was missing to achieve its goal of being a one-stop free and open-source OS though, was an **OS kernel** to handle hardware/software interactions and keep all the lights blinking away.

Enter one Linus Torvalds, a Finnish-American software engineer who developed the **Linux kernel** in 1991. The goal was to be a free replacement for Unix, and very quickly the Linux kernel became the OS kernel of choice for the GNU operating system that the GNU project was working on.

Put the Linux kernel and the GNU components together and you are *off to the races* in terms of being able to run a computer from top-to-bottom and since the 1990s, GNU/Linux have formed the basis of many free and open-source operating systems.

An operating system using Linux as its OS kernel is called a **Linux distribution** or **distro** for short, and there are *lots* of them to choose from. The main ones you're going to want to be familiar with are:

![mint](/imagesforarticles/hellyeahmint.jpeg)


- **Debian**-based Linux distros, like **Ubuntu** or **Linux Mint** (my distro of choice, personally). These are friendly to new Linux users and very popular for both home computing devices and servers. Easy to learn, easy to maintain and well documented.

![rhel](/imagesforarticles/rhel.jpg)


- **Fedora**-based Linux distros, like **Red Hat Enterprise Linux (RHEL)** or **CentOS**. Very popular for large enterprise deployments, and enterprise support contracts that come along with it too if you're using the paid RHEL version. CentOS and Rocky Linux are free rebuilds.

![kali](/imagesforarticles/kali.jpeg)

- **Kali Linux** and **ParrotOS** - both Debian-based, and based entirely around supplying and supporting tools for security work such as penetration testing. Near-mandatory for most security professionals, awful choice for your daily driver OS. Deploy it to a VM instead, trust me.

![alpine](/imagesforarticles/alpine.png)

- **Alpine Linux**, a small and lightweight distribution of Linux popular for containers. Fun fact, one of the few popular distros not to use glibc or the coreutils of GNU!

![whoislinus](/imagesforarticles/whoislinus.jpeg)

- **Arch Linux**, a hardcore distro of Linux where the user is expected to configure all of their own utilities. There has never been a "surprise Arch user". people who use it are biologically incapable of keeping that information silent. I think it's something that comes with the package manager?

![gentoo](/imagesforarticles/gentoo.jpg)

- **Gentoo Linux**, an interesting Linux distro where the code is compiled locally by the user to allow for *machine-specific* customization and some pretty awesome speed improvements. Definitely **don't** start here!

Now you know the main distributions (and memes) that comprise the Linux ecosystem. Have fun agonizing over which oen to use and relentlessly gatekeeping - just as Linus Torvalds intended (probably).

----

### The Linux Desktop Environment & Filesystem

... under construction ...
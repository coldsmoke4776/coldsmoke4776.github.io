---
title: "Pthreads & Concurrency: Rapido Levels Up"
description: "Lots of work and research resulted in a quantum understanding leap!"
pubDate: "Sep 28 2025"
slug: "rapido-levels-up-concurrency"
heroImage: "/imagesforarticles/rapidoconcscreen.png"
---

[Under Construction]

---

### Background - what the hell is Rapido?

(summary utilized from my previous Rapido post)

Rapido is my version of a basic hacker's tool called a **port scanner**. 

You fire one at an *input* of some kind, often a .txt file of IP addresses, a network range in CIDR notation (/24 etc.) or just a single IP address. In addition, you feed in a starting port and an ending port to build a *port range*, and you set it off.

Your port scanner reaches out to each target in turn, attempting a connection with each port in the range and feeding back what it recieves back to you. The idea is, you use that information to decide what to do next in the attack lifecycle.

One of the most famous port scanners (I know it's not *just* a port scanner, but bear with me) is called **Nmap**.

![Nmap](/imagesforarticles/Nmap.jpg)

Nmap, per Wikipedia, was launched in September 1997 - making it a good chunk older than a bunch of people that currently hold the OSCP, which is objectively hilarious.

It has been fleshed out enormously over that time, expanding well beyond the original scope of port scanning into a fully fledged network scanner that can detect services, scan for specific vulnerabilities and execute scripts, as well as output data in a variety of useful file formats.

Creating "diet Nmap" was *not* my goal when creating Rapido. Creating something shockingly fast and easy to get **useful information** from was.

I found during my initial run at OSCP that I struggled to usefully parse and synthesize a lot of the reconnaissance information I was gathering into a concrete set of "next steps", or even just a "next direction". 

To quote the ever-excellent [*The Art of Unix Programming*](https://cdn.nakamotoinstitute.org/docs/taoup.pdf):

> (i) Make each program do **one thing well.** To do a new job, build afresh rather than complicate old programs by adding new features.

**That's what I wanted Rapido to be.**

A fast scanner, with usefully triaged information, and informed next steps for the user.

---

### You Have These Resources, This Primer On TCP/IP Networking....And My Axe!

[Under Construction]


#### Resources

[Under Construction]

---

#### IP Addresses

[Under Construction]


---

#### Ports

[Under Construction]


---

#### Protocols

[Under Construction]


---

#### CIDR, Subnetting & VLSM

[Under Construction]


---

#### The hell is an API? 

[Under Construction]


--- 

### What I THOUGHT would be the hard part: Sockets and Talking With The Sockets API

[Under Construction]


---

### What WAS the hard part: (I) - Parsing f**king arguments

[Under Construction]


---

### What WAS the hard part: (II) - Big-Endian vs. Little-Endian

[Under Construction]


----

### Wrapping Up: Rapido & The Matt-a-Sploit Framework

So, what have we done here today? 

[Under Construction]


Happy bug hunting!

----
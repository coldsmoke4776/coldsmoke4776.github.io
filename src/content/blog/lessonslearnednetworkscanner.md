---
title: "Endianness? Bitwise? Parsing? Lessons Learned Building the Rapido Port Scanner"
description: "Sockets? More straightforward than I thought. Argument parsing, though..."
pubDate: "Sep 14 2025"
slug: "lessons-learned-network-scanner"
heroImage: "/imagesforarticles/hardwork.jpg"
---

Back in 2019, I was a professional penetration tester and I decided to take a stab at the [(Offensive Security Certified Professional (OSCP)](https://www.offsec.com/courses/pen-200/) certification. 

![OSCP Logo](/imagesforarticles/OSCP.png)

It's a pretty difficult hacking certification that tests a bunch of related skillsets, like your reconnaissance, enumeration and exploitation skills - culminating in a tough 24-hour exam where you get put to the test!

I didn't pass back then, I'd only just qualified professionally and in all honesty probably took on too much, too fast. I burnt out hard and didn't enjoy the process of learning. I forced the information in, it felt like a grind and eventually I took my try at the exam out of mostly obligation and unsurprisingly, didn't pass.

A **lot** has changed in the last seven years. 

I've spent near a decade in IT (2026 will mark my 10th year since starting) and cybersecurity and I've spent time in a bunch of different areas of the field. 

I've consulted, I've project managed, I've pentested, I've internal audited and now I put all of that to work help our salespeople at Bishop Fox close deals and make our clients more secure.

So in 2026, I thought I'd make a concerted run at passing OSCP once and for all, for an entirely different set of reasons:

- I have discovered a new-found **fire** for low-level systems programming, assembly, and exploit research I never had back in 2019.
- I have a decade of real-world technical context to place that exploitation knowledge into.
- I've learnt a *lot* about how code works under the hood and how execution flow gets represented in memory. 
- Knowledge at that level is a big part of not just the buffer overflow piece of not just the OSCP course, but also the **Offensive Security Exploit Developer (OSED)** certification the OSCP's a prequisite for. I would *love* to do the OSED one day!
- Most importantly, for the first time in years - **all this stuff's FUN again, man. Truly, authentically FUN.**

A big part of that effort was making sure I understood *every part* of *every tool* that I used. So I decided to write a bunch of my own!

Enter.... **Rapido**!

---

### First off, bud - what the hell is Rapido?

Glad you asked, Mr. Rhetorical Question!

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

![synackmeme](/imagesforarticles/synackmeme.jpg)

Before we jump into the gnarly shit, let's make sure we understand the basic concepts underpinning the things we're going to be dealing with in this article.

I'm also going to share some links to some EXCELLENT resources if you wanna tackle something like this yourself!

#### Resources

- [**Beej's Guide to C Programming**](https://beej.us/guide/bgc/html/split/index.html): I cannot *believe* this is freely available on the Internet. It's detailed, extremely useful and genuinely fun to read. Beej has an excellent sense of humor and this is a fine reference for concepts you will bump into a **LOT**.
- [**Beej's Guide to Network Programming**](https://beej.us/guide/bgnet/html/split/index.html): Again, cannot believe this is free, along with the rest of the guides on Beej's phenomenal (and highly 90s-esque) website. This was INVALUABLE learning about the Sockets API, which we'll get to later.
- [**The Art of Unix Programming**](https://cdn.nakamotoinstitute.org/docs/taoup.pdf): I really liked the philosophical approach to how this text frames writing software. There's a distinct lens of *focus* above everything else - doing one thing great instead of half-assing a bunch of flashy shit.
- [**Effective C (No Starch Press)**](https://nostarch.com/effective-c-2nd-edition): Free? No. Worth the money? Abso-fucking-lutely. This, alongside the book underneath this one, have been my left and right hands not just for building Rapido, but **learning C altogether**.
- [**Head First C: A Brain-Friendly Guide**](https://www.amazon.com/Head-First-C-Brain-Friendly-Guide/dp/1449399916): The *actual* first book I'd hand someone who wants to learn this language. Friendly tone, good sense of humor, intended to be read front-to-back. DO THE EXERCISES AND WRITE THE CODE. DON'T TRY AND OUTCOACH THE COACH!

#### IP Addresses

I assume anyone reading this blog already knows what an IP address is, but if not - here's a quick rundown!

Every device on a network has *two* main ways to be identified:

**Physical (MAC address)**:
Think of this like the serial number burned into the device’s network card. On most machines it looks like **3c:06:30:1a:f5:de**. 
It’s great for finding a device inside a local network (like on a switch).

**Logical (IP address)**:
This is the one you’ll actually work with day to day. It’s more like a mailing address that can change depending on the network you’re plugged into, and there are two versions of the IP protocol - version 4 and version 6.

- An **IPv4** address looks like **10.0.4.30**.
- An **IPv6** address looks like **fd41:5a90:e54d:1:14fc:ccb3:a903:4b78**.

MAC = “who you are physically.”
IP = “where you are right now.”

For Rapido's, we only care about IPv4 for now, because that’s where port scanning and CIDR notation are most familiar for the majority of users - myself included!


#### Ports

Again, I assume most readers know what a port is, but if unfamiliar, here's another quick rundown.

If an IP address is like a *mailing address* that directs you to a house or an apartment building, a **port** is like a direction to a specific 
*room* or *apartment* within that building.

Each service running on a computer will be listening (waiting to receive connections) on a given port, such as:

- FTP (File Transfer Protocol) - Port 21
- SSH (Secure Shell) - Port 22
- Telnet - Port 23
- SMTP (Simple Mail Transfer Protocol) - Port 25
- HTTP (Hypertext Transfer Protocol) - Port 80

So if I am running a web server at my device on **port 80** with an **IP address of 10.0.4.30**, I could direct a connection to that server by pointing it to **10.0.4.30:80.**

There are **65,535** ports, but most common services sit within the port range of **1-1024** and receive the most focus of many hacking attempts (legitimate and illegitimate).

To relate it back to this project, I am directing Rapido to knock on the door of each room/apartment in the building between a given range of port numbers, hence the term "port scanner"!


#### Protocols

..under construction..


#### CIDR, Subnetting & VLSM

..under construction..


#### The hell is an API? 

..under construction..


--- 

### What I THOUGHT would be the hard part: Talking With The Sockets API

..under construction..


---

### What WAS the hard part: (I) - Parsing f**king arguments

..under construction..

---

### What WAS the hard part: (II) - Big-Endian vs. Little-Endian

..under construction..


---

### What WAS the hard part: (III) - Host/Network Byte Order & Dealing with CIDR Ranges

..under construction..


----

### Wrapping Up: Rapido & The Matt-a-Sploit Framework

So, what have we done here today? 

- list
- list
- list

Happy bug hunting!

----
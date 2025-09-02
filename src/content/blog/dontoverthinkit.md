---
title: "Don't Overthink It: Portfolio Sites with GH Pages and Astro"
description: "How I got matttwells.com up and running in a day."
pubDate: "Sep 01 2025"
slug: "pointers-practical-guide"
heroImage: "/astro.jpg"
---



It's more important than ever to have some sort of consistent presence online, especially in an industry as fast-moving as tech.

All of those little things you're doing, all the fires you're putting out at work on a weekly basis?

They're a phenomenal showcase for the experience you've gained over your career and in your spare time.

One of the easiest ways you can put all that hard work to immediate use is by building out a "portfolio site" just like this one!

Before you say "but...but...I'm not a frontend developer and JavaScript is terrifying!" - neither am I, and you don't need to be.

Here's a great way to get started using Astro templates and GitHub Pages.

---


### Step 1: Buy that domain!


- Head to Namecheap, [Google Domains](https://domains.google) — or whoever you trust — and grab a domain.
- For me, it was matttwells.com. Costs about $10–15/year.
- Pro tip: get something simple, memorable, and not hyphenated-to-death.
- Just remember, you ideally want other professionals to see this - its unlikely a hiring manager is going to find www.buddyimforkliftcertified.com anywhere near as funny as you do in a year's time.


---


### Step 2: Find an Astro Template you like!

Astro is a phenomenal example of what we call a **static site generator**.

You can think of static site generators as a "website factory" that gathers up all of your content, all of the templates that you've used, and the data that's meant to go in them - and builds you the complete website.

No databases or fancy server wizardry needed!

Astro isn't the only static site generator out there (Gatsby is another popular SSG) but Astro is very user-friendly and has a lot of beautiful-looking, free and paid themes to choose from at [Astro Themes](httos://astro.build/themes/1).

I chose a terminal-themed Astro template called **Token** because I thought it looked cool, but choose one *you* like! 

Then, on your machine, you're going to want to clone the GitHub repo of the template you've chosen to use:

```bash
git clone https://github.com/ArnavK-09/token-template my-site
cd my-site
npm install
npm run dev
```

That `npm run dev` line will fire up a site that you can view in your browser at a localhost:portnumber address, like localhost:4567. 

Boom, instant starter!


---


### Step 3: Don't let yourself get intimidated - use AI to help at first.

If you're not a frontend developer or you're just starting out, it can look terrifying when the entire project setup appears out of nowhere, and you're like <em>"what the actual hell is packagelock.json???"</em>

So don't be shy about bringing in some help - this is actually something AI services like Claude, Gemini and ChatGPT are very good at.

I pasted the contents of the template's <strong>consts.ts</strong> file (where information that is true across the site is held) into ChatGPT and asked it directly to help me break it down. I asked where I needed to change things to get the site looking <em>mine</em>.

Example of before ChatGPT:

```bash
export const SITE_TITLE = "Token Astro Portfolio";
```

And after ChatGPT:

```bash
export const SITE_TITLE = "Matt Twells · Solutions Architect & Security Explorer";
```

You actually need to change way less of an Astro template than you'd expect to get it off the ground. 

Change placeholder input for your own, put your name where the template stuff was - that kind of thing!


---


### Step 4: To GitHub Pages!

GitHub Pages is an excellent, free option for hosting a portfolio site and Astro works great with it, so that's what I used.

- Create a repository on your GitHub called <strong>yourusername.github.io</strong>.
- My username on GH is coldsmoke4776, so that's what I'd put there. But you would use your own.
- When you're done customizing the template, push your code up to GitHub using the commands below:


```bash
git init
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

If you get errors, tag in your AI to help - it'll normally be something access related and most AIs can help you with Personal Access Tokens or configuring SSH access (my recommendation).


- Go to your repo → **Settings** → **Pages**
- Set the build system to **GitHub Actions**.
- Your Astro template almost certainly comes with a file designed to work with GitHub Actions called deploy.yml
- Once the build action is done, your site will be live at *yourusername.github.io*!


---


### Step 5: It's Always DNS...


- Go to **Settings** > **Pages** in GitHub, scroll to Custom domain, and add your domain (*buddyimforkliftcertified.com*).
- Update your domain registrar’s DNS settings (almost all of them will have direct instruction pages for this) with the GitHub Pages IPs (GitHub gives you these).
- DNS propagation (your domain registar telling the rest of the Internet about your site) can take a few minutes to a few hours, but eventually typing in your domain = your shiny new site.


---


### Step 6: Post about it!

Once your site is live and if you picked a template with an inbuilt blog (like I did) - go to /content/blog/ and try customizing one of the template posts into a writeup of how your experience went!

It would make a great first item in your portfolio!


---


### Step 7: Go learn more stuff!

Use AI to get off the ground and taking action, but now it's your turn to take initiative and go learn how to put the stuff you <em>really</em> want to show off in your site.

Your first step is to go learn more JavaScript to understand the rest of the template files. 

I can highly recommend the book [Eloquent JavaScript](https://eloquentjavascript.net) as a place to start.

Exercism.org also has an incredible [JavaScript track](https://exercism.org/tracks/javascript) that you can use to get up to speed!


---

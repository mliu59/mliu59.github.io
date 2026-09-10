---
title: "Wikispeedruns: A Retrospective"
description: "Retrospective on building Wikispeedruns."
date: 2026-01-10
tags: ["wikispeedruns", "retrospective"]
draft: false
---
Site link: [wikispeedruns.com](https://wikispeedruns.com)
Repo link: [github.com/wikispeedruns/wikipedia-speedruns](https://github.com/wikispeedruns/wikipedia-speedruns)

`Wikispeedruns` is a game where you race from one Wikipedia article to another using only the links on the page. A few friends and I built the website for it back in 2021, and it's been running ever since. After almost five years, the project is now basically in maintenance mode, so this feels like a good time to look back at the project as a whole, and at the higher-level decisions we made along the way.

## How it started

It started during COVID isolation, partly because it was a cool concept with tons of room to explore, and mostly because it was fun. Inspired by YouTube videos and a few existing websites, the first version wasn't a website at all. It was a tournament hosted over a Discord call, with me screensharing a slidedeck of start and end articles while everyone raced in their own browsers. Wanting to streamline that whole process, we brainstormed and decided to build a website for the game. I treated it as a great opportunity to learn what software engineering actually looks like, and as a chance to build something fun with my friends. The slightly longer and more dramatic rendition of the origin story is on the [devblog](https://wikispeedruns.com/devblog).

## What went right

**A lot of learning happened.** This was the goal from the start, and it ended up being the biggest payoff by far. More on that at the end.

**The game outgrew its concept.** What began as a simple single-player sprint turned into a full platform: multiple game modes, async multiplayer lobbies, daily prompts and streaks, achievements, leaderboards, and a pile of community features. Along the way we also survived multiple major refactors of both the frontend and backend, going from hand-written HTML and JavaScript to Vue with a proper build step, and from a plain Flask backend to one with Celery workers and a Redis message broker for the heavier jobs. Each of those was painful at the time and clearly worth it afterwards.

**We got a taste of the whole stack.** MySQL schema design, Flask APIs, frontend rendering, cloud deployments, wrangling the Wikipedia API (including dealing with both frontend rendering and backend service changes that they've made over the past few years), and the day-to-day workflows around each of them. For someone with no formal software engineering training, getting to see all of those pieces fit together was a big deal.

**It grew organically, far more than any of us expected.** This is the part I'm still a little amazed by. We never spent any effort on marketing. Growth was pure word of mouth, and it just kept coming: new users every day from all over the world, new games played, new lobbies created for friend groups and communities. We got featured on multiple forums, including the front page of [Hacker News](https://news.ycombinator.com/item?id=32850856), and Wikimedia Nederland ran a [live Wikispeedrun competition](https://www.wikimedia.nl/wikispeedrun/) at their annual conference using our platform.

We also had some really crazy days with massive influxes of users, almost always driven by a streamer or YouTuber. Funnily enough, many of those creators didn't even use our site (a lot of them just race on native Wikipedia), but we'd still get flooded because we rank so highly on search. And underneath all the spikes, we ended up with an active community that plays and talks on Discord every day, which is incredible to see. A number of competing platforms also spawned as we got popular, which was interesting to keep an eye on, but it didn't really change our path.

**Side projects spun out.** A bunch of exploratory work in graph traversal, web scraping, data labeling, natural language processing, and machine learning all grew out of the core project, mostly in service of generating and categorizing prompts better. Each one was a great opportunity to dig into a niche area I otherwise wouldn't have touched.

## What went wrong

**"Suffering from success".** As proud as we are of the work, some pieces of our backend was simply never designed for high data volumes, most obviously our analytics pipeline and our database design in general being not as optimized as needed. Once the database grew past some threshold, the stats queries started freezing the site. A bandaid fix kept our site up, but it meant going without complete analytics for a few months until we properly fixed it. I don't think we exactly did anything wrong here, since all of this was well outside the intended scope of the project, but we probably could have spent a bit more time studying our design choices before the growth forced us to.

![Suffering from Success (DJ Khaled, 2013)](https://upload.wikimedia.org/wikipedia/en/thumb/7/7d/DJ_Khaled_Suffering_from_Success.jpg/250px-DJ_Khaled_Suffering_from_Success.jpg){h=250}

**Maintenance.** When we started, we didn't understand the level of commitment required to keep a platform like this running, or to support the features we kept proposing. A lot of what we built was built because it sounded cool, which I still think is the right instinct for a creative passion project. But we never treated maintainability as a core requirement, and quietly assumed that someone on the team would keep doing the manual work forever. A few years on, as we all moved into jobs and busier lives, that work increasingly became a burden, and I think we all feel a bit burnt out by it.

The best example is daily prompts and streaks. They're arguably our single biggest retention feature, and they need at least one prompt populated ahead of time every single day. Miss one, and players lose streaks they've built up over months, which is a fast way to lose people.

The same goes for new features and updates. We were extremely ambitious about continuous development on a free, open source game, and the mountain of open issues, planned features, and half-finished pull requests tells that story pretty clearly. We even had a public versioning system that never incremented much. All these features fed a lot of feature creep early on. Achievements, marathon mode, the devblog, and a handful of others all ended up in the same place: launched, loved, and then slowly left behind.

Looking back, I think we should still have gone with our gut and our creative drive to decide what to build. But we also should have thought further ahead about how to preserve the project for the years to come, even if its only a passion project.

**Antiquated frameworks.** The biggest technical pitfall was starting the frontend in plain HTML and JavaScript instead of an established framework like Vue or React. That was arguably a fair choice at the time, since we had less experience and the experienced people were focused on the backend. But the frontend got increasingly bulky and hard to maintain, and the major refactor we eventually did would have been far easier as a starting point.

## What it meant to me, personally

This was my first real exposure to software engineering beyond algorithms courses and hardware-focused mechatronics work. Going in, software meant writing source code. It didn't take long into development to realize that the code is a small part of the picture, and that systems, tools, frameworks, and workflows are most of what actually makes software run. I picked all of that up as we went.

I learned the fundamentals of web frameworks, databases, cloud deployments, and APIs here. It's also where I picked up Python, which is still my primary language today. That know-how gave me the confidence to start building things outside of coursework, and every passion project I've started since traces back to this one.

It was also my first software project with real ownership. Not a homework assignment or a lab task, but something people I'd never met used every day, broke in ways we didn't anticipate, and cared about enough to complain when it went down. That changes how you think about the work.

## Where it stands

`Wikispeedruns` is still up, people still play every day, and we still fix what breaks. We're just not building anything new, and I'm okay with that. It did more than any of us set out for it to do. Thank you to every player who played our game, and especially to those who kept showing up.

If you've never tried it, go [play a round](https://wikispeedruns.com).

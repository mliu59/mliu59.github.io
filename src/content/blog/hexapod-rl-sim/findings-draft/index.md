---
title: "Teaching a Spidertron to Walk"
description: "Findings from an exploratory RL locomotion project: a simulated hexapod, reward tuning churn, and broken physics."
date: 2026-09-17
tags: ["hexapod-rl-sim", "reinforcement-learning", "robotics"]
draft: true
---

Repo link: [github.com/mliu59/hexapod-rl-sim](https://github.com/mliu59/hexapod-rl-sim)

I've wanted to try training robot locomotion with reinforcement learning for a while now — not to read about it, but to actually do it firsthand: build a robot model, drop it into a simulator, and watch it learn to run around. This project is that. It's deliberately exploratory, and the robot is mostly imaginary, so none of the numbers matter on an absolute scale. What I was after was the experience and the lessons, and it delivered plenty of both.

The goal for the first milestone: have a robot run around on flat terrain, following a target vector (heading and speed) that I can change on the fly.

## The tool stack

I went with NVIDIA's Isaac Lab stack, for a few reasons:

- It's the industry standard for developing locomotion policies in sim.
- My compute is fairly limited (one home GPU), so optimized parallel environments help enormously with the speed of iterative exploration — thousands of robots training at once turns each experiment into a coffee-break-sized loop instead of an overnight one.
- It integrates well with RSL-RL as the RL library.
- PhysX is good enough for initial exploration. It has real shortcomings in contact simulation (more on that later — much more), and MuJoCo could be a future upgrade, but it wasn't the bottleneck for anything I wanted to learn here.

PPO was the natural starting point for the algorithm: on-policy, online, trained entirely in sim, and the default workhorse of this whole subfield. The reward mechanism follows from the task: since the objective is velocity tracking, the reward is dense (a tracking score on every tick, rather than a sparse "you made it" bonus), and the policy is goal-conditioned — the setpoints are part of the observation, so one trained network can follow whatever commands you feed it.

## The robot: specs → agentic CAD → URDF

I've always loved the concept of a massive spidertron as a way of navigating complex terrain — terrain where the obstacles are comparable in size to the robot itself — as seen in Factorio.

![Factorio's spidertron walking through trees](./factorio_spidertron.gif)

So the spidertron became the base design, with a couple of modifications. I reduced the leg count from eight to six (I may increase it back later for more redundancy). And with an eye toward possibly building a real robot someday: the Factorio spidertron's telescoping lower leg is gone — if extra redundancy with the knee is ever needed, another revolute joint is a much saner option than a prismatic one — and the whole thing is scaled way down, actuated by hobbyist servos. Three joints per leg, eighteen in total.

![The six-legged spidertron model at its nominal stance](./spidertron_render.png)

The baseline physical assumptions are deliberately grounded in that hobby hardware: inertias estimated from vendor-provided STEP files, torque, range, and power limits derived from the servo spec sheets, and no excess payload for this first iteration. The robot is imaginary, but it's imaginary in a physically honest way — everything downstream respects what real servos could actually do.

The model itself was built with an agentic code-to-CAD pipeline: the robot is a Python program (using [build123d](https://github.com/gumyr/build123d)), not a binary CAD document, and the URDF that Isaac Lab consumes is generated straight from the CAD parameters. This was partly practical and partly an experiment in its own right — a coding agent reasons about parametric geometry far better in code than through renders, so it can iterate on the design, measure mass properties, and validate joints without a human driving a GUI.

## The march task

After using a trivial stand-and-track-height task to shake out the environment, I wanted to explore reward function design on a simple matching task: track a goal-conditioned target speed, no heading tracking yet. Just march.

At the beginning, I was graciously imparting my own expert knowledge of hexapod mechanics onto the policy — by which I mean I prescribed the exact gait I wanted to see. Real hexapods overwhelmingly use the alternating tripod gait: two sets of three legs (front and rear on one side, middle on the other) swinging in antiphase, so the body always rests on a stable triangle. So I wrote rewards for feet being off the ground in those groups, for the two tripods alternating with roughly equal air time, and penalties for behavior that simply didn't use some of the legs.

This ultimately worked decently well — the tripod emerged, and it looks great:

![The march policy walking with a clean alternating-tripod gait](./march_v6_spidertron.gif)

But I spent a *significant* amount of churn and trial-and-error reward tuning to reach the balance where that gait actually emerged. Unbalanced rewards didn't produce slightly-worse walking; they produced entirely different degenerate behaviors — marching in place, hopping around on a subset of legs while the rest stayed curled, and other creative interpretations of my instructions.

![One of the degenerate strategies: pogo-hopping on a few legs](./walk_v8_tripod_hop_spidertron.gif)

All that churn raised the obvious question: was any of this prescription necessary? Would an efficient gait like the alternating tripod emerge on its own, from nothing but exploration and speed pressure from the environment?

### Reaching the limits of the physics engine fairly early

To find out, I set up a simple experiment: maximize travel speed, regardless of direction, with no gait shaping at all. The robot found not one but two exploits, each a layer deeper than the last.

![The energy-pump exploit accelerating indefinitely](./march_free_exploit_spidertron.gif)

**1. The energy pump.** The policy commanded bang-bang leg sweeps way beyond the servos' bandwidth. Ground contact backdrove the joints, and the stiff PD drives fighting those backdriven joints at the solver level injected momentum on every ground tap — accelerating the robot indefinitely, a paddle-wheel powered by a solver artifact. An energy audit made it unambiguous: the robot carried several times more kinetic energy than its actuators had ever done work for.

**2. Friction evasion.** With the energy hole fixed, the policy learned to skate. It kept its foot contacts down to brief grazing taps lasting about one physics step — too short for the solver's friction anchors to converge — so its sliding contacts behaved near-frictionlessly, and it glided across the world like it was ice.

![The gliding policy skating on near-frictionless micro-contacts](./march_free2_gliding_spidertron.gif)

The mitigations, in the end, all lived in the physics rather than the reward function:

- The ideal PD drives were replaced with a DC-motor torque-speed envelope built from the servo spec sheets — beyond no-load speed the motor can only brake, so contact interactions can dissipate energy but never source it.
- Contact physics fixes: generate contacts slightly *before* touch (so friction anchors exist by the time of impact) and more solver iterations for friction convergence.
- One reward-side change that's really a hardware preference: penalizing very short foot contacts. Tap contacts are impulse loading on real servo gearboxes — and pricing them also happens to starve this whole class of timestep-scale exploit of its pattern.

The lesson that generalized: **physics violations get fixed in physics; rewards only express preferences among physically honest behaviors.** Patching physics holes with reward penalties is fragile — the optimizer just routes around them.

One nuance worth keeping: some slipping is *realistic*. Skating and scrambling have real-world analogs, and a policy that slides isn't automatically cheating. The test that separated exploit from honest sliding was raising the friction coefficient and watching actuator power rise proportionally — the policy pays the friction bill, it just finds sliding worth the price.

![With nothing left to exploit: an honest, energy-paid sliding shuffle](./march_free3_spidertron.gif)

## The walk task

Back to the main milestone task: track a full velocity vector, heading and speed. For this task I took off the gait-specific prescriptive rewards, kept the physics exploit fixes, and let it train.

Across multiple trials, random exploration was always able to produce *some* gait that generally tracked the target — but it often relied on only four or five legs to jog around, with the spares held off the ground or dragged along decoratively.

| Fixed camera | Chase camera |
| --- | --- |
| ![The walk policy from a fixed camera](./demo_fixed_cam.gif) | ![The walk policy from a chase camera](./demo_chase_cam.gif) |

I accepted this for the initial flat-ground walk task. The conclusion I couldn't avoid: for this morphology on flat ground, speed pressure alone is insufficient — gait structure has to come from the prior. A hexapod has so much static stability to spare that it can afford gaits no biped or quadruped could get away with, and nothing about flat terrain punishes it for using them.

But I noted this down as a bet for later: the lazy gaits likely won't survive rugged terrain or ride-stability requirements. When the environment itself starts punishing a robot that jogs on four legs — catches, obstacles, grip variance — the speed and fitness hit should do the work my hand-written gait rewards were doing, for free. That's the experiment I'm most looking forward to.

## Training observability harness

A side-effort that paid for itself many times over: every training run is wrapped in an observability harness, because with hours-long runs on one GPU, discovering a problem *after* a run is the most expensive way to discover it. The pieces:

- Live samplers and checkpoints — saved weights, exported policies, and per-term reward and loss plots for every run.
- Console log capture, so every run directory is self-describing after the fact.
- VRAM overhead tracking — knowing the actual headroom lets me allocate more of the card to parallel training experiments or in-training rollout renders.
- Gliding detection — a direct descendant of the friction exploit above: a live tripwire on foot slip that flags skating within minutes of it emerging, instead of hours later when a human happens to watch a rollout video.

## What's next

Immediate next steps, mostly the design factors that real robots have to optimize for:

- **Ride stability** — observe and penalize g-forces on the robot chassis, so the body glides while the legs do the work.
- **Energy conservation** — e.g. standing near-still should be the natural optimum when the target velocity is zero.
- **Rugged terrain**, with curriculum difficulty levels — and the emergence bet above finally gets settled.

Some more ambitious areas that could be interesting to explore:

- **Sensor integration** — perceptive depth estimation or terrain height-map scans, enabling perceptive policies (versus the blind proprioceptive policies I have now), plus collision avoidance.
- **Load adaptability** — technically already modeled implicitly through joint position observability, but direct torque/power measurements could make it explicit.
- **A generalized model for robot degradation** — one or more legs or joints break, and the robot adapts. Technically a hexapod only needs three legs to stand stable and four to move, so there's a lot of redundancy to exploit.
- **Population-based training** — optimizing across multiple RL policies rather than tuning one at a time.
- Eventually, if time and resources allow, **building the real thing** and using it to learn sim-to-real.

And once there's a working "robot" in sim, it becomes a platform for a different class of fun problems: distributed fleet coordination (swarms, task allocation), path finding, and multi-agent RL — multiple agents coordinating on one task, up to and including forming a mountain of bots so that one robot can climb over it and finish the job, World War Z style.

## Some references

Work that shaped my understanding along the way:

- [Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning](https://arxiv.org/abs/2109.11978) (Rudin et al.) — the blueprint for the train-thousands-of-robots-on-one-GPU approach, and the origin of RSL-RL.
- [Orbit: A Unified Simulation Framework for Interactive Robot Learning Environments](https://arxiv.org/abs/2301.04195) (Mittal et al.) — the framework that became Isaac Lab.
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347) (Schulman et al.) — PPO itself.
- [Emergence of Locomotion Behaviours in Rich Environments](https://arxiv.org/abs/1707.02286) (Heess et al.) — the classic case for environments, not rewards, shaping behavior; directly motivates the rough-terrain experiment above.
- [Learning Agile and Dynamic Motor Skills for Legged Robots](https://arxiv.org/abs/1901.08652) (Hwangbo et al.) — actuator modeling as the key to honest sim training, which this project relearned the hard way.
- [Sim-to-Real: Learning Agile Locomotion For Quadruped Robots](https://arxiv.org/abs/1804.10332) (Tan et al.) — the sim-to-real gap, and why physical grounding matters from day one.
- [LocoFormer](https://arxiv.org/abs/2509.23745) (Skild AI) — generalized, omni-bodied locomotion training; a glimpse of where this field is heading.

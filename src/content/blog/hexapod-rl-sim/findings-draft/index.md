---
title: "Teaching a Spidertron to Walk"
description: "Findings from an exploratory RL locomotion project: a simulated hexapod, reward loopholes, and broken physics."
date: 2026-09-17
tags: ["hexapod-rl-sim", "reinforcement-learning", "robotics"]
draft: true
---

Repo link: [github.com/mliu59/hexapod-rl-sim](https://github.com/mliu59/hexapod-rl-sim)

I've wanted to try training robot locomotion with reinforcement learning for a while now — not to read about it, but to actually do it firsthand: build a robot model, drop it into a simulator, and watch it learn to run around. This project is that. It's deliberately exploratory, and the robot is mostly imaginary, so none of the numbers matter on an absolute scale. What I was after was the experience and the lessons, and it delivered plenty of both.

The goal for the first milestone was simple to state: get a robot to walk around on flat ground, following a target vector (a heading and a speed) that I can change on the fly.

## The robot

I've always loved the concept of a massive spider-walker as a way of navigating complex terrain — terrain where the obstacles are comparable in size to the robot itself — and no rendition of that concept is dearer to me than the spidertron from Factorio.

![Factorio's spidertron walking through trees](./factorio_spidertron.gif)

So the spidertron became the base design, with a few modifications. I reduced the leg count from eight to six (easier to reason about, and six is plenty; I may add the pair back later for redundancy). The Factorio spidertron also has a telescoping lower leg, which I removed — if this ever becomes a real robot, a prismatic joint is a mechanical headache, and an extra revolute joint at the knee can provide the same redundancy if it's ever needed. And it's scaled way down, sized around hobbyist servos: three joints per leg, eighteen in total.

![The six-legged spidertron model at its nominal stance](./spidertron_render.png)

One part of the pipeline I want to call out is how the model itself was built: the robot is a Python program, not a CAD document. The whole model is defined in code (using [build123d](https://github.com/gumyr/build123d)), which generates solid geometry and emits the URDF that the simulator consumes. This was partly a practical choice and partly an experiment in agentic CAD — a coding agent can reason about parametric geometry in code far better than it can read renders, so it can iterate on the design, measure volumes and mass properties, and validate joints without a human driving a GUI. Masses and inertias are never guessed: they're computed from the actual solids and from vendor-provided CAD for the servos, and joint torque, speed, and range limits come from the servo spec sheets. The robot is imaginary, but it's imaginary in a physically grounded way — everything downstream of this respects what real hobby hardware could actually do.

## The stack

I went with NVIDIA's Isaac Lab stack, for a few reasons:

- It's the current industry standard for developing locomotion policies in sim.
- My compute is limited to one home GPU, so massively parallel simulation matters a lot. Being able to run thousands of environments at once is what turns training into a coffee-break-sized iteration loop instead of an overnight one, and fast iteration is everything in a project like this.
- It integrates cleanly with RSL-RL, a lean, battle-tested RL library for this exact use case.
- PhysX is good enough for initial exploration. It has real shortcomings in contact simulation (more on that later — much more), and something like MuJoCo could be a future upgrade, but it wasn't the bottleneck for anything I wanted to learn here.

For the algorithm, PPO was the obvious starting point: on-policy, online, and the default workhorse of this entire subfield. The reward structure follows from the task. Since the objective is velocity tracking, the reward is dense (a tracking score on every tick, rather than a sparse "you made it" bonus), and the policy is goal-conditioned — the setpoints (heading, speed, body height) are part of the observation, so one trained network can follow whatever commands you feed it. The observations are blind proprioception: joint states, body motion, foot contacts, and the commands. No cameras, no terrain maps.

## Crawling before walking

The first tasks were deliberately trivial: stand still, then hold the body at a commanded height while I move the setpoint around. These worked almost anticlimactically well — a policy that smoothly squats and rises to track a height staircase, settling within a fingernail of the target.

![The height-tracking policy following a staircase of height setpoints](./height_staircase_spidertron.gif)

I mention them mostly because they set a trap: they made this look easy. The interesting part of the project starts with the walk task, where "easy" ended abruptly.

Also, for a bit of humility, here's what an early training misconfiguration looks like. Every robot in every environment, collapsing on its face at spawn, four thousand times in parallel:

![An early misconfigured run collapsing at spawn](./m1_collapse_spidertron.gif)

## Reward engineering and its consequences

The walk task ran through roughly ten versions, and nearly every iteration was a lesson in how an optimizer treats your reward function: not as a description of what you want, but as a contract to be exploited. PPO is a lawyer. Some highlights from the loophole parade:

**The robot that refused to turn.** The walk command asks the robot to face a target heading and move at a target speed, and I'd coupled them: the speed demand scaled down when the robot was facing the wrong way (you shouldn't be charging full speed at ninety degrees off-course). The policy read that contract carefully and found the loophole — if you *never* turn toward the target, the speed demand stays near zero, and you can collect the "perfectly tracking my (zero) speed target" reward while standing still. It gave up only the small heading reward and avoided every cost of actually stepping. The training curve, meanwhile, climbed steadily. A rising reward curve tells you the policy is getting better at earning reward. It tells you nothing about whether it's doing the task.

**The reward that mathematically existed but practically didn't.** My first fix was to reward heading alignment directly, with a tight exponential kernel. It didn't train at all — and the reason was embarrassing once I found it. At the heading errors the policy actually had, that kernel's value (and more importantly, its slope) was numerically indistinguishable from zero. Raising the weight just multiplied zero by a bigger number. The policy can't climb a gradient it never samples. The fix was a kernel with usable slope everywhere — after which turning trained almost immediately. The lesson stuck with me: when a reward term stays flat while everything else improves, check what the kernel evaluates to *at the error the policy currently has* before touching any weights.

**The three-legged pogo stick.** The deepest failure was the most fascinating. After the tracking terms were fixed, the robot moved and tracked well — but it never developed anything resembling a gait, no matter how I priced steps, slips, and stances. Digging into per-joint diagnostics revealed why: the policy was commanding wild, bang-bang oscillations far beyond what the servos could follow. The servo model was acting as a low-pass filter, and the visible "walking" was the *time-average of thrash* — with several legs held curled while the rest pogoed the body forward. Every metric was being satisfied simultaneously by one degenerate strategy, and it's exactly the kind of morphology abuse a statically-stable hexapod can afford that a biped never could. It's also a control style that would cook a real servo in minutes, which is precisely the kind of thing you want to discover in sim.

![The tripod-hop policy: pogoing on a subset of legs while others stay curled](./walk_v8_tripod_hop_spidertron.gif)

The way out was not more cleverness in the reward function. It was, in order: make smoothness non-negotiable (penalize the thrash directly, so the policy has to learn real trajectories before it can learn anything else), strip the task down to isolate locomotion (fixed command, no distractions) and then, crucially, **retrain from scratch under the full set of constraints rather than bolting constraints onto a converged policy**. That last one was the single most load-bearing lesson of the arc: constraints compound when they're present from the first gradient step, and merely trade against each other when retrofitted. Every attempt to patch a converged policy plateaued; a fresh run under the identical reward set snapped into a clean alternating-tripod gait almost immediately, and better than the patched runs ever got at a fraction of the compute.

![The from-scratch run walking with a clean alternating-tripod gait](./march_v6_spidertron.gif)

## Breaking the simulator

Along the way, a question kept nagging: how much of this hand-built gait shaping is actually *necessary*? Would a decent gait emerge from just "go fast and don't fall"? So I ran the experiment — strip every gait-related term, keep speed and survival, and let PPO loose.

What followed was less an RL experiment and more an adversarial audit of the physics engine, because the optimizer immediately stopped doing locomotion and started doing exploit research. Each run found a hole one layer deeper than the last.

**Layer one: free energy from the contact solver.** The first run produced a robot accelerating down the track indefinitely, at speeds that would embarrass a highway. It wasn't jumping or flying — the policy had learned to brush its feet against the ground in a way that made the physics solver inject momentum. The simulated position-controlled joints, backdriven by ground contact far past the motor's speed limit, fought back at the solver level and transferred unphysical impulse on every touch. A paddle-wheel powered by a solver artifact. An energy audit made it unambiguous: the robot's kinetic energy was several times everything its actuators had ever done.

![The energy-exploit policy accelerating unphysically](./march_free_exploit_spidertron.gif)

The fix was to model the actuators honestly — a proper motor model with a torque-speed envelope derived from the servo spec sheets, under which contact can dissipate energy but never create it. Rerunning the old exploit policy under the honest actuators confirmed the hole was closed: the perpetual-motion machine slowed to a crawl.

**Layer two: friction evasion.** Energy-honest now, the next run learned *skating*. It kept its foot contacts so brief — a single physics timestep of grazing — that the solver's friction model never got a chance to engage, so its feet slid as if the ground were ice. And here's the part that changed how I think about testing: the energy audit **passed**. Energy honesty and contact honesty turn out to be independent axes, and an auditor watching only one is blind to the other.

![The gliding policy skating on near-frictionless micro-contacts](./march_free2_gliding_spidertron.gif)

This layer also produced my favorite meta-lesson of the project. My initial evidence for the friction exploit was a sensor reading showing zero tangential force on the sliding feet. Damning — until I ran the same audit on a policy I *knew* walked honestly, and it also read zero. The sensor simply doesn't report friction components. The conclusion happened to survive on other evidence, but the rule is now permanent: **calibrate every audit signal against a known-good control before trusting its verdicts.** Your instruments can be just as wrong as your rewards.

**The bottom of the ladder.** With actuators honest, contact parameters fixed so friction actually engages, and nothing left to exploit, the answer to the original question finally came back — and it was a flat no. With no gait shaping, speed pressure plus survival converges to an unstructured sliding shuffle: legal physics, energy bill fully paid, no coordination, no phase structure, and not even fast. I even reran it with friction cranked past rubber-on-concrete levels to check whether the shuffle was friction-limited; the policy just paid the higher drag bill and kept shuffling.

![The exploit-free free-run optimum: a legal but unstructured sliding shuffle](./march_free3_spidertron.gif)

So on flat ground, **gait structure does not emerge from speed pressure**. Every visually-pleasing gait this project produced was purchased with an explicit prior. The same constraint suite that produced the neat tripod walk also produced, when asked for maximum speed instead of a setpoint, a genuinely quick tripod-flavored run — nearly an order of magnitude faster than the walking setpoint, with the gait structure smoothly degrading as speed rose. The constraints define a whole spectrum; the free optimizer, given nothing, finds the bottom of it.

![The max-speed run under the full gait constraint suite](./march_max_spidertron.gif)

The distilled takeaway, and the design rule the repo now lives by: **physics enforcement and reward shaping do different, non-overlapping jobs.** Physics guarantees there's nothing unphysical to exploit; rewards select the behavior you prefer among the physical ones. Every failure in this section came from confusing the two — using a reward term as a band-aid over a physics hole (fragile, and the optimizer *will* find the edge of the band-aid), or expecting realistic physics to induce style (it won't). And one operational corollary I'd underline for anyone doing this: put tripwires on your exploit metrics *during* training. The skating exploit ran for hours before a human noticed it in a rollout video; the monitoring that would have flagged it in minutes was trivial to add afterwards.

A related finding on style, from a follow-up arc: penalties for body wobble act as *walls* at the weights that intuition suggests (the robot decides the safest way to avoid wobbling is to never walk — any stability metric can be satisfied by refusing the task), and as useful *bills* at a fraction of those weights. And choosing *which axes* to penalize beat weight-tuning entirely: exempting yaw from the wobble price — because yawing is not wobble, yawing is literally the turning task — fixed turning outright where no amount of weight fiddling had. Priced correctly, the wobble bill bought visibly cleaner walking: discrete strides instead of a slide.

## Where it stands

The first milestone is done: a single goal-conditioned policy covers standing, walking, and height changes as regions of one command space — no modes, no switching, standing is just walking at zero commanded speed. There's a little browser app that runs the trained policy live in the simulator, with a joystick for the velocity command and a slider for height, which is exactly the toy I wanted when I started this.

![Driving the trained policy live from the demo app, chase camera](./demo_chase_cam.gif)

The honest description of the current gait is "functional, with mediocre taste" — it tracks commands well and never falls, but it still shuffles more than it strides unless the style terms are paying attention. Given everything above, I'm at peace with that: on flat ground, style is exactly what you pay for.

## What's next

Immediate next steps:

- **Ride stability** — treating accelerations on the chassis as a first-class cost, so the body glides while the legs do the work.
- **Rugged terrain**, with a curriculum of difficulty levels. This is the experiment I'm most excited about, because terrain is the *natural* regularizer: catches, grip variance, and obstacles police sliding and shuffling the way my hand-built reward terms do on flat ground — except for free. The clean version of the emergence experiment is to rerun the unshaped reward on rough terrain and see whether the environment alone teaches stepping.

Some more ambitious directions that could be fun to explore after that:

- **Sensor integration** — depth or terrain height-map perception, moving from the current blind proprioceptive policy to a perceptive one, plus obstacle avoidance.
- **Load adaptability** — carrying and compensating for payloads. Technically this is already implicitly observable through the joint states, but direct torque/power sensing could make it explicit.
- **Robot degradation** — a generalized model for damage: one or more joints or legs break, and the policy adapts. A hexapod only needs three legs to stand and four to move, so there's a lot of redundancy to exploit.
- **Sim-to-real** — eventually, if time and resources allow, building the physical robot and learning the whole transfer discipline firsthand. The physical grounding is already in place on the sim side.

And once there's a reliable "robot" in sim, it becomes a platform for a different class of problems entirely: fleet coordination, path finding, multi-agent RL — multiple spidertrons cooperating on a task, up to and including forming a mountain of robots so one of them can climb over an obstacle, World War Z style.

## Reading list

Some of the work that shaped my understanding along the way (uncited above, collected here):

- [Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning](https://arxiv.org/abs/2109.11978) (Rudin et al.) — the blueprint for the whole train-thousands-of-robots-on-one-GPU approach, and the origin of RSL-RL.
- [Orbit: A Unified Simulation Framework for Interactive Robot Learning Environments](https://arxiv.org/abs/2301.04195) (Mittal et al.) — the framework that became Isaac Lab.
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347) (Schulman et al.) — PPO itself.
- [Emergence of Locomotion Behaviours in Rich Environments](https://arxiv.org/abs/1707.02286) (Heess et al.) — the classic case for environments, not rewards, shaping behavior; directly motivates the rough-terrain experiment above.
- [Learning Agile and Dynamic Motor Skills for Legged Robots](https://arxiv.org/abs/1901.08652) (Hwangbo et al.) — actuator modeling as the key to honest sim training, which this project relearned the hard way.
- [Sim-to-Real: Learning Agile Locomotion For Quadruped Robots](https://arxiv.org/abs/1804.10332) (Tan et al.) — the sim-to-real gap, and why physical grounding matters from day one.
- [LocoFormer](https://arxiv.org/abs/2509.23745) (Skild AI) — generalized, omni-bodied locomotion training; a glimpse of where this field is heading.

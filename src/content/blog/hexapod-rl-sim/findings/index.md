---
title: "Hexapod RL Sim: Findings"
description: "Placeholder — findings from the hexapod-rl-sim project."
date: 2026-09-15
tags: ["hexapod-rl-sim", "reinforcement-learning", "robotics"]
draft: true
---
Repo link: [github.com/mliu59/hexapod-rl-sim](https://github.com/mliu59/hexapod-rl-sim)


## Goals

exploratory project
I would like to explore and first hand try training locomotion on a robot using RL techniques and be able to watch it run around in sim. 

goal for the first milestone: have a robot be able to run around in flat terrain, following some target vector (heading and speed). 

## tool stack

NVIDIA's IsaacLab stack, a few reasons:
- industry standard for developing locomotion policies in sim
- My compute is fairly limited (one home GPU), so optimized parallel envs will be extremely helpful for speed of iterative exploration
- integrates well with RSL-RL as an RL library
- PhysX is good enough for initial exploration (MuJoCo can be used in the future for better contact simulations, given the shortcomings of PhysX)

we can start with PPO
- on policy
- online RL, in sim

reward mechanisms:
- because we want velocity tracking, this means some decisions:
    - dense reward, on every tick
    - goal conditioned


## robot model (specs -> agentic CAD generation -> URDF)

Always loved the concept of a massive spidertron as a way of navigating complex terrain (obstacles are comparable in size to the robot), as seen in Factorio. 

[insert gif of 8 legged factorio spidertron]

a couple of modifications from the base factorio spidertron:
- reduced the leg count to 6 from 8 (may increase it back later to provide more redundancy)
- in the case that we might build a real robot, a few changes:
    - factorio spidertron also has a telescoping lower leg (tibia). Removed. Might opt to add another DOF revolute joint if extra redundancy with the knee is needed
    - scaled down. uses hobbyist servos for actuation

[insert photo of 6 legged design]

some baseline assumptions for this first iteration
- [insert servo specs]. Inertia can be estimated from vendor provided STEP files. Torque, range, power limits are derived from spec sheets. 
- [load assumptions], no excess load

build with agentic code to CAD pipelines
- build123d
- then generate URDF from CAD parameters for use in IsaacLab

## discussion


### march task
After using a trivial stand and track height task to setup the environment, I wanted to explore with how to set reward functions with a simple matching task (track a goal condition target speed, but no heading tracking). At the beginning, I was graciously imparting my own knowledge of hexapod mechanics and prescribing alternating tripods as the specific gait pattern that I want to emerge (satire commentary). I did this by specifying reward functions that rewarded feet being off-ground in groups, alternating so that the two tripods would be in the air by about equal time, and also penalized behavior that completely didn't use some of the legs. This ultimately worked decently well, but I spent a significant amount of churn and trial-and-error reward tuning to reach the correct balance of rewards for the gait to emerge. Unbalanced rewards often resulted in significant degradations of robot behavior, such as marching in place, or hopping, etc. I needed to see if an optimal gait like alternating tripods would emerge from exploration forced by the environment and target speed pressure. 

#### reaching the limits of the physics engine fairly early
in a simple experiment to maximize travel speed (regardless of direction), the robot found not one but two exploits, each a layer deeper:

[see video: docs/march_free_exploit_spidertron.mp4]

1. **energy pump**: the policy commanded bang-bang leg sweeps way beyond servo bandwidth. ground contact backdrove the joints, and the stiff PD drives fighting the backdriven joints at the solver level injected momentum on every ground tap, accelerating indefinitely. an energy audit showed 3.3x more kinetic energy than the actuators actually did work for. 
2. **friction evasion**: with energy fixed, the policy learned to skate — brief grazing taps lasting ~one physics step, too short for the solver's friction anchors to converge, so sliding contacts behaved near-frictionlessly. 

mitigated by:
- replacing ideal PD drives with a DC motor torque-speed envelope from the servo spec sheets — beyond no-load speed the motor can only brake, so contacts can dissipate energy but never source it
- contact physics fixes: generate contacts slightly before touch (so friction anchors exist by impact) and more solver iterations for friction convergence
- penalizing short foot contacts — justified as hardware wear (tap contacts are impulse loading on real servo gearboxes), which also happens to starve this class of exploit of its pattern

the lesson that generalized: **physics violations get fixed in physics; rewards only express preferences among physically-honest behaviors.** patching physics holes with reward penalties is fragile — the optimizer just routes around them.

note that some slipping is realistic (skating, scrambling have real-world analogs) — the test that separated exploit from honest sliding was raising friction and watching actuator power rise proportionally: the policy pays the friction bill, it just finds sliding worth the price.

### walk task

Coming back to the main milestone task, which is to have the robot be able to track a velocity vector. For this task I took off the gait specific prescriptive rewards and corrected physics exploits. Across multiple trials, random exploration was always able to produce some gait that generally tracked with the target, but often relied on only 4 or 5 legs to jog. 

[insert demo videos]

I accepted this for this initial flat ground walk task. For this morphology on flat ground, speed pressure was insufficient and gait structure had to come from the prior. but noted that this would likely not work on rugged terrain and with ride stability requirements, where the speed and/or fitness of the robot would take a substantial hit if its walking on 5 or even 4 legs under environmental pressure. 


### training observability harness and utils
- live samplers and checkpoints (saved weights, policy, and loss plots)
- console logs
- VRAM limit overhead. can be used to allocate more VRAM for parallel training experiments / renders
- gliding detection (related to gliding physics exploit)


## What's next

Immediate next steps:
- design factors that need to be optimized in real robots:
    - Ride stability (observe and penalize g's on the robot chassis)
    - energy conservation (e.g. stand near still when target velocity is zero)
- rugged terrain (with different curriculum levels)

some more ambitious areas that could be interesting to explore:
- sensor integration (perceptive depth estimation, terrain height map scan)
    - can be used for perceptive policies, vs proprioceptive policies which is what we have now
    - collision avoidance (tolerance)
- load adaptability (which technically should already be modeled implicitly from joint pos observability, but could be more direct by adding torque/power measurements)
- generalized model for robot degradation (one or more leg/joints break, how the robot should adapt. technically a robot only needs 3 legs to stand stable, 4 legs to move)
- population-based training to optimize on multiple RL policies
- eventually, if time and resource allows, building a real thing and using it to learn sim-to-real

once we have a working "robot" in sim, there are some other fun problems that we can use it to explore in sim:
- distributed fleet coordination (swarms, task allocation, etc.)
- path finding
- multi agent RL (multiple agents coordinating to do the same task. e.g. forming a mountain of bots so that one robot can climb on it and complete a task, like in World War Z)

## some references (do not need to be cited)

- LocoFormer (Skild AI), generalized omnibodied locomotion training: https://arxiv.org/abs/2509.23745



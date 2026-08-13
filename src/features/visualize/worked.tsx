import React from "react";
import { Button, Card, cx } from "@/components/ui";
import { RichText } from "@/components/Katex";
import { useApp } from "@/lib/store";
import { MiniViz, type VizSpec } from "./worked-viz";

// Worked examples in the Cambridge 9702 style: five per topic, progressively
// harder, each solution in explained steps (subheading + a "what's happening"
// note + the maths). Values are generated so "Randomize" gives a fresh but
// correct question, and each carries a mini diagram that reflects its numbers.
// Original questions modelled on past-paper style — not reproductions.

export interface Step { heading: string; detail: string; math?: string; }
export interface WorkedResult { question: string; steps: Step[]; answer: string; viz?: VizSpec; }
export interface WorkedLevel { tier: string; generate: () => WorkedResult; }
export interface WorkedTopic { topicId: string; concept: string; levels: WorkedLevel[]; }

const g = 9.81, hEv = 4.14e-15, hc = 1240, G = 6.67e-11, kC = 8.99e9, eC = 1.60e-19, R_gas = 8.31, kB = 1.38e-23, cLight = 3.0e8;
const rnd = (min: number, max: number, step = 1) => Math.round((min + Math.random() * (max - min)) / step) * step;
const fmt = (x: number, n = 3) => String(Number(x.toPrecision(n)));
const s = (heading: string, detail: string, math?: string): Step => ({ heading, detail, math });

export const WORKED: Record<string, WorkedTopic> = {
  // ============================ KINEMATICS ============================
  "phy-kinematics": {
    topicId: "phy-kinematics",
    concept: "Motion with uniform acceleration — the SUVAT equations. Treat horizontal and vertical motion separately for projectiles.",
    levels: [
      { tier: "1 · Recall", generate() { const v = rnd(8, 24, 2), t = rnd(3, 10, 1); const a = v / t, d = 0.5 * v * t; return {
        question: `A car accelerates uniformly **from rest** to $${v}\\,\\text{m s}^{-1}$ in $${t}\\,\\text{s}$. Find the acceleration and the distance travelled.`,
        steps: [ s("Choose the definition", "Acceleration is the change in velocity each second.", `$a = \\dfrac{v-u}{t} = \\dfrac{${v}-0}{${t}}$`), s("Evaluate", "The velocity climbs at a steady rate from zero.", `$a = ${fmt(a)}\\,\\text{m s}^{-2}$`), s("Distance via average speed", "For uniform acceleration the average speed is ½(u+v).", `$s = \\tfrac12(u+v)t = ${fmt(d)}\\,\\text{m}$`) ],
        answer: `$a = ${fmt(a)}\\,\\text{m s}^{-2}$,  $s = ${fmt(d)}\\,\\text{m}$`, viz: { kind: "motion", v } }; } },
      { tier: "2 · Standard", generate() { const v = rnd(12, 30, 2), d = rnd(50, 200, 10); const a = (v * v) / (2 * d), t = v / a; return {
        question: `A train starts from rest and reaches $${v}\\,\\text{m s}^{-1}$ after travelling $${d}\\,\\text{m}$. Find the acceleration and the time taken.`,
        steps: [ s("Pick the SUVAT equation", "We know u, v and s but not t — use the equation without t.", `$v^2 = u^2 + 2as$`), s("Rearrange for a", "Setting u = 0 isolates the acceleration.", `$a = \\dfrac{v^2}{2s} = ${fmt(a)}\\,\\text{m s}^{-2}$`), s("Find the time", "Now use a first-order equation.", `$t = \\dfrac{v-u}{a} = ${fmt(t)}\\,\\text{s}$`) ],
        answer: `$a = ${fmt(a)}\\,\\text{m s}^{-2}$,  $t = ${fmt(t)}\\,\\text{s}$`, viz: { kind: "motion", v } }; } },
      { tier: "3 · Application", generate() { const u = rnd(22, 32, 2), v = rnd(4, 12, 2), d = rnd(40, 120, 10); const a = (v * v - u * u) / (2 * d), t = (v - u) / a; return {
        question: `A cyclist brakes from $${u}\\,\\text{m s}^{-1}$ to $${v}\\,\\text{m s}^{-1}$ over $${d}\\,\\text{m}$. Find the deceleration and the time to slow.`,
        steps: [ s("Same equation, non-zero u", "Both u and v are given, so keep the full form.", `$v^2 = u^2 + 2as$`), s("Solve for a", "A negative result confirms it is a deceleration.", `$a = \\dfrac{v^2-u^2}{2s} = ${fmt(a)}\\,\\text{m s}^{-2}$`), s("Time to slow", "Use v = u + at, keeping the sign of a.", `$t = \\dfrac{v-u}{a} = ${fmt(t)}\\,\\text{s}$`) ],
        answer: `$a = ${fmt(a)}\\,\\text{m s}^{-2}$ (deceleration),  $t = ${fmt(t)}\\,\\text{s}$`, viz: { kind: "motion", v: u, decel: true } }; } },
      { tier: "4 · Multi-step", generate() { const u = rnd(15, 30, 1); const H = (u * u) / (2 * g), tUp = u / g, tTot = 2 * tUp; return {
        question: `A ball is thrown **vertically upward** at $${u}\\,\\text{m s}^{-1}$. Find the maximum height and the total time in the air. Take $g = 9.81\\,\\text{m s}^{-2}$.`,
        steps: [ s("Condition at the top", "At maximum height the velocity is momentarily zero.", `$v = 0,\\ a = -g$`), s("Height from SUVAT", "Use v² = u² + 2as with v = 0.", `$H = \\dfrac{u^2}{2g} = ${fmt(H)}\\,\\text{m}$`), s("Time up", "v = u − gt gives the time to the top.", `$t_{up} = \\dfrac{u}{g} = ${fmt(tUp)}\\,\\text{s}$`), s("By symmetry", "Rising and falling take equal times.", `$t_{total} = 2t_{up} = ${fmt(tTot)}\\,\\text{s}$`) ],
        answer: `$H = ${fmt(H)}\\,\\text{m}$,  $t_{total} = ${fmt(tTot)}\\,\\text{s}$`, viz: { kind: "vthrow", u } }; } },
      { tier: "5 · Exam-level", generate() { const u = rnd(20, 40, 2), ang = rnd(30, 60, 5); const r = (ang * Math.PI) / 180; const R = (u * u * Math.sin(2 * r)) / g, H = (u * Math.sin(r)) ** 2 / (2 * g), T = (2 * u * Math.sin(r)) / g; return {
        question: `A projectile is launched at $${u}\\,\\text{m s}^{-1}$ at $${ang}^{\\circ}$ to the horizontal. Find the time of flight, maximum height and range. Ignore air resistance.`,
        steps: [ s("Split the velocity", "Resolve into independent horizontal and vertical parts.", `$u_x = u\\cos\\theta = ${fmt(u * Math.cos(r))},\\ u_y = u\\sin\\theta = ${fmt(u * Math.sin(r))}$`), s("Time of flight", "Vertical motion returns to the ground: t = 2u_y/g.", `$T = ${fmt(T)}\\,\\text{s}$`), s("Maximum height", "Vertical SUVAT with v = 0 at the peak.", `$H = ${fmt(H)}\\,\\text{m}$`), s("Range", "Horizontal distance at constant u_x over the flight time.", `$R = u_xT = ${fmt(R)}\\,\\text{m}$`) ],
        answer: `$T = ${fmt(T)}\\,\\text{s}$,  $H = ${fmt(H)}\\,\\text{m}$,  $R = ${fmt(R)}\\,\\text{m}$`, viz: { kind: "projectile", u, ang } }; } },
    ],
  },

  // ============================ DYNAMICS ============================
  "phy-dynamics": {
    topicId: "phy-dynamics",
    concept: "Newton's laws and momentum. Only the resultant force accelerates a body; momentum is conserved when no external force acts.",
    levels: [
      { tier: "1 · Recall", generate() { const F = rnd(6, 30, 2), m = rnd(1, 6, 1); const a = F / m; return {
        question: `A resultant force of $${F}\\,\\text{N}$ acts on a mass of $${m}\\,\\text{kg}$. Find the acceleration.`,
        steps: [ s("Newton's 2nd law", "For constant mass, force = mass × acceleration.", `$F = ma$`), s("Rearrange", "Divide through by the mass.", `$a = \\dfrac{F}{m} = ${fmt(a)}\\,\\text{m s}^{-2}$`) ],
        answer: `$a = ${fmt(a)}\\,\\text{m s}^{-2}$`, viz: { kind: "block", F, friction: 0 } }; } },
      { tier: "2 · Standard", generate() { const F = rnd(16, 40, 2), fr = rnd(2, 10, 1), m = rnd(2, 8, 1); const a = (F - fr) / m; return {
        question: `A $${m}\\,\\text{kg}$ crate is pulled by a $${F}\\,\\text{N}$ horizontal force against $${fr}\\,\\text{N}$ of friction. Find the acceleration.`,
        steps: [ s("Find the resultant", "Friction opposes motion, so subtract it.", `$F_{net} = ${F} - ${fr} = ${F - fr}\\,\\text{N}$`), s("Apply F = ma", "Only the resultant accelerates the crate.", `$a = \\dfrac{F_{net}}{m} = ${fmt(a)}\\,\\text{m s}^{-2}$`) ],
        answer: `$a = ${fmt(a)}\\,\\text{m s}^{-2}$`, viz: { kind: "block", F, friction: fr } }; } },
      { tier: "3 · Application", generate() { const m = rnd(50, 90, 5), a = rnd(1, 4, 0.5); const N = m * (g + a); return {
        question: `A $${m}\\,\\text{kg}$ person stands in a lift that accelerates **upward** at $${a}\\,\\text{m s}^{-2}$. Find the normal contact force from the floor.`,
        steps: [ s("Draw the forces", "Upward contact force N and downward weight mg.", `$N - mg = ma$`), s("Solve for N", "The floor supports the weight and supplies the extra force.", `$N = m(g+a) = ${fmt(N)}\\,\\text{N}$`) ],
        answer: `$N = ${fmt(N)}\\,\\text{N}$ (vs weight $${fmt(m * g)}\\,\\text{N}$)`, viz: { kind: "bars", items: [{ label: "mg", v: m * g, tone: "bad" }, { label: "N", v: N, tone: "good" }] } }; } },
      { tier: "4 · Multi-step", generate() { const m1 = rnd(1, 3, 0.5), u1 = rnd(4, 10, 1), m2 = rnd(2, 4, 0.5); const vf = (m1 * u1) / (m1 + m2); return {
        question: `A $${m1}\\,\\text{kg}$ trolley at $${u1}\\,\\text{m s}^{-1}$ collides and **sticks to** a stationary $${m2}\\,\\text{kg}$ trolley. Find their common velocity.`,
        steps: [ s("Conserve momentum", "No external horizontal force, so total momentum is unchanged.", `$m_1u_1 = (m_1+m_2)v$`), s("Substitute", "The second trolley starts at rest.", `$${m1}\\times${u1} = (${m1 + m2})v$`), s("Solve", "A perfectly inelastic collision — they move together.", `$v = ${fmt(vf)}\\,\\text{m s}^{-1}$`) ],
        answer: `$v = ${fmt(vf)}\\,\\text{m s}^{-1}$`, viz: { kind: "bars", items: [{ label: "before", v: m1 * u1 }, { label: "after", v: (m1 + m2) * vf }] } }; } },
      { tier: "5 · Exam-level", generate() { const m = rnd(0.1, 0.5, 0.05), u = rnd(15, 30, 1), t = rnd(0.02, 0.08, 0.01); const F = (2 * m * u) / t; return {
        question: `A $${fmt(m)}\\,\\text{kg}$ ball hits a wall at $${u}\\,\\text{m s}^{-1}$ and rebounds at the same speed. Contact lasts $${fmt(t)}\\,\\text{s}$. Find the average force on the ball.`,
        steps: [ s("Momentum is a vector", "The rebound reverses direction.", `$\\Delta p = m(-u) - m(u)$`), s("Magnitude of change", "The change is 2mu because the direction flips.", `$|\\Delta p| = 2mu = ${fmt(2 * m * u)}\\,\\text{kg m s}^{-1}$`), s("Impulse = F·t", "Force is the rate of change of momentum.", `$F = \\dfrac{\\Delta p}{t} = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$`, viz: { kind: "block", F: 20, friction: 20 } }; } },
    ],
  },

  // ============================ WAVES ============================
  "phy-waves": {
    topicId: "phy-waves",
    concept: "Progressive waves transfer energy. Speed, frequency and wavelength are linked by v = fλ; interference gives the double-slit and grating results.",
    levels: [
      { tier: "1 · Recall", generate() { const f = rnd(200, 800, 20), v = rnd(320, 346, 2); const lam = v / f; return {
        question: `A sound wave has frequency $${f}\\,\\text{Hz}$ and travels at $${v}\\,\\text{m s}^{-1}$. Find its wavelength.`,
        steps: [ s("Wave equation", "Speed equals frequency times wavelength.", `$v = f\\lambda$`), s("Rearrange", "Divide the speed by the frequency.", `$\\lambda = \\dfrac{v}{f} = ${fmt(lam)}\\,\\text{m}$`) ],
        answer: `$\\lambda = ${fmt(lam)}\\,\\text{m}$`, viz: { kind: "wave", amp: 24, count: 3 } }; } },
      { tier: "2 · Standard", generate() { const lam = rnd(2, 6, 0.5), v = rnd(6, 20, 1); const f = v / lam, T = 1 / f; return {
        question: `Water waves of wavelength $${lam}\\,\\text{m}$ travel at $${v}\\,\\text{m s}^{-1}$. Find the frequency and the period.`,
        steps: [ s("Frequency from v = fλ", "Rearrange the wave equation for f.", `$f = \\dfrac{v}{\\lambda} = ${fmt(f)}\\,\\text{Hz}$`), s("Period", "Period is the reciprocal of frequency.", `$T = \\dfrac{1}{f} = ${fmt(T)}\\,\\text{s}$`) ],
        answer: `$f = ${fmt(f)}\\,\\text{Hz}$,  $T = ${fmt(T)}\\,\\text{s}$`, viz: { kind: "wave", amp: 22, count: 4 } }; } },
      { tier: "3 · Application", generate() { const a = rnd(0.2, 0.6, 0.05), D = rnd(1.5, 3, 0.5), x = rnd(1.5, 4, 0.5); const lam = (a * 1e-3 * (x * 1e-3)) / D; const nm = lam * 1e9; return {
        question: `In a double-slit experiment the slits are $${fmt(a)}\\,\\text{mm}$ apart, the screen is $${D}\\,\\text{m}$ away and the fringe spacing is $${fmt(x)}\\,\\text{mm}$. Find the wavelength.`,
        steps: [ s("Double-slit formula", "Fringe spacing links to wavelength, slit separation and distance.", `$x = \\dfrac{\\lambda D}{a} \\Rightarrow \\lambda = \\dfrac{ax}{D}$`), s("Convert units", "Put a and x in metres before substituting.", `$\\lambda = ${fmt(lam)}\\,\\text{m} \\approx ${fmt(nm)}\\,\\text{nm}$`) ],
        answer: `$\\lambda \\approx ${fmt(nm)}\\,\\text{nm}$`, viz: { kind: "wave", amp: 20, count: 5 } }; } },
      { tier: "4 · Multi-step", generate() { const lines = rnd(300, 600, 50), nmLam = rnd(450, 650, 10), n = rnd(1, 3, 1); const d = 1e-3 / lines; const sinT = (n * nmLam * 1e-9) / d; const theta = Math.asin(Math.min(1, sinT)) * 180 / Math.PI; return {
        question: `Light of wavelength $${nmLam}\\,\\text{nm}$ hits a grating with $${lines}$ lines per mm. Find the angle of the $n = ${n}$ maximum.`,
        steps: [ s("Slit spacing", "d is 1 mm divided by the lines per mm.", `$d = \\dfrac{1\\times10^{-3}}{${lines}} = ${fmt(d)}\\,\\text{m}$`), s("Grating equation", "Each order satisfies d sinθ = nλ.", `$\\sin\\theta = \\dfrac{n\\lambda}{d} = ${fmt(sinT)}$`), s("Inverse sine", "This gives the angle of that bright fringe.", `$\\theta = \\sin^{-1}(${fmt(sinT)}) = ${fmt(theta)}^{\\circ}$`) ],
        answer: `$\\theta = ${fmt(theta)}^{\\circ}$`, viz: { kind: "wave", amp: 18, count: 6 } }; } },
      { tier: "5 · Exam-level", generate() { const L = rnd(0.4, 0.9, 0.05), f = rnd(200, 500, 10); const lam = 2 * L, v = f * lam; return {
        question: `A string of length $${fmt(L)}\\,\\text{m}$ fixed at both ends vibrates in its **fundamental** mode at $${f}\\,\\text{Hz}$. Find the wavelength and the wave speed.`,
        steps: [ s("Picture the standing wave", "The fundamental has a node at each end, one antinode in the middle.", `$\\text{length} = \\tfrac12\\lambda$`), s("Wavelength", "Twice the string length.", `$\\lambda = 2L = ${fmt(lam)}\\,\\text{m}$`), s("Wave speed", "Use v = fλ.", `$v = f\\lambda = ${fmt(v)}\\,\\text{m s}^{-1}$`) ],
        answer: `$\\lambda = ${fmt(lam)}\\,\\text{m}$,  $v = ${fmt(v)}\\,\\text{m s}^{-1}$`, viz: { kind: "wave", amp: 26, count: 2 } }; } },
    ],
  },

  // ============================ D.C. CIRCUITS ============================
  "phy-dc-circuits": {
    topicId: "phy-dc-circuits",
    concept: "Kirchhoff's laws with Ohm's law. Series shares current; parallel shares p.d.; a real cell has internal resistance.",
    levels: [
      { tier: "1 · Recall", generate() { const V = rnd(3, 12, 1), R = rnd(2, 20, 1); const I = V / R; return {
        question: `A $${R}\\,\\Omega$ resistor is connected across a $${V}\\,\\text{V}$ supply. Find the current.`,
        steps: [ s("Ohm's law", "p.d. equals current times resistance.", `$V = IR$`), s("Rearrange", "Divide voltage by resistance.", `$I = \\dfrac{V}{R} = ${fmt(I)}\\,\\text{A}$`) ],
        answer: `$I = ${fmt(I)}\\,\\text{A}$`, viz: { kind: "circuit", series: true, R1: R, V } }; } },
      { tier: "2 · Standard", generate() { const V = rnd(6, 18, 1), R1 = rnd(2, 10, 1), R2 = rnd(2, 10, 1); const Rt = R1 + R2, I = V / Rt, V2 = I * R2; return {
        question: `$R_1 = ${R1}\\,\\Omega$ and $R_2 = ${R2}\\,\\Omega$ are in **series** across $${V}\\,\\text{V}$. Find the current and the p.d. across $R_2$.`,
        steps: [ s("Combine in series", "Series resistances add.", `$R = ${Rt}\\,\\Omega$`), s("Total current", "One current flows everywhere.", `$I = \\dfrac{V}{R} = ${fmt(I)}\\,\\text{A}$`), s("p.d. across R₂", "Apply Ohm's law to R₂.", `$V_2 = IR_2 = ${fmt(V2)}\\,\\text{V}$`) ],
        answer: `$I = ${fmt(I)}\\,\\text{A}$,  $V_2 = ${fmt(V2)}\\,\\text{V}$`, viz: { kind: "circuit", series: true, R1, R2, V } }; } },
      { tier: "3 · Application", generate() { const V = rnd(6, 12, 1), R1 = rnd(3, 8, 1), R2 = rnd(3, 8, 1); const Rp = (R1 * R2) / (R1 + R2), It = V / Rp; return {
        question: `$R_1 = ${R1}\\,\\Omega$ and $R_2 = ${R2}\\,\\Omega$ are in **parallel** across $${V}\\,\\text{V}$. Find the combined resistance and total current.`,
        steps: [ s("Combine in parallel", "Add reciprocals, then invert.", `$\\dfrac{1}{R} = \\dfrac{1}{${R1}}+\\dfrac{1}{${R2}} \\Rightarrow R = ${fmt(Rp)}\\,\\Omega$`), s("Same p.d. on each branch", "Both resistors see the full supply.", `$I_1 = ${fmt(V / R1)}\\,\\text{A},\\ I_2 = ${fmt(V / R2)}\\,\\text{A}$`), s("Total current", "Branch currents add at the junction.", `$I = ${fmt(It)}\\,\\text{A}$`) ],
        answer: `$R = ${fmt(Rp)}\\,\\Omega$,  $I = ${fmt(It)}\\,\\text{A}$`, viz: { kind: "circuit", series: false, R1, R2, V } }; } },
      { tier: "4 · Multi-step", generate() { const emf = rnd(6, 12, 1), r = rnd(0.5, 2, 0.5), R = rnd(3, 10, 1); const I = emf / (R + r), Vt = I * R; return {
        question: `A cell of e.m.f. $${emf}\\,\\text{V}$ and internal resistance $${fmt(r)}\\,\\Omega$ drives a $${R}\\,\\Omega$ resistor. Find the current and terminal p.d.`,
        steps: [ s("Include internal resistance", "The e.m.f. drives current through R and r in series.", `$\\varepsilon = I(R+r)$`), s("Solve for current", "Divide the e.m.f. by the total resistance.", `$I = ${fmt(I)}\\,\\text{A}$`), s("Terminal p.d.", "The e.m.f. minus the 'lost volts' Ir.", `$V = IR = ${fmt(Vt)}\\,\\text{V}$`) ],
        answer: `$I = ${fmt(I)}\\,\\text{A}$,  $V = ${fmt(Vt)}\\,\\text{V}$`, viz: { kind: "circuit", series: true, R1: R, V: emf } }; } },
      { tier: "5 · Exam-level", generate() { const V = rnd(9, 15, 1), R1 = rnd(2, 8, 1), R2 = rnd(2, 8, 1); const Vout = (V * R2) / (R1 + R2); return {
        question: `A potential divider uses $R_1 = ${R1}\\,\\Omega$ and $R_2 = ${R2}\\,\\Omega$ across $${V}\\,\\text{V}$, output across $R_2$. Find the output, and say what happens if $R_2$ is a thermistor that heats up.`,
        steps: [ s("Divider rule", "The output is the supply shared in proportion to R₂.", `$V_{out} = V\\dfrac{R_2}{R_1+R_2}$`), s("Evaluate", "p.d. across the lower resistor.", `$V_{out} = ${fmt(Vout)}\\,\\text{V}$`), s("Reason about the thermistor", "Warmer ⇒ lower R₂ ⇒ smaller share of voltage.", `$R_2\\downarrow \\Rightarrow V_{out}\\downarrow$`) ],
        answer: `$V_{out} = ${fmt(Vout)}\\,\\text{V}$; output **falls** as the thermistor warms.`, viz: { kind: "circuit", series: true, R1, R2, V } }; } },
    ],
  },

  // ============================ CIRCULAR MOTION ============================
  "phy-circular-motion": {
    topicId: "phy-circular-motion",
    concept: "Uniform circular motion needs a centre-directed (centripetal) resultant force mv²/r, provided by tension, gravity, friction, etc.",
    levels: [
      { tier: "1 · Recall", generate() { const v = rnd(4, 14, 1), r = rnd(2, 8, 1); const a = (v * v) / r; return {
        question: `An object moves in a circle of radius $${r}\\,\\text{m}$ at $${v}\\,\\text{m s}^{-1}$. Find the centripetal acceleration.`,
        steps: [ s("Centripetal acceleration", "Directed to the centre, magnitude v²/r.", `$a = \\dfrac{v^2}{r} = ${fmt(a)}\\,\\text{m s}^{-2}$`) ],
        answer: `$a = ${fmt(a)}\\,\\text{m s}^{-2}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "2 · Standard", generate() { const m = rnd(0.5, 3, 0.5), v = rnd(3, 10, 1), r = rnd(1, 5, 0.5); const F = (m * v * v) / r; return {
        question: `A $${fmt(m)}\\,\\text{kg}$ mass moves in a circle of radius $${fmt(r)}\\,\\text{m}$ at $${v}\\,\\text{m s}^{-1}$. Find the centripetal force.`,
        steps: [ s("Newton's 2nd law for circles", "Resultant force = mass × centripetal acceleration.", `$F = \\dfrac{mv^2}{r} = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "3 · Application", generate() { const v = rnd(6, 16, 1), r = rnd(20, 60, 5); const omega = v / r, T = (2 * Math.PI) / omega; return {
        question: `A car goes round a circular track of radius $${r}\\,\\text{m}$ at $${v}\\,\\text{m s}^{-1}$. Find the angular speed and the lap time.`,
        steps: [ s("Angular speed", "Rate of sweeping angle; ω = v/r.", `$\\omega = ${fmt(omega)}\\,\\text{rad s}^{-1}$`), s("Period", "One lap is 2π radians.", `$T = \\dfrac{2\\pi}{\\omega} = ${fmt(T)}\\,\\text{s}$`) ],
        answer: `$\\omega = ${fmt(omega)}\\,\\text{rad s}^{-1}$,  $T = ${fmt(T)}\\,\\text{s}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "4 · Multi-step", generate() { const r = rnd(0.5, 1.5, 0.1); const vMin = Math.sqrt(g * r); return {
        question: `A bucket of water is whirled in a **vertical** circle of radius $${fmt(r)}\\,\\text{m}$. Find the minimum speed at the top for the water to stay in.`,
        steps: [ s("Forces at the top", "Both gravity and contact force point down, toward the centre.", `$mg + N = \\dfrac{mv^2}{r}$`), s("Minimum condition", "The slowest safe speed is when N just reaches zero.", `$mg = \\dfrac{mv^2}{r} \\Rightarrow v = \\sqrt{gr}$`), s("Evaluate", "The mass cancels.", `$v = ${fmt(vMin)}\\,\\text{m s}^{-1}$`) ],
        answer: `$v_{min} = ${fmt(vMin)}\\,\\text{m s}^{-1}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "5 · Exam-level", generate() { const m = rnd(0.2, 0.8, 0.1), v = rnd(4, 9, 1), r = rnd(0.8, 1.6, 0.1); const T = m * g + (m * v * v) / r; return {
        question: `A $${fmt(m)}\\,\\text{kg}$ ball on a string moves in a vertical circle of radius $${fmt(r)}\\,\\text{m}$. At the **bottom** its speed is $${v}\\,\\text{m s}^{-1}$. Find the tension there.`,
        steps: [ s("Forces at the bottom", "Tension up (to centre), weight down (away).", `$T - mg = \\dfrac{mv^2}{r}$`), s("Make T the subject", "The string supports the weight and supplies the centripetal force.", `$T = mg + \\dfrac{mv^2}{r}$`), s("Substitute", "This is why the string most often snaps at the bottom.", `$T = ${fmt(T)}\\,\\text{N}$`) ],
        answer: `$T = ${fmt(T)}\\,\\text{N}$`, viz: { kind: "orbit", showF: true } }; } },
    ],
  },

  // ============================ FORCES & MOMENTS ============================
  "phy-forces-moments": {
    topicId: "phy-forces-moments",
    concept: "Equilibrium needs zero resultant force AND zero resultant moment. A moment is force × perpendicular distance.",
    levels: [
      { tier: "1 · Recall", generate() { const F = rnd(5, 40, 5), d = rnd(0.2, 1.2, 0.1); const M = F * d; return {
        question: `A force of $${F}\\,\\text{N}$ acts at a perpendicular distance of $${fmt(d)}\\,\\text{m}$ from a pivot. Find the moment.`,
        steps: [ s("Definition of moment", "Force times perpendicular distance.", `$M = Fd = ${fmt(M)}\\,\\text{N m}$`) ],
        answer: `$M = ${fmt(M)}\\,\\text{N m}$`, viz: { kind: "beam", lw: 0, ld: 0, rw: F, rd: d * 40 } }; } },
      { tier: "2 · Standard", generate() { const W1 = rnd(4, 20, 2), d1 = rnd(20, 60, 5), d2 = rnd(20, 60, 5); const W2 = (W1 * d1) / d2; return {
        question: `A beam balances on a central pivot. A $${W1}\\,\\text{N}$ weight sits $${d1}\\,\\text{cm}$ from the pivot. What weight $${d2}\\,\\text{cm}$ on the other side balances it?`,
        steps: [ s("Principle of moments", "Clockwise moments equal anticlockwise moments.", `$W_1 d_1 = W_2 d_2$`), s("Solve", "Units of distance cancel.", `$W_2 = \\dfrac{W_1 d_1}{d_2} = ${fmt(W2)}\\,\\text{N}$`) ],
        answer: `$W_2 = ${fmt(W2)}\\,\\text{N}$`, viz: { kind: "beam", lw: W1, ld: d1, rw: W2, rd: d2 } }; } },
      { tier: "3 · Application", generate() { const W = rnd(20, 60, 5), L = rnd(2, 4, 0.5); return {
        question: `A uniform beam of weight $${W}\\,\\text{N}$ and length $${fmt(L)}\\,\\text{m}$ rests on a support at each end. Find the force on each support.`,
        steps: [ s("Weight acts at the centre", "For a uniform beam, gravity acts at the midpoint.", `centre at $${fmt(L / 2)}\\,\\text{m}$`), s("Take moments about one end", "This removes that reaction from the equation.", `$R_{far}\\times L = W\\times\\tfrac{L}{2} \\Rightarrow R_{far} = \\tfrac{W}{2}$`), s("Balance the forces", "The two reactions add to the total weight.", `$R = \\tfrac{W}{2} = ${fmt(W / 2)}\\,\\text{N}$ each`) ],
        answer: `Each support carries $${fmt(W / 2)}\\,\\text{N}$`, viz: { kind: "beam", lw: W / 2, ld: 40, rw: W / 2, rd: 40 } }; } },
      { tier: "4 · Multi-step", generate() { const W = rnd(30, 80, 5), L = rnd(3, 5, 0.5), a = rnd(0.5, 1, 0.25); const dW = L / 2 - a, dR = L - a; const W2 = (W * dW) / dR; return {
        question: `A uniform beam of weight $${W}\\,\\text{N}$ and length $${fmt(L)}\\,\\text{m}$ is pivoted $${fmt(a)}\\,\\text{m}$ from its left end. What downward force at the **right end** keeps it horizontal?`,
        steps: [ s("Locate the weight", "It acts at the centre, (L/2 − a) right of the pivot.", `$d_W = ${fmt(dW)}\\,\\text{m}$`), s("The load's lever arm", "The right end is (L − a) from the pivot.", `$d_2 = ${fmt(dR)}\\,\\text{m}$`), s("Take moments about the pivot", "The weight turns one way; the load must turn the other.", `$W_2 = \\dfrac{W\\,d_W}{d_2} = ${fmt(W2)}\\,\\text{N}$`) ],
        answer: `$W_2 = ${fmt(W2)}\\,\\text{N}$`, viz: { kind: "beam", lw: W, ld: dW * 40, rw: W2, rd: dR * 40 } }; } },
      { tier: "5 · Exam-level", generate() { const F = rnd(40, 90, 5), ang = rnd(20, 50, 5); const r = ang * Math.PI / 180; const Fh = F * Math.cos(r), Fv = F * Math.sin(r); return {
        question: `A force of $${F}\\,\\text{N}$ acts at $${ang}^{\\circ}$ above the horizontal. Resolve it into horizontal and vertical components.`,
        steps: [ s("Resolve horizontally", "The adjacent component uses cosine.", `$F_x = F\\cos\\theta = ${fmt(Fh)}\\,\\text{N}$`), s("Resolve vertically", "The opposite component uses sine.", `$F_y = F\\sin\\theta = ${fmt(Fv)}\\,\\text{N}$`), s("Check", "They recombine by Pythagoras.", `$\\sqrt{F_x^2+F_y^2} \\approx ${F}\\,\\text{N}$`) ],
        answer: `$F_x = ${fmt(Fh)}\\,\\text{N}$,  $F_y = ${fmt(Fv)}\\,\\text{N}$`, viz: { kind: "bars", items: [{ label: "Fx", v: Fh }, { label: "Fy", v: Fv }] } }; } },
    ],
  },

  // ============================ WORK, ENERGY & POWER ============================
  "phy-work-energy-power": {
    topicId: "phy-work-energy-power",
    concept: "Work is energy transferred by a force; energy is conserved; power is energy per second.",
    levels: [
      { tier: "1 · Recall", generate() { const F = rnd(10, 60, 5), d = rnd(2, 12, 1); const W = F * d; return {
        question: `A force of $${F}\\,\\text{N}$ moves an object $${d}\\,\\text{m}$ in its own direction. Find the work done.`,
        steps: [ s("Definition of work", "Force times distance moved in the force's direction.", `$W = Fs = ${fmt(W)}\\,\\text{J}$`) ],
        answer: `$W = ${fmt(W)}\\,\\text{J}$`, viz: { kind: "bars", items: [{ label: "W", v: W }] } }; } },
      { tier: "2 · Standard", generate() { const m = rnd(0.5, 4, 0.5), v = rnd(4, 20, 1); const KE = 0.5 * m * v * v; return {
        question: `Find the kinetic energy of a $${fmt(m)}\\,\\text{kg}$ object moving at $${v}\\,\\text{m s}^{-1}$.`,
        steps: [ s("Kinetic energy formula", "Energy of motion is ½mv².", `$E_k = \\tfrac12 mv^2 = ${fmt(KE)}\\,\\text{J}$`) ],
        answer: `$E_k = ${fmt(KE)}\\,\\text{J}$`, viz: { kind: "bars", items: [{ label: "Eₖ", v: KE }] } }; } },
      { tier: "3 · Application", generate() { const m = rnd(50, 400, 10), hh = rnd(3, 12, 1), t = rnd(5, 20, 1); const E = m * g * hh, P = E / t; return {
        question: `A pump raises $${m}\\,\\text{kg}$ of water through $${hh}\\,\\text{m}$ in $${t}\\,\\text{s}$. Find the useful output power.`,
        steps: [ s("Energy gained", "The water gains gravitational PE mgh.", `$E = mgh = ${fmt(E)}\\,\\text{J}$`), s("Power is energy per second", "Divide by time.", `$P = \\dfrac{E}{t} = ${fmt(P)}\\,\\text{W}$`) ],
        answer: `$P = ${fmt(P)}\\,\\text{W}$`, viz: { kind: "bars", items: [{ label: "E", v: E }, { label: "P", v: P }] } }; } },
      { tier: "4 · Multi-step", generate() { const Pin = rnd(500, 2000, 100), m = rnd(40, 120, 10), hh = rnd(2, 6, 1), t = rnd(4, 10, 1); const useful = (m * g * hh) / t, eff = (useful / Pin) * 100; return {
        question: `A motor rated $${Pin}\\,\\text{W}$ lifts a $${m}\\,\\text{kg}$ load through $${hh}\\,\\text{m}$ in $${t}\\,\\text{s}$. Find its efficiency.`,
        steps: [ s("Useful output power", "Useful energy is mgh; divide by time.", `$P_{out} = \\dfrac{mgh}{t} = ${fmt(useful)}\\,\\text{W}$`), s("Efficiency", "Useful power out ÷ total power in.", `$\\eta = \\dfrac{P_{out}}{P_{in}}\\times100\\% = ${fmt(eff)}\\%$`) ],
        answer: `$\\eta = ${fmt(eff)}\\%$`, viz: { kind: "bars", items: [{ label: "Pin", v: Pin, tone: "bad" }, { label: "Pout", v: useful, tone: "good" }] } }; } },
      { tier: "5 · Exam-level", generate() { const m = rnd(0.5, 2, 0.5), h0 = rnd(5, 20, 1), vend = rnd(6, 12, 1); const Ep = m * g * h0, Ek = 0.5 * m * vend * vend, lost = Ep - Ek; return {
        question: `A $${fmt(m)}\\,\\text{kg}$ ball dropped from $${h0}\\,\\text{m}$ hits the ground at $${vend}\\,\\text{m s}^{-1}$. How much energy is lost to air resistance?`,
        steps: [ s("Energy at the start", "All gravitational PE.", `$E_p = mgh = ${fmt(Ep)}\\,\\text{J}$`), s("Energy at the ground", "Now kinetic energy.", `$E_k = \\tfrac12 mv^2 = ${fmt(Ek)}\\,\\text{J}$`), s("Energy conservation", "The shortfall was dissipated by drag.", `$E_{lost} = E_p - E_k = ${fmt(lost)}\\,\\text{J}$`) ],
        answer: `$E_{lost} = ${fmt(lost)}\\,\\text{J}$`, viz: { kind: "bars", items: [{ label: "Ep", v: Ep }, { label: "Ek", v: Ek, tone: "good" }, { label: "lost", v: lost, tone: "bad" }] } }; } },
    ],
  },

  // ============================ DEFORMATION ============================
  "phy-deformation": {
    topicId: "phy-deformation",
    concept: "Hooke's law (F = kx) holds up to the limit of proportionality. Stress/strain give the Young modulus; area under F–x is the stored elastic energy.",
    levels: [
      { tier: "1 · Recall", generate() { const k = rnd(20, 200, 10), x = rnd(2, 10, 1) / 100; const F = k * x; return {
        question: `A spring of stiffness $${k}\\,\\text{N m}^{-1}$ is stretched by $${fmt(x * 100)}\\,\\text{cm}$. Find the force.`,
        steps: [ s("Hooke's law", "Force is proportional to extension.", `$F = kx = ${k}\\times${fmt(x)} = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$`, viz: { kind: "spring", extRel: x * 100 / 10 } }; } },
      { tier: "2 · Standard", generate() { const F = rnd(2, 12, 1), x = rnd(1, 8, 1) / 100; const k = F / x; return {
        question: `A load of $${F}\\,\\text{N}$ extends a spring by $${fmt(x * 100)}\\,\\text{cm}$. Find the spring constant.`,
        steps: [ s("Rearrange Hooke's law", "k is force per unit extension.", `$k = \\dfrac{F}{x} = \\dfrac{${F}}{${fmt(x)}} = ${fmt(k)}\\,\\text{N m}^{-1}$`) ],
        answer: `$k = ${fmt(k)}\\,\\text{N m}^{-1}$`, viz: { kind: "spring", extRel: x * 100 / 8 } }; } },
      { tier: "3 · Application", generate() { const k = rnd(50, 300, 10), x = rnd(2, 10, 1) / 100; const E = 0.5 * k * x * x; return {
        question: `A spring of stiffness $${k}\\,\\text{N m}^{-1}$ is stretched by $${fmt(x * 100)}\\,\\text{cm}$. Find the elastic energy stored.`,
        steps: [ s("Energy = area under F–x", "For a linear spring this is a triangle.", `$E = \\tfrac12 Fx = \\tfrac12 kx^2$`), s("Substitute", "Use the extension in metres.", `$E = \\tfrac12\\times${k}\\times${fmt(x)}^2 = ${fmt(E)}\\,\\text{J}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{J}$`, viz: { kind: "spring", extRel: x * 100 / 10 } }; } },
      { tier: "4 · Multi-step", generate() { const Fn = rnd(20, 100, 5), d = rnd(0.5, 2, 0.5) / 1000, L = rnd(1, 3, 0.5); const A = Math.PI * (d / 2) ** 2; const stress = Fn / A; return {
        question: `A wire of diameter $${fmt(d * 1000)}\\,\\text{mm}$ and length $${fmt(L)}\\,\\text{m}$ carries a load of $${Fn}\\,\\text{N}$. Find the tensile stress.`,
        steps: [ s("Cross-sectional area", "Circle of radius d/2.", `$A = \\pi (d/2)^2 = ${fmt(A)}\\,\\text{m}^2$`), s("Stress = force / area", "Force spread over the cross-section.", `$\\sigma = \\dfrac{F}{A} = ${fmt(stress)}\\,\\text{Pa}$`) ],
        answer: `$\\sigma = ${fmt(stress)}\\,\\text{Pa}$`, viz: { kind: "spring", extRel: 0.6 } }; } },
      { tier: "5 · Exam-level", generate() { const Fn = rnd(30, 120, 10), d = rnd(0.4, 1.2, 0.1) / 1000, L = rnd(1.5, 3, 0.5), ext = rnd(0.5, 3, 0.5) / 1000; const A = Math.PI * (d / 2) ** 2; const E = (Fn * L) / (A * ext); return {
        question: `A wire (diameter $${fmt(d * 1000)}\\,\\text{mm}$, length $${fmt(L)}\\,\\text{m}$) stretches by $${fmt(ext * 1000)}\\,\\text{mm}$ under a $${Fn}\\,\\text{N}$ load. Find the Young modulus.`,
        steps: [ s("Area", "From the diameter.", `$A = \\pi(d/2)^2 = ${fmt(A)}\\,\\text{m}^2$`), s("Stress and strain", "σ = F/A and ε = x/L.", `$\\sigma = ${fmt(Fn / A)}\\,\\text{Pa},\\ \\varepsilon = ${fmt(ext / L)}$`), s("Young modulus", "E is the ratio of stress to strain.", `$E = \\dfrac{FL}{Ax} = ${fmt(E)}\\,\\text{Pa}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{Pa}$`, viz: { kind: "spring", extRel: 0.8 } }; } },
    ],
  },

  // ============================ ELECTRICITY ============================
  "phy-electricity": {
    topicId: "phy-electricity",
    concept: "Current is the rate of flow of charge; power dissipated is VI; resistance depends on material, length and cross-section (R = ρL/A).",
    levels: [
      { tier: "1 · Recall", generate() { const Q = rnd(10, 120, 5), t = rnd(2, 20, 1); const I = Q / t; return {
        question: `A charge of $${Q}\\,\\text{C}$ flows past a point in $${t}\\,\\text{s}$. Find the current.`,
        steps: [ s("Definition of current", "Current is charge per unit time.", `$I = \\dfrac{Q}{t} = ${fmt(I)}\\,\\text{A}$`) ],
        answer: `$I = ${fmt(I)}\\,\\text{A}$`, viz: { kind: "circuit", series: true, R1: 10, V: 12 } }; } },
      { tier: "2 · Standard", generate() { const V = rnd(6, 24, 1), I = rnd(0.2, 3, 0.1); const P = V * I; return {
        question: `A device draws $${fmt(I)}\\,\\text{A}$ from a $${V}\\,\\text{V}$ supply. Find the power dissipated.`,
        steps: [ s("Electrical power", "Power is p.d. times current.", `$P = VI = ${V}\\times${fmt(I)} = ${fmt(P)}\\,\\text{W}$`) ],
        answer: `$P = ${fmt(P)}\\,\\text{W}$`, viz: { kind: "circuit", series: true, R1: Math.round(V / I), V } }; } },
      { tier: "3 · Application", generate() { const P = rnd(20, 100, 5), R = rnd(4, 20, 1); const I = Math.sqrt(P / R), V = I * R; return {
        question: `A resistor of $${R}\\,\\Omega$ dissipates $${P}\\,\\text{W}$. Find the current through it and the p.d. across it.`,
        steps: [ s("Choose the power form", "Use P = I²R since P and R are known.", `$I = \\sqrt{\\dfrac{P}{R}} = ${fmt(I)}\\,\\text{A}$`), s("p.d.", "Then apply Ohm's law.", `$V = IR = ${fmt(V)}\\,\\text{V}$`) ],
        answer: `$I = ${fmt(I)}\\,\\text{A}$,  $V = ${fmt(V)}\\,\\text{V}$`, viz: { kind: "circuit", series: true, R1: R, V: Math.round(V) } }; } },
      { tier: "4 · Multi-step", generate() { const rho = rnd(15, 60, 5) * 1e-9, L = rnd(2, 10, 1), dmm = rnd(0.3, 1, 0.1); const A = Math.PI * (dmm / 2000) ** 2; const R = (rho * L) / A; return {
        question: `A wire of length $${L}\\,\\text{m}$, diameter $${fmt(dmm)}\\,\\text{mm}$ and resistivity $${fmt(rho * 1e9)}\\times10^{-9}\\,\\Omega\\,\\text{m}$ is used. Find its resistance.`,
        steps: [ s("Cross-sectional area", "Circle from the diameter.", `$A = \\pi(d/2)^2 = ${fmt(A)}\\,\\text{m}^2$`), s("Resistivity formula", "Longer wire ⇒ more R; thicker ⇒ less R.", `$R = \\dfrac{\\rho L}{A} = ${fmt(R)}\\,\\Omega$`) ],
        answer: `$R = ${fmt(R)}\\,\\Omega$`, viz: { kind: "circuit", series: true, R1: Math.max(1, Math.round(R)), V: 6 } }; } },
      { tier: "5 · Exam-level", generate() { const P = rnd(40, 100, 5), V = rnd(6, 12, 1), hrs = rnd(2, 8, 1); const I = P / V, energyJ = P * hrs * 3600, kWh = (P / 1000) * hrs; return {
        question: `A $${P}\\,\\text{W}$ lamp runs from a $${V}\\,\\text{V}$ supply for $${hrs}\\,\\text{hours}$. Find the current and the energy used (in J and kW·h).`,
        steps: [ s("Current", "From P = VI.", `$I = \\dfrac{P}{V} = ${fmt(I)}\\,\\text{A}$`), s("Energy in joules", "Energy is power times time in seconds.", `$E = Pt = ${P}\\times${hrs}\\times3600 = ${fmt(energyJ)}\\,\\text{J}$`), s("In kW·h", "The unit used on electricity bills.", `$E = ${fmt(P / 1000)}\\times${hrs} = ${fmt(kWh)}\\,\\text{kW h}$`) ],
        answer: `$I = ${fmt(I)}\\,\\text{A}$,  $E = ${fmt(energyJ)}\\,\\text{J} = ${fmt(kWh)}\\,\\text{kW h}$`, viz: { kind: "circuit", series: true, R1: Math.round(V / I), V } }; } },
    ],
  },

  // ============================ GRAVITATIONAL FIELDS ============================
  "phy-gravitation": {
    topicId: "phy-gravitation",
    concept: "Gravity is an inverse-square attractive field. Field strength g = GM/r²; for orbits gravity provides the centripetal force.",
    levels: [
      { tier: "1 · Recall", generate() { const M = rnd(4, 8, 1) * 1e24, r = rnd(6, 9, 1) * 1e6; const gg = (G * M) / (r * r); return {
        question: `A planet has mass $${fmt(M / 1e24)}\\times10^{24}\\,\\text{kg}$ and radius $${fmt(r / 1e6)}\\times10^{6}\\,\\text{m}$. Find the surface gravitational field strength.`,
        steps: [ s("Field strength", "g is the field per unit mass, GM/r².", `$g = \\dfrac{GM}{r^2} = ${fmt(gg)}\\,\\text{N kg}^{-1}$`) ],
        answer: `$g = ${fmt(gg)}\\,\\text{N kg}^{-1}$`, viz: { kind: "field", attractive: true, distRel: 3 } }; } },
      { tier: "2 · Standard", generate() { const m1 = rnd(2, 9, 1) * 1e3, m2 = rnd(2, 9, 1) * 1e3, r = rnd(1, 5, 0.5); const F = (G * m1 * m2) / (r * r); return {
        question: `Two masses, $${fmt(m1 / 1e3)}\\times10^{3}\\,\\text{kg}$ and $${fmt(m2 / 1e3)}\\times10^{3}\\,\\text{kg}$, are $${fmt(r)}\\,\\text{m}$ apart. Find the gravitational force between them.`,
        steps: [ s("Newton's law of gravitation", "An inverse-square attractive force.", `$F = \\dfrac{Gm_1m_2}{r^2}$`), s("Substitute", "G = 6.67×10⁻¹¹.", `$F = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$`, viz: { kind: "field", attractive: true, distRel: r } }; } },
      { tier: "3 · Application", generate() { const M = 6.0e24, r = rnd(7, 12, 0.5) * 1e6; const v = Math.sqrt((G * M) / r); return {
        question: `A satellite orbits the Earth (mass $6.0\\times10^{24}\\,\\text{kg}$) at radius $${fmt(r / 1e6)}\\times10^{6}\\,\\text{m}$. Find its orbital speed.`,
        steps: [ s("Gravity is the centripetal force", "Set the gravitational force equal to mv²/r.", `$\\dfrac{GMm}{r^2} = \\dfrac{mv^2}{r}$`), s("Cancel m and solve", "The satellite's own mass cancels.", `$v = \\sqrt{\\dfrac{GM}{r}} = ${fmt(v)}\\,\\text{m s}^{-1}$`) ],
        answer: `$v = ${fmt(v)}\\,\\text{m s}^{-1}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "4 · Multi-step", generate() { const M = 6.0e24, r = rnd(7, 15, 0.5) * 1e6; const v = Math.sqrt((G * M) / r), T = (2 * Math.PI * r) / v; return {
        question: `Find the period of a satellite orbiting the Earth (mass $6.0\\times10^{24}\\,\\text{kg}$) at radius $${fmt(r / 1e6)}\\times10^{6}\\,\\text{m}$.`,
        steps: [ s("Orbital speed", "From gravity = centripetal force.", `$v = \\sqrt{GM/r} = ${fmt(v)}\\,\\text{m s}^{-1}$`), s("Period", "Time for one circumference.", `$T = \\dfrac{2\\pi r}{v} = ${fmt(T)}\\,\\text{s} \\approx ${fmt(T / 3600)}\\,\\text{h}$`) ],
        answer: `$T = ${fmt(T)}\\,\\text{s}$ ($\\approx ${fmt(T / 3600)}\\,\\text{h}$)`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "5 · Exam-level", generate() { const M = 6.0e24, r = rnd(7, 20, 1) * 1e6, m = rnd(200, 800, 50); const phi = -(G * M) / r, Ep = phi * m; return {
        question: `A $${m}\\,\\text{kg}$ probe is at radius $${fmt(r / 1e6)}\\times10^{6}\\,\\text{m}$ from the Earth (mass $6.0\\times10^{24}\\,\\text{kg}$). Find the gravitational potential and the probe's potential energy there.`,
        steps: [ s("Gravitational potential", "Negative because the field is attractive (zero at infinity).", `$\\phi = -\\dfrac{GM}{r} = ${fmt(phi)}\\,\\text{J kg}^{-1}$`), s("Potential energy", "Multiply potential by the probe's mass.", `$E_p = m\\phi = ${fmt(Ep)}\\,\\text{J}$`) ],
        answer: `$\\phi = ${fmt(phi)}\\,\\text{J kg}^{-1}$,  $E_p = ${fmt(Ep)}\\,\\text{J}$`, viz: { kind: "field", attractive: true, distRel: r / 3e6 } }; } },
    ],
  },

  // ============================ ELECTRIC FIELDS ============================
  "phy-electric-fields": {
    topicId: "phy-electric-fields",
    concept: "Coulomb's law is inverse-square but charges attract or repel. Field strength E = F/q; between parallel plates E = V/d (uniform).",
    levels: [
      { tier: "1 · Recall", generate() { const V = rnd(100, 2000, 100), d = rnd(2, 20, 1) / 1000; const E = V / d; return {
        question: `Two parallel plates $${fmt(d * 1000)}\\,\\text{mm}$ apart have a p.d. of $${V}\\,\\text{V}$. Find the electric field strength between them.`,
        steps: [ s("Uniform field", "Between parallel plates the field is V/d.", `$E = \\dfrac{V}{d} = ${fmt(E)}\\,\\text{V m}^{-1}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{V m}^{-1}$`, viz: { kind: "field", attractive: false, distRel: 3 } }; } },
      { tier: "2 · Standard", generate() { const q1 = rnd(1, 9, 1) * 1e-6, q2 = rnd(1, 9, 1) * 1e-6, r = rnd(0.05, 0.3, 0.05); const F = (kC * q1 * q2) / (r * r); return {
        question: `Two charges of $${fmt(q1 * 1e6)}\\,\\mu\\text{C}$ and $${fmt(q2 * 1e6)}\\,\\mu\\text{C}$ are $${fmt(r)}\\,\\text{m}$ apart. Find the force between them.`,
        steps: [ s("Coulomb's law", "Inverse-square, like gravity but for charge.", `$F = \\dfrac{Q_1Q_2}{4\\pi\\varepsilon_0 r^2} = \\dfrac{kQ_1Q_2}{r^2}$`), s("Substitute", "k = 8.99×10⁹.", `$F = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$ (repulsive if like charges)`, viz: { kind: "field", attractive: false, distRel: r * 10 } }; } },
      { tier: "3 · Application", generate() { const Q = rnd(2, 9, 1) * 1e-9, r = rnd(0.1, 0.5, 0.05); const E = (kC * Q) / (r * r); return {
        question: `Find the electric field strength $${fmt(r)}\\,\\text{m}$ from a point charge of $${fmt(Q * 1e9)}\\,\\text{nC}$.`,
        steps: [ s("Radial field of a point charge", "E = kQ/r² points away from a positive charge.", `$E = \\dfrac{kQ}{r^2} = ${fmt(E)}\\,\\text{V m}^{-1}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{V m}^{-1}$`, viz: { kind: "field", attractive: false, distRel: r * 8 } }; } },
      { tier: "4 · Multi-step", generate() { const V = rnd(200, 1000, 100), d = rnd(5, 20, 1) / 1000; const E = V / d, F = eC * E; return {
        question: `An electron sits between parallel plates $${fmt(d * 1000)}\\,\\text{mm}$ apart with a p.d. of $${V}\\,\\text{V}$. Find the force on the electron.`,
        steps: [ s("Field strength", "Uniform field between the plates.", `$E = \\dfrac{V}{d} = ${fmt(E)}\\,\\text{V m}^{-1}$`), s("Force on the charge", "F = qE with the electron's charge.", `$F = eE = 1.6\\times10^{-19}\\times${fmt(E)} = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$`, viz: { kind: "field", attractive: true, distRel: 3 } }; } },
      { tier: "5 · Exam-level", generate() { const V = rnd(500, 3000, 100); const vel = Math.sqrt((2 * eC * V) / 9.11e-31); return {
        question: `An electron is accelerated from rest through a p.d. of $${V}\\,\\text{V}$. Find its final speed. (electron mass $9.11\\times10^{-31}\\,\\text{kg}$)`,
        steps: [ s("Energy gained", "Work done on the charge becomes kinetic energy.", `$eV = \\tfrac12 mv^2$`), s("Solve for v", "Rearrange for the speed.", `$v = \\sqrt{\\dfrac{2eV}{m}} = ${fmt(vel)}\\,\\text{m s}^{-1}$`) ],
        answer: `$v = ${fmt(vel)}\\,\\text{m s}^{-1}$`, viz: { kind: "field", attractive: false, distRel: 3 } }; } },
    ],
  },

  // ============================ MAGNETIC FIELDS ============================
  "phy-magnetic-fields": {
    topicId: "phy-magnetic-fields",
    concept: "A current or moving charge in a magnetic field feels a force (F = BIL, F = BQv). A charge moving across a field travels in a circle.",
    levels: [
      { tier: "1 · Recall", generate() { const B = rnd(0.1, 1, 0.1), I = rnd(1, 8, 0.5), L = rnd(0.05, 0.3, 0.05); const F = B * I * L; return {
        question: `A wire of length $${fmt(L)}\\,\\text{m}$ carrying $${fmt(I)}\\,\\text{A}$ sits at right angles to a $${fmt(B)}\\,\\text{T}$ field. Find the force on it.`,
        steps: [ s("Force on a current", "Perpendicular field gives F = BIL.", `$F = BIL = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "2 · Standard", generate() { const B = rnd(0.2, 1.5, 0.1), Q = eC, v = rnd(1, 9, 1) * 1e6; const F = B * Q * v; return {
        question: `An electron moves at $${fmt(v / 1e6)}\\times10^{6}\\,\\text{m s}^{-1}$ across a $${fmt(B)}\\,\\text{T}$ field. Find the magnetic force on it.`,
        steps: [ s("Force on a moving charge", "F = BQv, perpendicular to the velocity.", `$F = BQv = ${fmt(B)}\\times1.6\\times10^{-19}\\times${fmt(v)}$`), s("Evaluate", "This force is always at right angles to v.", `$F = ${fmt(F)}\\,\\text{N}$`) ],
        answer: `$F = ${fmt(F)}\\,\\text{N}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "3 · Application", generate() { const B = rnd(0.2, 1, 0.1), v = rnd(2, 9, 1) * 1e6, m = 9.11e-31; const r = (m * v) / (eC * B); return {
        question: `An electron enters a $${fmt(B)}\\,\\text{T}$ field at $${fmt(v / 1e6)}\\times10^{6}\\,\\text{m s}^{-1}$, perpendicular to it. Find the radius of its circular path.`,
        steps: [ s("Magnetic force = centripetal force", "The field bends the path into a circle.", `$BQv = \\dfrac{mv^2}{r}$`), s("Solve for r", "Cancel one v and rearrange.", `$r = \\dfrac{mv}{BQ} = ${fmt(r)}\\,\\text{m}$`) ],
        answer: `$r = ${fmt(r)}\\,\\text{m}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "4 · Multi-step", generate() { const N = rnd(50, 200, 10), B = rnd(0.1, 0.5, 0.05), I = rnd(1, 5, 0.5), A = rnd(10, 40, 5) / 10000; const torque = B * A * N * I; return {
        question: `A coil of $${N}$ turns and area $${fmt(A * 10000)}\\,\\text{cm}^2$ carries $${fmt(I)}\\,\\text{A}$ in a $${fmt(B)}\\,\\text{T}$ field (plane parallel to the field). Find the maximum torque.`,
        steps: [ s("Torque on a coil", "Maximum when the plane is along the field.", `$\\tau = BANI$`), s("Substitute", "Use the area in m².", `$\\tau = ${fmt(B)}\\times${fmt(A)}\\times${N}\\times${fmt(I)} = ${fmt(torque)}\\,\\text{N m}$`) ],
        answer: `$\\tau = ${fmt(torque)}\\,\\text{N m}$`, viz: { kind: "orbit", showF: true } }; } },
      { tier: "5 · Exam-level", generate() { const B = rnd(0.3, 1, 0.1), v = rnd(2, 8, 1) * 1e5, L = rnd(0.05, 0.2, 0.05); const emf = B * L * v; return {
        question: `A rod of length $${fmt(L)}\\,\\text{m}$ moves at $${fmt(v / 1e5)}\\times10^{5}\\,\\text{m s}^{-1}$ perpendicular to a $${fmt(B)}\\,\\text{T}$ field. Find the e.m.f. induced across it.`,
        steps: [ s("Motional e.m.f.", "The rod sweeps out flux; e.m.f. = BLv.", `$\\varepsilon = BLv$`), s("Substitute", "This is the basis of a simple generator.", `$\\varepsilon = ${fmt(B)}\\times${fmt(L)}\\times${fmt(v)} = ${fmt(emf)}\\,\\text{V}$`) ],
        answer: `$\\varepsilon = ${fmt(emf)}\\,\\text{V}$`, viz: { kind: "orbit", showF: true } }; } },
    ],
  },

  // ============================ THERMAL PHYSICS ============================
  "phy-thermal": {
    topicId: "phy-thermal",
    concept: "Heating changes internal energy: Q = mcΔθ raises temperature; Q = mL changes state at constant temperature.",
    levels: [
      { tier: "1 · Recall", generate() { const m = rnd(0.2, 2, 0.1), cH = 4200, dT = rnd(10, 60, 5); const Q = m * cH * dT; return {
        question: `Find the energy to heat $${fmt(m)}\\,\\text{kg}$ of water by $${dT}\\,\\text{K}$. (c = 4200 J kg⁻¹ K⁻¹)`,
        steps: [ s("Heat capacity equation", "Energy = mass × specific heat × temperature rise.", `$Q = mc\\Delta\\theta = ${fmt(Q)}\\,\\text{J}$`) ],
        answer: `$Q = ${fmt(Q)}\\,\\text{J}$`, viz: { kind: "gas", tempRel: dT / 60 } }; } },
      { tier: "2 · Standard", generate() { const m = rnd(0.1, 1, 0.1), L = rnd(2, 3.4, 0.1) * 1e5; const Q = m * L; return {
        question: `Find the energy to boil away $${fmt(m)}\\,\\text{kg}$ of water already at 100 °C. (specific latent heat of vaporisation $${fmt(L / 1e5)}\\times10^{5}\\,\\text{J kg}^{-1}$)`,
        steps: [ s("Latent heat", "Changing state needs energy but no temperature change.", `$Q = mL = ${fmt(m)}\\times${fmt(L)} = ${fmt(Q)}\\,\\text{J}$`) ],
        answer: `$Q = ${fmt(Q)}\\,\\text{J}$`, viz: { kind: "gas", tempRel: 1 } }; } },
      { tier: "3 · Application", generate() { const P = rnd(500, 2000, 100), m = rnd(0.3, 1.5, 0.1), cH = 4200, dT = rnd(20, 70, 5); const Q = m * cH * dT, t = Q / P; return {
        question: `A $${P}\\,\\text{W}$ heater warms $${fmt(m)}\\,\\text{kg}$ of water by $${dT}\\,\\text{K}$. How long does it take? (c = 4200 J kg⁻¹ K⁻¹, no losses)`,
        steps: [ s("Energy needed", "First find the heat required.", `$Q = mc\\Delta\\theta = ${fmt(Q)}\\,\\text{J}$`), s("Time from power", "Power is energy per second.", `$t = \\dfrac{Q}{P} = ${fmt(t)}\\,\\text{s}$`) ],
        answer: `$t = ${fmt(t)}\\,\\text{s}$`, viz: { kind: "gas", tempRel: dT / 70 } }; } },
      { tier: "4 · Multi-step", generate() { const P = rnd(40, 100, 10), m = rnd(0.05, 0.2, 0.05), L = 3.34e5, t = rnd(60, 300, 30); const Qin = P * t, mMelt = Qin / L; return {
        question: `A $${P}\\,\\text{W}$ heater is placed in ice at 0 °C for $${t}\\,\\text{s}$. How much ice melts? (latent heat of fusion $3.34\\times10^{5}\\,\\text{J kg}^{-1}$)`,
        steps: [ s("Energy supplied", "Power times time.", `$Q = Pt = ${fmt(Qin)}\\,\\text{J}$`), s("Mass melted", "All the energy goes into melting (temperature stays 0 °C).", `$m = \\dfrac{Q}{L} = ${fmt(mMelt)}\\,\\text{kg}$`) ],
        answer: `$m = ${fmt(mMelt)}\\,\\text{kg}$`, viz: { kind: "gas", tempRel: 0.2 } }; } },
      { tier: "5 · Exam-level", generate() { const mMetal = rnd(0.2, 0.8, 0.1), cMetal = rnd(200, 500, 20), tHot = rnd(80, 120, 5), mW = rnd(0.2, 0.6, 0.1), tW = rnd(15, 25, 1); const cW = 4200; const tFinal = (mMetal * cMetal * tHot + mW * cW * tW) / (mMetal * cMetal + mW * cW); return {
        question: `A $${fmt(mMetal)}\\,\\text{kg}$ metal block ($c = ${cMetal}\\,\\text{J kg}^{-1}\\text{K}^{-1}$) at $${tHot}\\,°\\text{C}$ is dropped into $${fmt(mW)}\\,\\text{kg}$ of water at $${tW}\\,°\\text{C}$. Find the final temperature.`,
        steps: [ s("Energy conservation", "Heat lost by the metal = heat gained by the water.", `$m_mc_m(\\theta_h-\\theta) = m_wc_w(\\theta-\\theta_w)$`), s("Solve for θ", "Rearrange for the common final temperature.", `$\\theta = ${fmt(tFinal)}\\,°\\text{C}$`) ],
        answer: `$\\theta = ${fmt(tFinal)}\\,°\\text{C}$`, viz: { kind: "gas", tempRel: 0.6 } }; } },
    ],
  },

  // ============================ IDEAL GASES ============================
  "phy-ideal-gases": {
    topicId: "phy-ideal-gases",
    concept: "An ideal gas obeys pV = nRT. Kinetic theory links temperature to the mean kinetic energy of the molecules.",
    levels: [
      { tier: "1 · Recall", generate() { const p1 = rnd(100, 300, 20) * 1e3, V1 = rnd(2, 8, 1), V2 = rnd(2, 8, 1); const p2 = (p1 * V1) / V2; return {
        question: `A gas at $${fmt(p1 / 1e3)}\\,\\text{kPa}$ occupies $${V1}\\times10^{-3}\\,\\text{m}^3$. It is compressed to $${V2}\\times10^{-3}\\,\\text{m}^3$ at constant temperature. Find the new pressure.`,
        steps: [ s("Boyle's law", "At constant T, pV is constant.", `$p_1V_1 = p_2V_2$`), s("Solve", "Smaller volume ⇒ higher pressure.", `$p_2 = \\dfrac{p_1V_1}{V_2} = ${fmt(p2 / 1e3)}\\,\\text{kPa}$`) ],
        answer: `$p_2 = ${fmt(p2 / 1e3)}\\,\\text{kPa}$`, viz: { kind: "gas", tempRel: 0.5 } }; } },
      { tier: "2 · Standard", generate() { const n = rnd(0.5, 3, 0.5), T = rnd(280, 340, 5), V = rnd(10, 40, 5) / 1000; const p = (n * R_gas * T) / V; return {
        question: `Find the pressure of $${fmt(n)}\\,\\text{mol}$ of an ideal gas at $${T}\\,\\text{K}$ in a $${fmt(V * 1000)}\\times10^{-3}\\,\\text{m}^3$ container. (R = 8.31)`,
        steps: [ s("Ideal gas equation", "pV = nRT relates the state variables.", `$p = \\dfrac{nRT}{V}$`), s("Substitute", "Use the volume in m³.", `$p = ${fmt(p)}\\,\\text{Pa}$`) ],
        answer: `$p = ${fmt(p)}\\,\\text{Pa}$`, viz: { kind: "gas", tempRel: T / 340 } }; } },
      { tier: "3 · Application", generate() { const T = rnd(250, 500, 10); const ke = 1.5 * kB * T; return {
        question: `Find the mean translational kinetic energy of a gas molecule at $${T}\\,\\text{K}$. (k = 1.38×10⁻²³ J K⁻¹)`,
        steps: [ s("Kinetic theory result", "Mean KE per molecule is proportional to absolute temperature.", `$\\overline{E_k} = \\tfrac32 kT`), s("Substitute", "", `$= 1.5\\times1.38\\times10^{-23}\\times${T} = ${fmt(ke)}\\,\\text{J}$`) ],
        answer: `$\\overline{E_k} = ${fmt(ke)}\\,\\text{J}$`, viz: { kind: "gas", tempRel: T / 500 } }; } },
      { tier: "4 · Multi-step", generate() { const p1 = rnd(100, 200, 10) * 1e3, T1 = rnd(280, 320, 5), T2 = rnd(340, 420, 10); const p2 = (p1 * T2) / T1; return {
        question: `A sealed rigid container of gas is at $${fmt(p1 / 1e3)}\\,\\text{kPa}$ and $${T1}\\,\\text{K}$. It is heated to $${T2}\\,\\text{K}$. Find the new pressure.`,
        steps: [ s("Constant volume", "With V fixed, p/T is constant (from pV = nRT).", `$\\dfrac{p_1}{T_1} = \\dfrac{p_2}{T_2}$`), s("Solve", "Hotter gas ⇒ higher pressure.", `$p_2 = p_1\\dfrac{T_2}{T_1} = ${fmt(p2 / 1e3)}\\,\\text{kPa}$`) ],
        answer: `$p_2 = ${fmt(p2 / 1e3)}\\,\\text{kPa}$`, viz: { kind: "gas", tempRel: T2 / 420 } }; } },
      { tier: "5 · Exam-level", generate() { const n = rnd(1, 4, 0.5), T = rnd(290, 360, 10); const N = n * 6.02e23, keTotal = N * 1.5 * kB * T; return {
        question: `Find the total internal energy of $${fmt(n)}\\,\\text{mol}$ of an ideal monatomic gas at $${T}\\,\\text{K}$. (Nₐ = 6.02×10²³)`,
        steps: [ s("Count the molecules", "N = n × Avogadro's number.", `$N = ${fmt(N)}$`), s("Total KE", "Sum the mean KE of every molecule (all internal energy is kinetic for an ideal gas).", `$U = N\\times\\tfrac32 kT = ${fmt(keTotal)}\\,\\text{J}$`) ],
        answer: `$U = ${fmt(keTotal)}\\,\\text{J}$`, viz: { kind: "gas", tempRel: T / 360 } }; } },
    ],
  },

  // ============================ ALTERNATING CURRENTS ============================
  "phy-alternating-currents": {
    topicId: "phy-alternating-currents",
    concept: "A.C. varies sinusoidally. The r.m.s. value delivers the same average power as a steady current; transformers change voltage.",
    levels: [
      { tier: "1 · Recall", generate() { const I0 = rnd(2, 10, 0.5); const Irms = I0 / Math.SQRT2; return {
        question: `An alternating current has a peak value of $${fmt(I0)}\\,\\text{A}$. Find its r.m.s. value.`,
        steps: [ s("r.m.s. from peak", "For a sinusoid, divide the peak by √2.", `$I_{rms} = \\dfrac{I_0}{\\sqrt2} = ${fmt(Irms)}\\,\\text{A}$`) ],
        answer: `$I_{rms} = ${fmt(Irms)}\\,\\text{A}$`, viz: { kind: "wave", amp: 26, count: 3 } }; } },
      { tier: "2 · Standard", generate() { const V0 = rnd(100, 340, 10); const Vrms = V0 / Math.SQRT2; return {
        question: `Mains voltage has a peak of $${V0}\\,\\text{V}$. Find the r.m.s. voltage.`,
        steps: [ s("r.m.s. voltage", "The effective (heating) value of the a.c.", `$V_{rms} = \\dfrac{V_0}{\\sqrt2} = ${fmt(Vrms)}\\,\\text{V}$`) ],
        answer: `$V_{rms} = ${fmt(Vrms)}\\,\\text{V}$`, viz: { kind: "wave", amp: 26, count: 3 } }; } },
      { tier: "3 · Application", generate() { const V0 = rnd(200, 340, 10), R = rnd(20, 100, 5); const Vrms = V0 / Math.SQRT2, P = (Vrms * Vrms) / R; return {
        question: `An a.c. supply of peak voltage $${V0}\\,\\text{V}$ is connected across a $${R}\\,\\Omega$ resistor. Find the mean power dissipated.`,
        steps: [ s("Use r.m.s. values", "Mean power uses the r.m.s. voltage.", `$V_{rms} = ${fmt(Vrms)}\\,\\text{V}$`), s("Mean power", "P = V²rms/R.", `$P = \\dfrac{V_{rms}^2}{R} = ${fmt(P)}\\,\\text{W}$`) ],
        answer: `$P = ${fmt(P)}\\,\\text{W}$`, viz: { kind: "wave", amp: 24, count: 4 } }; } },
      { tier: "4 · Multi-step", generate() { const Vp = rnd(200, 240, 10), Np = rnd(800, 1200, 50), Ns = rnd(50, 200, 10); const Vs = (Vp * Ns) / Np; return {
        question: `A transformer has $${Np}$ primary turns and $${Ns}$ secondary turns. The primary r.m.s. voltage is $${Vp}\\,\\text{V}$. Find the secondary voltage.`,
        steps: [ s("Turns ratio", "Voltage ratio equals turns ratio.", `$\\dfrac{V_s}{V_p} = \\dfrac{N_s}{N_p}$`), s("Solve", "Fewer secondary turns ⇒ step-down.", `$V_s = V_p\\dfrac{N_s}{N_p} = ${fmt(Vs)}\\,\\text{V}$`) ],
        answer: `$V_s = ${fmt(Vs)}\\,\\text{V}$`, viz: { kind: "wave", amp: 20, count: 5 } }; } },
      { tier: "5 · Exam-level", generate() { const Vp = 230, Pp = rnd(1000, 5000, 500), effc = rnd(90, 99, 1); const Ip = Pp / Vp, Ps = Pp * effc / 100; return {
        question: `A transformer is $${effc}\\%$ efficient. Its $${Vp}\\,\\text{V}$ primary draws power to deliver $${Pp}\\,\\text{W}$ of input. Find the primary current and the useful output power.`,
        steps: [ s("Primary current", "From P = VI on the primary side.", `$I_p = \\dfrac{P}{V_p} = ${fmt(Ip)}\\,\\text{A}$`), s("Output power", "Efficiency is output ÷ input.", `$P_{out} = ${effc}\\% \\times ${Pp} = ${fmt(Ps)}\\,\\text{W}$`) ],
        answer: `$I_p = ${fmt(Ip)}\\,\\text{A}$,  $P_{out} = ${fmt(Ps)}\\,\\text{W}$`, viz: { kind: "bars", items: [{ label: "in", v: Pp, tone: "bad" }, { label: "out", v: Ps, tone: "good" }] } }; } },
    ],
  },

  // ============================ NUCLEAR PHYSICS ============================
  "phy-nuclear": {
    topicId: "phy-nuclear",
    concept: "Radioactive decay is random and exponential. Mass defect releases energy via E = mc²; binding energy per nucleon peaks near iron.",
    levels: [
      { tier: "1 · Recall", generate() { const th = rnd(2, 30, 1); const lam = Math.LN2 / th; return {
        question: `An isotope has a half-life of $${th}\\,\\text{hours}$. Find its decay constant (per hour).`,
        steps: [ s("Link half-life and λ", "λ = ln2 / t½.", `$\\lambda = \\dfrac{\\ln 2}{t_{1/2}} = \\dfrac{0.693}{${th}} = ${fmt(lam)}\\,\\text{h}^{-1}$`) ],
        answer: `$\\lambda = ${fmt(lam)}\\,\\text{h}^{-1}$`, viz: { kind: "bars", items: [{ label: "N₀", v: 8 }, { label: "½", v: 4 }, { label: "¼", v: 2 }] } }; } },
      { tier: "2 · Standard", generate() { const n = rnd(2, 6, 1), N0 = rnd(4, 9, 1) * 1e6; const N = N0 / Math.pow(2, n); return {
        question: `A sample starts with $${fmt(N0 / 1e6)}\\times10^{6}$ undecayed nuclei. How many remain after $${n}$ half-lives?`,
        steps: [ s("Each half-life halves N", "Multiply by ½ for every half-life.", `$N = N_0\\left(\\tfrac12\\right)^{${n}}$`), s("Evaluate", "", `$N = ${fmt(N)}$`) ],
        answer: `$N = ${fmt(N)}$ nuclei`, viz: { kind: "bars", items: [{ label: "0", v: 8 }, { label: "1", v: 4 }, { label: "2", v: 2 }, { label: "3", v: 1 }] } }; } },
      { tier: "3 · Application", generate() { const lam = rnd(0.01, 0.1, 0.005), N = rnd(2, 9, 1) * 1e12; const A = lam * N; return {
        question: `A source has $${fmt(N / 1e12)}\\times10^{12}$ undecayed nuclei and decay constant $${fmt(lam)}\\,\\text{s}^{-1}$. Find its activity.`,
        steps: [ s("Activity", "Rate of decay is λN.", `$A = \\lambda N = ${fmt(lam)}\\times${fmt(N)} = ${fmt(A)}\\,\\text{Bq}$`) ],
        answer: `$A = ${fmt(A)}\\,\\text{Bq}$`, viz: { kind: "bars", items: [{ label: "N", v: 9 }, { label: "A", v: 4, tone: "accent" }] } }; } },
      { tier: "4 · Multi-step", generate() { const dm = rnd(2, 9, 1) * 1e-30; const E = dm * cLight * cLight, MeV = E / (1.6e-13); return {
        question: `A nuclear reaction has a mass defect of $${fmt(dm * 1e30)}\\times10^{-30}\\,\\text{kg}$. Find the energy released, in joules and MeV.`,
        steps: [ s("Mass–energy equivalence", "The lost mass becomes energy.", `$E = \\Delta m\\,c^2 = ${fmt(dm)}\\times(3\\times10^8)^2 = ${fmt(E)}\\,\\text{J}$`), s("Convert to MeV", "1 MeV = 1.6×10⁻¹³ J.", `$E = ${fmt(MeV)}\\,\\text{MeV}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{J} = ${fmt(MeV)}\\,\\text{MeV}$`, viz: { kind: "bars", items: [{ label: "Δm", v: 4 }, { label: "E", v: 9, tone: "accent" }] } }; } },
      { tier: "5 · Exam-level", generate() { const th = rnd(5, 30, 1), t = rnd(10, 60, 5), A0 = rnd(2, 9, 1) * 1e6; const lam = Math.LN2 / th; const A = A0 * Math.exp(-lam * t); return {
        question: `A source of half-life $${th}\\,\\text{hours}$ has an initial activity of $${fmt(A0 / 1e6)}\\times10^{6}\\,\\text{Bq}$. Find its activity after $${t}\\,\\text{hours}$.`,
        steps: [ s("Decay constant", "From the half-life.", `$\\lambda = \\dfrac{\\ln 2}{${th}} = ${fmt(lam)}\\,\\text{h}^{-1}$`), s("Exponential decay", "Activity falls off exponentially.", `$A = A_0 e^{-\\lambda t} = ${fmt(A0 / 1e6)}\\times10^6\\,e^{-${fmt(lam)}\\times${t}}$`), s("Evaluate", "", `$A = ${fmt(A)}\\,\\text{Bq}$`) ],
        answer: `$A = ${fmt(A)}\\,\\text{Bq}$`, viz: { kind: "bars", items: [{ label: "A₀", v: 9 }, { label: "A", v: Math.max(1, (A / A0) * 9), tone: "accent" }] } }; } },
    ],
  },

  // ============================ QUANTUM ============================
  "phy-quantum": {
    topicId: "phy-quantum",
    concept: "Light is quantised into photons of energy E = hf. Below the threshold frequency no electrons are emitted — the photoelectric effect.",
    levels: [
      { tier: "1 · Recall", generate() { const fu = rnd(4, 16, 1); const E = hEv * fu * 1e14; return {
        question: `A photon has frequency $${fu}\\times10^{14}\\,\\text{Hz}$. Find its energy in eV. ($h = 4.14\\times10^{-15}\\,\\text{eV s}$)`,
        steps: [ s("Photon energy", "Planck's constant times frequency.", `$E = hf = ${fmt(E)}\\,\\text{eV}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{eV}$`, viz: { kind: "photon", emits: true, keFrac: 0.4 } }; } },
      { tier: "2 · Standard", generate() { const nm = rnd(400, 700, 20); const E = hc / nm; return {
        question: `Find the energy (in eV) of a photon of wavelength $${nm}\\,\\text{nm}$. ($hc = 1240\\,\\text{eV nm}$)`,
        steps: [ s("Energy–wavelength link", "Combine E = hf and c = fλ.", `$E = \\dfrac{hc}{\\lambda} = \\dfrac{1240}{${nm}} = ${fmt(E)}\\,\\text{eV}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{eV}$`, viz: { kind: "photon", emits: true, keFrac: 0.5 } }; } },
      { tier: "3 · Application", generate() { const fu = rnd(9, 16, 1), phi = rnd(1.5, 3, 0.1); const E = hEv * fu * 1e14, KE = E - phi; return {
        question: `Light of frequency $${fu}\\times10^{14}\\,\\text{Hz}$ hits a metal of work function $${fmt(phi)}\\,\\text{eV}$. Find the maximum kinetic energy of the photoelectrons.`,
        steps: [ s("Photon energy", "Energy each photon delivers.", `$E = hf = ${fmt(E)}\\,\\text{eV}$`), s("Einstein's equation", "Photon energy pays the work function; the rest is KE.", `$KE_{max} = hf - \\phi = ${fmt(KE)}\\,\\text{eV}$`) ],
        answer: `$KE_{max} = ${fmt(KE)}\\,\\text{eV}$`, viz: { kind: "photon", emits: KE > 0, keFrac: Math.max(0, KE / E) } }; } },
      { tier: "4 · Multi-step", generate() { const phi = rnd(2, 4.5, 0.1); const f0 = phi / hEv, nm0 = hc / phi; return {
        question: `A metal has work function $${fmt(phi)}\\,\\text{eV}$. Find the threshold frequency and the longest wavelength that ejects electrons.`,
        steps: [ s("Threshold condition", "At threshold the photon energy just equals φ.", `$hf_0 = \\phi \\Rightarrow f_0 = ${fmt(f0)}\\,\\text{Hz}$`), s("Longest wavelength", "Longer λ ⇒ lower energy, so this is the cut-off.", `$\\lambda_0 = \\dfrac{hc}{\\phi} = ${fmt(nm0)}\\,\\text{nm}$`) ],
        answer: `$f_0 = ${fmt(f0)}\\,\\text{Hz}$,  $\\lambda_0 = ${fmt(nm0)}\\,\\text{nm}$`, viz: { kind: "photon", emits: false, keFrac: 0 } }; } },
      { tier: "5 · Exam-level", generate() { const fu = rnd(10, 18, 1), phi = rnd(2, 3.5, 0.1); const E = hEv * fu * 1e14, Vs = E - phi; return {
        question: `Light of frequency $${fu}\\times10^{14}\\,\\text{Hz}$ falls on a metal of work function $${fmt(phi)}\\,\\text{eV}$. Find the stopping potential.`,
        steps: [ s("Meaning of stopping potential", "It just stops the fastest electrons: eV_s = KE_max.", `$eV_s = hf - \\phi$`), s("In electron-volts", "The charge cancels neatly.", `$V_s = ${fmt(E)} - ${fmt(phi)} = ${fmt(Vs)}\\,\\text{V}$`) ],
        answer: `$V_s = ${fmt(Vs)}\\,\\text{V}$`, viz: { kind: "photon", emits: Vs > 0, keFrac: Math.max(0, Vs / E) } }; } },
    ],
  },

  // ============================ CAPACITANCE ============================
  "phy-capacitance": {
    topicId: "phy-capacitance",
    concept: "A capacitor stores charge (Q = CV) and energy (½CV²), and charges/discharges exponentially with time constant τ = RC.",
    levels: [
      { tier: "1 · Recall", generate() { const C = rnd(10, 100, 10), V = rnd(3, 12, 1); const Q = C * V; return {
        question: `A $${C}\\,\\mu\\text{F}$ capacitor is charged to $${V}\\,\\text{V}$. Find the charge stored.`,
        steps: [ s("Definition of capacitance", "Charge equals capacitance times voltage.", `$Q = CV = ${fmt(Q)}\\,\\mu\\text{C}$`) ],
        answer: `$Q = ${fmt(Q)}\\,\\mu\\text{C}$`, viz: { kind: "capacitor", frac: 1 } }; } },
      { tier: "2 · Standard", generate() { const C = rnd(10, 100, 10), V = rnd(3, 12, 1); const E = 0.5 * C * V * V; return {
        question: `Find the energy stored in a $${C}\\,\\mu\\text{F}$ capacitor charged to $${V}\\,\\text{V}$.`,
        steps: [ s("Energy formula", "Area under the Q–V graph, ½CV².", `$W = \\tfrac12 CV^2 = ${fmt(E)}\\,\\mu\\text{J}$`) ],
        answer: `$W = ${fmt(E)}\\,\\mu\\text{J}$`, viz: { kind: "capacitor", frac: 1 } }; } },
      { tier: "3 · Application", generate() { const C1 = rnd(10, 60, 10), C2 = rnd(10, 60, 10); const par = C1 + C2, ser = (C1 * C2) / (C1 + C2); return {
        question: `Two capacitors $C_1 = ${C1}\\,\\mu\\text{F}$ and $C_2 = ${C2}\\,\\mu\\text{F}$ are combined. Find the total in **series** and **parallel**.`,
        steps: [ s("Parallel adds", "Unlike resistors, capacitors in parallel add.", `$C_{par} = ${par}\\,\\mu\\text{F}$`), s("Series adds reciprocals", "Smaller than either capacitor.", `$C_{ser} = ${fmt(ser)}\\,\\mu\\text{F}$`) ],
        answer: `Parallel $= ${par}\\,\\mu\\text{F}$,  Series $= ${fmt(ser)}\\,\\mu\\text{F}$`, viz: { kind: "capacitor", frac: 0.8 } }; } },
      { tier: "4 · Multi-step", generate() { const V0 = rnd(6, 12, 1), R = rnd(10, 50, 5), C = rnd(100, 1000, 100), t = rnd(1, 5, 1); const tau = R * C * 1e-6; const V = V0 * Math.exp(-t / tau); return {
        question: `A $${C}\\,\\mu\\text{F}$ capacitor charged to $${V0}\\,\\text{V}$ discharges through a $${R}\\,\\text{k}\\Omega$ resistor. Find the p.d. after $${t}\\,\\text{s}$.`,
        steps: [ s("Time constant", "τ = RC sets the pace (in seconds).", `$\\tau = RC = ${fmt(tau)}\\,\\text{s}$`), s("Exponential decay", "Voltage falls exponentially.", `$V = V_0 e^{-t/\\tau} = ${fmt(V)}\\,\\text{V}$`) ],
        answer: `$V = ${fmt(V)}\\,\\text{V}$`, viz: { kind: "capacitor", frac: V / V0 } }; } },
      { tier: "5 · Exam-level", generate() { const R = rnd(20, 80, 5), C = rnd(200, 800, 100); const tau = R * C * 1e-6, tHalf = tau * Math.LN2; return {
        question: `A capacitor discharges through a resistor with $R = ${R}\\,\\text{k}\\Omega$ and $C = ${C}\\,\\mu\\text{F}$. Find the time constant and the time for the charge to halve.`,
        steps: [ s("Time constant", "Time to fall to 37% of the start value.", `$\\tau = RC = ${fmt(tau)}\\,\\text{s}$`), s("Half-life of decay", "Set Q = ½Q₀ and take logs.", `$t_{1/2} = \\tau\\ln 2 = ${fmt(tHalf)}\\,\\text{s}$`) ],
        answer: `$\\tau = ${fmt(tau)}\\,\\text{s}$,  $t_{1/2} = ${fmt(tHalf)}\\,\\text{s}$`, viz: { kind: "capacitor", frac: 0.5 } }; } },
    ],
  },

  // ============================ OSCILLATIONS (SHM) ============================
  "phy-oscillations": {
    topicId: "phy-oscillations",
    concept: "Simple harmonic motion: a = −ω²x. Period depends on the system, not the amplitude; energy swaps between kinetic and potential.",
    levels: [
      { tier: "1 · Recall", generate() { const m = rnd(0.2, 2, 0.1), k = rnd(10, 100, 5); const T = 2 * Math.PI * Math.sqrt(m / k); return {
        question: `A $${fmt(m)}\\,\\text{kg}$ mass on a spring of stiffness $${k}\\,\\text{N m}^{-1}$ oscillates. Find the period.`,
        steps: [ s("Mass–spring period", "Period from the mass and the spring constant.", `$T = 2\\pi\\sqrt{\\dfrac{m}{k}} = ${fmt(T)}\\,\\text{s}$`) ],
        answer: `$T = ${fmt(T)}\\,\\text{s}$`, viz: { kind: "spring", extRel: 0.6 } }; } },
      { tier: "2 · Standard", generate() { const Lp = rnd(0.2, 1.5, 0.1); const T = 2 * Math.PI * Math.sqrt(Lp / g); return {
        question: `Find the period of a simple pendulum of length $${fmt(Lp)}\\,\\text{m}$. Take $g = 9.81\\,\\text{m s}^{-2}$.`,
        steps: [ s("Pendulum period", "For small swings, T depends on length and g.", `$T = 2\\pi\\sqrt{\\dfrac{L}{g}} = ${fmt(T)}\\,\\text{s}$`) ],
        answer: `$T = ${fmt(T)}\\,\\text{s}$`, viz: { kind: "spring", extRel: 0.5 } }; } },
      { tier: "3 · Application", generate() { const T = rnd(0.5, 3, 0.5), A = rnd(2, 15, 1) / 100; const omega = (2 * Math.PI) / T, vmax = omega * A; return {
        question: `An object performs SHM with period $${fmt(T)}\\,\\text{s}$ and amplitude $${fmt(A * 100)}\\,\\text{cm}$. Find its maximum speed.`,
        steps: [ s("Angular frequency", "ω = 2π/T.", `$\\omega = \\dfrac{2\\pi}{T} = ${fmt(omega)}\\,\\text{rad s}^{-1}$`), s("Maximum speed", "The speed is greatest at the centre: v_max = ωA.", `$v_{max} = \\omega A = ${fmt(vmax)}\\,\\text{m s}^{-1}$`) ],
        answer: `$v_{max} = ${fmt(vmax)}\\,\\text{m s}^{-1}$`, viz: { kind: "spring", extRel: A * 100 / 15 } }; } },
      { tier: "4 · Multi-step", generate() { const T = rnd(0.4, 2, 0.2), A = rnd(3, 12, 1) / 100; const omega = (2 * Math.PI) / T, aMax = omega * omega * A; return {
        question: `An object in SHM has period $${fmt(T)}\\,\\text{s}$ and amplitude $${fmt(A * 100)}\\,\\text{cm}$. Find the maximum acceleration.`,
        steps: [ s("Angular frequency", "ω = 2π/T.", `$\\omega = ${fmt(omega)}\\,\\text{rad s}^{-1}$`), s("Maximum acceleration", "|a| is greatest at the extremes: a_max = ω²A.", `$a_{max} = \\omega^2 A = ${fmt(aMax)}\\,\\text{m s}^{-2}$`) ],
        answer: `$a_{max} = ${fmt(aMax)}\\,\\text{m s}^{-2}$`, viz: { kind: "spring", extRel: A * 100 / 12 } }; } },
      { tier: "5 · Exam-level", generate() { const T = rnd(0.5, 2, 0.25), A = rnd(6, 14, 1) / 100, x = rnd(2, 5, 1) / 100; const omega = (2 * Math.PI) / T, v = omega * Math.sqrt(A * A - x * x); return {
        question: `An object in SHM (period $${fmt(T)}\\,\\text{s}$, amplitude $${fmt(A * 100)}\\,\\text{cm}$) is at displacement $${fmt(x * 100)}\\,\\text{cm}$. Find its speed there.`,
        steps: [ s("Angular frequency", "ω = 2π/T.", `$\\omega = ${fmt(omega)}\\,\\text{rad s}^{-1}$`), s("Speed at displacement x", "Uses the SHM velocity equation.", `$v = \\omega\\sqrt{A^2 - x^2} = ${fmt(v)}\\,\\text{m s}^{-1}$`) ],
        answer: `$v = ${fmt(v)}\\,\\text{m s}^{-1}$`, viz: { kind: "spring", extRel: A * 100 / 14 } }; } },
    ],
  },

  // ============================ SUPERPOSITION ============================
  "phy-superposition": {
    topicId: "phy-superposition",
    concept: "Coherent waves superpose: path difference nλ gives constructive, (n+½)λ destructive. Double slits, gratings and stationary waves all follow.",
    levels: [
      { tier: "1 · Recall", generate() { const nm = rnd(450, 650, 10), n = rnd(1, 4, 1); const pd = n * nm; return {
        question: `Two coherent sources emit light of wavelength $${nm}\\,\\text{nm}$. Find the path difference for the $n = ${n}$ **bright** fringe.`,
        steps: [ s("Constructive condition", "Bright fringes occur at whole-number multiples of λ.", `$\\text{path difference} = n\\lambda = ${n}\\times${nm} = ${fmt(pd)}\\,\\text{nm}$`) ],
        answer: `path difference $= ${fmt(pd)}\\,\\text{nm}$`, viz: { kind: "wave", amp: 24, count: 3 } }; } },
      { tier: "2 · Standard", generate() { const nm = rnd(450, 650, 10), a = rnd(0.2, 0.6, 0.05), D = rnd(1.5, 3, 0.5); const x = (nm * 1e-9 * D) / (a * 1e-3); return {
        question: `Light of wavelength $${nm}\\,\\text{nm}$ passes through slits $${fmt(a)}\\,\\text{mm}$ apart onto a screen $${D}\\,\\text{m}$ away. Find the fringe spacing.`,
        steps: [ s("Double-slit formula", "Fringe spacing from wavelength, distance and slit separation.", `$x = \\dfrac{\\lambda D}{a}$`), s("Substitute", "Keep everything in SI units.", `$x = ${fmt(x * 1000)}\\,\\text{mm}$`) ],
        answer: `$x = ${fmt(x * 1000)}\\,\\text{mm}$`, viz: { kind: "wave", amp: 22, count: 4 } }; } },
      { tier: "3 · Application", generate() { const v = rnd(200, 400, 20), Lstr = rnd(0.5, 1.2, 0.1), n = rnd(1, 4, 1); const f = (n * v) / (2 * Lstr); return {
        question: `A string of length $${fmt(Lstr)}\\,\\text{m}$ carries waves of speed $${v}\\,\\text{m s}^{-1}$. Find the frequency of the $n = ${n}$ harmonic.`,
        steps: [ s("Harmonics on a fixed string", "Allowed frequencies are multiples of the fundamental.", `$f_n = \\dfrac{nv}{2L}$`), s("Substitute", "The nth harmonic fits n half-wavelengths.", `$f_${n} = ${fmt(f)}\\,\\text{Hz}$`) ],
        answer: `$f = ${fmt(f)}\\,\\text{Hz}$`, viz: { kind: "wave", amp: 24, count: n + 1 } }; } },
      { tier: "4 · Multi-step", generate() { const nm = rnd(450, 650, 10), pd = rnd(200, 900, 50); const phase = (360 * pd) / nm; const type = ((pd / nm) % 1 < 0.25 || (pd / nm) % 1 > 0.75) ? "constructive" : ((pd / nm) % 1 > 0.35 && (pd / nm) % 1 < 0.65) ? "destructive" : "partial"; return {
        question: `Two waves of wavelength $${nm}\\,\\text{nm}$ meet with a path difference of $${pd}\\,\\text{nm}$. Find the phase difference and state the type of interference.`,
        steps: [ s("Phase from path difference", "A path difference of one λ is 360°.", `$\\Delta\\phi = \\dfrac{\\text{path diff}}{\\lambda}\\times360^{\\circ} = ${fmt(phase)}^{\\circ}$`), s("Interpret", "Near a whole λ ⇒ constructive; near a half ⇒ destructive.", `Result: **${type}**`) ],
        answer: `$\\Delta\\phi = ${fmt(phase)}^{\\circ}$ · ${type}`, viz: { kind: "wave", amp: 20, count: 4 } }; } },
      { tier: "5 · Exam-level", generate() { const lines = rnd(300, 600, 50), nm = rnd(450, 650, 10); const d = 1e-3 / lines; const nMax = Math.floor(d / (nm * 1e-9)); return {
        question: `A diffraction grating has $${lines}$ lines per mm. Light of wavelength $${nm}\\,\\text{nm}$ shines on it. Find the highest order maximum that can be seen.`,
        steps: [ s("Slit spacing", "d = 1 mm ÷ lines per mm.", `$d = ${fmt(d)}\\,\\text{m}$`), s("Maximum order", "sinθ can't exceed 1, so n ≤ d/λ; take the whole number.", `$n_{max} = \\left\\lfloor\\dfrac{d}{\\lambda}\\right\\rfloor = ${nMax}$`) ],
        answer: `$n_{max} = ${nMax}$`, viz: { kind: "wave", amp: 18, count: 6 } }; } },
    ],
  },

  // ============================ PARTICLE PHYSICS ============================
  "phy-particle": {
    topicId: "phy-particle",
    concept: "Matter is built from quarks and leptons. Charge, baryon number and lepton number are conserved; mass converts to energy via E = mc².",
    levels: [
      { tier: "1 · Recall", generate() {
        const opts = [ { q: "up, up, down", val: "+1", work: "\\tfrac23+\\tfrac23-\\tfrac13" }, { q: "up, down, down", val: "0", work: "\\tfrac23-\\tfrac13-\\tfrac13" }, { q: "up, up, up", val: "+2", work: "\\tfrac23\\times3" }, { q: "down, down, down", val: "−1", work: "-\\tfrac13\\times3" } ];
        const o = opts[Math.floor(Math.random() * opts.length)]; return {
        question: `A baryon is made of the quarks: **${o.q}**. Find its charge (in units of e).`,
        steps: [ s("Add the quark charges", "up = +⅔e, down = −⅓e.", `$Q = ${o.work} = ${o.val}\\,e$`) ],
        answer: `$Q = ${o.val}\\,e$`, viz: { kind: "bars", items: [{ label: "u", v: 2 }, { label: "d", v: 1, tone: "bad" }] } }; } },
      { tier: "2 · Standard", generate() { const me = 9.11e-31; const E = me * cLight * cLight, MeV = E / 1.6e-13; return {
        question: `Find the rest energy of an electron (mass $9.11\\times10^{-31}\\,\\text{kg}$), in joules and MeV.`,
        steps: [ s("Mass–energy equivalence", "Rest energy is E = mc².", `$E = mc^2 = 9.11\\times10^{-31}\\times(3\\times10^8)^2 = ${fmt(E)}\\,\\text{J}$`), s("Convert to MeV", "1 MeV = 1.6×10⁻¹³ J.", `$E = ${fmt(MeV)}\\,\\text{MeV}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{J} = ${fmt(MeV)}\\,\\text{MeV}$`, viz: { kind: "bars", items: [{ label: "m", v: 3 }, { label: "E", v: 8, tone: "accent" }] } }; } },
      { tier: "3 · Application", generate() { const me = 9.11e-31; const E = 2 * me * cLight * cLight, MeV = E / 1.6e-13; return {
        question: `An electron meets a positron (its antiparticle) and they annihilate. Find the total energy released. (each mass $9.11\\times10^{-31}\\,\\text{kg}$)`,
        steps: [ s("Both masses convert", "Two identical rest masses become energy.", `$E = 2mc^2$`), s("Evaluate", "This appears as (usually two) gamma photons.", `$E = ${fmt(E)}\\,\\text{J} = ${fmt(MeV)}\\,\\text{MeV}$`) ],
        answer: `$E = ${fmt(E)}\\,\\text{J} = ${fmt(MeV)}\\,\\text{MeV}$`, viz: { kind: "photon", emits: true, keFrac: 0.6 } }; } },
      { tier: "4 · Multi-step", generate() { const me = 9.11e-31; const Eeach = me * cLight * cLight; const f = Eeach / 6.63e-34; return {
        question: `In electron–positron annihilation, two equal photons are produced. Find the frequency of each photon. ($h = 6.63\\times10^{-34}\\,\\text{J s}$)`,
        steps: [ s("Energy of each photon", "Each carries one electron's rest energy.", `$E = mc^2 = ${fmt(Eeach)}\\,\\text{J}$`), s("Frequency from E = hf", "Rearrange for f.", `$f = \\dfrac{E}{h} = ${fmt(f)}\\,\\text{Hz}$`) ],
        answer: `$f = ${fmt(f)}\\,\\text{Hz}$ (gamma ray)`, viz: { kind: "photon", emits: true, keFrac: 0.8 } }; } },
      { tier: "5 · Exam-level", generate() { const mp = 1.67e-27; const E = mp * cLight * cLight, MeV = E / 1.6e-13; return {
        question: `Find the rest energy of a proton (mass $1.67\\times10^{-27}\\,\\text{kg}$) in MeV, and comment on why it is far larger than an electron's.`,
        steps: [ s("Rest energy", "E = mc² with the proton mass.", `$E = 1.67\\times10^{-27}\\times(3\\times10^8)^2 = ${fmt(E)}\\,\\text{J}$`), s("Convert", "≈ 938 MeV — about 1836× the electron because the proton is that much more massive.", `$E = ${fmt(MeV)}\\,\\text{MeV}$`) ],
        answer: `$E = ${fmt(MeV)}\\,\\text{MeV}$`, viz: { kind: "bars", items: [{ label: "e⁻", v: 0.5 }, { label: "p", v: 9, tone: "accent" }] } }; } },
    ],
  },

  // ============================ MEDICAL PHYSICS ============================
  "phy-medical": {
    topicId: "phy-medical",
    concept: "X-rays attenuate exponentially through tissue; ultrasound reflects at boundaries of differing acoustic impedance Z = ρc.",
    levels: [
      { tier: "1 · Recall", generate() { const I0 = rnd(4, 10, 1), mu = rnd(0.1, 0.5, 0.05), x = rnd(5, 30, 5); const I = I0 * Math.exp(-mu * x); return {
        question: `An X-ray beam of intensity $${I0}\\,\\text{W m}^{-2}$ passes through $${x}\\,\\text{mm}$ of tissue (attenuation coefficient $${fmt(mu)}\\,\\text{mm}^{-1}$). Find the emerging intensity.`,
        steps: [ s("Attenuation law", "Intensity falls off exponentially with depth.", `$I = I_0 e^{-\\mu x} = ${I0}\\,e^{-${fmt(mu)}\\times${x}}$`), s("Evaluate", "", `$I = ${fmt(I)}\\,\\text{W m}^{-2}$`) ],
        answer: `$I = ${fmt(I)}\\,\\text{W m}^{-2}$`, viz: { kind: "bars", items: [{ label: "I₀", v: I0 }, { label: "I", v: I, tone: "accent" }] } }; } },
      { tier: "2 · Standard", generate() { const mu = rnd(0.1, 0.6, 0.05); const half = Math.log(2) / mu; return {
        question: `Tissue has a linear attenuation coefficient of $${fmt(mu)}\\,\\text{mm}^{-1}$. Find its half-value thickness.`,
        steps: [ s("Half-value thickness", "The depth that halves the intensity.", `$x_{1/2} = \\dfrac{\\ln 2}{\\mu} = \\dfrac{0.693}{${fmt(mu)}} = ${fmt(half)}\\,\\text{mm}$`) ],
        answer: `$x_{1/2} = ${fmt(half)}\\,\\text{mm}$`, viz: { kind: "bars", items: [{ label: "I₀", v: 8 }, { label: "½", v: 4, tone: "accent" }] } }; } },
      { tier: "3 · Application", generate() { const rho = rnd(1000, 1100, 20), cS = rnd(1500, 1600, 20); const Z = rho * cS; return {
        question: `Find the acoustic impedance of soft tissue with density $${rho}\\,\\text{kg m}^{-3}$ and speed of sound $${cS}\\,\\text{m s}^{-1}$.`,
        steps: [ s("Acoustic impedance", "Z is density times the speed of sound.", `$Z = \\rho c = ${rho}\\times${cS} = ${fmt(Z)}\\,\\text{kg m}^{-2}\\text{s}^{-1}$`) ],
        answer: `$Z = ${fmt(Z)}\\,\\text{kg m}^{-2}\\text{s}^{-1}$`, viz: { kind: "wave", amp: 22, count: 4 } }; } },
      { tier: "4 · Multi-step", generate() { const Z1 = 1.6e6, Z2 = rnd(3, 8, 1) * 1e6; const alpha = ((Z2 - Z1) / (Z2 + Z1)) ** 2; return {
        question: `Ultrasound travels from soft tissue ($Z_1 = 1.6\\times10^{6}$) to bone ($Z_2 = ${fmt(Z2 / 1e6)}\\times10^{6}\\,\\text{kg m}^{-2}\\text{s}^{-1}$). Find the fraction of intensity reflected.`,
        steps: [ s("Reflection coefficient", "Depends on the impedance mismatch at the boundary.", `$\\alpha = \\left(\\dfrac{Z_2-Z_1}{Z_2+Z_1}\\right)^2`), s("Evaluate", "A big mismatch (like tissue↔bone) reflects strongly — why gel is used at the skin.", `$\\alpha = ${fmt(alpha)}$`) ],
        answer: `$\\alpha = ${fmt(alpha)}$ ($${fmt(alpha * 100)}\\%$ reflected)`, viz: { kind: "bars", items: [{ label: "in", v: 1 }, { label: "reflected", v: alpha, tone: "accent" }] } }; } },
      { tier: "5 · Exam-level", generate() { const cS = 1540, tus = rnd(20, 120, 10); const d = (cS * tus * 1e-6) / 2; return {
        question: `An ultrasound echo returns after $${tus}\\,\\mu\\text{s}$. The speed of sound in tissue is $${cS}\\,\\text{m s}^{-1}$. Find the depth of the reflecting boundary.`,
        steps: [ s("There and back", "The pulse travels to the boundary and back, so use half the time.", `$d = \\dfrac{c\\,t}{2}$`), s("Substitute", "Convert µs to seconds.", `$d = \\dfrac{${cS}\\times${tus}\\times10^{-6}}{2} = ${fmt(d)}\\,\\text{m}$`) ],
        answer: `$d = ${fmt(d)}\\,\\text{m} = ${fmt(d * 100)}\\,\\text{cm}$`, viz: { kind: "wave", amp: 20, count: 5 } }; } },
    ],
  },

  // ============================ ASTRONOMY & COSMOLOGY ============================
  "phy-astronomy": {
    topicId: "phy-astronomy",
    concept: "Standard candles and redshift measure the Universe. Wien's law and Stefan's law link a star's spectrum and luminosity to temperature.",
    levels: [
      { tier: "1 · Recall", generate() { const T = rnd(3000, 10000, 500); const lam = 2.9e-3 / T, nm = lam * 1e9; return {
        question: `A star's surface is at $${T}\\,\\text{K}$. Find the wavelength at which it emits most strongly. (Wien constant $2.9\\times10^{-3}\\,\\text{m K}$)`,
        steps: [ s("Wien's displacement law", "Hotter stars peak at shorter (bluer) wavelengths.", `$\\lambda_{max} = \\dfrac{2.9\\times10^{-3}}{T} = ${fmt(lam)}\\,\\text{m} \\approx ${fmt(nm)}\\,\\text{nm}$`) ],
        answer: `$\\lambda_{max} \\approx ${fmt(nm)}\\,\\text{nm}$`, viz: { kind: "field", attractive: true, distRel: 3 } }; } },
      { tier: "2 · Standard", generate() { const r = rnd(5, 20, 1) * 1e8, T = rnd(4000, 9000, 500); const sigma = 5.67e-8; const Llum = 4 * Math.PI * r * r * sigma * Math.pow(T, 4); return {
        question: `A star has radius $${fmt(r / 1e8)}\\times10^{8}\\,\\text{m}$ and surface temperature $${T}\\,\\text{K}$. Find its luminosity. (σ = 5.67×10⁻⁸)`,
        steps: [ s("Stefan–Boltzmann law", "Luminosity from surface area and temperature⁴.", `$L = 4\\pi r^2\\sigma T^4$`), s("Evaluate", "The T⁴ term makes hot stars enormously luminous.", `$L = ${fmt(Llum)}\\,\\text{W}$`) ],
        answer: `$L = ${fmt(Llum)}\\,\\text{W}$`, viz: { kind: "field", attractive: true, distRel: 3 } }; } },
      { tier: "3 · Application", generate() { const Llum = rnd(2, 9, 1) * 1e26, d = rnd(4, 40, 2) * 1e16; const Fl = Llum / (4 * Math.PI * d * d); return {
        question: `A star of luminosity $${fmt(Llum / 1e26)}\\times10^{26}\\,\\text{W}$ is $${fmt(d / 1e16)}\\times10^{16}\\,\\text{m}$ away. Find the radiation flux we receive.`,
        steps: [ s("Inverse-square spreading", "Power spreads over a sphere of radius d.", `$F = \\dfrac{L}{4\\pi d^2}$`), s("Evaluate", "This is what a detector actually measures.", `$F = ${fmt(Fl)}\\,\\text{W m}^{-2}$`) ],
        answer: `$F = ${fmt(Fl)}\\,\\text{W m}^{-2}$`, viz: { kind: "field", attractive: false, distRel: d / 1e16 / 6 } }; } },
      { tier: "4 · Multi-step", generate() { const lam = rnd(400, 700, 20), dLam = rnd(2, 20, 1); const v = (dLam / lam) * 3e8; return {
        question: `A spectral line normally at $${lam}\\,\\text{nm}$ is observed at $${lam + dLam}\\,\\text{nm}$ from a distant galaxy. Find its recession speed.`,
        steps: [ s("Redshift", "The fractional wavelength shift gives v/c.", `$\\dfrac{\\Delta\\lambda}{\\lambda} = \\dfrac{v}{c}$`), s("Solve for v", "A redshift means the galaxy is moving away.", `$v = c\\dfrac{\\Delta\\lambda}{\\lambda} = ${fmt(v)}\\,\\text{m s}^{-1}$`) ],
        answer: `$v = ${fmt(v)}\\,\\text{m s}^{-1}$`, viz: { kind: "field", attractive: false, distRel: 4 } }; } },
      { tier: "5 · Exam-level", generate() { const v = rnd(2, 9, 1) * 1e6, H0 = 2.3e-18; const d = v / H0, Mly = d / 9.46e21; return {
        question: `A galaxy recedes at $${fmt(v / 1e6)}\\times10^{6}\\,\\text{m s}^{-1}$. Using the Hubble constant $H_0 = 2.3\\times10^{-18}\\,\\text{s}^{-1}$, estimate its distance.`,
        steps: [ s("Hubble's law", "Recession speed is proportional to distance.", `$v = H_0 d \\Rightarrow d = \\dfrac{v}{H_0}$`), s("Evaluate", "The farther a galaxy, the faster it recedes.", `$d = ${fmt(d)}\\,\\text{m} \\approx ${fmt(Mly)}\\,\\text{million ly}$`) ],
        answer: `$d = ${fmt(d)}\\,\\text{m}$`, viz: { kind: "field", attractive: false, distRel: 5 } }; } },
    ],
  },
};

export function hasWorked(topicId: string): boolean {
  return !!WORKED[topicId];
}

export function WorkedExamples({ topicId }: { topicId: string }) {
  const settings = useApp((st) => st.settings);
  const topic = WORKED[topicId];
  const [level, setLevel] = React.useState(0);
  const [result, setResult] = React.useState<WorkedResult | null>(() => topic?.levels[0].generate() ?? null);
  const [revealed, setRevealed] = React.useState(0); // steps shown (0 = solution hidden)
  const [showViz, setShowViz] = React.useState(settings.showDiagrams);

  if (!topic || !result) return null;
  const steps = result.steps;
  const solutionOpen = revealed > 0;
  const allShown = revealed >= steps.length;

  function load(i: number) {
    setLevel(i);
    setResult(topic.levels[i].generate());
    setRevealed(0);
  }
  function openSolution() {
    setRevealed(settings.revealStepwise ? 1 : steps.length);
  }

  return (
    <Card className="lifted p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="text-xs font-medium text-physics uppercase tracking-wide">Worked examples</div>
        <span className="text-ink-faint text-[0.7rem]">Cambridge style · 5 levels</span>
      </div>
      <p className="text-ink-soft text-sm leading-relaxed mb-4">{topic.concept}</p>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {topic.levels.map((lv, i) => (
          <button
            key={i}
            onClick={() => load(i)}
            className={cx(
              "px-2.5 py-1.5 rounded-xl text-xs border transition-all duration-200 active:scale-95",
              i === level ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-faint border-line/60 hover:text-ink-soft",
            )}
          >
            {lv.tier}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-2/50 border border-line/50 px-4 py-3.5">
        <RichText text={result.question} className="prose-paper text-ink" />
      </div>

      {/* Mini dynamic diagram */}
      {result.viz && showViz && (
        <div className="mt-3 animate-fade-in">
          <MiniViz spec={result.viz} />
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {!solutionOpen ? (
          <Button variant="primary" accent="physics" size="sm" onClick={openSolution}>Show solution</Button>
        ) : (
          <Button variant="soft" size="sm" onClick={() => setRevealed(0)}>Hide solution</Button>
        )}
        <Button variant="soft" size="sm" onClick={() => load(level)}>↻ Randomize</Button>
        {result.viz && (
          <Button variant="ghost" size="sm" onClick={() => setShowViz((v) => !v)}>
            {showViz ? "Hide diagram" : "Show diagram"}
          </Button>
        )}
        {level < topic.levels.length - 1 && (
          <Button variant="ghost" size="sm" onClick={() => load(level + 1)} className="ml-auto">Next, harder →</Button>
        )}
      </div>

      {solutionOpen && (
        <div className="mt-5 space-y-3.5">
          {steps.slice(0, revealed).map((st, i) => (
            <div key={i} className="rounded-2xl border border-line/50 bg-surface px-4 py-3 animate-fade-up">
              <div className="flex items-baseline gap-2.5">
                <span className="text-physics text-xs font-semibold tabular-nums shrink-0 mt-0.5">Step {i + 1}</span>
                <span className="text-ink font-medium text-sm">{st.heading}</span>
              </div>
              <p className="text-ink-soft text-sm mt-1 leading-relaxed">{st.detail}</p>
              {st.math && <div className="mt-2 text-ink"><RichText text={st.math} /></div>}
            </div>
          ))}

          {/* Stepwise controls */}
          {!allShown ? (
            <div className="flex items-center gap-2">
              <Button variant="primary" accent="physics" size="sm" onClick={() => setRevealed((r) => r + 1)}>Reveal next step →</Button>
              <Button variant="ghost" size="sm" onClick={() => setRevealed(steps.length)}>Show all</Button>
              <span className="text-ink-faint text-xs ml-auto">{revealed} / {steps.length}</span>
            </div>
          ) : (
            <div className="rounded-2xl bg-mark-good-bg/50 border border-mark-good/25 px-4 py-3 animate-fade-up">
              <span className="text-xs font-medium text-mark-good uppercase tracking-wide">Answer</span>
              <div className="text-ink mt-1"><RichText text={result.answer} /></div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

import React from "react";
import { ProjectileViz, DynamicsViz, CircularViz, SHMViz } from "./mechanics";
import { WaveViz, SuperpositionViz } from "./waves";
import { DCCircuitViz } from "./circuits";
import { FieldViz } from "./fields";
import { IdealGasViz, CapacitorViz, PhotoelectricViz } from "./more";

export interface VizEntry {
  topicId: string;
  // Interactive component, if one exists for this topic.
  component?: React.ComponentType;
  // One-line concept summary shown on the card.
  summary: string;
  // Governing equations (LaTeX, no delimiters) shown in the detail panel.
  equations: string[];
  // Detailed explanation bullets (may contain inline $…$ maths).
  detail: string[];
}

// Every 9702 topic has a fully detailed entry; those with a `component`
// are also interactive.
export const VIZ_REGISTRY: Record<string, VizEntry> = {
  "phy-kinematics": {
    topicId: "phy-kinematics",
    component: ProjectileViz,
    summary: "Projectile motion — range, height, time of flight.",
    equations: ["v = u + at", "s = ut + \\tfrac12 at^2", "v^2 = u^2 + 2as", "s = \\tfrac12(u+v)t"],
    detail: [
      "Displacement, velocity and acceleration are **vectors** — direction matters. Speed and distance are the scalar versions.",
      "The four *suvat* equations only apply when acceleration is **constant**. For a projectile, treat horizontal and vertical motion **separately**.",
      "Horizontally there is no acceleration, so $s_x = u_x t$. Vertically $a = -g$, so the object slows, stops, and falls back.",
      "On a velocity–time graph, the **gradient** is acceleration and the **area** under it is displacement.",
      "Maximum range on level ground is at a launch angle of **45°**; complementary angles (e.g. 30° and 60°) give the same range.",
    ],
  },
  "phy-dynamics": {
    topicId: "phy-dynamics",
    component: DynamicsViz,
    summary: "F = ma — resultant force and acceleration.",
    equations: ["F = ma", "F = \\dfrac{\\Delta p}{\\Delta t}", "p = mv"],
    detail: [
      "Newton's 1st law: with **zero resultant force**, an object stays at rest or moves at constant velocity.",
      "Newton's 2nd law: resultant force = rate of change of momentum. For constant mass this reduces to $F = ma$.",
      "Newton's 3rd law: forces come in **equal and opposite pairs** acting on *different* bodies.",
      "Only the **resultant** force accelerates a body. Balanced applied force and friction ⇒ constant velocity (terminal velocity).",
      "Momentum is **conserved** in collisions with no external force. Elastic collisions also conserve kinetic energy; inelastic do not.",
    ],
  },
  "phy-forces-moments": {
    topicId: "phy-forces-moments",
    summary: "Turning effects — moments, couples and equilibrium.",
    equations: ["\\text{moment} = F \\times d_{\\perp}", "\\text{torque of couple} = F \\times d", "\\text{upthrust} = \\rho g V"],
    detail: [
      "The **moment** of a force = force × perpendicular distance from the pivot to the line of action.",
      "**Principle of moments**: for equilibrium, total clockwise moments = total anticlockwise moments about any point.",
      "For full equilibrium two conditions must hold: **resultant force = 0** and **resultant moment = 0**.",
      "A **couple** is two equal, antiparallel forces; it produces rotation only, with torque $= Fd$.",
      "The **centre of gravity** is where the whole weight is taken to act — key when a weight sits on the pivot (zero moment).",
    ],
  },
  "phy-work-energy-power": {
    topicId: "phy-work-energy-power",
    summary: "Work, the energy stores, and power.",
    equations: ["W = Fs\\cos\\theta", "E_k = \\tfrac12 mv^2", "\\Delta E_p = mg\\Delta h", "P = \\dfrac{W}{t} = Fv"],
    detail: [
      "**Work** is energy transferred by a force: $W = Fs\\cos\\theta$, where $\\theta$ is the angle between force and motion.",
      "**Conservation of energy**: energy is never created or destroyed, only transferred between stores.",
      "Falling object (no resistance): loss in $E_p$ = gain in $E_k$, so $mgh = \\tfrac12 mv^2$.",
      "**Efficiency** = useful energy out ÷ total energy in (×100%). The rest is usually dissipated as heat.",
      "**Power** is the rate of energy transfer; for a constant force at speed $v$, $P = Fv$.",
    ],
  },
  "phy-deformation": {
    topicId: "phy-deformation",
    summary: "Springs, stress–strain and the Young modulus.",
    equations: ["F = kx", "E = \\dfrac{\\sigma}{\\varepsilon} = \\dfrac{FL}{Ax}", "E_{elastic} = \\tfrac12 Fx = \\tfrac12 kx^2"],
    detail: [
      "**Hooke's law**: extension ∝ load, up to the **limit of proportionality**. Beyond the elastic limit the material won't return to its original length.",
      "**Stress** $\\sigma = F/A$ (Pa); **strain** $\\varepsilon = x/L$ (no units).",
      "The **Young modulus** $E = \\sigma/\\varepsilon$ is the gradient of the straight-line part of a stress–strain graph.",
      "Elastic **strain energy** = area under the force–extension graph $= \\tfrac12 Fx$.",
      "Ductile (copper), brittle (glass) and polymeric (rubber) materials have characteristically different stress–strain curves.",
    ],
  },
  "phy-waves": {
    topicId: "phy-waves",
    component: WaveViz,
    summary: "Travelling waves — v = fλ.",
    equations: ["v = f\\lambda", "T = \\dfrac{1}{f}", "I \\propto A^2"],
    detail: [
      "A progressive wave transfers **energy** without transferring matter — particles oscillate about fixed points.",
      "**Transverse**: oscillations perpendicular to energy travel (light, water). **Longitudinal**: parallel (sound).",
      "**Frequency** is set by the source and does not change; changing the medium changes speed and hence wavelength.",
      "**Intensity** ∝ amplitude², and for a point source ∝ $1/r^2$.",
      "Polarisation is possible only for transverse waves — a good discriminator in exam questions.",
    ],
  },
  "phy-superposition": {
    topicId: "phy-superposition",
    component: SuperpositionViz,
    summary: "Interference, diffraction and standing waves.",
    equations: ["\\lambda = \\dfrac{ax}{D}", "d\\sin\\theta = n\\lambda", "\\text{path diff} = n\\lambda \\;(\\text{constructive})"],
    detail: [
      "**Superposition**: when waves meet, displacements add. Coherent sources (constant phase difference, same frequency) give a stable pattern.",
      "**Constructive** interference: path difference $= n\\lambda$. **Destructive**: $= (n+\\tfrac12)\\lambda$.",
      "Young's double slit: fringe spacing $x = \\lambda D / a$ — used to measure the wavelength of light.",
      "**Diffraction grating** $d\\sin\\theta = n\\lambda$ gives sharper, brighter maxima than two slits.",
      "**Stationary waves** form from two identical waves travelling in opposite directions: fixed nodes and antinodes, no net energy transfer.",
    ],
  },
  "phy-electricity": {
    topicId: "phy-electricity",
    summary: "Charge, current, potential difference and resistance.",
    equations: ["I = \\dfrac{\\Delta Q}{\\Delta t}", "V = IR", "P = VI = I^2R = \\dfrac{V^2}{R}", "R = \\dfrac{\\rho L}{A}"],
    detail: [
      "**Current** is the rate of flow of charge; one ampere is one coulomb per second.",
      "**Potential difference** is the energy transferred per unit charge ($V = W/Q$); **e.m.f.** is energy supplied per unit charge.",
      "**Ohm's law**: for an ohmic conductor at constant temperature, $V \\propto I$.",
      "I–V characteristics: a filament lamp curves (resistance rises with temperature); a diode conducts only one way.",
      "**Resistivity** $\\rho$ is a property of the material; resistance also depends on length and cross-section: $R = \\rho L / A$.",
    ],
  },
  "phy-dc-circuits": {
    topicId: "phy-dc-circuits",
    component: DCCircuitViz,
    summary: "Series & parallel — Kirchhoff's laws.",
    equations: ["R_{series} = R_1 + R_2", "\\dfrac{1}{R_{parallel}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}", "\\varepsilon = I(R + r)"],
    detail: [
      "**Kirchhoff's 1st law** (charge conservation): total current into a junction = total current out.",
      "**Kirchhoff's 2nd law** (energy conservation): around any loop, the sum of e.m.f.s = sum of p.d.s.",
      "**Series**: one current everywhere; p.d. splits in proportion to resistance. **Parallel**: same p.d.; current splits.",
      "A **potential divider** outputs a fraction of the supply: $V_{out} = V_{in}\\,R_2/(R_1+R_2)$.",
      "**Internal resistance** $r$ causes 'lost volts': terminal p.d. $= \\varepsilon - Ir$.",
    ],
  },
  "phy-circular-motion": {
    topicId: "phy-circular-motion",
    component: CircularViz,
    summary: "Centripetal force and a = v²/r.",
    equations: ["\\omega = \\dfrac{2\\pi}{T} = \\dfrac{v}{r}", "a = \\dfrac{v^2}{r} = \\omega^2 r", "F = \\dfrac{mv^2}{r} = m\\omega^2 r"],
    detail: [
      "In uniform circular motion **speed is constant but velocity is not** — direction changes continuously, so there is acceleration.",
      "The acceleration (and net force) points **towards the centre** — centripetal, not a new kind of force.",
      "The centripetal force is *provided by* something real: tension, gravity, friction, the normal contact force, etc.",
      "Angle in **radians**: $\\theta = s/r$; a full circle is $2\\pi$ rad.",
      "Halving the radius at constant speed **doubles** the required force ($a = v^2/r$).",
    ],
  },
  "phy-gravitation": {
    topicId: "phy-gravitation",
    component: FieldViz,
    summary: "Newton's gravity — an inverse-square field.",
    equations: ["F = \\dfrac{GMm}{r^2}", "g = \\dfrac{GM}{r^2}", "\\phi = -\\dfrac{GM}{r}", "v = \\sqrt{\\dfrac{GM}{r}}"],
    detail: [
      "Gravity is always **attractive** and follows an **inverse-square** law: double the distance, quarter the force.",
      "**Field strength** $g$ is force per unit mass; near a surface it's uniform, far out it's radial.",
      "Gravitational **potential** is negative (zero at infinity) because the field is attractive — you do work to escape.",
      "For a **satellite**, gravity provides the centripetal force ⇒ orbital speed $v = \\sqrt{GM/r}$.",
      "A **geostationary** orbit has a 24-hour period, sits over the equator, and moves west-to-east.",
    ],
  },
  "phy-oscillations": {
    topicId: "phy-oscillations",
    component: SHMViz,
    summary: "Simple harmonic motion — a = −ω²x.",
    equations: ["a = -\\omega^2 x", "x = x_0\\cos(\\omega t)", "v = \\pm\\omega\\sqrt{x_0^2 - x^2}", "v_{max} = \\omega x_0"],
    detail: [
      "SHM is defined by acceleration **∝ displacement** and directed back to equilibrium: $a = -\\omega^2 x$.",
      "Displacement and acceleration are **exactly out of phase**; velocity is a quarter-cycle out (max at the centre).",
      "Period depends only on the system, **not** the amplitude (isochronous): mass–spring $T = 2\\pi\\sqrt{m/k}$; pendulum $T = 2\\pi\\sqrt{L/g}$.",
      "Energy swaps between kinetic (max at centre) and potential (max at the extremes); total energy $\\propto x_0^2$.",
      "**Damping** removes energy and reduces amplitude; **resonance** occurs when driving frequency = natural frequency.",
    ],
  },
  "phy-thermal": {
    topicId: "phy-thermal",
    summary: "Internal energy, heat capacity and latent heat.",
    equations: ["Q = mc\\Delta\\theta", "Q = mL", "\\Delta U = q + w", "T(K) = \\theta(°C) + 273.15"],
    detail: [
      "**Internal energy** = total random kinetic + potential energy of the molecules.",
      "**Specific heat capacity** $c$: energy to raise 1 kg by 1 K without a change of state.",
      "**Specific latent heat** $L$: energy to change the state of 1 kg at constant temperature (breaking bonds, not raising T).",
      "During a change of state the temperature stays constant even though energy is supplied.",
      "**Thermodynamics 1st law**: $\\Delta U = q + w$ — internal energy change = heat added + work done on the gas.",
    ],
  },
  "phy-ideal-gases": {
    topicId: "phy-ideal-gases",
    component: IdealGasViz,
    summary: "The gas laws and kinetic theory.",
    equations: ["pV = nRT = NkT", "pV = \\tfrac13 Nm\\langle c^2\\rangle", "\\tfrac12 m\\langle c^2\\rangle = \\tfrac32 kT"],
    detail: [
      "An **ideal gas** obeys $pV = nRT$ exactly; real gases approximate it at low pressure and high temperature.",
      "Kinetic theory links the macroscopic $p, V, T$ to microscopic molecular motion.",
      "Mean translational KE per molecule is **directly proportional to absolute temperature**: $\\overline{E_k} = \\tfrac32 kT$.",
      "**Absolute zero** (0 K) is where molecular KE (and pressure at constant volume) extrapolate to zero.",
      "Use $n = N/N_A$ and $R = N_A k$ to move between the mole and molecule forms.",
    ],
  },
  "phy-electric-fields": {
    topicId: "phy-electric-fields",
    component: FieldViz,
    summary: "Coulomb's law and electric fields.",
    equations: ["F = \\dfrac{Q_1 Q_2}{4\\pi\\varepsilon_0 r^2}", "E = \\dfrac{F}{q}", "V = \\dfrac{Q}{4\\pi\\varepsilon_0 r}", "E = \\dfrac{V}{d}"],
    detail: [
      "**Coulomb's law** is inverse-square like gravity, but charges can **attract or repel**.",
      "**Field strength** $E$ = force per unit positive charge; field lines point from + to −.",
      "Between **parallel plates** the field is uniform: $E = V/d$, pointing from high to low potential.",
      "Electric **potential** is positive near a positive charge and zero at infinity.",
      "Strong parallels with gravitation — same maths, but potential can be positive **or** negative.",
    ],
  },
  "phy-capacitance": {
    topicId: "phy-capacitance",
    component: CapacitorViz,
    summary: "Storing charge — capacitors and exponential decay.",
    equations: ["C = \\dfrac{Q}{V}", "W = \\tfrac12 QV = \\tfrac12 CV^2", "Q = Q_0 e^{-t/RC}", "\\tau = RC"],
    detail: [
      "**Capacitance** = charge stored per volt (farads). A capacitor stores energy in its electric field.",
      "Energy stored = area under a $Q$–$V$ graph $= \\tfrac12 QV$.",
      "Charging/discharging is **exponential** with time constant $\\tau = RC$ (time to fall to $1/e ≈ 37\\%$).",
      "Capacitors in **parallel** add ($C = C_1 + C_2$); in **series** add reciprocals — opposite to resistors.",
      "After $5\\tau$ the capacitor is essentially fully charged/discharged.",
    ],
  },
  "phy-magnetic-fields": {
    topicId: "phy-magnetic-fields",
    summary: "Forces on currents and charges; EM induction.",
    equations: ["F = BIL\\sin\\theta", "F = BQv", "\\Phi = BA", "\\varepsilon = -\\dfrac{\\mathrm{d}(N\\Phi)}{\\mathrm{d}t}"],
    detail: [
      "A current in a magnetic field feels a force $F = BIL\\sin\\theta$ — direction from **Fleming's left-hand rule**.",
      "A moving charge feels $F = BQv$, always perpendicular to $v$, so it moves in a **circle** (used in mass spectrometers).",
      "**Magnetic flux** $\\Phi = BA$; **flux linkage** is $N\\Phi$.",
      "**Faraday's law**: induced e.m.f. ∝ rate of change of flux linkage. **Lenz's law**: the induced effect opposes the change (energy conservation).",
      "This is the basis of generators and transformers.",
    ],
  },
  "phy-alternating-currents": {
    topicId: "phy-alternating-currents",
    summary: "A.C., r.m.s. values and rectification.",
    equations: ["I = I_0\\sin(\\omega t)", "I_{rms} = \\dfrac{I_0}{\\sqrt2}", "P_{mean} = \\tfrac12 I_0 V_0", "\\dfrac{V_s}{V_p} = \\dfrac{N_s}{N_p}"],
    detail: [
      "A.C. varies sinusoidally; the **peak** value $I_0$ is larger than the useful average.",
      "**r.m.s.** value is the equivalent steady current delivering the same average power: $I_{rms} = I_0/\\sqrt2$.",
      "Mean power in a resistor $= I_{rms}V_{rms} = \\tfrac12 I_0V_0$.",
      "A **half-wave** rectifier uses one diode; a **full-wave (bridge)** rectifier uses four.",
      "A **smoothing capacitor** in parallel with the load reduces the ripple.",
    ],
  },
  "phy-quantum": {
    topicId: "phy-quantum",
    component: PhotoelectricViz,
    summary: "Photons, the photoelectric effect, duality.",
    equations: ["E = hf = \\dfrac{hc}{\\lambda}", "hf = \\phi + E_{k,max}", "\\lambda = \\dfrac{h}{p}", "eV = hf - \\phi"],
    detail: [
      "Light comes in **photons** of energy $E = hf$ — a quantum, particle-like packet.",
      "**Photoelectric effect**: below the threshold frequency **no** electrons are emitted, no matter how bright — evidence for photons over waves.",
      "Einstein's equation: $hf = \\phi + E_{k,max}$, where $\\phi$ is the work function.",
      "**de Broglie**: particles have a wavelength $\\lambda = h/p$ — electrons diffract, showing wave–particle duality.",
      "Line spectra show discrete **energy levels**: a photon is emitted when an electron drops, $hf = E_2 - E_1$.",
    ],
  },
  "phy-nuclear": {
    topicId: "phy-nuclear",
    summary: "Mass–energy, binding energy and decay.",
    equations: ["E = mc^2", "\\Delta E = \\Delta m\\,c^2", "A = \\lambda N", "N = N_0 e^{-\\lambda t}", "t_{1/2} = \\dfrac{\\ln 2}{\\lambda}"],
    detail: [
      "**Mass–energy equivalence**: a mass defect $\\Delta m$ corresponds to energy $\\Delta m\\,c^2$.",
      "**Binding energy** is the energy to split a nucleus; the **binding energy per nucleon** peaks around iron-56 (most stable).",
      "**Fusion** (light nuclei) and **fission** (heavy nuclei) both release energy by moving towards that peak.",
      "Radioactive decay is **random** and **spontaneous**; activity $A = \\lambda N$.",
      "The number of undecayed nuclei falls exponentially; **half-life** $t_{1/2} = \\ln2/\\lambda$ is constant.",
    ],
  },
  "phy-medical": {
    topicId: "phy-medical",
    summary: "Ultrasound, X-rays and PET imaging.",
    equations: ["I = I_0 e^{-\\mu x}", "Z = \\rho c", "\\alpha = \\left(\\dfrac{Z_2 - Z_1}{Z_2 + Z_1}\\right)^2"],
    detail: [
      "**X-ray** intensity is attenuated exponentially through tissue: $I = I_0 e^{-\\mu x}$; contrast comes from different $\\mu$.",
      "**Ultrasound** reflects at boundaries where acoustic **impedance** $Z = \\rho c$ changes; gel matches impedance to reduce reflection at the skin.",
      "A-scans give depth from echo time; B-scans build a 2-D image.",
      "**PET** uses positron-emitting tracers; annihilation produces two 511 keV gamma photons detected back-to-back.",
      "Imaging choices trade resolution, penetration and ionising-radiation dose.",
    ],
  },
  "phy-astronomy": {
    topicId: "phy-astronomy",
    summary: "Standard candles, redshift and Hubble's law.",
    equations: ["d = \\dfrac{1}{p\\,(\\text{arcsec})}\\;\\text{pc}", "\\dfrac{\\Delta\\lambda}{\\lambda} \\approx \\dfrac{v}{c}", "v = H_0 d", "L = 4\\pi d^2 F"],
    detail: [
      "**Parallax** measures nearby distances; luminosity–flux ($F = L/4\\pi d^2$) with **standard candles** reaches far galaxies.",
      "**Redshift** of spectral lines shows galaxies moving away: $\\Delta\\lambda/\\lambda \\approx v/c$.",
      "**Hubble's law** $v = H_0 d$ — recession speed ∝ distance — implies an expanding universe.",
      "$1/H_0$ estimates the age of the universe.",
      "Together with the cosmic microwave background this supports the **Big Bang** model.",
    ],
  },
};

export function vizFor(topicId: string): VizEntry | undefined {
  return VIZ_REGISTRY[topicId];
}

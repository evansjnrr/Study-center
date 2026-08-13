import type { Question, SubjectCode } from "@/lib/questions";

// ------------------------------------------------------------------
// Original Cambridge-STYLE questions with genuine mark schemes.
// Not reproductions of past papers (those are copyright) — but written to
// the same format, mark allocation and command-word conventions.
// Real papers you own can be added via Settings → Import questions.
// ------------------------------------------------------------------

export const QUESTION_BANK: Question[] = [
  // ============================ PHYSICS 9702 ============================
  {
    id: "p-kin-1", subject: "9702", paper: "Paper 2", topicId: "phy-kinematics",
    subtopic: "Uniform acceleration", marks: 4, difficulty: 1, source: "original",
    stem: "A car accelerates uniformly from rest and reaches a speed of $24\\,\\text{m s}^{-1}$ after travelling $150\\,\\text{m}$.\n\n**(a)** Calculate the acceleration. **[3]**\n**(b)** Calculate the time taken. **[1]**",
    markScheme: [
      { id: "m1", text: "Selects $v^2 = u^2 + 2as$ with $u = 0$", marks: 1, criterion: "formula" },
      { id: "m2", text: "Substitutes correctly: $24^2 = 2 \\times a \\times 150$", marks: 1, criterion: "substitution" },
      { id: "m3", text: "$a = 1.92\\,\\text{m s}^{-2}$ (allow 1.9), correct unit", marks: 1, criterion: "answer" },
      { id: "m4", text: "$t = v/a = 24/1.92 = 12.5\\,\\text{s}$", marks: 1, criterion: "answer" },
    ],
    guidance: "A bare answer with no working scores 1 max. Missing unit loses the final mark.",
  },
  {
    id: "p-kin-2", subject: "9702", paper: "Paper 2", topicId: "phy-kinematics",
    subtopic: "Projectiles", marks: 6, difficulty: 3, source: "original",
    stem: "A ball is projected at $28\\,\\text{m s}^{-1}$ at $40^{\\circ}$ above the horizontal from level ground. Air resistance is negligible.\n\n**(a)** Show that the vertical component of the initial velocity is about $18\\,\\text{m s}^{-1}$. **[1]**\n**(b)** Calculate the maximum height reached. **[2]**\n**(c)** Calculate the horizontal range. **[3]**",
    data: "Take $g = 9.81\\,\\text{m s}^{-2}$.",
    markScheme: [
      { id: "m1", text: "$u_y = 28\\sin 40^{\\circ} = 18.0\\,\\text{m s}^{-1}$", marks: 1, criterion: "substitution" },
      { id: "m2", text: "Uses $v^2 = u^2 + 2as$ with $v = 0$ vertically", marks: 1, criterion: "formula" },
      { id: "m3", text: "$H = 18.0^2/(2 \\times 9.81) = 16.5\\,\\text{m}$", marks: 1, criterion: "answer" },
      { id: "m4", text: "Time of flight $T = 2u_y/g = 3.67\\,\\text{s}$", marks: 1, criterion: "working" },
      { id: "m5", text: "$u_x = 28\\cos 40^{\\circ} = 21.4\\,\\text{m s}^{-1}$", marks: 1, criterion: "substitution" },
      { id: "m6", text: "$R = u_x T = 78.7\\,\\text{m}$ (allow 78–79 m)", marks: 1, criterion: "answer" },
    ],
    guidance: "Treat horizontal and vertical motion separately. ECF allowed throughout.",
  },
  {
    id: "p-dyn-1", subject: "9702", paper: "Paper 1", topicId: "phy-dynamics",
    subtopic: "Newton's laws", marks: 2, difficulty: 1, source: "original",
    stem: "**State** Newton's second law of motion.",
    markScheme: [
      { id: "m1", text: "The resultant force is proportional to the rate of change of momentum", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "…and acts in the direction of the change / of the force", marks: 1, criterion: "knowledge" },
    ],
    guidance: "'F = ma' alone scores 1 (it is only the constant-mass special case).",
  },
  {
    id: "p-dyn-2", subject: "9702", paper: "Paper 2", topicId: "phy-dynamics",
    subtopic: "Momentum", marks: 5, difficulty: 2, source: "original",
    stem: "A trolley of mass $0.80\\,\\text{kg}$ moving at $3.5\\,\\text{m s}^{-1}$ collides with a stationary trolley of mass $1.20\\,\\text{kg}$. They move off together.\n\n**(a)** Calculate their common velocity. **[3]**\n**(b)** **Show** that the collision is inelastic. **[2]**",
    markScheme: [
      { id: "m1", text: "States conservation of momentum: $m_1u_1 = (m_1+m_2)v$", marks: 1, criterion: "formula" },
      { id: "m2", text: "Substitutes: $0.80 \\times 3.5 = 2.00 \\times v$", marks: 1, criterion: "substitution" },
      { id: "m3", text: "$v = 1.4\\,\\text{m s}^{-1}$", marks: 1, criterion: "answer" },
      { id: "m4", text: "Calculates KE before ($4.9\\,\\text{J}$) and after ($1.96\\,\\text{J}$)", marks: 1, criterion: "working" },
      { id: "m5", text: "KE is not conserved, therefore inelastic", marks: 1, criterion: "explanation" },
    ],
  },
  {
    id: "p-wav-1", subject: "9702", paper: "Paper 1", topicId: "phy-waves",
    subtopic: "Wave properties", marks: 3, difficulty: 1, source: "original",
    stem: "A sound wave of frequency $256\\,\\text{Hz}$ travels through air at $340\\,\\text{m s}^{-1}$. Calculate its wavelength.",
    markScheme: [
      { id: "m1", text: "Uses $v = f\\lambda$", marks: 1, criterion: "formula" },
      { id: "m2", text: "$\\lambda = 340/256$", marks: 1, criterion: "substitution" },
      { id: "m3", text: "$\\lambda = 1.33\\,\\text{m}$ with unit", marks: 1, criterion: "answer" },
    ],
  },
  {
    id: "p-sup-1", subject: "9702", paper: "Paper 2", topicId: "phy-superposition",
    subtopic: "Double slit", marks: 4, difficulty: 2, source: "original",
    stem: "In a double-slit experiment the slit separation is $0.45\\,\\text{mm}$ and the screen is $2.0\\,\\text{m}$ away. The fringe spacing is measured as $2.6\\,\\text{mm}$.\n\n**(a)** Calculate the wavelength of the light. **[3]**\n**(b)** **State** what happens to the fringe spacing if the slits are moved closer together. **[1]**",
    markScheme: [
      { id: "m1", text: "Uses $\\lambda = ax/D$", marks: 1, criterion: "formula" },
      { id: "m2", text: "Converts mm to m and substitutes correctly", marks: 1, criterion: "substitution" },
      { id: "m3", text: "$\\lambda = 5.85 \\times 10^{-7}\\,\\text{m}$ (585 nm)", marks: 1, criterion: "answer" },
      { id: "m4", text: "Fringe spacing increases", marks: 1, criterion: "explanation" },
    ],
  },
  {
    id: "p-dc-1", subject: "9702", paper: "Paper 2", topicId: "phy-dc-circuits",
    subtopic: "Internal resistance", marks: 5, difficulty: 2, source: "original",
    stem: "A cell of e.m.f. $9.0\\,\\text{V}$ and internal resistance $1.5\\,\\Omega$ is connected to a $6.0\\,\\Omega$ resistor.\n\n**(a)** Calculate the current. **[3]**\n**(b)** Calculate the terminal p.d. **[1]**\n**(c)** **Explain** why the terminal p.d. is less than the e.m.f. **[1]**",
    markScheme: [
      { id: "m1", text: "Uses $\\varepsilon = I(R + r)$", marks: 1, criterion: "formula" },
      { id: "m2", text: "$9.0 = I(6.0 + 1.5)$", marks: 1, criterion: "substitution" },
      { id: "m3", text: "$I = 1.2\\,\\text{A}$", marks: 1, criterion: "answer" },
      { id: "m4", text: "$V = IR = 7.2\\,\\text{V}$", marks: 1, criterion: "answer" },
      { id: "m5", text: "Energy is dissipated / p.d. is 'lost' across the internal resistance", marks: 1, criterion: "explanation" },
    ],
  },
  {
    id: "p-circ-1", subject: "9702", paper: "Paper 4", topicId: "phy-circular-motion",
    subtopic: "Vertical circles", marks: 4, difficulty: 3, source: "original",
    stem: "A ball of mass $0.40\\,\\text{kg}$ is attached to a string and swung in a vertical circle of radius $1.2\\,\\text{m}$. At the lowest point its speed is $6.0\\,\\text{m s}^{-1}$.\n\n**Calculate** the tension in the string at that point.",
    data: "Take $g = 9.81\\,\\text{m s}^{-2}$.",
    markScheme: [
      { id: "m1", text: "Recognises $T - mg = mv^2/r$ at the lowest point", marks: 1, criterion: "formula" },
      { id: "m2", text: "$mv^2/r = 0.40 \\times 36 / 1.2 = 12\\,\\text{N}$", marks: 1, criterion: "substitution" },
      { id: "m3", text: "$mg = 3.92\\,\\text{N}$", marks: 1, criterion: "working" },
      { id: "m4", text: "$T = 15.9\\,\\text{N}$ (allow 16 N)", marks: 1, criterion: "answer" },
    ],
    guidance: "A very common error is $T = mv^2/r$ alone, omitting the weight — that scores 2 max.",
  },
  {
    id: "p-cap-1", subject: "9702", paper: "Paper 4", topicId: "phy-capacitance",
    subtopic: "Discharge", marks: 4, difficulty: 2, source: "original",
    stem: "A $470\\,\\mu\\text{F}$ capacitor charged to $12\\,\\text{V}$ discharges through a $22\\,\\text{k}\\Omega$ resistor.\n\n**(a)** Calculate the time constant. **[2]**\n**(b)** Calculate the p.d. after $15\\,\\text{s}$. **[2]**",
    markScheme: [
      { id: "m1", text: "Uses $\\tau = RC$", marks: 1, criterion: "formula" },
      { id: "m2", text: "$\\tau = 22\\times10^3 \\times 470\\times10^{-6} = 10.3\\,\\text{s}$", marks: 1, criterion: "answer" },
      { id: "m3", text: "Uses $V = V_0 e^{-t/\\tau}$", marks: 1, criterion: "formula" },
      { id: "m4", text: "$V = 12e^{-15/10.3} = 2.79\\,\\text{V}$ (allow 2.8 V)", marks: 1, criterion: "answer" },
    ],
  },
  {
    id: "p-qua-1", subject: "9702", paper: "Paper 4", topicId: "phy-quantum",
    subtopic: "Photoelectric effect", marks: 5, difficulty: 2, source: "original",
    stem: "Light of frequency $9.0\\times10^{14}\\,\\text{Hz}$ is incident on a metal of work function $2.4\\,\\text{eV}$.\n\n**(a)** Calculate the photon energy in eV. **[2]**\n**(b)** Calculate the maximum kinetic energy of the emitted electrons. **[1]**\n**(c)** **Explain** why no electrons are emitted below a certain frequency. **[2]**",
    data: "Take $h = 4.14\\times10^{-15}\\,\\text{eV s}$.",
    markScheme: [
      { id: "m1", text: "Uses $E = hf$", marks: 1, criterion: "formula" },
      { id: "m2", text: "$E = 3.73\\,\\text{eV}$", marks: 1, criterion: "answer" },
      { id: "m3", text: "$KE_{max} = hf - \\phi = 1.33\\,\\text{eV}$", marks: 1, criterion: "answer" },
      { id: "m4", text: "One photon transfers all its energy to one electron", marks: 1, criterion: "explanation" },
      { id: "m5", text: "Below threshold the photon energy is less than the work function, so the electron cannot escape", marks: 1, criterion: "explanation" },
    ],
  },
  {
    id: "p-grav-1", subject: "9702", paper: "Paper 4", topicId: "phy-gravitation",
    subtopic: "Orbits", marks: 4, difficulty: 3, source: "original",
    stem: "A satellite orbits the Earth at a radius of $8.0\\times10^{6}\\,\\text{m}$. The mass of the Earth is $6.0\\times10^{24}\\,\\text{kg}$.\n\n**(a)** **Show** that the orbital speed is about $7.1\\,\\text{km s}^{-1}$. **[3]**\n**(b)** Calculate the period of the orbit. **[1]**",
    data: "$G = 6.67\\times10^{-11}\\,\\text{N m}^2\\,\\text{kg}^{-2}$.",
    markScheme: [
      { id: "m1", text: "Equates gravitational and centripetal force: $GMm/r^2 = mv^2/r$", marks: 1, criterion: "formula" },
      { id: "m2", text: "Rearranges to $v = \\sqrt{GM/r}$", marks: 1, criterion: "working" },
      { id: "m3", text: "$v = 7.07\\times10^{3}\\,\\text{m s}^{-1}$", marks: 1, criterion: "answer" },
      { id: "m4", text: "$T = 2\\pi r/v = 7.1\\times10^{3}\\,\\text{s}$", marks: 1, criterion: "answer" },
    ],
  },
  {
    id: "p-fm-1", subject: "9702", paper: "Paper 2", topicId: "phy-forces-moments",
    subtopic: "Moments", marks: 4, difficulty: 1, source: "original",
    stem: "A uniform beam of weight $40\\,\\text{N}$ and length $2.0\\,\\text{m}$ rests on a pivot at its centre. A $12\\,\\text{N}$ weight hangs $0.80\\,\\text{m}$ from the pivot.\n\n**(a)** **Explain** why the weight of the beam exerts no moment about the pivot. **[1]**\n**(b)** Calculate the weight $W$ needed $0.50\\,\\text{m}$ from the pivot on the other side to balance the beam. **[3]**",
    markScheme: [
      { id: "m1", text: "Weight acts at the centre of mass, which is at the pivot — zero perpendicular distance", marks: 1, criterion: "explanation" },
      { id: "m2", text: "Applies principle of moments: $12 \\times 0.80 = W \\times 0.50$", marks: 1, criterion: "formula" },
      { id: "m3", text: "$9.6 = 0.50W$", marks: 1, criterion: "substitution" },
      { id: "m4", text: "$W = 19.2\\,\\text{N}$", marks: 1, criterion: "answer" },
    ],
  },

  // ============================ ECONOMICS 9708 ============================
  {
    id: "e-ped-1", subject: "9708", paper: "Paper 2", topicId: "ec-elasticity",
    subtopic: "PED", marks: 4, difficulty: 1, source: "original",
    stem: "The price of a train ticket rises from \\$8 to \\$10 and the number of tickets sold falls from 500 to 425 per day.\n\n**(a)** Calculate the price elasticity of demand. **[2]**\n**(b)** **Explain** what this value tells the train company about its total revenue. **[2]**",
    markScheme: [
      { id: "m1", text: "%ΔQ = −15%, %ΔP = +25%", marks: 1, criterion: "application" },
      { id: "m2", text: "PED = −0.6 (accept 0.6, inelastic)", marks: 1, criterion: "answer" },
      { id: "m3", text: "Demand is price inelastic (|PED| < 1)", marks: 1, criterion: "knowledge" },
      { id: "m4", text: "So raising price increases total revenue", marks: 1, criterion: "analysis" },
    ],
  },
  {
    id: "e-ext-1", subject: "9708", paper: "Paper 2", topicId: "ec-market-failure",
    subtopic: "Negative externalities", marks: 8, difficulty: 2, source: "original",
    stem: "**Explain**, using a diagram, how the consumption of sugary drinks can lead to market failure, and **analyse** one policy a government could use to correct it.",
    markScheme: [
      { id: "m1", text: "Defines negative externality: cost to a third party not involved in the transaction", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "Diagram: MPB and MSB shown, MSB below MPB, axes labelled", marks: 2, criterion: "diagram" },
      { id: "m3", text: "Identifies market equilibrium (MPB = MPC) and social optimum (MSB = MSC)", marks: 1, criterion: "application" },
      { id: "m4", text: "Explains overconsumption — output exceeds the social optimum", marks: 1, criterion: "analysis" },
      { id: "m5", text: "Identifies and shades the welfare loss triangle", marks: 1, criterion: "analysis" },
      { id: "m6", text: "Policy identified (indirect tax / regulation / information)", marks: 1, criterion: "knowledge" },
      { id: "m7", text: "Explains mechanism: tax raises price, internalises the external cost, reduces quantity to the optimum", marks: 1, criterion: "analysis" },
    ],
    guidance: "No diagram caps the answer at 5. The welfare-loss triangle must be identified for full analysis marks.",
  },
  {
    id: "e-sd-1", subject: "9708", paper: "Paper 1", topicId: "ec-price-system",
    subtopic: "Supply and demand", marks: 4, difficulty: 1, source: "original",
    stem: "A severe frost destroys a large part of the coffee harvest.\n\n**Explain**, using a supply and demand diagram, the effect on the equilibrium price and quantity of coffee.",
    markScheme: [
      { id: "m1", text: "Supply curve shifts to the left (decrease in supply)", marks: 1, criterion: "application" },
      { id: "m2", text: "Diagram correctly drawn with axes labelled and both equilibria marked", marks: 1, criterion: "diagram" },
      { id: "m3", text: "Equilibrium price rises", marks: 1, criterion: "analysis" },
      { id: "m4", text: "Equilibrium quantity falls", marks: 1, criterion: "analysis" },
    ],
    guidance: "A very common error is shifting demand instead of supply — no marks for the analysis if so.",
  },
  {
    id: "e-adas-1", subject: "9708", paper: "Paper 4", topicId: "ec-ad-as",
    subtopic: "Fiscal policy", marks: 12, difficulty: 3, source: "original",
    stem: "**Discuss** whether an increase in government spending is always an effective way to increase real national income.",
    markScheme: [
      { id: "m1", text: "Defines AD and identifies G as a component (AD = C + I + G + (X−M))", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "AD/AS diagram showing a rightward AD shift, axes labelled", marks: 2, criterion: "diagram" },
      { id: "m3", text: "Explains the multiplier — the final rise in income exceeds the injection", marks: 2, criterion: "analysis" },
      { id: "m4", text: "Explains that the effect depends on spare capacity / position on AS", marks: 2, criterion: "evaluation" },
      { id: "m5", text: "Near full employment the effect is mainly inflationary, not real output", marks: 1, criterion: "evaluation" },
      { id: "m6", text: "Considers crowding out, time lags or how it is financed", marks: 2, criterion: "evaluation" },
      { id: "m7", text: "Reaches a supported, conditional judgement ('effective if…')", marks: 2, criterion: "evaluation" },
    ],
    guidance: "Level 3 (9–12) needs developed analysis AND evaluation with a reasoned judgement. A bald yes/no conclusion caps at Level 2.",
  },
  {
    id: "e-mono-1", subject: "9708", paper: "Paper 4", topicId: "ec-firms-costs",
    subtopic: "Monopoly", marks: 6, difficulty: 2, source: "original",
    stem: "**Explain**, using a diagram, why a profit-maximising monopolist produces a lower output at a higher price than a firm in perfect competition.",
    markScheme: [
      { id: "m1", text: "States profit maximisation occurs where MC = MR", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "Diagram with AR, MR, MC (and AC), MR below AR", marks: 2, criterion: "diagram" },
      { id: "m3", text: "Explains MR lies below AR because price must fall to sell more", marks: 1, criterion: "analysis" },
      { id: "m4", text: "Identifies output where MC = MR and price read off AR", marks: 1, criterion: "application" },
      { id: "m5", text: "Compares with perfect competition where P = MC, giving higher output and lower price", marks: 1, criterion: "analysis" },
    ],
  },
  {
    id: "e-ex-1", subject: "9708", paper: "Paper 4", topicId: "ec-trade",
    subtopic: "Exchange rates", marks: 6, difficulty: 3, source: "original",
    stem: "A country's currency depreciates by 15%.\n\n**Analyse** the likely effect on its current account balance.",
    markScheme: [
      { id: "m1", text: "Defines depreciation: a fall in the value of the currency under a floating system", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "Exports become cheaper abroad, imports dearer domestically (SPICED)", marks: 1, criterion: "application" },
      { id: "m3", text: "Export volumes rise and import volumes fall", marks: 1, criterion: "analysis" },
      { id: "m4", text: "States the Marshall–Lerner condition (PEDx + PEDm > 1)", marks: 1, criterion: "analysis" },
      { id: "m5", text: "Explains the J-curve — the balance worsens before it improves", marks: 1, criterion: "evaluation" },
      { id: "m6", text: "Concludes that the improvement depends on elasticities and time", marks: 1, criterion: "evaluation" },
    ],
  },
  {
    id: "e-def-1", subject: "9708", paper: "Paper 1", topicId: "ec-basic-economic-problem",
    subtopic: "Opportunity cost", marks: 3, difficulty: 1, source: "original",
    stem: "**Define** opportunity cost and **give** one example of an opportunity cost faced by a government.",
    markScheme: [
      { id: "m1", text: "The value of the next best alternative forgone", marks: 2, criterion: "knowledge" },
      { id: "m2", text: "Valid example, e.g. spending on healthcare means less available for education", marks: 1, criterion: "application" },
    ],
    guidance: "'What you give up' alone scores 1 — the phrase 'next best alternative' is required for both marks.",
  },
  {
    id: "e-min-1", subject: "9708", paper: "Paper 2", topicId: "ec-labour",
    subtopic: "Minimum wage", marks: 6, difficulty: 2, source: "original",
    stem: "**Explain**, using a labour market diagram, the possible effects of introducing a national minimum wage above the equilibrium wage.",
    markScheme: [
      { id: "m1", text: "Defines minimum wage as a legally enforced wage floor", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "Diagram with Dl and Sl, minimum wage line above equilibrium, axes labelled", marks: 2, criterion: "diagram" },
      { id: "m3", text: "Identifies excess supply of labour (unemployment) on the diagram", marks: 1, criterion: "application" },
      { id: "m4", text: "Explains higher incomes for those still employed", marks: 1, criterion: "analysis" },
      { id: "m5", text: "Explains firms' costs rise, so quantity of labour demanded falls", marks: 1, criterion: "analysis" },
    ],
  },

  // ======================= COMPUTER SCIENCE 9618 =======================
  {
    id: "c-dr-1", subject: "9618", paper: "Paper 1", topicId: "cs-data-representation",
    subtopic: "Number systems", marks: 4, difficulty: 1, source: "original",
    stem: "**(a)** Convert the denary number 214 into 8-bit binary. **[2]**\n**(b)** Convert your answer to hexadecimal. **[1]**\n**(c)** **State** one reason why hexadecimal is used to represent binary. **[1]**",
    markScheme: [
      { id: "m1", text: "Correct method shown (place values 128 64 32 16 8 4 2 1)", marks: 1, criterion: "working" },
      { id: "m2", text: "11010110", marks: 1, criterion: "answer" },
      { id: "m3", text: "D6", marks: 1, criterion: "answer" },
      { id: "m4", text: "More compact / easier for humans to read / less error-prone", marks: 1, criterion: "knowledge" },
    ],
  },
  {
    id: "c-dr-2", subject: "9618", paper: "Paper 1", topicId: "cs-data-representation",
    subtopic: "Two's complement", marks: 3, difficulty: 2, source: "original",
    stem: "**(a)** Show how −38 is represented in 8-bit two's complement. **[2]**\n**(b)** **Explain** what is meant by overflow. **[1]**",
    markScheme: [
      { id: "m1", text: "+38 = 00100110, then invert and add 1 (method shown)", marks: 1, criterion: "working" },
      { id: "m2", text: "11011010", marks: 1, criterion: "answer" },
      { id: "m3", text: "The result is too large to be stored in the available number of bits", marks: 1, criterion: "knowledge" },
    ],
  },
  {
    id: "c-alg-1", subject: "9618", paper: "Paper 2", topicId: "cs-algorithm-design",
    subtopic: "Searching", marks: 6, difficulty: 2, source: "original",
    stem: "**Write** an algorithm in **pseudocode** that uses a binary search to find a value `Target` in a sorted array `List` of `N` integers. The algorithm should output the index if found, or −1 if not.",
    markScheme: [
      { id: "m1", text: "Initialises Low ← 1 and High ← N", marks: 1, criterion: "algorithm" },
      { id: "m2", text: "Loop condition WHILE Low <= High", marks: 1, criterion: "algorithm" },
      { id: "m3", text: "Calculates Mid ← (Low + High) DIV 2", marks: 1, criterion: "algorithm" },
      { id: "m4", text: "Compares List[Mid] with Target and returns Mid if equal", marks: 1, criterion: "algorithm" },
      { id: "m5", text: "Correctly adjusts Low or High for the two remaining cases", marks: 1, criterion: "algorithm" },
      { id: "m6", text: "Returns −1 after the loop; correct Cambridge pseudocode conventions", marks: 1, criterion: "syntax" },
    ],
    guidance: "Python/VB syntax used instead of pseudocode conventions loses the syntax mark.",
  },
  {
    id: "c-tt-1", subject: "9618", paper: "Paper 2", topicId: "cs-trace-tables",
    subtopic: "Tracing", marks: 4, difficulty: 1, source: "original",
    stem: "Complete a trace table for this algorithm and state the output.\n\n```\nA ← 17\nB ← 5\nQ ← 0\nWHILE A >= B DO\n    A ← A - B\n    Q ← Q + 1\nENDWHILE\nOUTPUT Q, A\n```",
    markScheme: [
      { id: "m1", text: "A column: 17, 12, 7, 2", marks: 1, criterion: "working" },
      { id: "m2", text: "Q column: 0, 1, 2, 3", marks: 1, criterion: "working" },
      { id: "m3", text: "Loop terminates when A = 2 (2 < 5)", marks: 1, criterion: "working" },
      { id: "m4", text: "Output: Q = 3, A = 2", marks: 1, criterion: "answer" },
    ],
  },
  {
    id: "c-db-1", subject: "9618", paper: "Paper 1", topicId: "cs-databases",
    subtopic: "SQL", marks: 4, difficulty: 2, source: "original",
    stem: "A table `Student(StudentID, Name, YearGroup, Grade)` exists.\n\n**Write** an SQL query to output the Name and Grade of all students in YearGroup 13, sorted alphabetically by Name.",
    markScheme: [
      { id: "m1", text: "SELECT Name, Grade", marks: 1, criterion: "syntax" },
      { id: "m2", text: "FROM Student", marks: 1, criterion: "syntax" },
      { id: "m3", text: "WHERE YearGroup = 13", marks: 1, criterion: "algorithm" },
      { id: "m4", text: "ORDER BY Name (ASC)", marks: 1, criterion: "algorithm" },
    ],
  },
  {
    id: "c-hw-1", subject: "9618", paper: "Paper 1", topicId: "cs-hardware",
    subtopic: "Fetch-decode-execute", marks: 5, difficulty: 2, source: "original",
    stem: "**Describe** the fetch stage of the fetch–decode–execute cycle, naming the registers used.",
    markScheme: [
      { id: "m1", text: "The address in the PC is copied to the MAR", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "The instruction at that address is fetched into the MDR", marks: 1, criterion: "knowledge" },
      { id: "m3", text: "The instruction is copied from the MDR to the CIR", marks: 1, criterion: "knowledge" },
      { id: "m4", text: "The PC is incremented", marks: 1, criterion: "knowledge" },
      { id: "m5", text: "All register abbreviations used correctly and in the right order", marks: 1, criterion: "explanation" },
    ],
  },
  {
    id: "c-sec-1", subject: "9618", paper: "Paper 1", topicId: "cs-security-ethics",
    subtopic: "Encryption", marks: 5, difficulty: 2, source: "original",
    stem: "**(a)** **Explain** the difference between symmetric and asymmetric encryption. **[3]**\n**(b)** **State** one advantage of asymmetric encryption. **[2]**",
    markScheme: [
      { id: "m1", text: "Symmetric uses the same key to encrypt and decrypt", marks: 1, criterion: "knowledge" },
      { id: "m2", text: "Asymmetric uses a key pair: public key to encrypt, private key to decrypt", marks: 1, criterion: "knowledge" },
      { id: "m3", text: "In symmetric the key must be shared securely in advance", marks: 1, criterion: "explanation" },
      { id: "m4", text: "No secret key needs to be transmitted", marks: 1, criterion: "explanation" },
      { id: "m5", text: "So it is not vulnerable to key interception during exchange", marks: 1, criterion: "analysis" },
    ],
  },
  {
    id: "c-ds-1", subject: "9618", paper: "Paper 2", topicId: "cs-data-structures",
    subtopic: "Stacks", marks: 5, difficulty: 2, source: "original",
    stem: "**Write** pseudocode for a `Push` procedure that adds an item to a stack implemented as an array `Stack[1:MAX]` with a pointer `Top`. It must handle a full stack.",
    markScheme: [
      { id: "m1", text: "PROCEDURE header and ENDPROCEDURE with a parameter", marks: 1, criterion: "syntax" },
      { id: "m2", text: "Checks IF Top < MAX (overflow check)", marks: 1, criterion: "algorithm" },
      { id: "m3", text: "Increments Top before storing", marks: 1, criterion: "algorithm" },
      { id: "m4", text: "Stack[Top] ← Item", marks: 1, criterion: "algorithm" },
      { id: "m5", text: "Outputs a suitable message on overflow", marks: 1, criterion: "algorithm" },
    ],
  },
  {
    id: "c-py-1", subject: "9618", paper: "Paper 4", topicId: "cs-python",
    subtopic: "Validation", marks: 5, difficulty: 2, source: "original",
    stem: "**Write** a Python function `get_mark()` that repeatedly asks the user for a mark until they enter a whole number between 0 and 100, then returns it. It must not crash on non-numeric input.",
    markScheme: [
      { id: "m1", text: "def get_mark(): with a loop that repeats", marks: 1, criterion: "syntax" },
      { id: "m2", text: "Uses int(input(...)) inside a try block", marks: 1, criterion: "algorithm" },
      { id: "m3", text: "except ValueError to catch non-numeric input", marks: 1, criterion: "algorithm" },
      { id: "m4", text: "Range check 0 <= mark <= 100", marks: 1, criterion: "algorithm" },
      { id: "m5", text: "Returns the value only when valid; re-prompts otherwise", marks: 1, criterion: "algorithm" },
    ],
  },
  {
    id: "c-oop-1", subject: "9618", paper: "Paper 4", topicId: "cs-oop",
    subtopic: "Classes", marks: 6, difficulty: 3, source: "original",
    stem: "**Write** a class `Book` with private attributes `Title` and `Copies`, a constructor, a getter for `Title`, and a method `Borrow()` that reduces `Copies` by 1 only if at least one copy is available.",
    markScheme: [
      { id: "m1", text: "Class declaration with both attributes declared PRIVATE", marks: 1, criterion: "syntax" },
      { id: "m2", text: "Constructor takes both values and assigns them", marks: 1, criterion: "algorithm" },
      { id: "m3", text: "Public getter returns Title", marks: 1, criterion: "algorithm" },
      { id: "m4", text: "Borrow() checks Copies > 0", marks: 1, criterion: "algorithm" },
      { id: "m5", text: "Decrements Copies when available", marks: 1, criterion: "algorithm" },
      { id: "m6", text: "Handles the unavailable case (message or returns False)", marks: 1, criterion: "algorithm" },
    ],
  },
];

export function bankTopics(subject: SubjectCode): string[] {
  return [...new Set(QUESTION_BANK.filter((q) => q.subject === subject).map((q) => q.topicId))];
}

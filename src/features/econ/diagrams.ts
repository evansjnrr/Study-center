// Editable economics diagram templates. Geometry lives in SVG plot coordinates:
// plot area x ∈ [PX0, PX1], y ∈ [PY0, PY1] with y inverted (small y = high value).
// The user drags handles to reshape; edits persist per diagram in IndexedDB.

export const PLOT = { x0: 46, x1: 344, y0: 24, y1: 262 };

export type CurveColor = "demand" | "supply" | "neutral" | "good" | "bad" | "third";

export interface DPoint {
  x: number;
  y: number;
}
export interface DLine {
  id: string;
  label: string;
  color: CurveColor;
  type: "line" | "curve"; // curve = quadratic through control point `c`
  p1: DPoint;
  p2: DPoint;
  c?: DPoint;
}
export interface KeyTerm {
  term: string;
  /** Exam-ready definition, phrased the way Cambridge mark schemes award it. */
  def: string;
  /** The words an examiner is scanning for — include these verbatim. */
  keywords?: string[];
}
export interface DiagramTemplate {
  id: string;
  name: string;
  category: "Microeconomics" | "Macroeconomics";
  xLabel: string;
  yLabel: string;
  lines: DLine[];
  // Straight-line pairs to mark the intersection of (equilibrium points).
  intersections?: [string, string][];
  // One-line orientation shown under the title.
  note: string;
  // A concrete real-world example (with context/numbers).
  realWorld: string;
  // Detailed, exam-grade breakdown: what the curves are, what shifts them,
  // and the conclusion to draw.
  explanation: string[];
  // Evaluation / "it depends" points that lift an answer into the top band.
  evaluation?: string[];
  keyTerms?: KeyTerm[];
}

const L = PLOT.x0, R = PLOT.x1, T = PLOT.y0, B = PLOT.y1;

export const DIAGRAMS: DiagramTemplate[] = [
  {
    id: "supply-demand",
    name: "Supply & Demand",
    category: "Microeconomics",
    xLabel: "Quantity",
    yLabel: "Price",
    lines: [
      { id: "D", label: "D", color: "demand", type: "line", p1: { x: L + 20, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "S", label: "S", color: "supply", type: "line", p1: { x: L + 20, y: B - 20 }, p2: { x: R - 10, y: T + 20 } },
    ],
    intersections: [["D", "S"]],
    note: "Equilibrium is where the plans of buyers and sellers coincide.",
    realWorld:
      "Global coffee (Arabica), 2021. A severe frost in Brazil — the world's largest producer — destroyed a chunk of the crop. Supply shifted left, and prices rose roughly 70% over the year even though demand was broadly unchanged.",
    explanation: [
      "**Demand (D)** slopes down: as price falls, quantity demanded rises (the law of demand). It shows buyers' willingness and ability to pay.",
      "**Supply (S)** slopes up: higher prices make production more profitable, so firms supply more.",
      "**Equilibrium** is at the intersection — the market-clearing price and quantity where there is no shortage or surplus.",
      "Above equilibrium price there is **excess supply** (a surplus) which pushes price down; below it there is **excess demand** (a shortage) which pushes price up.",
      "Distinguish a **movement along** a curve (caused by that good's own price) from a **shift** of the whole curve (caused by any other factor).",
    ],
    evaluation: [
      "The size of the price change depends on how **price-elastic** demand and supply are.",
      "Markets may adjust slowly — frictions, contracts and information gaps delay the return to equilibrium.",
    ],
    keyTerms: [
      { term: "Demand", def: "The quantity of a good consumers are **willing and able** to buy at each price over a given period of time.", keywords: ["willing and able", "at each price", "given time period"] },
      { term: "Supply", def: "The quantity of a good producers are **willing and able** to sell at each price over a given period of time.", keywords: ["willing and able", "at each price"] },
      { term: "Equilibrium", def: "The price at which **quantity demanded equals quantity supplied**, so there is no tendency for price to change; the market clears.", keywords: ["quantity demanded equals quantity supplied", "market clears", "no tendency to change"] },
      { term: "Excess demand", def: "A **shortage**: at the ruling price, quantity demanded exceeds quantity supplied, creating upward pressure on price.", keywords: ["shortage", "quantity demanded exceeds quantity supplied", "upward pressure on price"] },
      { term: "Excess supply", def: "A **surplus**: at the ruling price, quantity supplied exceeds quantity demanded, creating downward pressure on price.", keywords: ["surplus", "downward pressure on price"] },
      { term: "Movement vs shift", def: "A change in the good's **own price** causes a movement **along** the curve (a change in quantity demanded/supplied); any **other** determinant **shifts** the whole curve (a change in demand/supply).", keywords: ["own price", "movement along", "shift of the curve", "change in quantity demanded"] },
    ],
  },
  {
    id: "demand-shift",
    name: "Shift in Demand",
    category: "Microeconomics",
    xLabel: "Quantity",
    yLabel: "Price",
    lines: [
      { id: "D1", label: "D₁", color: "neutral", type: "line", p1: { x: L + 10, y: T + 40 }, p2: { x: R - 60, y: B - 20 } },
      { id: "D2", label: "D₂", color: "demand", type: "line", p1: { x: L + 70, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "S", label: "S", color: "supply", type: "line", p1: { x: L + 20, y: B - 20 }, p2: { x: R - 10, y: T + 20 } },
    ],
    intersections: [["D1", "S"], ["D2", "S"]],
    note: "A change in a non-price factor shifts the whole demand curve.",
    realWorld:
      "Electric vehicles, 2020–2024. Rising real incomes, falling battery prices and generous government subsidies shifted demand for EVs to the right (D₁ → D₂). Both the equilibrium price and quantity sold rose sharply.",
    explanation: [
      "Demand shifts **right** (increase) or **left** (decrease) when a determinant other than the good's own price changes.",
      "Determinants — remember **PIRATES**: Population, Income, Related goods (substitutes/complements), Advertising/tastes, Expectations, Season.",
      "For a **normal good**, higher income shifts demand right; for an **inferior good** it shifts left.",
      "Here D₁ → D₂ raises equilibrium price **and** quantity, because supply is upward-sloping.",
      "A subsidy to buyers works like an income boost — it raises willingness to pay at every quantity.",
    ],
    evaluation: [
      "The rise in price vs quantity depends on the **elasticity of supply**: inelastic supply → mostly price rises; elastic supply → mostly quantity rises.",
      "Subsidies have an **opportunity cost** and may simply be captured as higher prices if supply can't expand.",
    ],
    keyTerms: [
      { term: "Increase in demand", def: "A **rightward shift** of the whole demand curve, caused by a change in a **non-price determinant**, so more is demanded **at every price**.", keywords: ["rightward shift", "at every price", "non-price determinant"] },
      { term: "Normal good", def: "A good for which demand **rises as consumer income rises** (positive income elasticity of demand).", keywords: ["income rises", "positive income elasticity"] },
      { term: "Inferior good", def: "A good for which demand **falls as consumer income rises** (negative income elasticity of demand).", keywords: ["negative income elasticity"] },
      { term: "Substitute", def: "A good bought **instead of** another; a rise in the price of one causes a rise in demand for the other (positive cross elasticity).", keywords: ["instead of", "positive cross elasticity"] },
      { term: "Complement", def: "A good bought **together with** another; a rise in the price of one causes a fall in demand for the other (negative cross elasticity).", keywords: ["together with", "negative cross elasticity"] },
      { term: "Subsidy", def: "A **payment by government to producers** (or consumers) to lower the price and encourage output or consumption.", keywords: ["payment by government", "lower price", "encourage output"] },
    ],
  },
  {
    id: "price-ceiling",
    name: "Price Ceiling (max price)",
    category: "Microeconomics",
    xLabel: "Quantity",
    yLabel: "Price",
    lines: [
      { id: "D", label: "D", color: "demand", type: "line", p1: { x: L + 20, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "S", label: "S", color: "supply", type: "line", p1: { x: L + 20, y: B - 20 }, p2: { x: R - 10, y: T + 20 } },
      { id: "PC", label: "Max price", color: "bad", type: "line", p1: { x: L, y: B - 70 }, p2: { x: R, y: B - 70 } },
    ],
    intersections: [["D", "S"]],
    note: "A legal maximum below equilibrium causes a shortage.",
    realWorld:
      "Berlin's rent cap (Mietendeckel, 2020). The city froze and capped rents below the market level to protect tenants. Advertised rental listings fell by around half within a year: a classic shortage, as landlords withdrew flats and demand outstripped supply.",
    explanation: [
      "A **price ceiling** is a legal maximum. It only bites if set **below** the free-market equilibrium.",
      "At the capped price, quantity demanded exceeds quantity supplied → a persistent **shortage** (excess demand).",
      "Consequences: queues, waiting lists, rationing, and **black markets** where the good resells above the cap.",
      "Intended to improve **affordability/equity** for consumers — but it reduces the quantity actually available.",
      "Drag the cap up above equilibrium and it becomes non-binding: the market clears normally.",
    ],
    evaluation: [
      "Effectiveness depends on how far below equilibrium it is set and how elastic supply is.",
      "May need to be paired with measures that **increase supply** (e.g. building more housing) to avoid worsening shortages.",
    ],
    keyTerms: [
      { term: "Price ceiling (maximum price)", def: "A **legally imposed maximum price**, set **below the free-market equilibrium**, intended to make a good more affordable for consumers.", keywords: ["legally imposed maximum", "below equilibrium", "affordable"] },
      { term: "Binding", def: "A price control only has an effect if it is **binding** — a ceiling must be **below** equilibrium (a floor **above** it), otherwise the market simply clears normally.", keywords: ["below equilibrium", "otherwise no effect"] },
      { term: "Shortage", def: "**Quantity demanded exceeds quantity supplied** at the ruling price; because price cannot legally rise, the shortage **persists**.", keywords: ["quantity demanded exceeds quantity supplied", "persists"] },
      { term: "Black market", def: "An **illegal (parallel) market** in which the good is resold **above** the legal maximum price, arising because of the unsatisfied excess demand.", keywords: ["illegal market", "above the maximum price", "excess demand"] },
      { term: "Rationing", def: "Non-price methods of allocating the limited supply — **queues, waiting lists or first-come-first-served** — used because price can no longer perform the rationing function.", keywords: ["queues", "waiting lists", "rationing function of price"] },
    ],
  },
  {
    id: "price-floor",
    name: "Minimum Wage (price floor)",
    category: "Microeconomics",
    xLabel: "Quantity of labour",
    yLabel: "Wage",
    lines: [
      { id: "DL", label: "Dₗ", color: "demand", type: "line", p1: { x: L + 20, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "SL", label: "Sₗ", color: "supply", type: "line", p1: { x: L + 20, y: B - 20 }, p2: { x: R - 10, y: T + 20 } },
      { id: "NMW", label: "Min wage", color: "bad", type: "line", p1: { x: L, y: T + 70 }, p2: { x: R, y: T + 70 } },
    ],
    intersections: [["DL", "SL"]],
    note: "A wage floor above equilibrium can create excess supply of labour.",
    realWorld:
      "The UK National Living Wage. Set above the market-clearing wage for low-skilled work, it raised pay for millions in employment. Economists debate whether it causes unemployment — evidence suggests small effects, because firms absorb costs and demand for labour is fairly inelastic.",
    explanation: [
      "In the labour market, **demand for labour (Dₗ)** comes from firms and slopes down; **supply of labour (Sₗ)** comes from workers and slopes up.",
      "A **minimum wage** is a price floor. It only bites if set **above** the equilibrium wage.",
      "Above equilibrium, quantity of labour supplied exceeds quantity demanded → **excess supply of labour**, i.e. unemployment on the diagram.",
      "Benefits: higher incomes for the low-paid, reduced poverty, stronger work incentives.",
      "Costs on the diagram: some workers priced out of jobs; firms face higher costs.",
    ],
    evaluation: [
      "The unemployment effect depends on the **elasticity of demand for labour** — if inelastic, job losses are small.",
      "In a **monopsony** (single dominant employer), a minimum wage can actually raise both wages and employment.",
    ],
    keyTerms: [
      { term: "Price floor (minimum price)", def: "A **legally imposed minimum price**, set **above the free-market equilibrium**, intended to raise the income of producers or workers.", keywords: ["legally imposed minimum", "above equilibrium"] },
      { term: "National minimum wage", def: "A **legally enforced wage floor** below which employers may not pay, designed to reduce poverty among low-paid workers.", keywords: ["legally enforced", "wage floor", "reduce poverty"] },
      { term: "Excess supply of labour", def: "At the minimum wage, the **quantity of labour supplied exceeds the quantity demanded** — shown on the diagram as unemployment.", keywords: ["quantity supplied exceeds quantity demanded", "unemployment"] },
      { term: "Derived demand", def: "Demand for labour is **derived** from the demand for the good or service it produces — it is not wanted for its own sake.", keywords: ["derived from demand for the product"] },
      { term: "Monopsony", def: "A market with a **single dominant buyer** (here, one major employer), which can push the wage **below** the competitive level.", keywords: ["single dominant buyer", "below the competitive wage"] },
    ],
  },
  {
    id: "negative-externality",
    name: "Negative Externality (consumption)",
    category: "Microeconomics",
    xLabel: "Quantity",
    yLabel: "Price / Benefit",
    lines: [
      { id: "MPB", label: "MPB = D", color: "demand", type: "line", p1: { x: L + 40, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "MSB", label: "MSB", color: "third", type: "line", p1: { x: L + 20, y: T + 55 }, p2: { x: R - 60, y: B - 20 } },
      { id: "MPC", label: "MPC = S", color: "supply", type: "line", p1: { x: L + 20, y: B - 20 }, p2: { x: R - 10, y: T + 20 } },
    ],
    intersections: [["MPB", "MPC"], ["MSB", "MPC"]],
    note: "Private consumption overshoots the social optimum: welfare loss.",
    realWorld:
      "Sugary soft drinks. When someone drinks them they weigh their own enjoyment (MPB) but ignore the wider costs — obesity, diabetes, and the burden on the health service (the external cost). The market overconsumes. The UK Soft Drinks Levy (2018) is the corrective tax.",
    explanation: [
      "**Marginal Private Benefit (MPB)** is the demand curve — the benefit to the individual consumer.",
      "**Marginal Social Benefit (MSB)** lies **below** MPB because consumption imposes an external cost on third parties; the gap is the external cost.",
      "The **free-market** equilibrium is where MPB = MPC (private optimum); the **social optimum** is where MSB = MPC.",
      "The market quantity exceeds the social optimum → **overconsumption** and a **deadweight welfare loss** (the shaded triangle between MSB and MPC out to the market quantity).",
      "Corrective policies: an **indirect tax** to internalise the cost, **regulation**, or **information/education** to shift MPB toward MSB.",
    ],
    evaluation: [
      "Valuing the external cost is difficult, so the 'right' tax is hard to set.",
      "Demand for such goods is often **inelastic and habit-forming**, so a tax may cut consumption little while hitting the poorest hardest (regressive).",
    ],
    keyTerms: [
      { term: "Externality", def: "A **cost or benefit** imposed on a **third party** who is **not involved in the transaction** — the classic cause of market failure.", keywords: ["third party", "not involved in the transaction", "spillover"] },
      { term: "Market failure", def: "Where the **free market fails to allocate resources efficiently**, so output differs from the socially optimal level.", keywords: ["fails to allocate resources efficiently", "socially optimal"] },
      { term: "MPB / MSB", def: "**Marginal Private Benefit** is the benefit to the individual consumer; **Marginal Social Benefit** = MPB **plus** any external benefit (or **minus** any external cost).", keywords: ["marginal private benefit", "marginal social benefit", "external cost"] },
      { term: "Social optimum", def: "The output where **MSB = MSC**, at which society's net welfare is maximised.", keywords: ["MSB = MSC", "welfare maximised"] },
      { term: "Welfare loss (deadweight loss)", def: "The **loss of social surplus** from producing beyond (or below) the social optimum — shown as the **triangle** between MSB and MSC out to the market quantity.", keywords: ["loss of social welfare", "triangle", "beyond the social optimum"] },
      { term: "Indirect tax", def: "A tax on **expenditure** (on a good or service) used to **internalise the externality** — raising private cost to equal social cost.", keywords: ["tax on expenditure", "internalise the externality", "polluter pays"] },
    ],
  },
  {
    id: "monopoly",
    name: "Monopoly (AR, MR, MC, AC)",
    category: "Microeconomics",
    xLabel: "Output",
    yLabel: "Price / Cost",
    lines: [
      { id: "AR", label: "AR = D", color: "demand", type: "line", p1: { x: L + 20, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "MR", label: "MR", color: "third", type: "line", p1: { x: L + 20, y: T + 20 }, p2: { x: (L + R) / 2 - 10, y: B - 20 } },
      { id: "MC", label: "MC", color: "bad", type: "curve", p1: { x: L + 30, y: B - 50 }, p2: { x: R - 30, y: T + 40 }, c: { x: L + 110, y: B - 40 } },
      { id: "AC", label: "AC", color: "supply", type: "curve", p1: { x: L + 20, y: T + 70 }, p2: { x: R - 30, y: T + 70 }, c: { x: (L + R) / 2, y: B - 60 } },
    ],
    note: "One dominant firm maximises profit where MR = MC, then reads price off AR.",
    realWorld:
      "A regional water company. As the sole supplier of piped water, it is a natural monopoly. It restricts output relative to a competitive market and charges a price above marginal cost, earning supernormal profit — which is why such firms are regulated (e.g. by Ofwat in the UK).",
    explanation: [
      "A **monopoly** is a single seller with high barriers to entry; it is a **price maker** facing the whole market demand curve (AR).",
      "Because it must lower price to sell more, **Marginal Revenue (MR)** lies below AR and falls twice as steeply.",
      "Profit is maximised at the output where **MR = MC**; the firm then charges the highest price consumers will pay for that output, read up to **AR**.",
      "If AR > AC at that output, the firm earns **supernormal profit**, protected long-run by barriers to entry.",
      "Versus perfect competition: **higher price, lower output**, allocative inefficiency (P > MC).",
    ],
    evaluation: [
      "Monopoly isn't all bad: **economies of scale** can lower costs, and supernormal profit can fund **innovation** (dynamic efficiency).",
      "**Natural monopolies** (water, rail) avoid wasteful duplication — the case for regulation rather than competition.",
    ],
    keyTerms: [
      { term: "Monopoly", def: "A market with a **single seller** (or a firm with ≥25% market share) protected by **high barriers to entry**; it is a **price maker**.", keywords: ["single seller", "barriers to entry", "price maker"] },
      { term: "Barriers to entry", def: "Obstacles preventing new firms entering — **economies of scale, patents, high sunk costs, legal protection or brand loyalty** — which sustain supernormal profit in the long run.", keywords: ["patents", "economies of scale", "sunk costs", "long run"] },
      { term: "Profit maximisation", def: "Producing where **MC = MR**; at this output the last unit adds exactly as much to revenue as to cost, so profit cannot be increased.", keywords: ["MC = MR"] },
      { term: "Supernormal (abnormal) profit", def: "Profit **above normal profit** — earned when **AR > AC** — which in monopoly persists long-run because of barriers to entry.", keywords: ["above normal profit", "AR exceeds AC"] },
      { term: "Normal profit", def: "The **minimum return needed to keep the firm in the industry**; it occurs where AR = AC and is counted as a cost.", keywords: ["minimum return to stay in the industry", "AR = AC"] },
      { term: "Allocative efficiency", def: "Achieved where **P = MC**, so the value consumers place on the last unit equals its cost. Monopoly is allocatively **inefficient** because **P > MC**.", keywords: ["P = MC", "P exceeds MC"] },
      { term: "Productive efficiency", def: "Producing at the **minimum point of the average cost curve**, where output is made at lowest possible unit cost.", keywords: ["minimum of AC", "lowest unit cost"] },
      { term: "Natural monopoly", def: "An industry where **economies of scale are so large** that one firm can supply the whole market at lower cost than several — so competition would waste resources.", keywords: ["economies of scale", "one firm supplies at lower cost"] },
    ],
  },
  {
    id: "kinked-demand",
    name: "Kinked Demand Curve (Oligopoly)",
    category: "Microeconomics",
    xLabel: "Output",
    yLabel: "Price / Cost",
    lines: [
      { id: "AR1", label: "AR (elastic)", color: "demand", type: "line", p1: { x: L + 20, y: T + 40 }, p2: { x: (L + R) / 2, y: T + 100 } },
      { id: "AR2", label: "AR (inelastic)", color: "demand", type: "line", p1: { x: (L + R) / 2, y: T + 100 }, p2: { x: R - 20, y: B - 20 } },
      { id: "MR1", label: "MR", color: "third", type: "line", p1: { x: L + 20, y: T + 40 }, p2: { x: (L + R) / 2, y: T + 160 } },
      { id: "MR2", label: "MR", color: "third", type: "line", p1: { x: (L + R) / 2, y: T + 196 }, p2: { x: R - 45, y: B - 5 } },
      { id: "MC", label: "MC", color: "bad", type: "curve", p1: { x: L + 30, y: B - 32 }, p2: { x: R - 40, y: T + 66 }, c: { x: L + 115, y: B - 22 } },
    ],
    note: "Rivals match a price cut but ignore a price rise — so price sticks at the kink.",
    realWorld:
      "Petrol retailing. Supermarket forecourts in a town watch each other daily: cut a penny and the others match within hours, so you win almost no extra volume; raise a penny alone and drivers simply pass you. The result is the familiar sight of near-identical pump prices that stay put for weeks.",
    explanation: [
      "**Oligopoly** is a market dominated by a few large firms, so each one's best move depends on what it expects rivals to do — it is **interdependent**.",
      "The kink comes from an asymmetric expectation. **Raise price** and rivals hold theirs, so you lose a lot of custom — demand above the kink is relatively **price elastic** (the flatter segment).",
      "**Cut price** and rivals match to protect their share, so you gain very little — demand below the kink is relatively **price inelastic** (the steeper segment).",
      "Because AR has a kink, **MR is discontinuous**: there is a vertical gap in MR directly beneath it.",
      "**MC can rise or fall anywhere within that gap** and the profit-maximising output where MR = MC does not move. Price is therefore **sticky** — this is the model's whole point.",
      "The prediction is **price rigidity without collusion**: prices change rarely, and firms compete through branding, loyalty schemes and quality instead — **non-price competition**.",
    ],
    evaluation: [
      "The model explains why prices are sticky but **not how the initial price was set** — a well-known weakness.",
      "Empirically, oligopoly prices do move together during **industry-wide cost shocks** (a crude oil spike lifts every forecourt at once), which the model doesn't capture.",
      "It may describe **tacit collusion** just as well as independent behaviour — and the two are very hard to tell apart from price data alone, which is exactly the regulator's problem.",
    ],
    keyTerms: [
      { term: "Oligopoly", def: "A market dominated by a **few large firms**, with a high **concentration ratio** and **interdependent** decision-making.", keywords: ["few large firms", "concentration ratio", "interdependence"] },
      { term: "Interdependence", def: "Each firm's best pricing or output decision **depends on how rivals are expected to react**, which is why game theory applies to oligopoly.", keywords: ["depends on rivals' reactions"] },
      { term: "Price rigidity (stickiness)", def: "Prices **change infrequently** even when costs change, because the discontinuity in MR means the profit-maximising output is unaffected by small cost shifts.", keywords: ["prices change infrequently", "gap in MR", "profit-maximising output unchanged"] },
      { term: "Non-price competition", def: "Competing through **branding, advertising, quality, service or loyalty schemes** rather than price — the predicted behaviour when price is sticky.", keywords: ["branding", "advertising", "quality", "rather than price"] },
      { term: "Collusion", def: "Firms **agreeing to fix price or output** to act like a monopoly. **Overt** collusion is a formal cartel; **tacit** collusion is an unspoken understanding, often via price leadership.", keywords: ["fix price or output", "cartel", "tacit", "price leadership"] },
      { term: "Concentration ratio", def: "The **combined market share of the largest n firms** (e.g. a 4-firm ratio of 80% means the top four hold 80% of the market) — the standard measure of how oligopolistic a market is.", keywords: ["combined market share of the largest firms"] },
    ],
  },
  {
    id: "indifference-budget",
    name: "Indifference Curves & Budget Line",
    category: "Microeconomics",
    xLabel: "Good X",
    yLabel: "Good Y",
    lines: [
      { id: "BL", label: "Budget line", color: "bad", type: "line", p1: { x: L + 16, y: T + 24 }, p2: { x: R - 34, y: B - 14 } },
      { id: "IC1", label: "IC₁", color: "demand", type: "curve", p1: { x: L + 26, y: T + 54 }, p2: { x: R - 44, y: B - 26 }, c: { x: L + 66, y: B - 34 } },
      { id: "IC2", label: "IC₂", color: "third", type: "curve", p1: { x: L + 44, y: T + 22 }, p2: { x: R - 16, y: B - 30 }, c: { x: L + 108, y: B - 44 } },
    ],
    note: "The consumer picks the highest curve the budget can reach — where IC is tangent to the budget line.",
    realWorld:
      "A student with £60 a month for eating out and streaming. The budget line is every affordable split of the two. When a streaming price cut rotates the line outwards, they don't just buy more streaming — the cheaper option also frees money for meals out. Separating those two responses is exactly what the substitution and income effects do.",
    explanation: [
      "An **indifference curve** joins all combinations of two goods giving the consumer the **same total utility** — they are indifferent between every point on it.",
      "ICs slope **downwards** (giving up Y must be compensated by more X) and are **convex to the origin** because of a **diminishing marginal rate of substitution**: the more X you already have, the less Y you'll give up for another unit.",
      "ICs **never cross** — if they did, the same bundle would sit on two different utility levels, which is a contradiction.",
      "The **budget line** shows every bundle the consumer can just afford. Its slope is the **relative price ratio** $P_X/P_Y$; a rise in income shifts it outwards **parallel**, while a change in one price **rotates** it about the other intercept.",
      "**Consumer equilibrium** is where the budget line is **tangent** to the highest attainable IC — here MRS equals the price ratio, so no reallocation can raise utility. IC₂ is preferred but unaffordable.",
      "A price fall can be split into the **substitution effect** (the good is now relatively cheaper, so switch towards it — always positive) and the **income effect** (real income has risen). Their sum explains why the demand curve slopes down.",
    ],
    evaluation: [
      "For an **inferior good** the income effect works **against** the substitution effect; if it dominates you get a **Giffen good** and demand slopes upwards — theoretically possible, empirically almost never observed.",
      "The model assumes consumers are **rational with consistent, transitive preferences** and full information. Behavioural economics shows choices shift with framing, habit and anchoring.",
      "Utility is **ordinal** here (ranking only), which is a genuine strength: no one has to claim utility can be measured in cardinal units.",
    ],
    keyTerms: [
      { term: "Indifference curve", def: "A curve showing all combinations of two goods that yield the **same level of total utility**, so the consumer is **indifferent** between them.", keywords: ["same level of utility", "indifferent between combinations"] },
      { term: "Marginal rate of substitution (MRS)", def: "The amount of Y a consumer will **give up for one more unit of X while staying on the same indifference curve** — the slope of the IC. It **diminishes** as X rises, which is why ICs are convex.", keywords: ["give up for one more unit", "same indifference curve", "diminishing"] },
      { term: "Budget line", def: "All the combinations of two goods a consumer can buy by **spending their whole income** at current prices; its slope is the **price ratio** $P_X/P_Y$.", keywords: ["spending all income", "at given prices", "price ratio"] },
      { term: "Consumer equilibrium", def: "The point where the budget line is **tangent to the highest attainable indifference curve** — utility is maximised because **MRS = the price ratio**.", keywords: ["tangency", "highest attainable indifference curve", "MRS equals price ratio"] },
      { term: "Substitution effect", def: "The change in quantity demanded caused **purely by the change in relative price**, holding real income (utility) constant. It is **always** towards the good that has become relatively cheaper.", keywords: ["relative price", "real income held constant", "always positive"] },
      { term: "Income effect", def: "The change in quantity demanded caused by the change in **real income** resulting from a price change. It is positive for a **normal** good and negative for an **inferior** good.", keywords: ["real income", "normal good", "inferior good"] },
      { term: "Giffen good", def: "A strongly **inferior** good whose **negative income effect outweighs the substitution effect**, so quantity demanded **rises as price rises** — an upward-sloping demand curve.", keywords: ["inferior", "income effect outweighs substitution effect", "demand slopes upwards"] },
    ],
  },
  {
    id: "lorenz-curve",
    name: "Lorenz Curve & Gini Coefficient",
    category: "Microeconomics",
    xLabel: "Cumulative % of households",
    yLabel: "Cumulative % of income",
    lines: [
      { id: "EQ", label: "Line of equality", color: "neutral", type: "line", p1: { x: L + 6, y: B - 6 }, p2: { x: R - 6, y: T + 6 } },
      { id: "LZ", label: "Lorenz curve", color: "demand", type: "curve", p1: { x: L + 6, y: B - 6 }, p2: { x: R - 6, y: T + 6 }, c: { x: R - 74, y: B - 22 } },
    ],
    note: "The further the curve sags from the 45° line, the more unequal the distribution.",
    realWorld:
      "South Africa has the world's most unequal recorded income distribution, with a Gini coefficient around 0.63 — its Lorenz curve sags a long way below the diagonal. Slovakia and Slovenia sit near 0.24, hugging it. The UK is roughly 0.35 before taxes and benefits pull it down noticeably.",
    explanation: [
      "Households are ranked from **poorest to richest** along the horizontal axis, and the vertical axis reads off the **cumulative share of income** they receive.",
      "The **45° line of equality** is the hypothetical case where every 10% of households receives exactly 10% of income.",
      "The **Lorenz curve** always lies on or below it. A point reading '60% of households receive 25% of income' is a direct statement of how unequal the distribution is.",
      "The **Gini coefficient** is the area **between** the two lines divided by the whole area under the 45° line: $G = A/(A+B)$. It runs from **0 (perfect equality)** to **1 (one household has everything)**.",
      "**Progressive taxation and transfer payments** pull the curve up towards the diagonal — which is why the post-tax Gini is almost always lower than the pre-tax one.",
      "Take care to distinguish **income** (a flow, per period) from **wealth** (a stock of assets). Wealth is always distributed far more unequally, so a wealth Lorenz curve sags much further.",
    ],
    evaluation: [
      "A single Gini number **hides where** the inequality sits: the same coefficient can come from a very poor bottom decile or a runaway top 1%. Two curves that **cross** can even share a Gini.",
      "It measures **relative** inequality, not poverty. Everyone's income could double with the Gini unchanged — inequality identical, absolute poverty far lower.",
      "Some inequality may be **incentive-compatible**: rewards for skill, risk and effort can raise growth. The equity–efficiency trade-off is the standard evaluation line.",
      "The data ignore the **informal economy**, undeclared income and benefits in kind, so measured inequality is an approximation.",
    ],
    keyTerms: [
      { term: "Lorenz curve", def: "A graph plotting the **cumulative percentage of income** received against the **cumulative percentage of households**, ranked poorest first; the further it lies **below the line of equality**, the greater the inequality.", keywords: ["cumulative percentage of income", "cumulative percentage of households", "below the line of equality"] },
      { term: "Line of equality", def: "The **45° line** representing a **perfectly equal** distribution, where each x% of households receives exactly x% of income.", keywords: ["45 degree line", "perfectly equal distribution"] },
      { term: "Gini coefficient", def: "The **area between the Lorenz curve and the line of equality as a proportion of the total area beneath the line of equality**. It ranges from **0 (perfect equality) to 1 (perfect inequality)**.", keywords: ["area between the curve and the line of equality", "0 perfect equality", "1 perfect inequality"] },
      { term: "Income vs wealth", def: "**Income** is a **flow** of earnings per time period; **wealth** is a **stock** of accumulated assets. Wealth is distributed **considerably more unequally** than income.", keywords: ["flow", "stock of assets", "wealth more unequally distributed"] },
      { term: "Progressive tax", def: "A tax taking a **rising proportion of income as income rises** (the average rate increases). It reduces inequality and shifts the Lorenz curve **towards** the diagonal.", keywords: ["rising proportion of income", "average rate increases"] },
      { term: "Transfer payment", def: "A government payment (pension, unemployment benefit, child benefit) made **without any good or service being produced in return** — a redistribution of income, not part of national output.", keywords: ["no output produced in return", "redistribution"] },
      { term: "Equity vs equality", def: "**Equality** means identical shares; **equity** means a distribution judged **fair**. Cambridge distinguishes **horizontal** equity (treating identical cases alike) from **vertical** equity (treating different cases differently).", keywords: ["fairness", "horizontal equity", "vertical equity"] },
    ],
  },
  {
    id: "phillips-curve",
    name: "Phillips Curve (Short & Long Run)",
    category: "Macroeconomics",
    xLabel: "Unemployment rate (%)",
    yLabel: "Inflation rate (%)",
    lines: [
      { id: "SRPC", label: "SRPC", color: "demand", type: "curve", p1: { x: L + 22, y: T + 20 }, p2: { x: R - 20, y: B - 34 }, c: { x: L + 74, y: B - 28 } },
      { id: "LRPC", label: "LRPC", color: "supply", type: "line", p1: { x: L + 170, y: T + 10 }, p2: { x: L + 170, y: B - 6 } },
    ],
    note: "A short-run trade-off between inflation and unemployment — which vanishes in the long run.",
    realWorld:
      "The 1970s broke the original curve. Oil shocks in 1973 and 1979 delivered **stagflation** — UK inflation above 20% alongside rising unemployment — a combination the simple downward-sloping relationship said was impossible. That failure is precisely what produced the expectations-augmented version with a vertical long-run curve.",
    explanation: [
      "The **short-run Phillips curve (SRPC)** shows an inverse relationship: as unemployment falls, labour markets tighten, wages are bid up and inflation rises.",
      "It is the mirror image of the AD/AS diagram. Rising AD moves the economy **up and left** along the SRPC — lower unemployment bought with higher inflation.",
      "The **long-run Phillips curve (LRPC)** is **vertical** at the **natural rate of unemployment** — the rate consistent with stable inflation, made up of frictional and structural unemployment.",
      "The reason is **expectations**. A government expanding demand gets lower unemployment only while inflation is **unexpected**. Once workers anticipate it, they demand higher nominal wages, firms cut employment back, and the economy returns to the natural rate at a **higher** inflation rate — the SRPC has shifted up.",
      "So the trade-off is **temporary**. Repeatedly exploiting it just ratchets inflation upwards with no lasting fall in unemployment — the **accelerationist** conclusion.",
      "Only **supply-side** policy shifts the LRPC **left**: better training and education, improved job matching, reformed benefits — anything cutting frictional or structural unemployment.",
    ],
    evaluation: [
      "The relationship has looked **flat** in many advanced economies since the 2010s — very low unemployment produced little inflation, which is hard to square with the model.",
      "It says nothing about **cost-push** inflation. A supply shock raises inflation *and* unemployment together, shifting the SRPC outwards rather than moving along it.",
      "The **natural rate is unobservable** and only estimated with a wide margin, so a policymaker cannot reliably tell whether the economy is above or below it in real time.",
      "**Hysteresis** complicates the vertical LRPC: a long recession can leave workers deskilled and detached from the labour market, raising the natural rate itself.",
    ],
    keyTerms: [
      { term: "Phillips curve", def: "A curve showing the **inverse relationship between the rate of inflation and the rate of unemployment** in the short run.", keywords: ["inverse relationship", "inflation and unemployment", "short run"] },
      { term: "Natural rate of unemployment (NRU)", def: "The rate of unemployment when the labour market is in equilibrium — **frictional plus structural** unemployment — at which **inflation is stable**. The LRPC is vertical at this rate.", keywords: ["frictional and structural", "stable inflation", "long-run vertical"] },
      { term: "Expectations-augmented Phillips curve", def: "The version in which the short-run curve's position depends on the **expected rate of inflation**; as expectations adjust upwards the SRPC **shifts up**, leaving unemployment back at the natural rate.", keywords: ["expected inflation", "SRPC shifts up", "returns to natural rate"] },
      { term: "Stagflation", def: "**High inflation and high unemployment occurring together**, usually caused by a cost-push supply shock — the combination the original Phillips curve could not explain.", keywords: ["high inflation and high unemployment together", "supply shock"] },
      { term: "Frictional unemployment", def: "Short-term unemployment while workers move **between jobs** — a search process, present even at full employment.", keywords: ["between jobs", "search", "short-term"] },
      { term: "Structural unemployment", def: "Unemployment from a **mismatch of skills or location** between the unemployed and available vacancies, caused by a lasting change in the pattern of demand or technology.", keywords: ["mismatch of skills", "geographical immobility", "long-term change in demand"] },
      { term: "Hysteresis", def: "Where a **temporary** rise in unemployment becomes **permanent**, because the long-term unemployed lose skills, motivation and contact with the labour market — raising the natural rate itself.", keywords: ["temporary becomes permanent", "loss of skills", "raises the natural rate"] },
    ],
  },
  {
    id: "ppf",
    name: "Production Possibility Frontier",
    category: "Microeconomics",
    xLabel: "Good A",
    yLabel: "Good B",
    lines: [
      { id: "PPF", label: "PPF", color: "supply", type: "curve", p1: { x: L + 10, y: T + 20 }, p2: { x: R - 20, y: B - 10 }, c: { x: R - 60, y: T + 40 } },
    ],
    note: "The maximum combinations an economy can produce with its resources.",
    realWorld:
      "'Guns vs butter.' In wartime, an economy shifts along its frontier away from consumer goods (butter) towards armaments (guns) — as many economies did in 1939–45. The opportunity cost of each extra tank is the consumer goods given up.",
    explanation: [
      "The **PPF** shows the maximum output combinations of two goods when all resources are used **efficiently**.",
      "Points **on** the curve are productively efficient; **inside** means unemployed/idle resources; **outside** is currently unattainable.",
      "Moving along the curve has an **opportunity cost** — more of one good means less of the other.",
      "The curve **bows outward** because resources aren't equally suited to both goods → **increasing** opportunity cost.",
      "**Economic growth** (more/better resources or technology) shifts the whole PPF outward.",
    ],
    evaluation: [
      "A straight-line PPF would imply constant opportunity cost (perfectly substitutable resources) — rarely realistic.",
      "Choosing more capital goods today (vs consumer goods) shifts the future PPF out faster.",
    ],
    keyTerms: [
      { term: "Scarcity", def: "**Unlimited wants** set against **limited (finite) resources** — the fundamental economic problem that forces choice.", keywords: ["unlimited wants", "limited resources", "forces choice"] },
      { term: "Opportunity cost", def: "The **value of the next best alternative forgone** when a choice is made.", keywords: ["next best alternative forgone"] },
      { term: "Production Possibility Frontier", def: "A curve showing the **maximum combinations of two goods** an economy can produce when all resources are **fully and efficiently employed** with existing technology.", keywords: ["maximum combinations", "fully and efficiently employed", "given technology"] },
      { term: "Productive efficiency (on the PPF)", def: "Any point **on** the frontier: it is impossible to produce more of one good **without producing less** of the other.", keywords: ["on the curve", "without producing less of the other"] },
      { term: "Increasing opportunity cost", def: "The reason the PPF is **concave (bowed outwards)**: resources are **not equally suited** to both goods, so each extra unit costs progressively more of the other.", keywords: ["bowed outwards", "resources not equally suited"] },
      { term: "Economic growth", def: "An **outward shift of the PPF**, caused by more or better resources, improved technology, or rising productivity.", keywords: ["outward shift", "more or better resources", "technology"] },
      { term: "Capital vs consumer goods", def: "**Capital goods** are used to produce other goods; choosing more of them lowers consumption today but shifts the **future PPF outwards faster**.", keywords: ["capital goods", "future growth"] },
    ],
  },
  {
    id: "cost-curves",
    name: "Cost Curves (MC, ATC, AVC)",
    category: "Microeconomics",
    xLabel: "Output",
    yLabel: "Cost per unit",
    lines: [
      { id: "MC", label: "MC", color: "bad", type: "curve", p1: { x: L + 30, y: B - 40 }, p2: { x: R - 20, y: T + 30 }, c: { x: L + 90, y: B - 30 } },
      { id: "ATC", label: "ATC", color: "supply", type: "curve", p1: { x: L + 20, y: T + 60 }, p2: { x: R - 20, y: T + 60 }, c: { x: (L + R) / 2, y: B - 60 } },
      { id: "AVC", label: "AVC", color: "third", type: "curve", p1: { x: L + 20, y: B - 70 }, p2: { x: R - 20, y: T + 90 }, c: { x: (L + R) / 2 - 20, y: B - 40 } },
    ],
    note: "MC cuts ATC and AVC at their lowest points.",
    realWorld:
      "A local bakery. With one oven, cost per loaf falls as output rises (the fixed oven cost is spread over more loaves). Push past the kitchen's capacity and staff work overtime in cramped space — cost per loaf climbs again. That's the U-shaped average total cost.",
    explanation: [
      "**Average Total Cost (ATC)** = total cost ÷ output; it is U-shaped in the short run.",
      "Falling ATC at low output comes from spreading **fixed costs**; rising ATC later comes from **diminishing marginal returns**.",
      "**Marginal Cost (MC)** is the cost of one more unit; it cuts **both** ATC and AVC at their **minimum** points.",
      "The gap between ATC and **AVC** is average fixed cost, which shrinks as output rises.",
      "In the long run all costs are variable — the curve reflects **economies then diseconomies of scale**.",
    ],
    evaluation: [
      "The minimum of ATC is the **productively efficient** level of output.",
      "Long-run cost curves depend on the **minimum efficient scale** of the industry.",
    ],
    keyTerms: [
      { term: "Fixed costs", def: "Costs that **do not vary with output** in the short run (rent, insurance); they must be paid even at zero output.", keywords: ["do not vary with output", "short run"] },
      { term: "Variable costs", def: "Costs that **change directly with the level of output** (raw materials, piece-rate wages).", keywords: ["vary directly with output"] },
      { term: "Marginal cost", def: "The **addition to total cost** of producing **one more unit** of output.", keywords: ["addition to total cost", "one more unit"] },
      { term: "Law of diminishing returns", def: "In the **short run**, as more of a variable factor is added to a **fixed factor**, the **marginal product eventually falls** — which is why MC eventually rises.", keywords: ["short run", "fixed factor", "marginal product eventually falls"] },
      { term: "Why MC cuts AC at its minimum", def: "When **MC < AC** the average is pulled **down**; when **MC > AC** it is pulled **up**. So MC must cross AC exactly at AC's **lowest point**.", keywords: ["MC below AC pulls average down", "minimum point"] },
      { term: "Economies of scale", def: "**Long-run** falls in **average cost** as the scale of output rises (purchasing, technical, managerial, financial, marketing, risk-bearing).", keywords: ["long run", "falling average cost", "scale of output"] },
      { term: "Diseconomies of scale", def: "**Long-run rises in average cost** beyond a certain size, usually from **communication problems, coordination difficulties and falling worker motivation**.", keywords: ["rising average cost", "coordination", "communication"] },
    ],
  },
  {
    id: "ped",
    name: "Elastic vs Inelastic Demand",
    category: "Microeconomics",
    xLabel: "Quantity",
    yLabel: "Price",
    lines: [
      { id: "Del", label: "Elastic D", color: "demand", type: "line", p1: { x: L + 10, y: B - 60 }, p2: { x: R - 10, y: B - 30 } },
      { id: "Din", label: "Inelastic D", color: "third", type: "line", p1: { x: L + 90, y: T + 10 }, p2: { x: L + 140, y: B - 10 } },
    ],
    note: "How responsive quantity demanded is to a change in price.",
    realWorld:
      "Insulin vs a single brand of bottled water. Insulin is a life-saving necessity with no substitute — demand is steep and inelastic, so quantity barely falls when price rises. One brand of water has many rivals — demand is flat and elastic, so a small price rise sends buyers elsewhere.",
    explanation: [
      "**Price elasticity of demand (PED)** = %ΔQ ÷ %ΔP. It is negative; we compare magnitudes.",
      "**Elastic** (|PED| > 1): quantity is very responsive — a flat curve. **Inelastic** (|PED| < 1): unresponsive — a steep curve.",
      "Determinants: **substitutes** (more → more elastic), **necessity vs luxury**, **proportion of income**, **time** (more elastic in the long run), and how **narrowly** the good is defined.",
      "Links to revenue: if demand is inelastic, raising price **increases** total revenue; if elastic, raising price **reduces** it.",
      "This is why governments tax inelastic goods (tobacco, fuel) — revenue holds up even as price rises.",
    ],
    evaluation: [
      "PED varies **along** a straight-line demand curve — elastic at the top, inelastic at the bottom.",
      "Estimates are imprecise: they rely on past data and 'other things equal', which rarely holds.",
    ],
    keyTerms: [
      { term: "Price elasticity of demand (PED)", def: "The **responsiveness of quantity demanded to a change in the good's own price**: $\\text{PED} = \\dfrac{\\%\\Delta Q_d}{\\%\\Delta P}$. It is normally **negative**.", keywords: ["responsiveness of quantity demanded", "% change in quantity ÷ % change in price"] },
      { term: "Price elastic demand", def: "|PED| **> 1**: quantity demanded changes **proportionately more** than price. Shown as a **flatter** curve.", keywords: ["greater than one", "proportionately more"] },
      { term: "Price inelastic demand", def: "|PED| **< 1**: quantity demanded changes **proportionately less** than price. Shown as a **steeper** curve.", keywords: ["less than one", "proportionately less"] },
      { term: "Determinants of PED", def: "**Substitutes** available, whether it is a **necessity or luxury**, the **proportion of income** spent on it, **time period**, and **how narrowly the good is defined** (habit-forming goods are inelastic).", keywords: ["substitutes", "necessity or luxury", "proportion of income", "time"] },
      { term: "PED and total revenue", def: "If demand is **inelastic**, raising price **raises** total revenue; if **elastic**, raising price **lowers** it. (TR = P × Q.)", keywords: ["inelastic: raise price raises revenue", "elastic: raise price lowers revenue"] },
      { term: "Income elasticity of demand (YED)", def: "The **responsiveness of demand to a change in income**: positive for **normal** goods, negative for **inferior** goods.", keywords: ["responsiveness to income", "normal", "inferior"] },
      { term: "Cross elasticity of demand (XED)", def: "The **responsiveness of demand for one good to a change in the price of another**: positive for **substitutes**, negative for **complements**.", keywords: ["positive: substitutes", "negative: complements"] },
    ],
  },
  {
    id: "ad-as",
    name: "AD – AS",
    category: "Macroeconomics",
    xLabel: "Real national output",
    yLabel: "Price level",
    lines: [
      { id: "AD", label: "AD", color: "demand", type: "line", p1: { x: L + 20, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "AS", label: "AS", color: "supply", type: "curve", p1: { x: L + 20, y: B - 20 }, p2: { x: R - 20, y: T + 30 }, c: { x: R - 70, y: B - 40 } },
    ],
    note: "The whole economy: aggregate demand meets aggregate supply.",
    realWorld:
      "COVID-19 stimulus, 2020–2022. Governments and central banks boosted spending and cut rates, shifting AD right. With spare capacity in 2020, output recovered with little inflation. By 2022, economies neared full capacity (the steep part of AS) and supply shocks hit — so extra demand fed mainly into inflation.",
    explanation: [
      "**Aggregate Demand (AD)** = C + I + G + (X − M) — total planned spending; it slopes down against the price level.",
      "**Aggregate Supply (AS)** slopes up and **steepens** near full employment, where extra spending can't raise real output much.",
      "An AD shift right raises real output **and** the price level; how they split depends on **where on AS** the economy is.",
      "With **spare capacity** (flat AS), extra AD mostly raises output; near **full capacity** (steep AS), it mostly raises prices (demand-pull inflation).",
      "The **multiplier** means an injection (e.g. government spending) raises national income by more than the initial amount.",
    ],
    evaluation: [
      "Effectiveness of demand-side policy depends on the output gap, the size of the multiplier, and **crowding out**.",
      "Long-run growth needs **supply-side** improvements (skills, investment, productivity) that shift AS right.",
    ],
    keyTerms: [
      { term: "Aggregate Demand", def: "The **total planned expenditure** on an economy's goods and services at each price level: **AD = C + I + G + (X − M)**.", keywords: ["total planned expenditure", "C + I + G + (X − M)", "at each price level"] },
      { term: "Aggregate Supply", def: "The **total planned output** producers are willing to supply at each price level in a given period.", keywords: ["total planned output", "at each price level"] },
      { term: "Multiplier", def: "The ratio of the **final change in national income** to the **initial change in injection**; spending is re-spent round the circular flow.", keywords: ["final change in national income", "initial injection", "circular flow"] },
      { term: "Output gap", def: "The difference between **actual output and potential (full-capacity) output**. A **negative** gap means spare capacity; a **positive** gap means the economy is over-heating.", keywords: ["actual and potential output", "spare capacity"] },
      { term: "Demand-pull inflation", def: "A sustained rise in the price level caused by **excess aggregate demand** when the economy is near full capacity.", keywords: ["excess aggregate demand", "near full capacity"] },
      { term: "Cost-push inflation", def: "A sustained rise in the price level caused by **rising costs of production** (wages, imported raw materials), shifting **AS left**.", keywords: ["rising costs of production", "AS shifts left"] },
      { term: "Crowding out", def: "Where **increased government borrowing raises interest rates**, reducing private-sector investment and offsetting the fiscal expansion.", keywords: ["government borrowing", "raises interest rates", "reduces private investment"] },
      { term: "Fiscal vs monetary policy", def: "**Fiscal** = government **spending and taxation**; **monetary** = the central bank's **interest rates and money supply**. Both are demand-side.", keywords: ["spending and taxation", "interest rates", "demand-side"] },
      { term: "Supply-side policy", def: "Measures to raise **productive capacity** — education, training, infrastructure, deregulation, tax incentives — shifting **AS right** and enabling growth **without inflation**.", keywords: ["productive capacity", "AS shifts right", "without inflation"] },
    ],
  },
  {
    id: "exchange-rate",
    name: "Exchange Rate (currency market)",
    category: "Macroeconomics",
    xLabel: "Quantity of £",
    yLabel: "Exchange rate ($ per £)",
    lines: [
      { id: "D1", label: "D£₁", color: "neutral", type: "line", p1: { x: L + 70, y: T + 20 }, p2: { x: R - 10, y: B - 20 } },
      { id: "D2", label: "D£₂", color: "demand", type: "line", p1: { x: L + 10, y: T + 40 }, p2: { x: R - 60, y: B - 20 } },
      { id: "S", label: "S£", color: "supply", type: "line", p1: { x: L + 20, y: B - 20 }, p2: { x: R - 10, y: T + 20 } },
    ],
    intersections: [["D1", "S"], ["D2", "S"]],
    note: "A currency's price is set by demand for and supply of it.",
    realWorld:
      "The pound after the June 2016 Brexit vote. Uncertainty cut foreign demand for UK assets and sterling, shifting demand for £ left (D£₁ → D£₂). The pound fell from about $1.48 to $1.33 against the dollar almost overnight — a depreciation.",
    explanation: [
      "In a **floating** system, the exchange rate is just the price of one currency in terms of another, set by demand and supply.",
      "**Demand for £** comes from foreigners buying UK exports, assets or investing here; **supply of £** comes from UK residents buying imports or foreign assets.",
      "A leftward shift in demand for £ causes a **depreciation** (fewer $ per £); a rightward shift causes an **appreciation**.",
      "Drivers: relative interest rates (hot money), trade flows, speculation, and confidence.",
      "A weaker £ makes exports cheaper and imports dearer — **SPICED** (Strong Pound = Imports Cheaper, Exports Dearer) works in reverse.",
    ],
    evaluation: [
      "The effect on the trade balance depends on the **Marshall–Lerner condition** and the **J-curve** — it improves only if demand is elastic enough, and only over time.",
      "A depreciation can import inflation via dearer imported raw materials.",
    ],
    keyTerms: [
      { term: "Exchange rate", def: "The **price of one currency expressed in terms of another**.", keywords: ["price of one currency in terms of another"] },
      { term: "Depreciation", def: "A **fall in the value of a currency** under a **floating** exchange rate, caused by market forces.", keywords: ["fall in value", "floating", "market forces"] },
      { term: "Devaluation", def: "A **deliberate reduction in the value** of a currency by the government under a **fixed** exchange rate system.", keywords: ["deliberate", "fixed exchange rate"] },
      { term: "Appreciation", def: "A **rise in the value of a currency** under a floating system.", keywords: ["rise in value", "floating"] },
      { term: "SPICED", def: "**S**trong **P**ound = **I**mports **C**heaper, **E**xports **D**earer — so a weaker currency makes **exports cheaper and imports dearer**.", keywords: ["exports cheaper", "imports dearer"] },
      { term: "Hot money", def: "Short-term **speculative capital flows** moving between countries chasing **higher interest rates** or expected currency gains.", keywords: ["speculative capital flows", "interest rate differentials"] },
      { term: "Marshall–Lerner condition", def: "A depreciation improves the current account **only if the combined price elasticities of demand for exports and imports exceed 1** (PEDx + PEDm > 1).", keywords: ["sum of elasticities greater than one", "current account"] },
      { term: "J-curve effect", def: "After a depreciation the current account **worsens first** (demand is inelastic in the short run) and **improves later** as volumes adjust.", keywords: ["worsens first then improves", "inelastic in the short run"] },
    ],
  },
];

export function diagramById(id: string): DiagramTemplate | undefined {
  return DIAGRAMS.find((d) => d.id === id);
}

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
  def: string;
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
      { term: "Equilibrium", def: "The price at which quantity demanded equals quantity supplied." },
      { term: "Excess demand", def: "A shortage: quantity demanded exceeds quantity supplied at the current price." },
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
      { term: "Price ceiling", def: "A government-imposed maximum price, set below equilibrium to help consumers." },
      { term: "Shortage", def: "Quantity demanded exceeds quantity supplied at the ruling price." },
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
      { term: "Externality", def: "A cost or benefit imposed on a third party not involved in the transaction." },
      { term: "Welfare loss", def: "The loss of social surplus when output differs from the social optimum." },
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
      { term: "PED", def: "The responsiveness of quantity demanded to a change in the good's price." },
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
      { term: "Multiplier", def: "The ratio of the final change in national income to the initial change in spending." },
      { term: "Output gap", def: "The difference between actual and potential (full-capacity) output." },
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
  },
];

export function diagramById(id: string): DiagramTemplate | undefined {
  return DIAGRAMS.find((d) => d.id === id);
}

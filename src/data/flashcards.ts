import type { CardSubject, Flashcard } from "@/lib/types";
import { newCard } from "@/lib/srs";

interface Seed {
  subject: CardSubject;
  deck: string;
  front: string;
  back: string;
}

// High-yield starter cards. The user can add their own on top.
const SEEDS: Seed[] = [
  // ---------------- Physics 9702 ----------------
  { subject: "9702", deck: "Formulas", front: "Wave speed", back: "$v = f\\lambda$ — speed = frequency × wavelength" },
  { subject: "9702", deck: "Formulas", front: "Newton's 2nd law (general form)", back: "$F = \\dfrac{\\Delta p}{\\Delta t}$ — resultant force = rate of change of momentum" },
  { subject: "9702", deck: "Formulas", front: "Kinetic energy", back: "$E_k = \\tfrac12 mv^2$" },
  { subject: "9702", deck: "Formulas", front: "The three SUVAT (constant a)", back: "$v = u + at$,  $s = ut + \\tfrac12 at^2$,  $v^2 = u^2 + 2as$" },
  { subject: "9702", deck: "Formulas", front: "Ohm's law & electrical power", back: "$V = IR$;  $P = VI = I^2R = \\dfrac{V^2}{R}$" },
  { subject: "9702", deck: "Formulas", front: "Centripetal acceleration", back: "$a = \\dfrac{v^2}{r} = \\omega^2 r$, directed to the centre" },
  { subject: "9702", deck: "Formulas", front: "Photon energy", back: "$E = hf = \\dfrac{hc}{\\lambda}$" },
  { subject: "9702", deck: "Formulas", front: "Capacitor energy stored", back: "$W = \\tfrac12 QV = \\tfrac12 CV^2$" },
  { subject: "9702", deck: "Definitions", front: "Define **displacement**", back: "Distance moved in a stated direction — a vector (distance is the scalar path length)." },
  { subject: "9702", deck: "Definitions", front: "State **Newton's 1st law**", back: "An object stays at rest or at constant velocity unless acted on by a resultant force." },
  { subject: "9702", deck: "Definitions", front: "Define the **moment** of a force", back: "Force × perpendicular distance from the pivot to the line of action of the force." },
  { subject: "9702", deck: "Definitions", front: "Transverse vs longitudinal wave", back: "Transverse: oscillations perpendicular to energy travel. Longitudinal: parallel to it." },
  { subject: "9702", deck: "Definitions", front: "Condition for **SHM**", back: "$a = -\\omega^2 x$: acceleration ∝ displacement, directed back to equilibrium." },
  { subject: "9702", deck: "Definitions", front: "Photoelectric threshold frequency", back: "Below it, no electrons are emitted however intense the light — evidence for photons." },
  { subject: "9702", deck: "Definitions", front: "Define **specific latent heat**", back: "Energy to change the state of 1 kg of a substance at constant temperature." },

  // ---------------- Economics 9708 ----------------
  { subject: "9708", deck: "Definitions", front: "Define **opportunity cost**", back: "The value of the next best alternative forgone when a choice is made." },
  { subject: "9708", deck: "Definitions", front: "Define **PED** and its formula", back: "Price elasticity of demand = responsiveness of Qd to price. $\\text{PED} = \\dfrac{\\%\\Delta Q_d}{\\%\\Delta P}$" },
  { subject: "9708", deck: "Definitions", front: "Elastic vs inelastic demand", back: "|PED| > 1 = elastic (very responsive); |PED| < 1 = inelastic (unresponsive)." },
  { subject: "9708", deck: "Definitions", front: "Define a **negative externality**", back: "A cost imposed on a third party not involved in the transaction (MSB < MPB or MSC > MPC)." },
  { subject: "9708", deck: "Definitions", front: "What is **market failure**?", back: "When the free market fails to allocate resources at the socially optimal level." },
  { subject: "9708", deck: "Definitions", front: "Define **price ceiling** vs **price floor**", back: "Ceiling = legal max (below eq → shortage). Floor = legal min (above eq → surplus)." },
  { subject: "9708", deck: "Definitions", front: "Components of **Aggregate Demand**", back: "AD = C + I + G + (X − M)." },
  { subject: "9708", deck: "Definitions", front: "The **multiplier** effect", back: "An injection raises national income by a larger final amount as spending circulates." },
  { subject: "9708", deck: "Definitions", front: "Define **inflation**", back: "A sustained rise in the general price level, reducing the purchasing power of money." },
  { subject: "9708", deck: "Definitions", front: "Demand-pull vs cost-push inflation", back: "Demand-pull: excess AD. Cost-push: rising costs of production (e.g. wages, imports)." },
  { subject: "9708", deck: "Definitions", front: "What does the **PPF** show?", back: "Max output combinations of two goods with full, efficient use of resources." },
  { subject: "9708", deck: "Definitions", front: "Why does a monopoly's **MR < AR**?", back: "It must lower price on all units to sell more, so marginal revenue falls faster than price." },
  { subject: "9708", deck: "Definitions", front: "Effect of a **weaker currency** (SPICED)", back: "Strong Pound → Imports Cheaper, Exports Dearer. So a weaker £ = exports cheaper, imports dearer." },
  { subject: "9708", deck: "Definitions", front: "Define **normal good** vs **inferior good**", back: "Normal: demand rises with income. Inferior: demand falls as income rises." },

  // ---------------- Computer Science 9618 ----------------
  { subject: "9618", deck: "Definitions", front: "Denary 210 in binary", back: "`11010010` (128 + 64 + 16 + 2)" },
  { subject: "9618", deck: "Definitions", front: "How does **two's complement** store negatives?", back: "The most significant bit has a negative place value (−128 in 8 bits)." },
  { subject: "9618", deck: "Definitions", front: "**Stack** vs **queue**", back: "Stack = LIFO (last in, first out). Queue = FIFO (first in, first out)." },
  { subject: "9618", deck: "Definitions", front: "Time complexity of **binary search**", back: "$O(\\log n)$ — halves the search range each step. Needs a **sorted** list." },
  { subject: "9618", deck: "Definitions", front: "Time complexity of **linear search** & **bubble sort**", back: "Linear search $O(n)$; bubble sort $O(n^2)$." },
  { subject: "9618", deck: "Definitions", front: "The **fetch–decode–execute** cycle", back: "PC→MAR; memory[MAR]→MDR; MDR→CIR; PC←PC+1; decode; execute." },
  { subject: "9618", deck: "Definitions", front: "Von Neumann architecture", back: "Program instructions and data are stored in the **same** memory." },
  { subject: "9618", deck: "Definitions", front: "**Compiler** vs **interpreter**", back: "Compiler translates the whole program once; interpreter translates & runs line by line." },
  { subject: "9618", deck: "Definitions", front: "**Symmetric** vs **asymmetric** encryption", back: "Symmetric: one shared secret key. Asymmetric: a public/private key pair." },
  { subject: "9618", deck: "Definitions", front: "Primary key vs foreign key", back: "Primary key uniquely identifies a row; foreign key links to another table's primary key." },
  { subject: "9618", deck: "Definitions", front: "Cambridge pseudocode: assignment & arrays", back: "Assignment uses `←`; arrays are **1-based**; keywords are in CAPITALS." },
  { subject: "9618", deck: "Definitions", front: "Even parity check", back: "A parity bit makes the total number of 1s even; an odd count on arrival flags an error." },
  { subject: "9618", deck: "Definitions", front: "What is **encapsulation** in OOP?", back: "Keep attributes PRIVATE and expose PUBLIC methods to control access to the data." },
  { subject: "9618", deck: "Definitions", front: "Decomposition vs abstraction", back: "Decomposition: break a problem into sub-problems. Abstraction: remove irrelevant detail." },
  { subject: "9618", deck: "Definitions", front: "Packet switching", back: "Data is split into packets (with headers) routed independently and reassembled in order." },
];

export function seedCards(): Flashcard[] {
  return SEEDS.map((s, i) =>
    newCard({
      id: `seed-card-${String(i + 1).padStart(3, "0")}`,
      subject: s.subject,
      deck: s.deck,
      front: s.front,
      back: s.back,
      source: "seed",
    }),
  );
}

export interface Topic {
  id: string;
  name: string;
  order: number;
}

// Physics 9702 — the full topic list, the index for the visual concept pages.
export const PHYSICS_TOPICS: Topic[] = [
  { id: "phy-kinematics", name: "Kinematics", order: 1 },
  { id: "phy-dynamics", name: "Dynamics", order: 2 },
  { id: "phy-forces-moments", name: "Forces & Moments", order: 3 },
  { id: "phy-work-energy-power", name: "Work, Energy & Power", order: 4 },
  { id: "phy-deformation", name: "Deformation of Solids", order: 5 },
  { id: "phy-waves", name: "Waves", order: 6 },
  { id: "phy-superposition", name: "Superposition", order: 7 },
  { id: "phy-electricity", name: "Electricity", order: 8 },
  { id: "phy-dc-circuits", name: "D.C. Circuits", order: 9 },
  { id: "phy-particle", name: "Particle Physics", order: 10 },
  { id: "phy-circular-motion", name: "Motion in a Circle", order: 11 },
  { id: "phy-gravitation", name: "Gravitational Fields", order: 12 },
  { id: "phy-oscillations", name: "Oscillations", order: 13 },
  { id: "phy-thermal", name: "Thermal Physics", order: 14 },
  { id: "phy-ideal-gases", name: "Ideal Gases", order: 15 },
  { id: "phy-electric-fields", name: "Electric Fields", order: 16 },
  { id: "phy-capacitance", name: "Capacitance", order: 17 },
  { id: "phy-magnetic-fields", name: "Magnetic Fields", order: 18 },
  { id: "phy-alternating-currents", name: "Alternating Currents", order: 19 },
  { id: "phy-quantum", name: "Quantum Physics", order: 20 },
  { id: "phy-nuclear", name: "Nuclear Physics", order: 21 },
  { id: "phy-medical", name: "Medical Physics", order: 22 },
  { id: "phy-astronomy", name: "Astronomy & Cosmology", order: 23 },
];

export function topicById(id: string): Topic | undefined {
  return PHYSICS_TOPICS.find((t) => t.id === id);
}

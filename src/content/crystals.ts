export type CrystalSpot = {
  id: string;
  position: [number, number];
};

export const CRYSTAL_XP = 10;

export const CRYSTALS: CrystalSpot[] = [
  { id: "crystal-plaza-west", position: [-15, -2] },
  { id: "crystal-plaza-east", position: [16, 3] },
  { id: "crystal-north-road", position: [3, -12] },
  { id: "crystal-south-road", position: [-3, 16] },
  { id: "crystal-northwest", position: [-19, -17] },
  { id: "crystal-southeast", position: [19, 17] },
  { id: "crystal-southwest", position: [-20, 14] },
  { id: "crystal-ridge-east", position: [31, -10] },
  { id: "crystal-ridge-west", position: [-33, 6] },
  { id: "crystal-meadow-south", position: [10, 35] },
  { id: "crystal-pass-north", position: [-12, -37] },
  { id: "crystal-lakeshore", position: [24, 40] },
];

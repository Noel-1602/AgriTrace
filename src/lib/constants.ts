export const DEMO_FARMER_ID =
  process.env.NEXT_PUBLIC_DEMO_FARMER_ID ??
  "11111111-1111-1111-1111-111111111111";

export const ACTIVITY_TYPES = [
  "Sowing",
  "Fertilizer Application",
  "Pesticide Application",
  "Irrigation",
  "Weeding",
  "Pest Management",
  "Harvest",
  "Packaging",
  "Transportation",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const BATCH_UNITS = ["kg", "tonnes", "litres", "pieces", "boxes"] as const;

export const CROP_MASTER = [
  { name: "Tomato", category: "Vegetable", unit: "kg" },
  { name: "Banana", category: "Fruit", unit: "kg" },
  { name: "Rice", category: "Cereal", unit: "kg" },
  { name: "Pepper", category: "Spice", unit: "kg" },
  { name: "Coconut", category: "Plantation", unit: "pieces" },
  { name: "Brinjal", category: "Vegetable", unit: "kg" },
  { name: "Chilli", category: "Spice", unit: "kg" },
  { name: "Cucumber", category: "Vegetable", unit: "kg" },
  { name: "Ginger", category: "Spice", unit: "kg" },
  { name: "Turmeric", category: "Spice", unit: "kg" },
  { name: "Tapioca", category: "Root", unit: "kg" },
] as const;

export const BATCH_STATUSES = ["Growing", "Harvested", "Sold", "Archived"] as const;

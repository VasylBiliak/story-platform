export type PlanType = "FREE" | "CREATOR" | "AUTHOR";

export interface Plan {
  id: PlanType;
  name: string;
  price: string;
  priceInCents: number;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "$0/month",
    priceInCents: 0,
    features: [
      "Create local drafts",
      "Private writing workflow",
      "No publishing",
    ],
  },
  {
    id: "CREATOR",
    name: "Creator",
    price: "$30/month",
    priceInCents: 3000,
    features: [
      "Publish books",
      "Public author profile",
      "Platform sales support",
      "45% platform sales fee",
    ],
  },
  {
    id: "AUTHOR",
    name: "Author",
    price: "$50/month",
    priceInCents: 5000,
    features: [
      "Publish books",
      "Author badge",
      "Priority creator status",
      "30% platform sales fee",
    ],
  },
];

export const getPlanById = (id: PlanType): Plan | undefined => {
  return PLANS.find((plan) => plan.id === id);
};

export const formatPlanName = (plan: PlanType): string => {
  const planData = getPlanById(plan);
  return planData?.name || plan;
};

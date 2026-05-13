export type PlanFeatures = Record<string, boolean | number | null>;
export type Plan = {
  id: string;
  name: string;
  tier: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeatures;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

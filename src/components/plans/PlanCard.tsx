import React from "react";
import { Button } from "@/components/ui";
import { Plan, PlanType } from "@/lib/constants/plans";
import { PlanFeatureList } from "./PlanFeatureList";
import { CurrentPlanBadge } from "./CurrentPlanBadge";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelectPlan?: (planId: PlanType) => void;
}

export function PlanCard({ plan, isCurrentPlan, onSelectPlan }: PlanCardProps) {
  const isPremium = plan.id === "AUTHOR";

  return (
    <div
      className={`
        relative bg-bg-secondary border rounded-xl p-6 transition-all duration-300
        ${isCurrentPlan 
          ? 'border-accent-tertiary shadow-lg shadow-accent-tertiary/20' 
          : 'border-border hover:border-accent-primary'
        }
        ${isPremium && !isCurrentPlan ? 'hover:border-accent-tertiary hover:shadow-lg hover:shadow-accent-tertiary/10' : ''}
      `}
      role="article"
      aria-label={`${plan.name} plan`}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 left-6">
          <CurrentPlanBadge />
        </div>
      )}

      <div className="pt-2">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {plan.name}
        </h3>
        
        <p className="text-2xl font-semibold text-text-primary mb-6">
          {plan.price}
        </p>

        <PlanFeatureList features={plan.features} />

        <div className="mt-6">
          <Button
            variant={isCurrentPlan ? "secondary" : isPremium ? "primary" : "outline"}
            size="lg"
            className="w-full"
            disabled={isCurrentPlan}
            onClick={() => onSelectPlan?.(plan.id)}
            aria-label={isCurrentPlan ? "Current plan selected" : `Select ${plan.name} plan`}
          >
            {isCurrentPlan ? "Current Plan" : "Select Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

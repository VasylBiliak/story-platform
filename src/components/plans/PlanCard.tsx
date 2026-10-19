import React from "react";
import { Button } from "@/components/ui";
import { Plan, PlanType } from "@/lib/constants/plans";
import { PlanFeatureList } from "./PlanFeatureList";
import { CurrentPlanBadge } from "./CurrentPlanBadge";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isMostPopular?: boolean;
  onSelectPlan?: (planId: PlanType) => void;
  isLoading?: boolean;
}

export function PlanCard({ plan, isCurrentPlan, isMostPopular, onSelectPlan, isLoading }: PlanCardProps) {
  const isPremium = plan.id === "AUTHOR";

  return (
    <div
      className={`
        relative bg-bg-secondary border rounded-2xl p-8 transition-all duration-300
        ${isCurrentPlan 
          ? 'border-accent-tertiary shadow-xl shadow-accent-tertiary/30 scale-[1.02]' 
          : 'border-border hover:border-accent-primary hover:shadow-xl hover:shadow-accent-primary/10 hover:-translate-y-1'
        }
        ${isPremium && !isCurrentPlan ? 'hover:border-accent-tertiary hover:shadow-xl hover:shadow-accent-tertiary/20' : ''}
      `}
      role="article"
      aria-label={`${plan.name} plan`}
    >
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-tertiary to-accent-tertiary/80 shadow-lg shadow-accent-tertiary/30">
            <span className="text-bg-primary text-xs font-bold uppercase tracking-wider">
              Most Popular
            </span>
          </div>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-6">
          <CurrentPlanBadge />
        </div>
      )}

      <div className={`${isMostPopular ? 'pt-4' : 'pt-2'}`}>
        <h3 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">
          {plan.name}
        </h3>
        
        <div className="mb-8">
          <p className="text-4xl font-bold text-text-primary tracking-tight">
            {plan.price}
          </p>
        </div>

        <div className="mb-8">
          <PlanFeatureList features={plan.features} />
        </div>

        <div>
          <Button
            variant={isCurrentPlan ? "secondary" : isPremium ? "primary" : "outline"}
            size="lg"
            className="w-full font-semibold"
            disabled={isCurrentPlan || isLoading}
            onClick={() => onSelectPlan?.(plan.id)}
            aria-label={isCurrentPlan ? "Current plan selected" : `Purchase ${plan.name} plan`}
          >
            {isLoading ? "Processing..." : isCurrentPlan ? "Current Plan" : "Purchase"}
          </Button>
        </div>
      </div>
    </div>
  );
}

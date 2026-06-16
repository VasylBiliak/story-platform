"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui";
import { PLANS, PlanType } from "@/lib/constants/plans";
import { PlanCard } from "@/components/plans";

export default function PlansPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleSelectPlan = (planId: PlanType) => {
    // TODO: Integrate with payment system
    console.log("Selected plan:", planId);
    // For now, just log the selection
    // Future: redirect to payment flow or call API to upgrade
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const currentPlan = user?.plan || "FREE";

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/profile")}
            className="mb-4"
            aria-label="Back to profile"
          >
            ← Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Subscription Plans
          </h1>
          <p className="text-text-secondary">
            Choose the plan that best fits your writing journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlan}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

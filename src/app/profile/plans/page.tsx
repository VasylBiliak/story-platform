"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui";
import { PLANS, PlanType } from "@/lib/constants/plans";
import { PlanCard } from "@/components/plans";

export default function PlansPage() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPurchasing, setIsPurchasing] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  // Handle payment status from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      // Refresh user data to get updated plan
      refreshUser();
      // Remove query parameter to prevent re-execution
      router.replace("/profile/plans");
    } else if (paymentStatus === "cancelled") {
      setError("Payment was cancelled");
    }
  }, [searchParams, refreshUser, router]);

  const handleSelectPlan = async (planId: PlanType) => {
    if (planId === "FREE") return;

    setIsPurchasing(planId);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/stripe/create-plan-checkout-session", {
        method: "POST",
        body: JSON.stringify({ planId }),
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process purchase");
      setIsPurchasing(null);
    }
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

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error-bg border border-error text-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlan}
              isMostPopular={plan.id === "AUTHOR"}
              onSelectPlan={handleSelectPlan}
              isLoading={isPurchasing === plan.id}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

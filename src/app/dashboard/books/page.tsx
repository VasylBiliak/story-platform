"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BooksDashboard } from "./BooksDashboard";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardBooksPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Manage Books</h1>
      <p className="text-text-secondary mb-8">
        Create books and chapters, view your library.
      </p>
      <BooksDashboard />
    </div>
  );
}

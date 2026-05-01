import { Metadata } from "next";
import { BooksDashboard } from "./BooksDashboard";

export const metadata: Metadata = {
  title: "Manage Books | Story Platform",
  description: "Create and manage your books and chapters.",
};

export default function DashboardBooksPage() {
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

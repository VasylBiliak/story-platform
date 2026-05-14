"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, Input, ConfirmModal } from "@/components/ui";
import { Book } from "@/lib/types";
import { BooksSection } from "@/components/books/BooksSection";
import { useUserBooksPagination } from "@/lib/hooks/useUserBooksPagination";
import { useBooksPagination } from "@/lib/hooks/useBooksPagination";

type ExtendedBook = Book & { isLocal?: boolean };

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // My Books pagination (user's own books + local books)
  const {
    allBooks: myBooks,
    isLoading: isMyBooksLoading,
    isLoadingMore: isMyBooksLoadingMore,
    hasMore: hasMoreMyBooks,
    loadMore: loadMoreMyBooks,
  } = useUserBooksPagination({ userId: user?.id || "", initialLimit: 8 });

  // All Books pagination (public books)
  const {
    books: allPublicBooks,
    isLoading: isAllBooksLoading,
    isLoadingMore: isAllBooksLoadingMore,
    hasMore: hasMoreAllBooks,
    loadMore: loadMoreAllBooks,
  } = useBooksPagination({ initialLimit: 8, mergeWithLocal: false });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    console.log({
      type: "CHANGE_PASSWORD",
      currentPassword,
      newPassword,
    });

    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.push("/");
  };

  const mappedMyBooks: ExtendedBook[] = myBooks.map((b) => ({
    ...b,
    isLocal: (b as ExtendedBook).isLocal || false,
  }));

  const mappedAllBooks: ExtendedBook[] = allPublicBooks.map((b) => ({
    ...b,
    isLocal: false,
  }));

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="flex items-center justify-center text-3xl font-bold text-text-primary mb-8">
          Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info Section */}
            <div className="bg-bg-secondary border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Account Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-text-tertiary">Name</label>
                  <p className="text-text-primary font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm text-text-tertiary">Email</label>
                  <p className="text-text-primary font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-bg-secondary border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Change Password
              </h2>

              {passwordError && (
                <div className="p-3 rounded bg-error-bg text-error text-sm mb-4">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  Update Password
                </Button>
              </form>
            </div>

            {/* Logout Section */}
            <div className="bg-bg-secondary border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Session
              </h2>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowLogoutModal(true)}
                className="w-full"
              >
                Log out
              </Button>
            </div>
          </div>

          {/* Right Column - Books */}
          <div className="lg:col-span-2 space-y-12">
            {/* My Books Section */}
            <BooksSection
              books={mappedMyBooks}
              isLoading={isMyBooksLoading}
              isLoadingMore={isMyBooksLoadingMore}
              hasMore={hasMoreMyBooks}
              loadMore={loadMoreMyBooks}
              emptyMessage="You have no books yet"
              emptyAction={{
                label: "Browse Library",
                onClick: () => router.push("/library"),
              }}
            />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Log out"
        description="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmButtonText="Log out"
      />
    </main>
  );
}

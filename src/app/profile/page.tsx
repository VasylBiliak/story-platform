"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, Input, ConfirmModal } from "@/components/ui";
import { Book } from "@/lib/types";
import { BooksSection } from "@/components/books/BooksSection";
import { useUserBooksPagination } from "@/lib/hooks/useUserBooksPagination";
import { useBooksPagination } from "@/lib/hooks/useBooksPagination";
import { AUTH_LIMITS } from "@/lib/constants/auth";
import { DeleteAccountVerifyModal } from "@/components/modals/DeleteAccountVerifyModal";
import { DeleteAccountConfirmModal } from "@/components/modals/DeleteAccountConfirmModal";

type ExtendedBook = Book & { isLocal?: boolean };

export default function ProfilePage() {
  const { user, logout, isLoading, updatePseudonym, deleteAccount } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Account deletion state
  const [showDeleteVerifyModal, setShowDeleteVerifyModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteCredentials, setDeleteCredentials] = useState({ email: "", password: "" });

  // Pseudonym edit form state
  const [isEditingPseudonym, setIsEditingPseudonym] = useState(false);
  const [pseudonym, setPseudonym] = useState(user?.name || "");
  const [pseudonymError, setPseudonymError] = useState("");
  const [pseudonymSuccess, setPseudonymSuccess] = useState("");

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

  // Update pseudonym state when user changes
  useEffect(() => {
    if (user?.name) {
      setPseudonym(user.name);
    }
  }, [user?.name]);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePseudonymUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPseudonymError("");
    setPseudonymSuccess("");

    const sanitizedPseudonym = pseudonym.trim();

    if (!sanitizedPseudonym) {
      setPseudonymError("Pseudonym is required");
      return;
    }

    if (sanitizedPseudonym.length > AUTH_LIMITS.PSEUDONYM_MAX_LENGTH) {
      setPseudonymError(`Pseudonym cannot exceed ${AUTH_LIMITS.PSEUDONYM_MAX_LENGTH} characters`);
      return;
    }

    try {
      await updatePseudonym(sanitizedPseudonym);
      setPseudonymSuccess("Pseudonym updated successfully");
      setIsEditingPseudonym(false);
    } catch (err) {
      setPseudonymError(err instanceof Error ? err.message : "Failed to update pseudonym");
    }
  };

  const handleCancelPseudonymEdit = () => {
    setIsEditingPseudonym(false);
    setPseudonym(user?.name || "");
    setPseudonymError("");
    setPseudonymSuccess("");
  };

  // Account deletion handlers
  const handleDeleteAccountClick = () => {
    setShowDeleteVerifyModal(true);
  };

  const handleVerifyCredentials = async (email: string, password: string) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("/api/user/delete/verify", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Verification failed");
    }

    // Verification successful, store credentials and show confirmation modal
    setDeleteCredentials({ email, password });
    setShowDeleteVerifyModal(false);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAccount(deleteCredentials.email, deleteCredentials.password);
      setShowDeleteConfirmModal(false);
      router.push("/");
    } catch (err) {
      // Error is handled in the modal
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteVerifyModal(false);
    setShowDeleteConfirmModal(false);
    setDeleteCredentials({ email: "", password: "" });
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
                  <label className="text-sm text-text-tertiary">Email</label>
                  <p className="text-text-primary font-medium">{user.email}</p>
                </div>
                
                {/* Pseudonym Section */}
                <div>
                  <label className="text-sm text-text-tertiary">Pseudonym</label>
                  {isEditingPseudonym ? (
                    <form onSubmit={handlePseudonymUpdate} className="mt-2 space-y-3">
                      {pseudonymError && (
                        <div className="p-3 rounded bg-error-bg text-error text-sm">
                          {pseudonymError}
                        </div>
                      )}
                      {pseudonymSuccess && (
                        <div className="p-3 rounded bg-success-bg text-success text-sm">
                          {pseudonymSuccess}
                        </div>
                      )}
                      <Input
                        type="text"
                        value={pseudonym}
                        onChange={(e) => {
                          if (e.target.value.length <= AUTH_LIMITS.PSEUDONYM_MAX_LENGTH) {
                            setPseudonym(e.target.value);
                          }
                        }}
                        placeholder="Enter new pseudonym"
                        maxLength={AUTH_LIMITS.PSEUDONYM_MAX_LENGTH}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelPseudonymEdit}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-text-primary font-medium">{user.name || 'Not set'}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingPseudonym(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
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
           {/* Danger Zone Section */}
            <div className="bg-bg-secondary border border-error/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-error mb-4">
                Delete Account
              </h2>
              <p className="text-text-secondary text-sm mb-4">
                Irreversible and destructive actions
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDeleteAccountClick}
                className="w-full border-error text-error hover:bg-error/10"
              >
                Delete
              </Button>
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

      {/* Account Deletion Verification Modal */}
      <DeleteAccountVerifyModal
        isOpen={showDeleteVerifyModal}
        userEmail={""}
        onVerify={handleVerifyCredentials}
        onCancel={handleCancelDelete}
      />

      {/* Account Deletion Confirmation Modal */}
      <DeleteAccountConfirmModal
        isOpen={showDeleteConfirmModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </main>
  );
}

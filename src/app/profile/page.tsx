"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal/ConfirmModal";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Profile</h1>

        {/* User Info Section */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6 mb-6">
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
        <div className="bg-bg-secondary border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Change Password
          </h2>

          {passwordError && (
            <div className="p-3 rounded bg-error-bg text-error text-sm mb-4">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="w-full py-3 px-4 bg-accent-primary text-bg-primary font-semibold rounded-lg hover:bg-accent-primary-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Logout Section */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Session
          </h2>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3 px-4 border border-accent-primary text-accent-primary font-semibold rounded-lg hover:bg-accent-primary hover:text-bg-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            Log out
          </button>
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

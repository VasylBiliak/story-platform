"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, Input, ConfirmModal } from "@/components/ui";

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

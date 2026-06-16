"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";

interface Props {
  isOpen: boolean;
  userEmail: string;
  onVerify: (email: string, password: string) => Promise<void>;
  onCancel: () => void;
}

export function DeleteAccountVerifyModal({ isOpen, userEmail, onVerify, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setIsVerifying(true);
    try {
      await onVerify(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-bg-primary border border-border rounded-xl shadow-xl p-6 m-4 max-w-md w-full">
        <h2 className="text-xl font-bold text-text-primary mb-2">Confirm Account Ownership</h2>
        <p className="text-text-secondary mb-6">Please enter your credentials to verify your identity.</p>

        {error && (
          <div className="p-3 rounded bg-error-bg text-error text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

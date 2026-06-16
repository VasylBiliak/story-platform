"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface Props {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteAccountConfirmModal({ isOpen, onConfirm, onCancel }: Props) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setIsDeleting(false);
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
        <h2 className="text-xl font-bold text-text-primary mb-2">Permanent Account Deletion</h2>
        
        <div className="space-y-4 mb-6">
          <p className="text-text-secondary">
            This action cannot be undone.
          </p>
          
          <p className="text-text-secondary">
            All of your data will be permanently deleted, including:
          </p>

          <ul className="text-text-secondary space-y-1 pl-4 list-disc">
            <li>Account information</li>
            <li>Books</li>
            <li>Chapters</li>
            <li>Purchases</li>
            <li>Reading history</li>
            <li>Profile data</li>
            <li>Any other data associated with your account</li>
          </ul>

          <p className="text-text-secondary font-medium">
            This deletion is permanent and cannot be reversed.
          </p>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="confirm-checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-border bg-bg-primary text-accent-primary focus:ring-accent-primary"
          />
          <label
            htmlFor="confirm-checkbox"
            className="text-text-secondary text-sm"
          >
            I understand that this action is permanent.
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className="bg-error hover:bg-error-hover text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Account Permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}

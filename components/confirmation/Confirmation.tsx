"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionButtonName: string;
  actionFunction: () => Promise<void> | void;
  isDangerous?: boolean;
}

const Confirmation = ({
  isOpen,
  onClose,
  title,
  description,
  actionButtonName,
  actionFunction,
  isDangerous = false,
}: ConfirmationProps) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await actionFunction();
      onClose();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-100 bg-black/50">
        {/* Popup Modal */}
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg">
          {/* Header with Close Button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {isDangerous && (
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 ml-4 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Description */}
          <p className="mb-6 w-full max-w-full whitespace-pre-wrap break-all text-sm text-muted-foreground text-left">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Close
            </Button>
            <Button
              variant={isDangerous ? "destructive" : "default"}
              onClick={handleAction}
              disabled={loading}
              className="min-w-25"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                actionButtonName
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Confirmation;

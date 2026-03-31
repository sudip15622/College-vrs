"use client";

import { useState } from "react";
import { submitReview } from "@/lib/actions/review";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaStar, FaTimes } from "react-icons/fa";

interface ReviewModalProps {
  bookingId: string;
  listingId: string;
  listingName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  bookingId,
  listingId,
  listingName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Open modal instantly, validation happens on submit
  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleSubmitReview = async () => {
    // Validation
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview(
        bookingId,
        rating,
        comment.trim() || undefined,
        false, // hasPhotos - can be enhanced later
      );

      if (result.success) {
        toast.success("Review submitted successfully!");
        // Reset form
        setRating(0);
        setComment("");
        setIsOpen(false);
        // Callback to refresh parent component
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Leave a Review"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 9999 }}>
          {/* Modal Container */}
          <div className="relative bg-card rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            >
              <FaTimes className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                Leave a Review
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Share your experience with {listingName}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                  {/* Rating Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          <FaStar
                            size={32}
                            className={`transition-colors ${
                              star <= (hoverRating || rating)
                                ? "text-primary"
                                : "text-border"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </p>
                    )}
                  </div>

                  {/* Comment Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Comments (Optional)
                    </label>
                    <Textarea
                      placeholder="Share details about your rental experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={500}
                      disabled={isSubmitting}
                      className="min-h-30 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {comment.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={isSubmitting}
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      className="flex-1"
                      disabled={isSubmitting || rating === 0}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

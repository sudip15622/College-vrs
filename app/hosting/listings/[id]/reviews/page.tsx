import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getListingReviews } from "@/lib/actions/listing";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={star <= rating ? "text-primary size-3.5" : "text-muted-foreground/30 size-3.5"}
        />
      ))}
    </div>
  );
}

const VehicleReviewsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const data = await getListingReviews(id);

  if (!data) {
    notFound();
  }

  const fiveStarCount = data.reviews.filter((review) => review.rating === 5).length;
  const positiveRate =
    data.stats.reviewCount > 0
      ? Math.round(((data.reviews.filter((review) => review.rating >= 4).length / data.stats.reviewCount) * 100))
      : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Review Dashboard</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{data.listing.name}</h1>
            <p className="text-muted-foreground">Customer reviews and sentiment overview</p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 px-4 py-3">
            <span className="text-3xl font-bold leading-none">
              {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : "New"}
            </span>
            <div className="space-y-1">
              <RatingStars rating={Math.round(data.stats.averageRating)} />
              <p className="text-xs text-muted-foreground">{data.stats.reviewCount} total reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold leading-none">
                {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : "New"}
              </span>
              <span className="text-muted-foreground text-sm">/ 5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{data.stats.reviewCount}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Positive Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{positiveRate}%</span>
            <p className="text-xs text-muted-foreground mt-1">{fiveStarCount} five-star ratings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Latest Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {data.reviews.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">No reviews yet for this vehicle.</p>
            </div>
          ) : (
            <div className="space-y-5 py-5">
              {data.reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex gap-4 rounded-xl border border-border p-4">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border">
                      <Image
                        src={review.user.image || "/default_user.png"}
                        alt={review.user.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{review.user.name}</p>
                          <p className="text-xs text-muted-foreground">{review.user.email}</p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <RatingStars rating={review.rating} />
                            <span className="font-semibold text-sm">{review.rating}.0</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {review.comment ? (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No comment provided.</p>
                      )}
                    </div>
                  </div>

                  {index < data.reviews.length - 1 && <div className="mt-5 border-t border-border" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleReviewsPage;

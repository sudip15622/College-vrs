import React from 'react'
import Link from 'next/link'
import { getListingById } from '@/lib/actions/listing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

const VehicleReviewsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Link href="/hosting/listings">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{listing.name}</h1>
        <p className="text-muted-foreground">Customer reviews and ratings</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <Link href={`/hosting/listings/${id}`}>
          <Button variant="ghost" className="rounded-none">
            Details
          </Button>
        </Link>
        <Link href={`/hosting/listings/${id}/bookings`}>
          <Button variant="ghost" className="rounded-none">
            Bookings ({listing.bookings.length})
          </Button>
        </Link>
        <Link href={`/hosting/listings/${id}/reviews`}>
          <Button variant="ghost" className="border-b-2 border-primary rounded-none">
            Reviews
          </Button>
        </Link>
      </div>

      {/* Reviews Section */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Reviews feature coming soon</p>
          <p className="text-sm text-muted-foreground mt-2">
            (Review model needs to be added to schema)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default VehicleReviewsPage

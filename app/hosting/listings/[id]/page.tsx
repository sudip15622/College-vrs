import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getListingById } from '@/lib/actions/listing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit } from 'lucide-react'
import { notFound } from 'next/navigation'

const VehicleDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  const imageData = listing.image as { url: string; publicId: string }
  const features = listing.features as string[] | null

  return (
    <div className="container py-8">
      <Link href="/hosting/listings">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{listing.name}</h1>
          <p className="text-muted-foreground">{listing.type}</p>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Vehicle
        </Button>
      </div>

      {/* Vehicle Image */}
      {imageData?.url && (
        <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
          <Image
            src={imageData.url}
            alt={listing.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <Link href={`/hosting/listings/${id}`}>
          <Button variant="ghost" className="border-b-2 border-primary rounded-none">
            Details
          </Button>
        </Link>
        <Link href={`/hosting/listings/${id}/bookings`}>
          <Button variant="ghost" className="rounded-none">
            Bookings ({listing.bookings.length})
          </Button>
        </Link>
        <Link href={`/hosting/listings/${id}/reviews`}>
          <Button variant="ghost" className="rounded-none">
            Reviews
          </Button>
        </Link>
      </div>

      {/* Vehicle Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle Type:</span>
              <span className="font-medium">{listing.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per Day:</span>
              <span className="font-medium">₹{listing.pricePerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fuel Type:</span>
              <span className="font-medium">{listing.fuelType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transmission:</span>
              <span className="font-medium">{listing.transmission}</span>
            </div>
            {listing.engineCapacity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engine Capacity:</span>
                <span className="font-medium">{listing.engineCapacity} CC</span>
              </div>
            )}
            {listing.mileage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mileage:</span>
                <span className="font-medium">{listing.mileage} km/l</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condition:</span>
              <span className="font-medium">{listing.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={listing.isAvailable ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {listing.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{listing.description}</p>
          </CardContent>
        </Card>

        {features && features.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default VehicleDetailPage

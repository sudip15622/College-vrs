import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getListingById } from '@/lib/actions/listing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit } from 'lucide-react'
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
    <div className="space-y-6 pb-8">
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.6fr_1fr]">
          <div className="relative min-h-80 bg-muted">
            {imageData?.url ? (
              <Image
                src={imageData.url}
                alt={listing.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{listing.type}</p>
                <h1 className="text-3xl font-semibold leading-tight">{listing.name}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  ₹{listing.pricePerDay.toLocaleString()}/day
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    listing.isAvailable
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {listing.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Fuel</p>
                  <p className="font-medium">{listing.fuelType}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Transmission</p>
                  <p className="font-medium">{listing.transmission}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Condition</p>
                  <p className="font-medium">{listing.condition}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Vehicle Type</p>
                  <p className="font-medium">{listing.type}</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link href={`/hosting/listings/${listing.id}/edit`}>
                <Button className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Vehicle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle Type</span>
              <span className="font-medium">{listing.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per Day</span>
              <span className="font-medium">₹{listing.pricePerDay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fuel Type</span>
              <span className="font-medium">{listing.fuelType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transmission</span>
              <span className="font-medium">{listing.transmission}</span>
            </div>
            {listing.engineCapacity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engine Capacity</span>
                <span className="font-medium">{listing.engineCapacity} CC</span>
              </div>
            )}
            {listing.mileage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mileage</span>
                <span className="font-medium">{listing.mileage} km/l</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condition</span>
              <span className="font-medium">{listing.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={
                  listing.isAvailable
                    ? 'font-medium text-primary'
                    : 'font-medium text-destructive'
                }
              >
                {listing.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-7 text-muted-foreground">
              {listing.description || 'No description provided for this vehicle yet.'}
            </p>
          </CardContent>
        </Card>

        {features && features.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2.5">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="rounded-full border bg-secondary px-3 py-1 text-sm text-secondary-foreground"
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

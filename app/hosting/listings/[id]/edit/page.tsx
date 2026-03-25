import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getListingById } from '@/lib/actions/listing'
import EditListingForm from '@/components/hosting/EditListingForm'

const EditVehiclePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  const imageData = listing.image as { url?: string; publicId?: string } | null
  const features = Array.isArray(listing.features) ? (listing.features as string[]) : []

  return (
    <div className="container max-w-4xl">
      <div className="mb-6">
        <Link href={`/hosting/listings/${id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicle Details
          </Button>
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Edit Vehicle</h1>
          <p className="text-muted-foreground">
            Update your vehicle listing details below.
          </p>
        </div>
      </div>

      <EditListingForm
        listingId={listing.id}
        currentImageUrl={imageData?.url || ''}
        initialValues={{
          type: listing.type,
          name: listing.name,
          description: listing.description,
          fuelType: listing.fuelType,
          transmission: listing.transmission,
          engineCapacity: listing.engineCapacity ? String(listing.engineCapacity) : '',
          mileage: listing.mileage ? String(listing.mileage) : '',
          pricePerDay: String(listing.pricePerDay),
          condition: listing.condition,
          features,
        }}
      />
    </div>
  )
}

export default EditVehiclePage

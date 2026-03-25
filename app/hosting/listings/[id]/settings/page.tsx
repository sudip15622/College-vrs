import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getListingSettingsById } from '@/lib/actions/listing'
import ListingSettingsClient from '@/components/hosting/ListingSettingsClient'

const VehicleSettingsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const listing = await getListingSettingsById(id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="container max-w-4xl">
      <div className="mb-6">
        <Link href={`/hosting/listings/${id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicle Details
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage vehicle status and listing actions</p>
      </div>

      <ListingSettingsClient
        listingId={listing.id}
        listingName={listing.name}
        isAvailable={listing.isAvailable}
        pendingBookings={listing.pendingBookings}
        activeBookings={listing.activeBookings}
        confirmedBookings={listing.confirmedBookings}
        blockingBookingsCount={listing.blockingBookingsCount}
      />
    </div>
  )
}

export default VehicleSettingsPage
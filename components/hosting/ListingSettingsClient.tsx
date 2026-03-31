'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteListingAction, toggleListingAvailabilityAction } from '@/lib/actions/listing'
import { Loader2 } from 'lucide-react'

type ListingSettingsClientProps = {
  listingId: string
  listingName: string
  isAvailable: boolean
  pendingBookings: number
  activeBookings: number
  confirmedBookings: number
  blockingBookingsCount: number
}

const ListingSettingsClient = ({
  listingId,
  listingName,
  isAvailable,
  pendingBookings,
  activeBookings,
  confirmedBookings,
  blockingBookingsCount,
}: ListingSettingsClientProps) => {
  const router = useRouter()
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleAvailability = async () => {
    try {
      setIsUpdatingAvailability(true)
      const result = await toggleListingAvailabilityAction({
        listingId,
        isAvailable: !isAvailable,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to update vehicle availability')
        return
      }

      toast.success(result.message || 'Availability updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('An unexpected error occurred while updating availability')
    } finally {
      setIsUpdatingAvailability(false)
    }
  }

  const handleDeleteVehicle = async () => {
    const confirmed = window.confirm(
      `Delete "${listingName}" permanently? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setIsDeleting(true)
      const result = await deleteListingAction({ listingId })

      if (!result.success) {
        toast.error(result.error || 'Failed to delete vehicle')
        return
      }

      toast.success(result.message || 'Vehicle deleted successfully')
      router.push('/hosting/listings')
      router.refresh()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('An unexpected error occurred while deleting the vehicle')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>
            Pause this vehicle to hide it from public booking, or resume it anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Current status</p>
              <p className="font-medium">{isAvailable ? 'Available' : 'Paused'}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isAvailable ? 'Live' : 'Paused'}
            </span>
          </div>

          <Button onClick={handleToggleAvailability} disabled={isUpdatingAvailability}>
            {isUpdatingAvailability ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : isAvailable ? (
              'Pause Vehicle'
            ) : (
              'Resume Vehicle'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Vehicle</CardTitle>
          <CardDescription>
            Permanently delete this vehicle listing if it has no pending, confirmed or active bookings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Booking checks</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Pending</p>
                <p className="font-medium">{pendingBookings}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Confirmed</p>
                <p className="font-medium">{confirmedBookings}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Active</p>
                <p className="font-medium">{activeBookings}</p>
              </div>
            </div>
          </div>

          {blockingBookingsCount > 0 ? (
            <p className="text-sm text-destructive">
              Deletion blocked: this vehicle has {blockingBookingsCount} pending, confirmed or active booking(s).
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              This vehicle can be deleted.
            </p>
          )}

          <Button
            variant="destructive"
            onClick={handleDeleteVehicle}
            disabled={isDeleting || blockingBookingsCount > 0}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Vehicle'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ListingSettingsClient
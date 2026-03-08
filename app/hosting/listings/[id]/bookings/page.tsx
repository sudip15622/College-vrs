import React from 'react'
import Link from 'next/link'
import { getListingById, getListingBookings } from '@/lib/actions/listing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

const VehicleBookingsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const [listing, bookings] = await Promise.all([
    getListingById(id),
    getListingBookings(id)
  ])

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
        <p className="text-muted-foreground">Manage bookings for this vehicle</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <Link href={`/hosting/listings/${id}`}>
          <Button variant="ghost" className="rounded-none">
            Details
          </Button>
        </Link>
        <Link href={`/hosting/listings/${id}/bookings`}>
          <Button variant="ghost" className="border-b-2 border-primary rounded-none">
            Bookings ({bookings.length})
          </Button>
        </Link>
        <Link href={`/hosting/listings/${id}/reviews`}>
          <Button variant="ghost" className="rounded-none">
            Reviews
          </Button>
        </Link>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No bookings yet for this vehicle</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{booking.user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Days</p>
                    <p className="font-medium">{booking.totalDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="font-medium">₹{booking.totalPrice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default VehicleBookingsPage

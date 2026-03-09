import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import CreateListingForm from '@/components/hosting/CreateListingForm'

const NewVehiclePage = () => {
  return (
    <div className="container max-w-4xl">
      <div className="mb-6">
        <Link href="/hosting/listings">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add New Vehicle</h1>
          <p className="text-muted-foreground">
            Create a new vehicle listing for rent. Fill in all the required details below.
          </p>
        </div>
      </div>

      <CreateListingForm />
    </div>
  )
}

export default NewVehiclePage

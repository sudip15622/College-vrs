import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

const NewVehiclePage = () => {
  return (
    <div className="container py-8 max-w-3xl">
      <Link href="/hosting/listings">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Vehicle</CardTitle>
          <CardDescription>Create a new vehicle listing for rent</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            [Vehicle creation form will go here]
          </p>
          <p className="text-sm mt-4">
            Form fields: Name, Type, Description, Price, Features, Images, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewVehiclePage

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const VehicleReviewsPage = () => {

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">Customer reviews and ratings</p>
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

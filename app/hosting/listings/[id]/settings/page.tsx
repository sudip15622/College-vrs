import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const VehicleSettingsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage vehicle status and listing actions</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Settings feature coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default VehicleSettingsPage
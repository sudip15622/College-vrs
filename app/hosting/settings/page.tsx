import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Settings } from 'lucide-react'

const SettingsPage = () => {
  return (
    <div className="container py-12">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-6">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Coming Soon</h1>
            
            <p className="text-muted-foreground mb-4">
              We're working on awesome settings features to help you manage your hosting experience.
            </p>
            
            <div className="w-full h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0 rounded-full mb-6" />
            
            <p className="text-sm text-muted-foreground">
              Check back soon for account settings, payment methods, notification preferences, and more!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage

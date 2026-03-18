import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ListingTabs from './ListingTabs'

const ListingDetailLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) => {
  const { id } = await params

  return (
    <div className="container">
      <Link href="/hosting/listings">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </Link>

      <ListingTabs id={id} />

      {children}
    </div>
  )
}

export default ListingDetailLayout
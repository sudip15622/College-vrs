'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, Edit, Eye, MoreHorizontal, Settings } from 'lucide-react'

type ListingActionsMenuProps = {
  listingId: string
}

const ListingActionsMenu = ({ listingId }: ListingActionsMenuProps) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Open menu">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/hosting/listings/${listingId}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/hosting/listings/${listingId}/bookings`} className="cursor-pointer">
            <Calendar className="mr-2 h-4 w-4" />
            View Bookings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/hosting/listings/${listingId}/edit`} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit Vehicle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/hosting/listings/${listingId}/settings`} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ListingActionsMenu
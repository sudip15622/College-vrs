'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ListingTabsProps = {
  id: string
}

const ListingTabs = ({ id }: ListingTabsProps) => {
  const pathname = usePathname()

  const tabs = [
    { label: 'Details', href: `/hosting/listings/${id}` },
    { label: 'Bookings', href: `/hosting/listings/${id}/bookings` },
    { label: 'Reviews', href: `/hosting/listings/${id}/reviews` },
    { label: 'Settings', href: `/hosting/listings/${id}/settings` },
  ]

  return (
    <div className="mb-6 flex gap-2 border-b">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href

        return (
          <Link key={tab.href} href={tab.href}>
            <Button
              variant="ghost"
              className={cn(
                'rounded-none border-0 border-b-2 border-transparent text-muted-foreground',
                isActive && 'border-primary text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Button>
          </Link>
        )
      })}
    </div>
  )
}

export default ListingTabs
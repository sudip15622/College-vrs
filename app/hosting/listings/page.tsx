import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { searchListings } from '@/lib/actions/listing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Eye, Calendar, Edit, Trash2 } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

const ListingsPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const limit = 10

  const { listings, pagination } = await searchListings({
    page: currentPage,
    limit,
    showAll: true, // Show all listings for host dashboard
  })

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Vehicles</h1>
          <p className="text-muted-foreground">Manage all your vehicle listings</p>
        </div>
        <Link href="/hosting/listings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Vehicle
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No vehicles listed yet</p>
            <Link href="/hosting/listings/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Vehicle
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-80">Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price/Day</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => {
                  const imageData = listing.image as { url: string; publicId: string }
                  return (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 border border-border rounded-md overflow-hidden shrink-0">
                            {imageData?.url ? (
                              <Image
                                src={imageData.url}
                                alt={listing.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted" />
                            )}
                          </div>
                          <span className="font-medium truncate max-w-55">
                            {listing.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{listing.type}</TableCell>
                      <TableCell className="font-medium">₹{listing.pricePerDay}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          listing.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {listing.isAvailable ? 'Available' : 'Paused'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{listing.bookings.length}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className='w-full'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/hosting/listings/${listing.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/hosting/listings/${listing.id}/bookings`} className="cursor-pointer">
                                <Calendar className="mr-2 h-4 w-4" />
                                View Bookings
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/hosting/listings/${listing.id}`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Vehicle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant='destructive' className="cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Vehicle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={currentPage > 1 ? `/hosting/listings?page=${currentPage - 1}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current page
                const showPage = 
                  page === 1 || 
                  page === pagination.totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                
                if (!showPage) {
                  // Show ellipsis for gaps
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    )
                  }
                  return null
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href={`/hosting/listings?page=${page}`}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext 
                  href={currentPage < pagination.totalPages ? `/hosting/listings?page=${currentPage + 1}` : '#'}
                  className={currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Pagination Info */}
      {listings.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} vehicles
        </p>
      )}
    </div>
  )
}

export default ListingsPage

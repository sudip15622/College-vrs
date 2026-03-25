import React from "react";
import Image from "next/image";
import { searchUsers } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import UsersActionMenu from "./UsersActionMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const UsersPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 10;

  const { users, pagination } = await searchUsers({
    page: currentPage,
    limit,
  });

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Users</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">User</TableHead>
                <TableHead className="w-[25%]">Email</TableHead>
                <TableHead className="w-[12%] text-center">Status</TableHead>
                <TableHead className="w-[12%] text-center">Role</TableHead>
                <TableHead className="w-[12%] text-center">Total Bookings</TableHead>
                <TableHead className="w-[14%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isVerified = Boolean(user.emailVerified);

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border">
                          <Image
                            src={user.image || "/default_user.png"}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="max-w-52 truncate font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="truncate">{user.email}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {isVerified ? "Verified" : "Unverified"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {user._count.bookings}
                    </TableCell>
                    <TableCell className="text-center">
                      <UsersActionMenu userId={user.id} role={user.role}/>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={
                    currentPage > 1 ? `/hosting/users?page=${currentPage - 1}` : "#"
                  }
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from(
                { length: pagination.totalPages },
                (_, index) => index + 1,
              ).map((page) => {
                const showPage =
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/hosting/users?page=${page}`}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href={
                    currentPage < pagination.totalPages
                      ? `/hosting/users?page=${currentPage + 1}`
                      : "#"
                  }
                  className={
                    currentPage >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {users.length > 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Showing {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, pagination.total)} of {pagination.total} users
        </p>
      )}
    </div>
  );
};

export default UsersPage;

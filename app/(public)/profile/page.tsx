import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/prisma";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { Skeleton } from "@/components/ui/skeleton";

async function ProfileContent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?returnTo=/profile");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      emailVerified: true,
    },
  });

  if (!user) {
    redirect("/login?returnTo=/profile");
  }

  return (
    <ProfilePageClient
      profile={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified ? true : false,
      }}
    />
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-border p-4 space-y-5">
          <Skeleton className="h-5 w-28" />
          <div className="flex justify-center">
            <Skeleton className="h-28 w-28 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <Skeleton className="h-6 w-24 mx-auto rounded-full" />
          <Skeleton className="h-12 w-full" />
        </div>

        <div className="rounded-xl border border-border p-4 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>

          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

const page = async () => {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
};

export default page;

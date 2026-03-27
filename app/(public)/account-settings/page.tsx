import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/prisma";
import AccountSettingsPageClient from "@/components/account-settings/AccountSettingsPageClient";
import { Skeleton } from "@/components/ui/skeleton";

async function AccountSettingsContent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?returnTo=/account-settings");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/login?returnTo=/account-settings");
  }

  return <AccountSettingsPageClient userName={user.name} email={user.email} />;
}

function AccountSettingsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="rounded-xl border border-border p-4 space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-xl border border-border p-4 space-y-4">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-4">
        <Skeleton className="h-6 w-36" />
        {[1, 2].map((item) => (
          <div key={item} className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </div>
  );
}

const page = async () => {
  return (
    <Suspense fallback={<AccountSettingsSkeleton />}>
      <AccountSettingsContent />
    </Suspense>
  );
};

export default page;

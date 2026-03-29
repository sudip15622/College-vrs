import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/prisma";
import VerifyEmailForm from "@/components/login/VerifyEmailForm";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?returnTo=/verify-email");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      emailVerified: true,
    },
  });

  if (!user) {
    redirect("/login?returnTo=/verify-email");
  }

  return (
    <div className="">
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-md p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
          <p className="text-muted-foreground">
            Verify your account email using OTP.
          </p>
        </div>

        <VerifyEmailForm
          name={user.name}
          email={user.email}
          isAlreadyVerified={!!user.emailVerified}
        />
      </div>
    </div>
  );
};

export default page;

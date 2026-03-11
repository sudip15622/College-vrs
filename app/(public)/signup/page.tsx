import Link from "next/link";
import React from "react";
import SignupForm from "@/components/login/SignupForm";

interface SignupPageProps {
  searchParams: Promise<{
    returnTo?: string;
  }>;
}

const page = async ({ searchParams }: SignupPageProps) => {
  const params = await searchParams;
  const loginUrl = params.returnTo ? `/login?returnTo=${encodeURIComponent(params.returnTo)}` : "/login";

  return (
    <div className="py-16">
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground">
            Join SajiloRide today and start your rental journey
          </p>
        </div>

        {/* Signup Form */}
        <SignupForm />

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-4 text-md">or</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-md text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            href={loginUrl}
            className="text-primary hover:text-primary/90 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default page;

import Link from "next/link";
import React from "react";
import LoginForm from "@/components/login/LoginForm";

const page = () => {
  return (
    <div className="py-16">
      {/* Header */}
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Login to your account and manage rentals.
          </p>
        </div>

        {/* Signup Form */}
        <LoginForm />

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-4 text-md">or</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-md text-gray-600 mt-6">
          Doesn&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/90 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default page;

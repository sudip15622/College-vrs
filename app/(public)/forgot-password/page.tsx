import Link from "next/link";
import React from "react";
import ForgotPasswordForm from "@/components/login/ForgotPasswordForm";

const page = () => {
  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-2xl border border-border shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
        <p className="text-muted-foreground">
          Recover your account in a few quick steps.
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-4 text-md">or</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <p className="text-center text-md text-gray-600 mt-6">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/90 font-medium hover:underline"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default page;

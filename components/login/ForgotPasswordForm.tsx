"use client";

import Link from "next/link";
import React from "react";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestForgotPasswordOtpAction,
  resetForgotPasswordAction,
  verifyForgotPasswordOtpAction,
} from "@/lib/actions/auth";
import {
  ForgotPasswordEmailSchema,
  ForgotPasswordEmailType,
  ForgotPasswordOtpSchema,
  ForgotPasswordOtpType,
  ForgotPasswordResetSchema,
  ForgotPasswordResetType,
} from "@/lib/schemas/forgot-password";

type ForgotStep = 1 | 2 | 3 | 4;

const LoadingSpinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [step, setStep] = React.useState<ForgotStep>(1);
  const [email, setEmail] = React.useState("");
  const [resetToken, setResetToken] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<ForgotPasswordEmailType>({
    resolver: zodResolver(ForgotPasswordEmailSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
  } = useForm<ForgotPasswordOtpType>({
    resolver: zodResolver(ForgotPasswordOtpSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      otp: "",
    },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm<ForgotPasswordResetType>({
    resolver: zodResolver(ForgotPasswordResetSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitEmail: SubmitHandler<ForgotPasswordEmailType> = async (data) => {
    const response = await requestForgotPasswordOtpAction(data);

    if (!response.success) {
      toast.error(response.error || "Failed to send OTP");
      return;
    }

    setEmail(data.email.toLowerCase().trim());
    toast.success(response.message || "OTP sent successfully");
    setStep(2);
  };

  const onSubmitOtp: SubmitHandler<ForgotPasswordOtpType> = async (data) => {
    const response = await verifyForgotPasswordOtpAction({
      email,
      otp: data.otp,
    });

    if (!response.success || !response.resetToken) {
      toast.error(response.error || "Failed to verify OTP");
      return;
    }

    setResetToken(response.resetToken);
    toast.success(response.message || "OTP verified successfully");
    setStep(3);
  };

  const onSubmitReset: SubmitHandler<ForgotPasswordResetType> = async (data) => {
    const response = await resetForgotPasswordAction({
      email,
      resetToken,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    if (!response.success) {
      toast.error(response.error || "Failed to reset password");
      return;
    }

    toast.success(response.message || "Password reset successful");
    setStep(4);

    if (response.loggedIn) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex-1">
            <div
              className={[
                "h-2 w-full rounded-full transition-colors",
                item <= step ? "bg-primary" : "bg-muted",
              ].join(" ")}
            />
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleEmailSubmit(onSubmitEmail)} className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Enter your email</h2>
            <p className="text-sm text-muted-foreground mt-1">
              We will send a one-time code to your email.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Controller
              name="email"
              control={emailControl}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  aria-invalid={!!emailErrors.email}
                  className={emailErrors.email ? "border-destructive" : ""}
                />
              )}
            />
            {emailErrors.email && (
              <p className="text-sm text-destructive">{emailErrors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isEmailSubmitting}>
            {isEmailSubmitting ? (
              <>
                <LoadingSpinner />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit(onSubmitOtp)} className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Verify OTP</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="otp" className="text-sm font-medium text-foreground">
              OTP Code
            </label>
            <Controller
              name="otp"
              control={otpControl}
              render={({ field }) => (
                <Input
                  {...field}
                  id="otp"
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  maxLength={6}
                  aria-invalid={!!otpErrors.otp}
                  className={otpErrors.otp ? "border-destructive" : ""}
                />
              )}
            />
            {otpErrors.otp && (
              <p className="text-sm text-destructive">{otpErrors.otp.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
              disabled={isOtpSubmitting}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isOtpSubmitting}>
              {isOtpSubmitting ? (
                <>
                  <LoadingSpinner />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>

          <button
            type="button"
            onClick={handleEmailSubmit(onSubmitEmail)}
            disabled={isEmailSubmitting}
            className="text-sm text-primary hover:underline w-fit"
          >
            {isEmailSubmitting ? "Resending..." : "Resend OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetSubmit(onSubmitReset)} className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Set new password</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a strong password for your account.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="new-password" className="text-sm font-medium text-foreground">
              New Password
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {showNewPassword ? <BiSolidHide /> : <BiSolidShow />}
              </button>
              <Controller
                name="newPassword"
                control={resetControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    aria-invalid={!!resetErrors.newPassword}
                    className={resetErrors.newPassword ? "border-destructive pr-8" : "pr-8"}
                  />
                )}
              />
            </div>
            {resetErrors.newPassword && (
              <p className="text-sm text-destructive">{resetErrors.newPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirm-password"
              className="text-sm font-medium text-foreground"
            >
              Confirm Password
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <BiSolidHide /> : <BiSolidShow />}
              </button>
              <Controller
                name="confirmPassword"
                control={resetControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    aria-invalid={!!resetErrors.confirmPassword}
                    className={resetErrors.confirmPassword ? "border-destructive pr-8" : "pr-8"}
                  />
                )}
              />
            </div>
            {resetErrors.confirmPassword && (
              <p className="text-sm text-destructive">{resetErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1"
              disabled={isResetSubmitting}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isResetSubmitting}>
              {isResetSubmitting ? (
                <>
                  <LoadingSpinner />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-5">
          <h2 className="text-lg font-semibold text-green-800">Password reset successful</h2>
          <p className="text-sm text-green-700">
            Your password has been reset. In the next step we will auto-login after reset.
          </p>
          <Button asChild size="lg">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      )}

    </div>
  );
};

export default ForgotPasswordForm;

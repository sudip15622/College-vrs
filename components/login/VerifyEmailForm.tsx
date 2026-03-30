"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  VerifyEmailOtpSchema,
  VerifyEmailOtpType,
} from "@/lib/schemas/verify-email";
import {
  requestEmailVerificationOtpAction,
  verifyEmailOtpAction,
} from "@/lib/actions/auth";

interface VerifyEmailFormProps {
  name: string;
  email: string;
  isAlreadyVerified: boolean;
}

type VerifyStep = 1 | 2;

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

const VerifyEmailForm = ({
  name,
  email,
  isAlreadyVerified,
}: VerifyEmailFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = React.useState<VerifyStep>(1);
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(isAlreadyVerified);

  const returnToParam = searchParams.get("returnTo");
  const returnTo =
    returnToParam && returnToParam.startsWith("/") ? returnToParam : "/";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailOtpType>({
    resolver: zodResolver(VerifyEmailOtpSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      otp: "",
    },
  });

  const handleSendOtp = async () => {
    if (isVerified) return;

    setIsSendingOtp(true);

    const response = await requestEmailVerificationOtpAction();

    if (!response.success) {
      toast.error(response.error || "Failed to send verification OTP");
      setIsSendingOtp(false);
      return;
    }

    toast.success(response.message || "Verification OTP sent");
    setStep(2);
    setIsSendingOtp(false);
  };

  const onSubmit: SubmitHandler<VerifyEmailOtpType> = async (data) => {
    if (isVerified) return;

    const response = await verifyEmailOtpAction(data);

    if (!response.success) {
      toast.error(response.error || "Failed to verify OTP");
      return;
    }

    toast.success(response.message || "Email verified successfully");
    setIsVerified(true);
    router.replace(returnTo);
  };

  if (isVerified) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-5">
        <h2 className="text-lg font-semibold text-green-800">
          Email already verified
        </h2>
        <p className="text-sm text-green-700">
          Your account email is verified. You can continue using all features.
        </p>
        <Button asChild size="lg">
          <Link href={returnTo}>Continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 w-full"
    >
      <div className="flex items-center justify-between gap-2">
        {[1, 2].map((item) => (
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

      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="text-base font-semibold mt-0.5">{name}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="verify-email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input id="verify-email" value={email} disabled readOnly />
        <p className="text-xs text-muted-foreground">
          Email is fetched from your account and cannot be changed here.
        </p>
      </div>

      {step === 1 && (
        <Button type="button" onClick={handleSendOtp} disabled={isSendingOtp}>
          {isSendingOtp ? (
            <>
              <LoadingSpinner />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      )}

      {step === 2 && (
        <>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="verify-otp"
              className="text-sm font-medium text-foreground"
            >
              OTP Code
            </label>
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="verify-otp"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  maxLength={6}
                  aria-invalid={!!errors.otp}
                  className={errors.otp ? "border-destructive" : ""}
                />
              )}
            />
            {errors.otp && (
              <p className="text-sm text-destructive">{errors.otp.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? "Resending..." : "Resend OTP"}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Enter the OTP sent to your email to complete verification.
          </p>
        </>
      )}
    </form>
  );
};

export default VerifyEmailForm;

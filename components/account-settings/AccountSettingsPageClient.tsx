"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, KeyRound, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChangePasswordInput,
  ChangePasswordSchema,
  ChangePasswordType,
  DeleteAccountInput,
  DeleteAccountSchema,
  DeleteAccountType,
} from "@/lib/schemas/account-settings";
import {
  changePasswordAction,
  deleteOwnAccountAction,
} from "@/lib/actions/auth";
import Link from "next/link";
import { RiVerifiedBadgeFill } from "react-icons/ri";

type AccountSettingsPageClientProps = {
  userName: string;
  email: string;
  emailVerified?: boolean;
};

const AccountSettingsPageClient = ({
  userName,
  email,
  emailVerified,
}: AccountSettingsPageClientProps) => {
  const router = useRouter();

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<ChangePasswordInput, any, ChangePasswordType>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const {
    control: deleteControl,
    handleSubmit: handleDeleteSubmit,
    reset: resetDeleteForm,
    formState: { errors: deleteErrors, isSubmitting: isDeletingAccount },
  } = useForm<DeleteAccountInput, any, DeleteAccountType>({
    resolver: zodResolver(DeleteAccountSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      password: "",
      confirmationText: "",
    },
  });

  const onChangePassword: SubmitHandler<ChangePasswordType> = async (data) => {
    const result = await changePasswordAction(data);

    if (!result.success) {
      toast.error(result.error || "Failed to change password");
      return;
    }

    toast.success(result.message || "Password changed successfully");
    resetPasswordForm();
  };

  const onDeleteAccount: SubmitHandler<DeleteAccountType> = async (data) => {
    const result = await deleteOwnAccountAction(data);

    if (!result.success) {
      toast.error(result.error || "Failed to delete account");
      return;
    }

    toast.success(result.message || "Account deleted");
    resetDeleteForm();

    setTimeout(() => {
      router.push("/signup");
      router.refresh();
    }, 250);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signed in as</CardTitle>
          <CardDescription>
            Make sure these account details are correct before changing security
            settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="font-medium">{userName}</p>
          <p className="text-muted-foreground">{email}</p>
        </CardContent>
      </Card>

      {!emailVerified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiVerifiedBadgeFill className="size-4" />
              Verify Email
            </CardTitle>
            <CardDescription>
              Your email is not verified yet. Verify it to secure your account.
            </CardDescription>
          </CardHeader>

          <CardFooter className="justify-end">
            <Button asChild variant="outline">
              <Link href="/verify-email?returnTo=%2Faccount-settings">
                <RiVerifiedBadgeFill className="size-4" />
                Go to Verify Email
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Use a strong password that you do not use anywhere else.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="change-password-form"
            className="space-y-4"
            onSubmit={handlePasswordSubmit(onChangePassword)}
          >
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Controller
                name="currentPassword"
                control={passwordControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="currentPassword"
                    type="password"
                    disabled={isChangingPassword}
                    aria-invalid={!!passwordErrors.currentPassword}
                    className={
                      passwordErrors.currentPassword ? "border-destructive" : ""
                    }
                    placeholder="Enter your current password"
                  />
                )}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Controller
                name="newPassword"
                control={passwordControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="newPassword"
                    type="password"
                    disabled={isChangingPassword}
                    aria-invalid={!!passwordErrors.newPassword}
                    className={
                      passwordErrors.newPassword ? "border-destructive" : ""
                    }
                    placeholder="Create a new password"
                  />
                )}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Controller
                name="confirmNewPassword"
                control={passwordControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirmNewPassword"
                    type="password"
                    disabled={isChangingPassword}
                    aria-invalid={!!passwordErrors.confirmNewPassword}
                    className={
                      passwordErrors.confirmNewPassword
                        ? "border-destructive"
                        : ""
                    }
                    placeholder="Re-enter your new password"
                  />
                )}
              />
              {passwordErrors.confirmNewPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="justify-between">
          <Link
            href="/forgot-password"
            className="text-left text-primary/90 hover:text-primary underline duration-200 transition-colors ease-in-out text-sm w-fit"
          >
            Forgot password?
          </Link>
          <Button
            type="submit"
            form="change-password-form"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="ring-1 ring-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-4" />
            Delete Account
          </CardTitle>
          <CardDescription>
            This action is permanent. Your bookings and sessions will be removed
            and cannot be recovered.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="delete-account-form"
            className="space-y-4"
            onSubmit={handleDeleteSubmit(onDeleteAccount)}
          >
            <div className="grid gap-2">
              <Label htmlFor="deletePassword">Password</Label>
              <Controller
                name="password"
                control={deleteControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="deletePassword"
                    type="password"
                    disabled={isDeletingAccount}
                    aria-invalid={!!deleteErrors.password}
                    className={
                      deleteErrors.password ? "border-destructive" : ""
                    }
                    placeholder="Enter your password"
                  />
                )}
              />
              {deleteErrors.password && (
                <p className="text-sm text-destructive">
                  {deleteErrors.password.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmationText">Type DELETE to confirm</Label>
              <Controller
                name="confirmationText"
                control={deleteControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirmationText"
                    disabled={isDeletingAccount}
                    aria-invalid={!!deleteErrors.confirmationText}
                    className={
                      deleteErrors.confirmationText ? "border-destructive" : ""
                    }
                    placeholder="DELETE"
                  />
                )}
              />
              {deleteErrors.confirmationText && (
                <p className="text-sm text-destructive">
                  {deleteErrors.confirmationText.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            type="submit"
            variant="destructive"
            form="delete-account-form"
            disabled={isDeletingAccount}
          >
            <Trash2 className="size-4" />
            {isDeletingAccount ? "Deleting..." : "Delete My Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSettingsPageClient;

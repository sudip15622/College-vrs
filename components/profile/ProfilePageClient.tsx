"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  BadgeCheck,
  Camera,
  PencilLine,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import {
  ProfileEditInput,
  ProfileEditSchema,
  ProfileEditType,
} from "@/lib/schemas/profile";
import { updateProfileAction } from "@/lib/actions/auth";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Link from "next/link";

type ProfileData = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  emailVerified?: boolean;
};

type ProfilePageClientProps = {
  profile: ProfileData;
};

const DEFAULT_PROFILE_IMAGE = "/default_user.png";
const toFormImageValue = (image: string | null) => {
  if (!image || image === DEFAULT_PROFILE_IMAGE) return "";
  return image;
};

const ProfilePageClient = ({ profile }: ProfilePageClientProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState(profile);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditInput, any, ProfileEditType>({
    resolver: zodResolver(ProfileEditSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: savedProfile.name,
      email: savedProfile.email,
      image: toFormImageValue(savedProfile.image),
    },
  });

  const formValues = watch();
  const previewImage = formValues.image || savedProfile.image || "";

  const initials = useMemo(() => {
    const parts = (formValues.name || "").trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";

    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return `${first}${second}`.toUpperCase();
  }, [formValues.name]);

  const onCancel = () => {
    reset({
      name: savedProfile.name,
      email: savedProfile.email,
      image: toFormImageValue(savedProfile.image),
    });
    setIsEditing(false);
  };

  const onSubmit: SubmitHandler<ProfileEditType> = async (data) => {
    const result = await updateProfileAction(data);

    if (!result.success) {
      toast.error(result.error || "Failed to update profile");
      return;
    }

    if (result.profile) {
      const updatedProfile = result.profile;

      setSavedProfile((prev) => ({
        ...prev,
        ...updatedProfile,
        emailVerified: updatedProfile.emailVerified,
      }));
      reset({
        name: updatedProfile.name,
        email: updatedProfile.email,
        image: toFormImageValue(updatedProfile.image),
      });
    }

    toast.success(result.message || "Profile updated successfully");
    setIsEditing(false);
    router.refresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            View your account info and update your details.
          </p>
        </div>

        <div className="flex gap-5 items-center justify-end">
          {!profile.emailVerified && (
            <Button asChild variant="outline">
              <Link href="/verify-email">
                <RiVerifiedBadgeFill className="size-4 text-primary/80" />
                Verify Email
              </Link>
            </Button>
          )}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <PencilLine className="size-4" />
              Edit Profile
            </Button>
          ) : (
            <Button variant="destructive" onClick={onCancel}>
              <X className="size-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Quick snapshot of your account.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="relative w-28 h-28 rounded-full ring-2 ring-border mx-auto bg-muted flex items-center justify-center">
              {previewImage ? (
                <div className="w-full h-full overflow-hidden rounded-full">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${previewImage})` }}
                  />
                </div>
              ) : (
                <span className="text-2xl font-semibold tracking-wide">
                  {initials}
                </span>
              )}
              {savedProfile.emailVerified && (
                <span className="absolute text-xl right-1 bottom-1 bg-card rounded-full p-px">
                  <RiVerifiedBadgeFill />
                </span>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold wrap-break-word">
                {formValues.name || "Unnamed User"}
              </h2>
              <p className="text-sm text-muted-foreground break-all">
                {formValues.email}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                <Shield className="size-3.5" />
                {savedProfile.role}
              </span>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="size-4" />
                <span>Account ID</span>
              </div>
              <p className="font-mono text-xs break-all">{savedProfile.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update your details and save changes."
                : "Switch to edit mode to update your profile."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="profile-edit-form"
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      disabled={!isEditing || isSubmitting}
                      aria-invalid={!!errors.name}
                      className={errors.name ? "border-destructive" : ""}
                      placeholder="Your full name"
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      disabled={!isEditing || isSubmitting}
                      aria-invalid={!!errors.email}
                      className={errors.email ? "border-destructive" : ""}
                      placeholder="you@example.com"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="image"
                      value={field.value ?? ""}
                      disabled={!isEditing || isSubmitting}
                      aria-invalid={!!errors.image}
                      className={errors.image ? "border-destructive" : ""}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  )}
                />
                {errors.image && (
                  <p className="text-sm text-destructive">
                    {errors.image.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Camera className="size-3.5" />
                  You can use the profile url of you other social media
                  platforms.
                </p>
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-end gap-2 bg-inherit">
            {isEditing ? (
              <>
                <Button type="button" variant="destructive" onClick={onCancel}>
                  Discard
                </Button>
                <Button
                  type="submit"
                  form="profile-edit-form"
                  disabled={isSubmitting}
                >
                  <BadgeCheck className="size-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                <PencilLine className="size-4" />
                Start Editing
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePageClient;

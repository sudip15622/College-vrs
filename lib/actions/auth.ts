"use server";

import { signIn, signOut, auth, unstable_update } from "@/auth";
import { customHash, generateSalt } from "../hash";
import prisma from "@/prisma";
import { LoginSchema, LoginType } from "../schemas/login";
import { SignupSchema, SignupType } from "../schemas/signup";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { ProfileEditInput, ProfileEditSchema } from "../schemas/profile";
import {
  ChangePasswordInput,
  ChangePasswordSchema,
  DeleteAccountInput,
  DeleteAccountSchema,
} from "../schemas/account-settings";
import {
  ForgotPasswordEmailType,
  ForgotPasswordEmailSchema,
  ForgotPasswordVerifyOtpType,
  ForgotPasswordVerifyOtpSchema,
  ForgotPasswordResetWithTokenType,
  ForgotPasswordResetWithTokenSchema,
} from "../schemas/forgot-password";
import { VerifyEmailOtpSchema, VerifyEmailOtpType } from "../schemas/verify-email";

interface AuthActionReturn {
  success: boolean;
  error?: string;
  message?: string;
}

interface ForgotPasswordVerifyOtpActionReturn extends AuthActionReturn {
  resetToken?: string;
}

interface ForgotPasswordResetActionReturn extends AuthActionReturn {
  loggedIn?: boolean;
}

interface UpdateProfileActionReturn extends AuthActionReturn {
  profile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    emailVerified: boolean;
  };
}

const DEFAULT_PROFILE_IMAGE = "/default_user.png";
const OTP_EXPIRY_MINUTES = 10;
const RESET_SESSION_EXPIRY_MINUTES = 15;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_GENERATION_SALT = "forgot_password_otp_generation_v1";
const OTP_VERIFICATION_SALT = "forgot_password_otp_verification_v1";
const RESET_TOKEN_HASH_SALT = "forgot_password_reset_token_hash_v1";

function getResetTokenHash(token: string) {
  return customHash(token, RESET_TOKEN_HASH_SALT);
}

function generateNumericOtp(email: string) {
  const entropySeed = `${email}|${Date.now()}|${generateSalt(12)}`;
  const digest = customHash(entropySeed, OTP_GENERATION_SALT);

  let numericStream = "";
  for (let i = 0; i < digest.length; i++) {
    const transformedDigit = (digest.charCodeAt(i) + i * 7) % 10;
    numericStream += transformedDigit.toString();
  }

  if (numericStream.length < 6) {
    numericStream = numericStream.padEnd(6, "0");
  }

  const maxStart = Math.max(0, numericStream.length - 6);
  const startIndex = (digest.charCodeAt(0) + digest.length) % (maxStart + 1);

  return numericStream.slice(startIndex, startIndex + 6);
}

function getOtpVerificationHash(email: string, otp: string) {
  const normalizedPayload = `${email.toLowerCase().trim()}|${otp}`;
  return customHash(normalizedPayload, OTP_VERIFICATION_SALT);
}

async function sendForgotPasswordOtpEmail(email: string, otp: string) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(resendApiKey);
  // const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  await resend.emails.send({
    from: 'VRS <contact@sudip-lamichhane.com.np>',
    to: email,
    subject: "Your password reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <h2 style="margin: 0 0 12px;">Password reset request</h2>
        <p style="margin: 0 0 12px;">Use this OTP to reset your password:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 8px 0 14px;">${otp}</div>
        <p style="margin: 0 0 8px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p style="margin: 0; color: #666;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

async function sendVerifyEmailOtpEmail(email: string, otp: string) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(resendApiKey);
  // const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  await resend.emails.send({
    from: 'VRS <contact@sudip-lamichhane.com.np>',
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <h2 style="margin: 0 0 12px;">Email verification</h2>
        <p style="margin: 0 0 12px;">Use this OTP to verify your email address:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 8px 0 14px;">${otp}</div>
        <p style="margin: 0 0 8px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p style="margin: 0; color: #666;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function requestEmailVerificationOtpAction(): Promise<AuthActionReturn> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User account not found",
      };
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: "Your email is already verified.",
      };
    }

    const email = user.email.toLowerCase().trim();

    const latestToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        purpose: "VERIFY_EMAIL",
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (latestToken) {
      const secondsSinceLastIssue =
        (Date.now() - latestToken.createdAt.getTime()) / 1000;

      if (secondsSinceLastIssue < OTP_RESEND_COOLDOWN_SECONDS) {
        return {
          success: true,
          message: "A verification OTP has been sent to your email.",
        };
      }
    }

    const otp = generateNumericOtp(email);
    const otpHash = getOtpVerificationHash(email, otp);
    const otpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    await prisma.passwordResetToken.create({
      data: {
        email,
        purpose: "VERIFY_EMAIL",
        otpHash,
        otpExpiresAt,
        maxAttempts: OTP_MAX_ATTEMPTS,
      },
    });

    try {
      await sendVerifyEmailOtpEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verify email OTP:", emailError);
      return {
        success: false,
        error: "Unable to send OTP right now. Please try again.",
      };
    }

    return {
      success: true,
      message: "A verification OTP has been sent to your email.",
    };
  } catch (error) {
    console.error("Error requesting verify email OTP:", error);
    return {
      success: false,
      error: "Unable to process request right now. Please try again.",
    };
  }
}

export async function verifyEmailOtpAction(
  formData: VerifyEmailOtpType,
): Promise<AuthActionReturn> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  const parsed = VerifyEmailOtpSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid OTP input",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User account not found",
      };
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: "Your email is already verified.",
      };
    }

    const email = user.email.toLowerCase().trim();
    const otpInputHash = getOtpVerificationHash(email, parsed.data.otp);

    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        purpose: "VERIFY_EMAIL",
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "Invalid or expired OTP",
      };
    }

    if (tokenRecord.attempts >= tokenRecord.maxAttempts) {
      return {
        success: false,
        error: "Too many attempts. Please request a new OTP.",
      };
    }

    if (tokenRecord.otpExpiresAt.getTime() < Date.now()) {
      return {
        success: false,
        error: "OTP has expired. Please request a new one.",
      };
    }

    if (tokenRecord.otpHash !== otpInputHash) {
      await prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return {
        success: false,
        error: "Invalid OTP",
      };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      }),
      prisma.passwordResetToken.update({
        where: {
          id: tokenRecord.id,
        },
        data: {
          verifiedAt: new Date(),
          consumedAt: new Date(),
        },
      }),
    ]);

    return {
      success: true,
      message: "Email verified successfully.",
    };
  } catch (error) {
    console.error("Error verifying email OTP:", error);
    return {
      success: false,
      error: "Unable to verify OTP right now. Please try again.",
    };
  }
}

export async function requestForgotPasswordOtpAction(
  formData: ForgotPasswordEmailType,
): Promise<AuthActionReturn> {
  const parsed = ForgotPasswordEmailSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Please enter a valid email address",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Always return the same message to avoid account enumeration.
    if (!user) {
      return {
        success: true,
        message: "If an account exists for this email, an OTP has been sent.",
      };
    }

    const latestToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        purpose: "FORGOT_PASSWORD",
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (latestToken) {
      const secondsSinceLastIssue =
        (Date.now() - latestToken.createdAt.getTime()) / 1000;

      if (secondsSinceLastIssue < OTP_RESEND_COOLDOWN_SECONDS) {
        return {
          success: true,
          message: "If an account exists for this email, an OTP has been sent.",
        };
      }
    }

    const otp = generateNumericOtp(email);
    const otpHash = getOtpVerificationHash(email, otp);
    const otpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    await prisma.passwordResetToken.create({
      data: {
        email,
        purpose: "FORGOT_PASSWORD",
        otpHash,
        otpExpiresAt,
        maxAttempts: OTP_MAX_ATTEMPTS,
      },
    });

    try {
      await sendForgotPasswordOtpEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send forgot password OTP email:", emailError);
    }

    return {
      success: true,
      message: "If an account exists for this email, an OTP has been sent.",
    };
  } catch (error) {
    console.error("Error requesting forgot password OTP:", error);
    return {
      success: false,
      error: "Unable to process request right now. Please try again.",
    };
  }
}

export async function verifyForgotPasswordOtpAction(
  formData: ForgotPasswordVerifyOtpType,
): Promise<ForgotPasswordVerifyOtpActionReturn> {
  const parsed = ForgotPasswordVerifyOtpSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid OTP input",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const otpInputHash = getOtpVerificationHash(email, parsed.data.otp);

  try {
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        purpose: "FORGOT_PASSWORD",
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "Invalid or expired OTP",
      };
    }

    if (tokenRecord.attempts >= tokenRecord.maxAttempts) {
      return {
        success: false,
        error: "Too many attempts. Please request a new OTP.",
      };
    }

    if (tokenRecord.otpExpiresAt.getTime() < Date.now()) {
      return {
        success: false,
        error: "OTP has expired. Please request a new one.",
      };
    }

    if (tokenRecord.otpHash !== otpInputHash) {
      await prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return {
        success: false,
        error: "Invalid OTP",
      };
    }

    const resetToken = randomBytes(32).toString("hex");
    const resetTokenHash = getResetTokenHash(resetToken);
    const resetTokenExpiresAt = new Date(
      Date.now() + RESET_SESSION_EXPIRY_MINUTES * 60 * 1000,
    );

    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: {
        verifiedAt: new Date(),
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    return {
      success: true,
      message: "OTP verified successfully",
      resetToken,
    };
  } catch (error) {
    console.error("Error verifying forgot password OTP:", error);
    return {
      success: false,
      error: "Unable to verify OTP. Please try again.",
    };
  }
}

export async function resetForgotPasswordAction(
  formData: ForgotPasswordResetWithTokenType,
): Promise<ForgotPasswordResetActionReturn> {
  const parsed = ForgotPasswordResetWithTokenSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid reset request",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const resetTokenHash = getResetTokenHash(parsed.data.resetToken);

  try {
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        purpose: "FORGOT_PASSWORD",
        consumedAt: null,
        verifiedAt: {
          not: null,
        },
        resetTokenHash,
        resetTokenExpiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "Invalid or expired password reset session",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Unable to reset password. Please try again.",
      };
    }

    const nextSalt = generateSalt();
    const nextPasswordHash = customHash(parsed.data.newPassword, nextSalt);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          salt: nextSalt,
          password: nextPasswordHash,
        },
      }),
      prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      prisma.passwordResetToken.update({
        where: {
          id: tokenRecord.id,
        },
        data: {
          consumedAt: new Date(),
        },
      }),
    ]);

    try {
      await signIn("credentials", {
        email,
        password: parsed.data.newPassword,
        redirect: false,
      });

      return {
        success: true,
        loggedIn: true,
        message: "Password reset successful. You are now logged in.",
      };
    } catch (signInError) {
      if (signInError instanceof AuthError) {
        console.error("Post-reset auto login failed:", signInError);
      }

      return {
        success: true,
        loggedIn: false,
        message: "Password reset successful. Please login with your new password.",
      };
    }
  } catch (error) {
    console.error("Error resetting forgot password:", error);
    return {
      success: false,
      error: "Unable to reset password right now. Please try again.",
    };
  }
}

export async function updateProfileAction(
  formData: ProfileEditInput
): Promise<UpdateProfileActionReturn> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to update your profile",
    };
  }

  const parsed = ProfileEditSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid profile input",
    };
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!currentUser) {
      return {
        success: false,
        error: "User account not found",
      };
    }

    const normalizedCurrentEmail = currentUser.email.toLowerCase().trim();
    const normalizedNextEmail = parsed.data.email.toLowerCase().trim();
    const emailChanged = normalizedCurrentEmail !== normalizedNextEmail;

    const existing = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: {
          id: currentUser.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Email is already in use by another account",
      };
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        ...(emailChanged
          ? {
              emailVerified: null,
            }
          : {}),
        image:
          parsed.data.image === "" || parsed.data.image === DEFAULT_PROFILE_IMAGE
            ? null
            : parsed.data.image,
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

    await unstable_update({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
      },
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        emailVerified: !!updatedUser.emailVerified,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);

    return {
      success: false,
      error: "Failed to update profile. Please try again",
    };
  }
}

export async function changePasswordAction(
  formData: ChangePasswordInput
): Promise<AuthActionReturn> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to change your password",
    };
  }

  const parsed = ChangePasswordSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid password input",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        salt: true,
        password: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User account not found",
      };
    }

    const currentHash = customHash(parsed.data.currentPassword, user.salt);

    if (currentHash !== user.password) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    const nextSalt = generateSalt();
    const nextHash = customHash(parsed.data.newPassword, nextSalt);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: nextHash,
        salt: nextSalt,
      },
    });

    revalidatePath("/account-settings");

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Error changing password:", error);

    return {
      success: false,
      error: "Failed to change password. Please try again",
    };
  }
}

export async function deleteOwnAccountAction(
  formData: DeleteAccountInput
): Promise<AuthActionReturn> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to delete your account",
    };
  }

  const parsed = DeleteAccountSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid account deletion request",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        salt: true,
        password: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User account not found",
      };
    }

    const passwordHash = customHash(parsed.data.password, user.salt);

    if (passwordHash !== user.password) {
      return {
        success: false,
        error: "Password is incorrect",
      };
    }

    const blockingBookingsCount = await prisma.booking.count({
      where: {
        userId: user.id,
        status: {
          in: ["Pending", "Confirmed", "Active"],
        },
      },
    });

    if (blockingBookingsCount > 0) {
      return {
        success: false,
        error:
          "You cannot delete your account while you have pending, confirmed, or active bookings",
      };
    }

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    try {
      await signOut({ redirect: false });
    } catch (signOutError) {
      console.error("Error signing out after account deletion:", signOutError);
    }

    revalidatePath("/");

    return {
      success: true,
      message: "Your account has been deleted",
    };
  } catch (error) {
    console.error("Error deleting account:", error);

    return {
      success: false,
      error: "Failed to delete account. Please try again",
    };
  }
}

export async function signupAction(
  formData: SignupType
): Promise<AuthActionReturn> {
  const signupFields = SignupSchema.safeParse(formData);

  if (!signupFields.success) {
    const firstError = signupFields.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Please check your input and try again",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: signupFields.data.email },
    });

    if (user) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    const salt = generateSalt();
    const passwordHash = customHash(signupFields.data.password, salt);

    await prisma.user.create({
      data: {
        ...signupFields.data,
        password: passwordHash,
        salt: salt,
      },
    });

    return {
      success: true,
      message: "Account created successfully! You can now login",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Unable to create account. Please try again later",
    };
  }
}

export async function LoginAction(
  formData: LoginType
): Promise<AuthActionReturn> {
  const loginFields = LoginSchema.safeParse(formData);

  if (!loginFields.success) {
    const firstError = loginFields.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid email or password!",
    };
  }

  try {
    await signIn("credentials", {
      email: loginFields.data.email,
      password: loginFields.data.password,
      redirect: false,
    });

    return {
      success: true,
      message: "Logged in successfully!",
    };
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      // Extract the actual error message from AuthError
      const errorMessage = error.cause?.err?.message || error.message;
      
      // Map common auth errors to user-friendly messages
      if (errorMessage.includes("No account found")) {
        return {
          success: false,
          error: "Invalid email or password!",
        };
      }
      if (errorMessage.includes("Incorrect password")) {
        return {
          success: false,
          error: "Invalid email or password!",
        };
      }
      if (errorMessage.includes("required")) {
        return {
          success: false,
          error: "Email and password are required!",
        };
      }
      
      return {
        success: false,
        error: "Invalid email or password!",
      };
    }
    
    return {
      success: false,
      error: "Unable to login. Please try again later",
    };
  }
}

export async function signOutAction(): Promise<AuthActionReturn> {
  try {
    await signOut({ redirect: false });

    return {
      success: true,
      message: "Signed out successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong",
    };
  }
}

interface SearchUsersParams {
  limit?: number;
  page?: number;
}

export async function searchUsers(params: SearchUsersParams) {
  const { limit = 10, page = 1 } = params;

  const skip = (page - 1) * limit;

  const total = await prisma.user.count();

  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      role: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function makeUserAdmin(userId: string): Promise<AuthActionReturn> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    // Check if current user is admin
    if (session.user.role !== "Admin") {
      return {
        success: false,
        error: "Only admins can perform this action",
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if already admin
    if (user.role === "Admin") {
      return {
        success: false,
        error: "User is already an admin",
      };
    }

    // Update user role to Admin
    await prisma.user.update({
      where: { id: userId },
      data: { role: "Admin" },
    });

    return {
      success: true,
      message: `${user.name} is now an admin`,
    };
  } catch (error) {
    console.error("Error making user admin:", error);
    return {
      success: false,
      error: "Failed to make user admin",
    };
  }
}

export async function removeUserAdmin(userId: string): Promise<AuthActionReturn> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    // Check if current user is admin
    if (session.user.role !== "Admin") {
      return {
        success: false,
        error: "Only admins can perform this action",
      };
    }

    // Check if trying to remove self from admin
    if (userId === session.user.id) {
      return {
        success: false,
        error: "You cannot remove your own admin privileges",
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if already a regular user
    if (user.role !== "Admin") {
      return {
        success: false,
        error: "User is not an admin",
      };
    }

    // Update user role to User
    await prisma.user.update({
      where: { id: userId },
      data: { role: "User" },
    });

    return {
      success: true,
      message: `${user.name} is no longer an admin`,
    };
  } catch (error) {
    console.error("Error removing user admin:", error);
    return {
      success: false,
      error: "Failed to remove admin privileges",
    };
  }
}

export async function deleteUser(userId: string): Promise<AuthActionReturn> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in",
      };
    }

    // Check if current user is admin
    if (session.user.role !== "Admin") {
      return {
        success: false,
        error: "Only admins can perform this action",
      };
    }

    // Check if trying to delete self
    if (userId === session.user.id) {
      return {
        success: false,
        error: "You cannot delete your own account",
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Delete user (cascading delete will handle bookings, sessions, etc.)
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: `User ${user.name} has been deleted`,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}


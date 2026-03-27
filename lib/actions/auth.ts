"use server";

import { signIn, signOut, auth, unstable_update } from "@/auth";
import { customHash, generateSalt } from "../hash";
import prisma from "@/prisma";
import { LoginSchema, LoginType } from "../schemas/login";
import { SignupSchema, SignupType } from "../schemas/signup";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { ProfileEditInput, ProfileEditSchema } from "../schemas/profile";

interface AuthActionReturn {
  success: boolean;
  error?: string;
  message?: string;
}

interface UpdateProfileActionReturn extends AuthActionReturn {
  profile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
  };
}

const DEFAULT_PROFILE_IMAGE = "/default_user.png";

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
    const existing = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: {
          id: session.user.id,
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


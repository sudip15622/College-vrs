"use server";

import { signIn, signOut } from "@/auth";
import { customHash, generateSalt } from "../hash";
import prisma from "@/prisma";
import { LoginSchema, LoginType } from "../schemas/login";
import { SignupSchema, SignupType } from "../schemas/signup";
import { AuthError } from "next-auth";

interface AuthActionReturn {
  success: boolean;
  error?: string;
  message?: string;
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


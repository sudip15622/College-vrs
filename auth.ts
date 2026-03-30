import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { customHash } from "./lib/hash";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        // logic to verify if the user exists
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        // logic to salt and hash password
        const inputHash = customHash(password, user.salt);

        if (inputHash !== user.password) {
          throw new Error("Incorrect password");
        }

        // return user object with their profile data
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          emailVerified: !!user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        const userEmailVerified = (
          user as { emailVerified?: Date | boolean | null }
        ).emailVerified;

        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image ?? null;
        token.emailVerified = Boolean(userEmailVerified);
      }

      if (trigger === "update" && session) {
        const sessionEmailVerified = (
          session.user as { emailVerified?: boolean | Date | null }
        ).emailVerified;

        token.name = session.user?.name ?? token.name;
        token.email = session.user?.email ?? token.email;
        token.role = session.user?.role ?? token.role;
        token.image = session.user?.image ?? token.image ?? null;
        token.emailVerified =
          typeof sessionEmailVerified === "boolean"
            ? sessionEmailVerified
            : Boolean(sessionEmailVerified ?? token.emailVerified);
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.image = (token.image as string | null) ?? null;
        (session.user as { emailVerified: boolean }).emailVerified = Boolean(
          token.emailVerified,
        );
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { customHash } from "./lib/hash";

export const { handlers, auth, signIn, signOut } = NextAuth({
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
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }

      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
        token.role = session.role;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

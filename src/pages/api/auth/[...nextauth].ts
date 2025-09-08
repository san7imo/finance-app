//src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { User as PrismaUser } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 días (opcional)
  },
  callbacks: {
    // Agregamos información extra a session.user
    async session({ session, user }) {
      if (session.user) {
        const dbUser = user as PrismaUser;
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.email = dbUser.email;
      }
      return session;
    },
    // Hook de signIn para asignar rol si no existe
    async signIn({ user }) {
      const dbUser = user as PrismaUser;
      try {
        const existing = await prisma.user.findUnique({
          where: { id: dbUser.id },
        });

        if (existing && !existing.role) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: "ADMIN" },
          });
        }
      } catch (err) {
        console.error("Error en signIn hook:", err);
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

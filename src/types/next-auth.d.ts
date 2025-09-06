// src/types/next-auth.d.ts
import { DefaultUser } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    role: Role;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    email: string;
  }
}
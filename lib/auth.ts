import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";

import { prisma } from "./db";
import type { SellerSummary } from "@/types/auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string | null }).role ?? token.role;
      } else if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });

        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      const userId = (user as { id?: string })?.id ?? token.sub;
      if (userId && (user || !token.sellers)) {
        const memberships = await getSellerMemberships(userId);
        token.sellers = memberships;

        if (!token.activeSellerId && memberships.length) {
          token.activeSellerId = memberships[0].id;
        }
      }

      if (
        trigger === "update" &&
        session &&
        "activeSellerId" in session &&
        typeof (session as { activeSellerId?: unknown }).activeSellerId === "string"
      ) {
        const requested = (session as { activeSellerId?: string }).activeSellerId;
        if (requested && token.sellers?.some((seller) => seller.id === requested)) {
          token.activeSellerId = requested;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
          role: token.role,
          sellers: token.sellers ?? [],
          activeSellerId:
            token.activeSellerId ??
            (token.sellers && token.sellers.length > 0 ? token.sellers[0].id : null),
        };
      }

      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export function isAdmin(session: Session | null | undefined) {
  return Boolean(session?.user && session.user.role === "admin");
}

export function isSeller(session: Session | null | undefined) {
  return Boolean(session?.user && session.user.role === "seller");
}

export async function requireAdminSession(): Promise<Session> {
  const session = await getServerAuthSession();

  if (!isAdmin(session)) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireSellerSession(): Promise<{
  session: Session;
  seller: SellerSummary;
}> {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/seller/login");
  }

  if (!isSeller(session)) {
    redirect("/seller/login");
  }

  const sellers = session.user.sellers ?? [];
  const activeSellerId = session.user.activeSellerId ?? sellers[0]?.id;
  const seller =
    sellers.find((item) => item.id === activeSellerId) ??
    (sellers.length ? sellers[0] : null);

  if (!seller) {
    redirect("/seller/apply?state=missing-seller");
  }

  return { session, seller };
}

async function getSellerMemberships(userId: string): Promise<SellerSummary[]> {
  const memberships = await prisma.sellerUser.findMany({
    where: { userId },
    select: {
      role: true,
      seller: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  });

  return memberships
    .filter((membership) => membership.seller)
    .map((membership) => ({
      id: membership.seller!.id,
      name: membership.seller!.name,
      slug: membership.seller!.slug,
      status: membership.seller!.status,
      role: membership.role,
    }));
}

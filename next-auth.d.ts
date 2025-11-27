import type { DefaultSession } from "next-auth";
import type { SellerSummary } from "@/types/auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role?: string | null;
      activeSellerId?: string | null;
      sellers?: SellerSummary[];
    };
  }

  interface User {
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    sellers?: SellerSummary[];
    activeSellerId?: string | null;
  }
}

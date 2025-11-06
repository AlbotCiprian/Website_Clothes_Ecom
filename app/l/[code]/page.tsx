import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RedirectType } from "next/dist/client/components/redirect";

import { findLinkByCode, recordLinkHit } from "@/lib/links";

type LinkPageProps = {
  params: { code: string };
};

export default async function LinkRedirectPage({ params }: LinkPageProps) {
  const code = params.code.toUpperCase();

  const link = await findLinkByCode(code);

  if (!link) {
    redirect("/shop", RedirectType.permanent);
  }

  const headerList = headers();
  await recordLinkHit({
    code,
    ipAddress:
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      null,
    userAgent: headerList.get("user-agent"),
    referer: headerList.get("referer"),
  });

  const destination = buildDestination(link);
  redirect(destination, RedirectType.permanent);
}

function buildDestination(link: Awaited<ReturnType<typeof findLinkByCode>>) {
  if (!link) {
    return "/shop";
  }

  const redirectParam = link.redirectTo ?? "";

  if (link.target === "ADD_TO_CART") {
    const params = new URLSearchParams({
      add: link.productId,
      ref: link.code,
    });

    if (link.variantId) {
      params.set("variant", link.variantId);
    }

    if (redirectParam) {
      params.set("redirect", redirectParam);
    }

    return `/shop?${params.toString()}`;
  }

  const params = new URLSearchParams({
    ref: link.code,
  });

  if (redirectParam) {
    params.set("redirect", redirectParam);
  }

  return `/product/${link.product.slug}?${params.toString()}`;
}

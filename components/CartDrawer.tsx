"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cartTotals, readCart, removeItem, subscribe, type CartSnapshot } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

export default function CartDrawer() {
  const [cart, setCart] = useState<CartSnapshot>(() => readCart());
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCart(readCart());
    const unsubscribe = subscribe((nextCart) => setCart(nextCart));
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totals = cartTotals(cart);
  const empty = cart.items.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Deschide coșul de cumpărături"
        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-100"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {mounted && totals.itemCount > 0 ? (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
              {totals.itemCount}
            </span>
          ) : null}
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Coșul tău</SheetTitle>
          <SheetDescription>
            Articolele sunt salvate pentru 30 de minute. Finalizează comanda când ești gata.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 flex flex-1 flex-col justify-between">
          <div className="space-y-4 text-sm text-neutral-700">
            {empty ? (
              <p>
                Coșul este momentan gol. Explorează colecția Claroche pentru a descoperi piese care îți completează
                rutina.
              </p>
            ) : (
              <ul className="space-y-3">
                {cart.items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantId}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        {item.size ? `Size ${item.size}` : ""}
                        {item.size && item.color ? " · " : ""}
                        {item.color ?? ""}
                      </p>
                      <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatMoney(item.price * item.quantity)}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-neutral-500 underline hover:text-neutral-800"
                        onClick={async () => {
                          await handleRemove(item.productId, item.variantId);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span className="text-lg font-semibold text-neutral-900">
                {formatMoney(totals.subtotal)}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={empty}
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
            >
              Finalizează comanda
            </Button>
            <p className="text-xs text-neutral-400">
              *Simulare demo — plățile vor fi disponibile în curând.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  async function handleRemove(productId: string, variantId: string) {
    try {
      removeItem(productId, variantId);
      setCart(readCart());
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  }
}

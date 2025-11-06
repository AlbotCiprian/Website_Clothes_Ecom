"use client";

import { ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Deschide coșul de cumpărături"
        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-100"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Coșul tău</SheetTitle>
          <SheetDescription>
            Articolele sunt salvate pentru 30 de minute. Finalizează comanda când ești gata.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 flex flex-1 flex-col justify-between">
          <div className="space-y-4 text-sm text-neutral-500">
            <p>
              Coșul este momentan gol. Explorează colecția Claroche pentru a descoperi piese care
              îți completează rutina.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span>Livrare standard</span>
                <span className="font-medium text-neutral-900">Gratuită</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Retur ușor</span>
                <span className="font-medium text-neutral-900">30 zile</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span className="text-lg font-semibold text-neutral-900">0,00 RON</span>
            </div>
            <Button className="w-full" size="lg" disabled>
              Finalizează comanda
            </Button>
            <p className="text-xs text-neutral-400">
              *Simulare demo – plățile vor fi disponibile în curând.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

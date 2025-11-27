import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-xl">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="text-6xl">🧭</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-neutral-900">Page lost in the dressing room</h1>
            <p className="text-neutral-600">
              We checked every hanger and still could not find what you are looking for. Let us walk you back.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/shop">Browse the shop</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

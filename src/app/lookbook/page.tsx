import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LookbookPage() {
  return (
    <div className="container-shell py-12">
      <div className="flex items-center gap-3">
        <Badge variant="muted">Lookbook</Badge>
        <h1 className="text-2xl font-semibold text-neutral-900">Coming soon</h1>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 p-8">
          <p className="text-lg font-semibold text-neutral-900">We are stitching the next drop.</p>
          <p className="text-neutral-600">
            New outfits, layered fits, and the Claroche vibe. Get notified when the lookbook is live.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/shop">Back to shop</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

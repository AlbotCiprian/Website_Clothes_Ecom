"use client";

interface TrackingPayload {
  event: string;
  path?: string;
  productId?: string;
  linkId?: string;
  ref?: string;
}

export async function trackEvent(payload: TrackingPayload) {
  try {
    await fetch("/api/tracking/hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        path: payload.path ?? window.location.pathname,
      }),
      keepalive: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Unable to submit tracking event", error);
    }
  }
}

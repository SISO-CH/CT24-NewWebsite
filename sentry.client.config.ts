import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [],
    beforeSend(event) {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("ct24_consent");
        if (!raw) return null;
        try {
          const prefs = raw === "accepted" ? { errorTracking: true } : JSON.parse(raw);
          if (!prefs.errorTracking) return null;
        } catch {
          return null;
        }
      }
      return event;
    },
  });
}

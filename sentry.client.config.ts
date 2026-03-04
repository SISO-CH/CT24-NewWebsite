import * as Sentry from "@sentry/nextjs";
import { getConsent } from "@/lib/consent";

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
      const prefs = getConsent();
      if (!prefs?.errorTracking) return null;
      return event;
    },
  });
}

// components/ui/MatelsoBookingWidget.tsx
// Note: This is a Server Component — reads env var at build/request time.

const BOOKING_URL = process.env.NEXT_PUBLIC_MATELSO_BOOKING_URL || null;

interface Props {
  height?: number;
}

export default function MatelsoBookingWidget({ height = 600 }: Props) {
  if (!BOOKING_URL) return null;

  return (
    <iframe
      src={BOOKING_URL}
      width="100%"
      height={height}
      style={{ border: "none", borderRadius: 12 }}
      title="Probefahrt buchen"
      loading="lazy"
    />
  );
}

/** True when the Matelso booking URL env var is configured */
export const isMatelsoConfigured = Boolean(BOOKING_URL);

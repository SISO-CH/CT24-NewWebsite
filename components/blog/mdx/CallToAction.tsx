import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction({
  href = "/autos",
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-8 rounded-2xl bg-ct-cyan p-6 text-white not-prose">
      <p className="font-semibold text-lg mb-3">{children}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-ct-cyan font-bold text-sm hover:opacity-90 transition-opacity"
      >
        Fahrzeuge entdecken <ArrowRight size={16} />
      </Link>
    </div>
  );
}

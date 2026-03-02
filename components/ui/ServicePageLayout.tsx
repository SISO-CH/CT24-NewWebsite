import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

interface Step {
  num:   string;
  title: string;
  desc:  string;
}

interface Props {
  badge:           string;
  heading:         ReactNode;
  lead:            string;
  usps:            string[];
  processEyebrow:  string;
  processHeading:  string;
  steps:           Step[];
  formEyebrow:     string;
  formHeading:     string;
  formNote:        string;
  formSubject:     string;
  formFields:      string[];
}

export default function ServicePageLayout({
  badge, heading, lead, usps,
  processEyebrow, processHeading, steps,
  formEyebrow, formHeading, formNote, formSubject, formFields,
}: Props) {
  return (
    <>
      {/* Header */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-ct-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            {badge}
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">
            {heading}
          </h1>
          <p className="text-ct-gray max-w-xl text-lg leading-relaxed">{lead}</p>
          <div className="flex flex-wrap gap-4 mt-6">
            {usps.map((u) => (
              <span key={u} className="flex items-center gap-1.5 text-sm text-ct-gray-mid">
                <CheckCircle2 size={14} className="text-ct-green shrink-0" />{u}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
                {processEyebrow}
              </p>
              <h2 className="text-2xl font-extrabold text-ct-dark">{processHeading}</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 100}>
                <div className="text-center p-6 rounded-xl border border-ct-border-soft shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p
                    className="text-5xl font-black mb-3"
                    style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}
                  >
                    {s.num}
                  </p>
                  <h3 className="font-bold text-base mb-2 text-ct-dark">{s.title}</h3>
                  <p className="text-ct-gray text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-14 bg-ct-light border-t border-ct-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
              {formEyebrow}
            </p>
            <h2 className="text-3xl font-extrabold mb-2 text-ct-dark">{formHeading}</h2>
            <p className="text-ct-gray text-sm mb-8">{formNote}</p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-ct-border p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <ServiceContactForm subject={formSubject} fields={formFields} />
          </div>
        </div>
      </section>
    </>
  );
}

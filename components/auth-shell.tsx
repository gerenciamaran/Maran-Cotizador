import type { ReactNode } from "react";
import Image from "next/image";
import { BoltIcon, ShieldIcon, UsersIcon } from "@/components/auth-icons";

const FEATURES = [
  {
    icon: BoltIcon,
    title: "Rápido",
    body: "Genera una cotización completa en minutos, no en horas.",
  },
  {
    icon: ShieldIcon,
    title: "Preciso",
    body: "Dimensionamiento basado en datos reales de irradiación solar.",
  },
  {
    icon: UsersIcon,
    title: "Profesional",
    body: "Propuestas en PDF con la identidad de MARÁN ENERGY.",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#05122a]">
      <div className="flex justify-end px-4 py-3 lg:absolute lg:right-6 lg:top-5 lg:py-0 lg:px-0">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          Sistema en línea
        </span>
      </div>

      <div className="relative isolate lg:w-1/2 overflow-hidden px-6 py-10 lg:p-16 flex flex-col justify-between">
        <Image
          src="/auth-hero.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover -z-20"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1100px 500px at 15% 15%, rgba(255,214,10,0.12), transparent 60%), linear-gradient(160deg, rgba(5,18,42,0.75) 0%, rgba(11,61,102,0.55) 55%, rgba(8,42,72,0.8) 100%)",
          }}
        />

        <Image
          src="/logo.png"
          alt="Marán Energy"
          width={1111}
          height={802}
          className="h-16 w-auto self-start"
          priority
        />

        <div className="max-w-md">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
            <span className="text-alert">{title.split(" ")[0]}</span>{" "}
            {title.split(" ").slice(1).join(" ")}
          </h1>
          <p className="text-linework text-sm md:text-base mb-8">{subtitle}</p>

          <div className="space-y-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-alert">
                  <f.icon className="w-4.5 h-4.5" width={18} height={18} />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{f.title}</div>
                  <div className="text-linework text-xs">{f.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[11px] text-white/40">
          © {new Date().getFullYear()} Marán Energy. Todos los derechos reservados.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f5f6f8] p-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">{children}</div>
      </div>
    </div>
  );
}

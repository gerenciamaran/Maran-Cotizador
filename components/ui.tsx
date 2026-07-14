import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl p-4 md:p-6 mb-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-heading font-semibold text-base text-gray-900 mb-4 pb-3 border-b border-gray-100">
      {children}
    </h2>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-gray-400 py-2.5">{children}</p>;
}

const buttonBase =
  "font-medium text-sm rounded-lg px-4 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:brightness-105",
  outline:
    "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-500 underline px-1 py-1.5 text-sm font-normal",
  danger: "bg-danger text-white hover:brightness-110",
  success: "bg-success text-white hover:brightness-110",
};

export function Button({
  variant = "primary",
  className = "",
  small = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  small?: boolean;
}) {
  return (
    <button
      className={`${buttonBase} ${variants[variant]} ${small ? "px-2.5 py-1.5 text-xs" : ""} ${className}`}
      {...props}
    />
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="bg-gray-100 rounded-full h-2 overflow-hidden mt-1.5">
      <div
        className="bg-blue-600 h-full transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function StatBox({ num, label }: { num: string | number; label: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
      <div className="font-heading text-2xl text-gray-900">{num}</div>
      <div className="font-mono text-[10px] text-gray-400 uppercase">{label}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block font-mono text-[11px] uppercase text-gray-500 mt-2.5 mb-1">
      {children}
    </label>
  );
}

export const inputClass =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

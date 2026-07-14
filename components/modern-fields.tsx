"use client";

import { useState, type ComponentType, type InputHTMLAttributes, type SVGProps } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "@/components/auth-icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export function ModernField({
  icon: Icon,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: IconType }) {
  return (
    <div className="relative">
      <Icon
        width={18}
        height={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        {...props}
        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${className}`}
      />
    </div>
  );
}

export function ModernPasswordField({
  name,
  placeholder,
  required,
  autoFocus,
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <LockIcon
        width={18}
        height={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        tabIndex={-1}
      >
        {show ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
      </button>
    </div>
  );
}

export const modernInputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

export const modernLabelClass = "block font-mono text-[11px] uppercase text-gray-500 mb-1";

export function ModernButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium text-sm hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 ${className}`}
    >
      {children}
    </button>
  );
}

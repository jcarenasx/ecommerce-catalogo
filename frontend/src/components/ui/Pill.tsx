import type { ButtonHTMLAttributes } from "react";

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function Pill({ children, active = false, className = "", ...rest }: PillProps) {
  const baseStyles =
    "flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition";
  const activeStyles = active
    ? "bg-black text-white"
    : "border border-slate-200 bg-white text-slate-500 hover:border-slate-400 shadow-sm";

  return (
    <button
      type="button"
      className={`${baseStyles} ${activeStyles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

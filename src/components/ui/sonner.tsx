"use client";

import type { ComponentProps } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

/** PodcastRow-style shell; base avoids `!` bg/border so per-toast classes (e.g. SONNER_*) can override. */
const sonnerClassNames: NonNullable<
  NonNullable<ComponentProps<typeof Sonner>["toastOptions"]>["classNames"]
> = {
  toast: [
    "group/toast relative flex w-[var(--width)] items-center gap-3 overflow-hidden",
    "rounded-2xl border border-violet-300/50 bg-white/80 p-4 text-[0.8125rem] leading-snug",
    "text-slate-800 shadow-[0_4px_18px_-8px_rgba(139,92,246,0.28)] backdrop-blur-xl",
    "transition-[box-shadow,transform] duration-300",
    "hover:shadow-[0_8px_28px_-8px_rgba(139,92,246,0.42)]",
    "dark:border-violet-500/30 dark:bg-slate-950/85 dark:text-slate-100",
    "dark:shadow-[0_4px_18px_-8px_rgba(139,92,246,0.2)] dark:hover:shadow-[0_10px_32px_-8px_rgba(139,92,246,0.35)]",
    "focus-visible:ring-2 focus-visible:ring-violet-400/45 focus-visible:ring-offset-2 focus-visible:outline-none",
    "dark:focus-visible:ring-violet-500/40 dark:focus-visible:ring-offset-slate-950",
  ].join(" "),
  content: "flex min-w-0 flex-1 flex-col gap-0.5",
  title: "font-semibold tracking-tight",
  description: "text-xs font-medium text-current/85",
  icon: "shrink-0 [&_svg]:size-4.5",
  closeButton: [
    "absolute top-0 left-0 z-1 flex size-5 -translate-x-[35%] -translate-y-[35%] items-center justify-center",
    "rounded-full border border-violet-200/70 bg-white/95 text-slate-600 shadow-sm",
    "hover:cursor-pointer hover:bg-violet-50 hover:text-slate-800",
    "dark:border-violet-500/35 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50",
  ].join(" "),
  actionButton: [
    "inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-semibold",
    "bg-violet-600 text-white shadow-sm hover:bg-violet-700",
    "dark:bg-violet-500 dark:hover:bg-violet-400",
  ].join(" "),
  cancelButton: [
    "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border px-3 text-xs font-semibold",
    "border-slate-300/70 bg-slate-100/90 text-slate-700 hover:bg-slate-200/90",
    "dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700/90",
  ].join(" "),
  loader: "relative shrink-0 text-indigo-500 dark:text-indigo-400",
  success: [
    "border-emerald-400/55! bg-emerald-50/95! text-emerald-950!",
    "dark:border-emerald-500/40! dark:bg-emerald-950/55! dark:text-emerald-50!",
  ].join(" "),
  error: [
    "border-rose-400/55! bg-rose-50/95! text-rose-950!",
    "dark:border-rose-500/45! dark:bg-rose-950/60! dark:text-rose-50!",
  ].join(" "),
  warning: [
    "border-amber-400/55! bg-amber-50/95! text-amber-950!",
    "dark:border-amber-500/45! dark:bg-amber-950/50! dark:text-amber-50!",
  ].join(" "),
  info: [
    "border-cyan-400/50! bg-cyan-50/95! text-cyan-950!",
    "dark:border-cyan-500/35! dark:bg-cyan-950/55! dark:text-cyan-50!",
  ].join(" "),
  loading: [
    "border-indigo-400/50! bg-indigo-50/95! text-indigo-950!",
    "dark:border-indigo-500/40! dark:bg-indigo-950/55! dark:text-indigo-50!",
  ].join(" "),
};

export function Toaster({ ...props }: ComponentProps<typeof Sonner>) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      {...props}
      theme={theme as ComponentProps<typeof Sonner>["theme"]}
      className={props.className}
      richColors={props.richColors ?? false}
      toastOptions={{
        ...props.toastOptions,
        unstyled: true,
        classNames: {
          ...sonnerClassNames,
          ...props.toastOptions?.classNames,
        },
      }}
    />
  );
}

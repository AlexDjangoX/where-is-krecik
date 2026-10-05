"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  CELL,
  HOLE,
  TEXT,
} from "@/components/where-is-krecik/components/panel-styles";

type ShowKrecikToggleProps = {
  checked: boolean;
  onToggle: () => void;
  className?: string;
};

/** Demo-mode switch: when on, Krecik stays visible while he moves. */
export function ShowKrecikToggle({
  checked,
  onToggle,
  className,
}: ShowKrecikToggleProps) {
  const t = useTranslations("where-is-krecik");
  const id = useId();
  const Icon = checked ? Eye : EyeOff;

  return (
    <div
      className={cn(
        CELL,
        "flex items-center justify-between gap-3 px-3 py-2.5 transition-colors",
        checked && "border-amber-400/70 bg-amber-50/80 dark:bg-amber-500/10",
        className,
      )}
    >
      <label
        htmlFor={id}
        className="flex min-w-0 cursor-pointer items-center gap-2.5"
      >
        <span className={cn(HOLE, "size-8")}>
          <Icon
            className={cn(
              "size-4",
              checked ? "text-amber-300" : "text-lime-200",
            )}
          />
        </span>
        <span className="flex flex-col gap-0.5 leading-tight">
          <span className="text-sm font-medium text-lime-950 dark:text-lime-50">
            {t("showToggle.label")}
          </span>
          <span className={cn(TEXT, "text-xs")}>
            {checked ? t("showToggle.demo") : t("showToggle.hidden")}
          </span>
        </span>
      </label>
      <Switch
        id={id}
        data-testid="krecik-show-toggle"
        checked={checked}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-lime-700/25 dark:data-[state=unchecked]:bg-lime-300/25"
      />
    </div>
  );
}

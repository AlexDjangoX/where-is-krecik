"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { PhilosophyDocument } from "@/components/chrome/PhilosophyDocument";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PhilosophyDialog() {
  const t = useTranslations("philosophy");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="philosophy-open"
          aria-label={t("button")}
          className="h-8 rounded-full border-lime-300/80 bg-white/80 px-3 text-xs font-semibold tracking-wide text-lime-950 shadow-none hover:bg-lime-100 dark:border-lime-500/30 dark:bg-lime-950/60 dark:text-lime-100 dark:hover:bg-lime-900/70"
        >
          <BookOpen className="size-3.5" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90dvh,48rem)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border-lime-300/70 bg-lime-50 p-0 sm:max-w-2xl dark:border-lime-500/20 dark:bg-[#111827]">
        <DialogHeader className="shrink-0 border-b border-lime-300/60 px-6 py-4 pr-12 text-left dark:border-lime-500/20">
          <DialogTitle className="text-lime-950 dark:text-lime-50">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-lime-900/70 dark:text-lime-100/70">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <PhilosophyDocument />
        </div>
      </DialogContent>
    </Dialog>
  );
}

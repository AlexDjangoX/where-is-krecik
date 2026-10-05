"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

const KRTEK_URL = "https://en.wikipedia.org/wiki/Krtek";

const TOC_IDS = [
  "why",
  "ritual",
  "setup",
  "moves",
  "growing",
  "board",
  "controls",
] as const;

const rich = {
  strong: (chunks: ReactNode) => (
    <strong className="font-semibold text-lime-950 dark:text-lime-50">
      {chunks}
    </strong>
  ),
  em: (chunks: ReactNode) => <em>{chunks}</em>,
  link: (chunks: ReactNode) => (
    <a
      href={KRTEK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-lime-800 underline underline-offset-2 hover:text-lime-950 dark:text-lime-300 dark:hover:text-lime-100"
    >
      {chunks}
    </a>
  ),
};

function scrollToSection(id: string) {
  document
    .getElementById(`philosophy-${id}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={`philosophy-${id}`} className="scroll-mt-3 space-y-3">
      <h3 className="text-base font-semibold tracking-tight text-lime-950 dark:text-lime-50">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Subheading({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-sm font-semibold text-lime-900 dark:text-lime-100">
      {children}
    </h4>
  );
}

function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-sm leading-relaxed text-lime-950/80 dark:text-lime-50/80 ${className}`}
    >
      {children}
    </p>
  );
}

function NumberedList({
  count,
  item,
}: {
  count: number;
  item: (index: number) => ReactNode;
}) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-lime-950/80 dark:text-lime-50/80">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>{item(i + 1)}</li>
      ))}
    </ol>
  );
}

function BulletList({
  count,
  item,
}: {
  count: number;
  item: (index: number) => ReactNode;
}) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-lime-950/80 dark:text-lime-50/80">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>{item(i + 1)}</li>
      ))}
    </ul>
  );
}

function Pillar({ title, body }: { title: string; body: ReactNode }) {
  return (
    <div className="rounded-xl border border-lime-700/10 bg-lime-50/80 px-3.5 py-3 dark:border-lime-300/10 dark:bg-lime-950/40">
      <p className="text-sm font-semibold text-lime-950 dark:text-lime-50">
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-lime-950/80 dark:text-lime-50/80">
        {body}
      </p>
    </div>
  );
}

export function PhilosophyDocument() {
  const t = useTranslations("philosophy");

  return (
    <article className="space-y-8">
      <nav
        aria-label={t("tocLabel")}
        className="sticky top-0 z-10 -mx-6 -mt-5 flex flex-wrap gap-1.5 border-b border-lime-300/50 bg-lime-50/95 px-6 py-3 backdrop-blur-md dark:border-lime-500/20 dark:bg-[#111827]/95"
      >
        {TOC_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className="rounded-full border border-lime-300/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-lime-900 transition-colors hover:bg-lime-100 dark:border-lime-500/30 dark:bg-lime-950/60 dark:text-lime-100 dark:hover:bg-lime-900/70"
          >
            {t(`toc.${id}`)}
          </button>
        ))}
      </nav>

      <div className="space-y-3">
        <Prose>{t("intro.p1")}</Prose>
        <Prose>{t.rich("intro.p2", rich)}</Prose>
        <Prose>{t("intro.p3")}</Prose>
        <Prose>{t.rich("intro.mole", rich)}</Prose>
      </div>

      <Section id="why" title={t("why.title")}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Pillar
            title={t("why.visualisation.title")}
            body={t("why.visualisation.body")}
          />
          <Pillar title={t("why.logic.title")} body={t("why.logic.body")} />
          <Pillar
            title={t("why.mindfulness.title")}
            body={t.rich("why.mindfulness.body", rich)}
          />
          <Pillar
            title={t("why.imagination.title")}
            body={t("why.imagination.body")}
          />
        </div>
      </Section>

      <Section id="ritual" title={t("ritual.title")}>
        <div className="space-y-3">
          <Subheading>{t("ritual.open.title")}</Subheading>
          <Prose>{t.rich("ritual.open.p1", rich)}</Prose>
          <Prose>{t("ritual.open.p2")}</Prose>
          <Prose>{t("ritual.open.p3")}</Prose>
        </div>
        <div className="space-y-3">
          <Subheading>{t("ritual.close.title")}</Subheading>
          <Prose>{t("ritual.close.lead")}</Prose>
          <NumberedList
            count={4}
            item={(n) => t.rich(`ritual.close.steps.${n}`, rich)}
          />
        </div>
        <div className="space-y-3">
          <Subheading>{t("ritual.listen.title")}</Subheading>
          <Prose>{t.rich("ritual.listen.p1", rich)}</Prose>
          <Prose>{t("ritual.listen.p2")}</Prose>
          <Prose>{t("ritual.listen.p3")}</Prose>
        </div>
        <div className="space-y-3">
          <Subheading>{t("ritual.ask.title")}</Subheading>
          <Prose>{t("ritual.ask.p1")}</Prose>
          <Prose>{t.rich("ritual.ask.p2", rich)}</Prose>
          <Prose>{t.rich("ritual.ask.p3", rich)}</Prose>
        </div>
      </Section>

      <Section id="setup" title={t("setup.title")}>
        <Prose>{t("setup.p1")}</Prose>
        <BulletList count={4} item={(n) => t(`setup.actions.${n}`)} />
        <Prose>{t("setup.p2")}</Prose>
        <Prose>{t("setup.p3")}</Prose>
        <Subheading>{t("setup.againTitle")}</Subheading>
        <div className="overflow-x-auto">
          <table className="w-full min-w-80 border-collapse text-left text-sm">
            <tbody>
              {(["replay", "round", "game"] as const).map((key) => (
                <tr
                  key={key}
                  className="border-b border-lime-300/40 last:border-0 dark:border-lime-500/20"
                >
                  <th className="align-top py-2 pr-3 font-semibold whitespace-nowrap text-lime-950 dark:text-lime-50">
                    {t(`setup.again.${key}.button`)}
                  </th>
                  <td className="py-2 text-lime-950/80 dark:text-lime-50/80">
                    {t(`setup.again.${key}.keeps`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="moves" title={t("moves.title")}>
        <Prose>{t.rich("moves.p1", rich)}</Prose>
        <Prose>{t("moves.p2")}</Prose>
        <Prose>{t("moves.orderLead")}</Prose>
        <NumberedList
          count={5}
          item={(n) => t.rich(`moves.order.${n}`, rich)}
        />
        <Prose>{t.rich("moves.p3", rich)}</Prose>
        <figure className="rounded-xl border border-amber-400/40 bg-amber-50/70 px-3.5 py-3 dark:border-amber-500/25 dark:bg-amber-950/30">
          <figcaption className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            {t("moves.walkthroughTitle")}
          </figcaption>
          <Prose className="mt-2">
            {t.rich("moves.walkthroughSetup", rich)}
          </Prose>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-lime-950/80 dark:text-lime-50/80">
            {([1, 2, 3] as const).map((n) => (
              <li key={n}>{t.rich(`moves.walkthrough.${n}`, rich)}</li>
            ))}
          </ul>
          <Prose className="mt-2">
            {t.rich("moves.walkthroughAnswer", rich)}
          </Prose>
        </figure>
        <Prose>{t("moves.p4")}</Prose>
      </Section>

      <Section id="growing" title={t("growing.title")}>
        <Prose>{t("growing.lead")}</Prose>
        <NumberedList
          count={8}
          item={(n) => t.rich(`growing.steps.${n}`, rich)}
        />
        <Prose>{t("growing.p1")}</Prose>
      </Section>

      <Section id="board" title={t("board.title")}>
        <Prose>{t.rich("board.lead", rich)}</Prose>
        {(
          [
            "holes",
            "rocks",
            "wormholes",
            "coordinates",
            "mole",
            "shake",
            "panel",
          ] as const
        ).map((key) => (
          <div key={key} className="space-y-1">
            <Subheading>{t(`board.${key}.title`)}</Subheading>
            <Prose>{t.rich(`board.${key}.body`, rich)}</Prose>
          </div>
        ))}
      </Section>

      <Section id="controls" title={t("controls.title")}>
        <Prose>{t("controls.lead")}</Prose>
        <BulletList
          count={3}
          item={(n) => t.rich(`controls.items.${n}`, rich)}
        />
        <Prose>{t("controls.p1")}</Prose>
      </Section>
    </article>
  );
}

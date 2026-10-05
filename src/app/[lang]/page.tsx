import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { WhereIsKrecikGame } from "@/components/where-is-krecik/components/WhereIsKrecikGame";
import { routing } from "@/intl/routing";

async function Home({ params }: Pick<PageProps<"/[lang]">, "params">) {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  return <WhereIsKrecikGame />;
}

export default function HomePage(props: PageProps<"/[lang]">) {
  return (
    <Suspense>
      <Home params={props.params} />
    </Suspense>
  );
}

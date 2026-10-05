import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "@/intl/routing";

const handleIntl = createIntlMiddleware(routing);

export default function proxy(request: NextRequest) {
  return handleIntl(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};

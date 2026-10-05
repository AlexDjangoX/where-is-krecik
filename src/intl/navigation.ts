import { routing } from "@/intl/routing";
import { createNavigation } from "next-intl/navigation";

export const { Link, usePathname, useRouter } = createNavigation(routing);

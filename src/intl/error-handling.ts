import { IntlError, IntlErrorCode } from "next-intl";

export function intlOnError(error: IntlError): void {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return;
  }
  console.error(error);
}

export function intlGetMessageFallback(): string {
  return "";
}

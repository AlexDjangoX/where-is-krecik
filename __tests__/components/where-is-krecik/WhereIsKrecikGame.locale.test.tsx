/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-confetti", () => ({
  default: () => null,
}));
import "@testing-library/jest-dom/vitest";

import { WhereIsKrecikGame } from "@/components/where-is-krecik/components/WhereIsKrecikGame";
import en from "@/intl/locales/en/where-is-krecik.json";
import pl from "@/intl/locales/pl/where-is-krecik.json";

afterEach(() => {
  cleanup();
});

function renderGame(locale: "en" | "pl") {
  const messages = locale === "pl" ? pl : en;
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={{ "where-is-krecik": messages }}
    >
      <WhereIsKrecikGame />
    </NextIntlClientProvider>,
  );
}

describe("WhereIsKrecikGame locale", () => {
  it("renders the setup and play controls in English", async () => {
    const user = userEvent.setup();
    renderGame("en");

    expect(
      screen.getByText("Krecik starts at B2. Ready when you are!"),
    ).toBeInTheDocument();
    expect(screen.getByText("Set up the board")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start round" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start round" }));
    expect(
      screen.getByRole("heading", { name: "Move Krecik" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reveal Krecik" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reveal Krecik" }));
    expect(screen.getByText("Did you find him?")).toBeInTheDocument();
    expect(screen.getByText("Krecik was at")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New game" }),
    ).toBeInTheDocument();
  });

  it("renders the setup and play controls in Polish", async () => {
    const user = userEvent.setup();
    renderGame("pl");

    expect(
      screen.getByText("Krecik startuje z B2. Możesz zaczynać!"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ustaw planszę")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Rozpocznij rundę" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Rozpocznij rundę" }));
    expect(
      screen.getByRole("heading", { name: "Rusz Krecikiem" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Odkryj Krecika" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Odkryj Krecika" }));
    expect(screen.getByText("Znaleźliście go?")).toBeInTheDocument();
    expect(screen.getByText("Krecik był na")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nowa gra" }),
    ).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import UserAvatar, { initialsFromEmail } from "./UserAvatar";

describe("initialsFromEmail", () => {
  it("takes two letters from dotted local part", () => {
    expect(initialsFromEmail("sofia.lin@example.com")).toBe("SL");
  });

  it("falls back to the first two characters", () => {
    expect(initialsFromEmail("guest@example.com")).toBe("GU");
  });

  it("uses 我 when email is empty", () => {
    expect(initialsFromEmail(null)).toBe("我");
    expect(initialsFromEmail("")).toBe("我");
  });
});

describe("UserAvatar", () => {
  it("renders initials when signed in", () => {
    render(<UserAvatar email="sofia.lin@example.com" signedIn size={40} />);
    expect(screen.getByTestId("user-avatar")).toHaveTextContent("SL");
  });

  it("renders a guest mark when signed out", () => {
    render(<UserAvatar email={null} signedIn={false} size={22} />);
    expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
    expect(screen.getByTestId("user-avatar")).not.toHaveTextContent("SL");
  });
});

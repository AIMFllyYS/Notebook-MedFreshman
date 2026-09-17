import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import UserAvatar, { initialsFromEmail } from "./UserAvatar";

describe("initialsFromEmail", () => {
  it("uses the first character of the email local part", () => {
    expect(initialsFromEmail("sofia.lin@example.com")).toBe("S");
    expect(initialsFromEmail("guest@example.com")).toBe("G");
  });

  it("uses the first character of 访客 when email is empty", () => {
    expect(initialsFromEmail(null)).toBe("访");
    expect(initialsFromEmail("")).toBe("访");
  });
});

describe("UserAvatar", () => {
  it("renders the first character when signed in", () => {
    render(<UserAvatar email="sofia.lin@example.com" signedIn size={40} />);
    expect(screen.getByTestId("user-avatar")).toHaveTextContent("S");
  });

  it("prefers an explicit name over the email prefix", () => {
    render(<UserAvatar name="苏菲" email="sofia.lin@example.com" signedIn size={40} />);
    expect(screen.getByTestId("user-avatar")).toHaveTextContent("苏");
  });

  it("renders a local image when provided", () => {
    render(
      <UserAvatar
        email="sofia@example.com"
        imageSrc="data:image/png;base64,aaa"
        signedIn
        size={40}
      />,
    );
    expect(screen.getByTestId("user-avatar").querySelector("img")).toHaveAttribute(
      "src",
      "data:image/png;base64,aaa",
    );
  });

  it("renders a guest mark when signed out", () => {
    render(<UserAvatar email={null} signedIn={false} size={22} />);
    expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
    expect(screen.getByTestId("user-avatar")).not.toHaveTextContent("S");
  });
});

import { render, screen } from "@testing-library/react";

import UspBadges from "../UspBadges";

describe("UspBadges", () => {
  it("lists all Claroche differentiators", () => {
    render(<UspBadges />);

    expect(screen.getByRole("heading", { name: /why claroche/i })).toBeVisible();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(screen.getByText(/tailored for movement/i)).toBeVisible();
    expect(screen.getByText(/responsible sourcing/i)).toBeVisible();
    expect(screen.getByText(/lifetime care/i)).toBeVisible();
  });
});

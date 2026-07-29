/**
 * Tests for SummaryCards component
 *
 * Feature: frontend-mobile-api-integration
 *
 * Property 15: SummaryCards values match summary object
 * Validates: Requirements 5.10
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { SummaryCards } from "../../app/components/authority/SummaryCards.js";
import React from "react";

// Feature: frontend-mobile-api-integration, Property 15: SummaryCards values match summary object

describe("SummaryCards — Property 15: values match summary object", () => {
  it("renders the correct count for each named field in the summary object", () => {
    // Feature: frontend-mobile-api-integration, Property 15: SummaryCards values match summary object
    fc.assert(
      fc.property(
        fc.record({
          total:         fc.nat({ max: 10000 }),
          new:           fc.nat({ max: 10000 }),
          open:          fc.nat({ max: 10000 }),
          investigating: fc.nat({ max: 10000 }),
          resolved:      fc.nat({ max: 10000 }),
          active:        fc.nat({ max: 10000 }),
        }),
        (summary) => {
          const { unmount, container } = render(React.createElement(SummaryCards, { summary }));

          try {
            // Scope queries to this render's container to avoid cross-iteration
            // interference when fast-check runs 100 iterations in a single test.
            // Find all card divs (direct children of the grid) and build a label→card map.
            const cards = Array.from(container.firstChild?.children ?? []);

            const findCard = (labelText) =>
              cards.find((card) =>
                Array.from(card.querySelectorAll("*")).some(
                  (el) => el.textContent.trim() === labelText && !el.children.length,
                ),
              );

            const totalCard = findCard("Total Reports");
            const openCard = findCard("Open Cases");
            const investigatingCard = findCard("Under Investigation");
            const resolvedCard = findCard("Resolved Cases");
            const activeCard = findCard("Active Cases");

            const getVal = (card) => card?.querySelector(".font-bold")?.textContent;

            expect(getVal(totalCard)).toBe(String(summary.total));
            expect(getVal(openCard)).toBe(String(summary.open));
            expect(getVal(investigatingCard)).toBe(String(summary.investigating));
            expect(getVal(resolvedCard)).toBe(String(summary.resolved));
            expect(getVal(activeCard)).toBe(String(summary.active));
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("defaults missing summary fields to 0", () => {
    render(React.createElement(SummaryCards, { summary: {} }));

    // All counters should show 0 when summary is empty
    const boldNumbers = document.querySelectorAll(".font-bold.text-navy");
    boldNumbers.forEach((el) => {
      expect(el.textContent).toBe("0");
    });
  });

  it("renders all 5 cards for a fully populated summary", () => {
    const summary = { total: 10, new: 2, open: 3, investigating: 2, resolved: 2, active: 5 };
    render(React.createElement(SummaryCards, { summary }));

    expect(screen.getByText("Total Reports")).toBeInTheDocument();
    expect(screen.getByText("Open Cases")).toBeInTheDocument();
    expect(screen.getByText("Under Investigation")).toBeInTheDocument();
    expect(screen.getByText("Resolved Cases")).toBeInTheDocument();
    expect(screen.getByText("Active Cases")).toBeInTheDocument();
  });

  it("renders 5 cards in a 2-col grid class below md breakpoint (Requirement 13.1)", () => {
    const { container } = render(
      React.createElement(SummaryCards, {
        summary: { total: 1, new: 0, open: 0, investigating: 0, resolved: 0, active: 1 },
      }),
    );

    const grid = container.firstChild;
    // grid-cols-2 must be present for viewports below md
    expect(grid.className).toMatch(/grid-cols-2/);
    // lg:grid-cols-5 for large screens
    expect(grid.className).toMatch(/lg:grid-cols-5/);
  });
});

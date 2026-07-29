/**
 * Tests for EvidenceUpload component
 *
 * Feature: frontend-mobile-api-integration
 *
 * Property 10: File upload validation
 * Validates: Requirements 3.7
 *
 * Also covers: Requirement 12.3 (touch target ≥ 44×44 CSS px)
 */

// Feature: frontend-mobile-api-integration, Property 10: File upload validation

import React from "react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import EvidenceUpload from "../../app/components/Report/EvidenceUpload.js";

// ---------------------------------------------------------------------------
// jsdom doesn't implement URL.createObjectURL — provide a stub
// ---------------------------------------------------------------------------
beforeAll(() => {
  if (typeof URL.createObjectURL === "undefined") {
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:mock-url"),
    });
  } else {
    URL.createObjectURL = vi.fn(() => "blob:mock-url");
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a File with an overridden size (avoids allocating huge buffers). */
const makeFile = (name, type, size) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size, writable: false });
  return file;
};

/**
 * Render EvidenceUpload with minimal react-hook-form stubs.
 * Returns { setValue, getEvidence } for assertions.
 */
const renderComponent = (initialFiles = []) => {
  let evidence = [...initialFiles];
  const watch = vi.fn((field) => (field === "evidence" ? evidence : undefined));
  const setValue = vi.fn((field, value) => {
    if (field === "evidence") evidence = [...value];
  });

  const utils = render(
    React.createElement(EvidenceUpload, { watch, setValue }),
  );

  return { ...utils, watch, setValue, getEvidence: () => evidence };
};

const MAX = 5 * 1024 * 1024; // 5 242 880

// ---------------------------------------------------------------------------
// Unit tests — specific examples
// ---------------------------------------------------------------------------

describe("EvidenceUpload — unit tests", () => {
  it("accepts a valid image file under 5 MB", () => {
    const { setValue } = renderComponent();

    const file = makeFile("photo.jpg", "image/jpeg", 1024 * 1024);
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    const lastCall = setValue.mock.calls[setValue.mock.calls.length - 1];
    expect(lastCall[1]).toContain(file);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("rejects a file that is 1 byte over 5 MB", () => {
    renderComponent();

    const tooBig = makeFile("large.jpg", "image/jpeg", MAX + 1);
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [tooBig] } });

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/large\.jpg/);
    expect(alert.textContent).toMatch(/too large/i);
  });

  it("accepts a file that is exactly 5 MB (boundary)", () => {
    const { setValue } = renderComponent();

    const exact = makeFile("exact.jpg", "image/jpeg", MAX);
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [exact] } });

    const lastCall = setValue.mock.calls[setValue.mock.calls.length - 1];
    expect(lastCall[1]).toContain(exact);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("rejects a non-image file (PDF)", () => {
    renderComponent();

    const pdf = makeFile("document.pdf", "application/pdf", 500);
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [pdf] } });

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/document\.pdf/);
    expect(alert.textContent).toMatch(/only image/i);
  });

  it("rejects a video file", () => {
    renderComponent();

    const video = makeFile("clip.mp4", "video/mp4", 1000);
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [video] } });

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/clip\.mp4/);
    expect(alert.textContent).toMatch(/only image/i);
  });

  it("shows one error entry per rejected file", () => {
    renderComponent();

    const files = [
      makeFile("bad1.pdf", "application/pdf", 100),
      makeFile("bad2.mp4", "video/mp4", 200),
    ];
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files } });

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/bad1\.pdf/);
    expect(alert.textContent).toMatch(/bad2\.mp4/);
  });

  it("does not include rejected files in the form value", () => {
    const { setValue } = renderComponent();

    const bad = makeFile("bad.pdf", "application/pdf", 100);
    const good = makeFile("good.png", "image/png", 100);
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [bad, good] } });

    const lastCall = setValue.mock.calls[setValue.mock.calls.length - 1];
    const evidence = lastCall[1];
    expect(evidence).toContain(good);
    expect(evidence).not.toContain(bad);
  });

  it("upload button has min-h-[44px] and min-w-[44px] classes (Requirement 12.3)", () => {
    renderComponent();

    const btn = screen.getByRole("button", { name: /choose image files to upload/i });
    expect(btn.className).toMatch(/min-h-\[44px\]/);
    expect(btn.className).toMatch(/min-w-\[44px\]/);
  });

  it("drop zone has min-h-[44px] and min-w-[44px] classes (Requirement 12.3)", () => {
    const { container } = renderComponent();

    const dropZone = container.querySelector(".rounded-xl.border-dashed");
    expect(dropZone.className).toMatch(/min-h-\[44px\]/);
    expect(dropZone.className).toMatch(/min-w-\[44px\]/);
  });

  it("input accept attribute is restricted to image/*", () => {
    renderComponent();

    const input = document.querySelector('input[type="file"]');
    expect(input.getAttribute("accept")).toBe("image/*");
  });
});

// ---------------------------------------------------------------------------
// Property 10: File upload validation (property-based)
// Validates: Requirements 3.7
// ---------------------------------------------------------------------------

describe("EvidenceUpload — Property 10: File upload validation", () => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  const nonImageTypes = [
    "application/pdf",
    "video/mp4",
    "text/plain",
    "application/zip",
    "audio/mpeg",
    "application/octet-stream",
  ];

  it(
    "rejects any file with a non-image MIME type or size > 5 MB — shows inline error, excludes from form value",
    () => {
      // Feature: frontend-mobile-api-integration, Property 10: File upload validation
      fc.assert(
        fc.property(
          fc.oneof(
            // Case 1: non-image type, valid size
            fc.record({
              type: fc.constantFrom(...nonImageTypes),
              size: fc.integer({ min: 1, max: MAX }),
            }),
            // Case 2: image type but oversized
            fc.record({
              type: fc.constantFrom(...imageTypes),
              size: fc.integer({ min: MAX + 1, max: MAX + 1024 * 1024 }),
            }),
          ),
          ({ type, size }) => {
            const file = makeFile("testfile.bin", type, size);
            let captured = [];
            const watch = vi.fn((field) => (field === "evidence" ? [] : undefined));
            const setValue = vi.fn((field, value) => {
              if (field === "evidence") captured = [...value];
            });

            const { unmount } = render(
              React.createElement(EvidenceUpload, { watch, setValue }),
            );

            const input = document.querySelector('input[type="file"]');
            fireEvent.change(input, { target: { files: [file] } });

            // File must NOT be in the form value
            expect(captured).not.toContain(file);

            // An inline error must be visible
            const alert = screen.getByRole("alert");
            expect(alert).toBeInTheDocument();
            expect(alert.textContent).toMatch(/testfile\.bin/);

            unmount();
          },
        ),
        { numRuns: 20 },
      );
    },
  );

  it(
    "accepts any image file with size ≤ 5 MB — no error shown, file added to form value",
    () => {
      // Feature: frontend-mobile-api-integration, Property 10: File upload validation
      fc.assert(
        fc.property(
          fc.record({
            type: fc.constantFrom(...imageTypes),
            size: fc.integer({ min: 1, max: MAX }),
          }),
          ({ type, size }) => {
            const file = makeFile("valid-image.img", type, size);
            let captured = [];
            const watch = vi.fn((field) => (field === "evidence" ? [] : undefined));
            const setValue = vi.fn((field, value) => {
              if (field === "evidence") captured = [...value];
            });

            const { unmount } = render(
              React.createElement(EvidenceUpload, { watch, setValue }),
            );

            const input = document.querySelector('input[type="file"]');
            fireEvent.change(input, { target: { files: [file] } });

            // File must be in the form value
            expect(captured).toContain(file);

            // No error should be shown
            expect(screen.queryByRole("alert")).toBeNull();

            unmount();
          },
        ),
        { numRuns: 20 },
      );
    },
  );
});

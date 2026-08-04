/**
 * Tests for CheckStatusForm component
 * Feature: frontend-mobile-api-integration
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server.js";
import React from "react";
import CheckStatusForm from "../../app/components/status/CheckStatusForm.js";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const mockResponse = {
  referenceCode: "ABCD-1234",
  title: "Bullying Incident",
  category: "bullying",
  status: "open",
  submittedAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T12:00:00Z",
  timeline: [
    { event: "submitted", timestamp: "2024-01-15T10:30:00Z", description: "Report was submitted" },
    { event: "updated", timestamp: "2024-01-16T12:00:00Z", description: "Status changed to open" },
  ],
};

describe("CheckStatusForm", () => {
  it("shows validation error for invalid reference code format", async () => {
    render(React.createElement(CheckStatusForm));
    const input = screen.getByRole("textbox", { name: /reference code/i });
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.change(input, { target: { value: "INVALID" } }); });
    await act(async () => { fireEvent.click(button); });

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert").textContent).toMatch(/valid reference code/i);
  });

  it("shows validation error when input is empty", async () => {
    render(React.createElement(CheckStatusForm));
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.click(button); });

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("accepts valid XXXX-XXXX codes and calls the API", async () => {
    let apiCalled = false;
    server.use(
      http.get(`${BASE_URL}/reports/status/:referenceCode`, () => {
        apiCalled = true;
        return HttpResponse.json(mockResponse, { status: 200 });
      }),
    );

    render(React.createElement(CheckStatusForm));
    const input = screen.getByRole("textbox", { name: /reference code/i });
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.change(input, { target: { value: "ABCD-1234" } }); });
    await act(async () => { fireEvent.click(button); });

    await waitFor(() => expect(apiCalled).toBe(true));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not call API for codes missing hyphen", async () => {
    let apiCalled = false;
    server.use(
      http.get(`${BASE_URL}/reports/status/:referenceCode`, () => {
        apiCalled = true;
        return HttpResponse.json({}, { status: 200 });
      }),
    );

    render(React.createElement(CheckStatusForm));
    const input = screen.getByRole("textbox", { name: /reference code/i });
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.change(input, { target: { value: "ABCD1234" } }); });
    await act(async () => { fireEvent.click(button); });

    expect(apiCalled).toBe(false);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("displays all required fields from a 200 response", async () => {
    server.use(
      http.get(`${BASE_URL}/reports/status/:referenceCode`, () =>
        HttpResponse.json(mockResponse, { status: 200 }),
      ),
    );

    render(React.createElement(CheckStatusForm));
    const input = screen.getByRole("textbox", { name: /reference code/i });
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.change(input, { target: { value: "ABCD-1234" } }); });
    await act(async () => { fireEvent.click(button); });

    await waitFor(() => expect(screen.getByText("Bullying Incident")).toBeInTheDocument());
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getAllByText(/bullying/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Report was submitted")).toBeInTheDocument();
    expect(screen.getByText("Status changed to open")).toBeInTheDocument();
  });

  it('shows "No report found" on 404', async () => {
    server.use(
      http.get(`${BASE_URL}/reports/status/:referenceCode`, () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 }),
      ),
    );

    render(React.createElement(CheckStatusForm));
    const input = screen.getByRole("textbox", { name: /reference code/i });
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.change(input, { target: { value: "ZZZZ-9999" } }); });
    await act(async () => { fireEvent.click(button); });

    await waitFor(() =>
      expect(screen.getByText(/no report found for that reference code/i)).toBeInTheDocument(),
    );
  });

  it("disables submit button while request is in-flight", async () => {
    server.use(
      http.get(`${BASE_URL}/reports/status/:referenceCode`, async () => {
        await new Promise((r) => setTimeout(r, 50));
        return HttpResponse.json(mockResponse, { status: 200 });
      }),
    );

    render(React.createElement(CheckStatusForm));
    const input = screen.getByRole("textbox", { name: /reference code/i });
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.change(input, { target: { value: "WXYZ-5678" } }); });

    act(() => { fireEvent.click(button); });
    expect(button).toBeDisabled();

    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("accepts lowercase codes (case-insensitive)", async () => {
    let calledWith = null;
    server.use(
      http.get(`${BASE_URL}/reports/status/:referenceCode`, ({ params }) => {
        calledWith = params.referenceCode;
        return HttpResponse.json({ ...mockResponse, title: "Case Test" }, { status: 200 });
      }),
    );

    render(React.createElement(CheckStatusForm));
    const input = screen.getByRole("textbox", { name: /reference code/i });
    const button = screen.getByRole("button", { name: /check status/i });

    await act(async () => { fireEvent.change(input, { target: { value: "abcd-1234" } }); });
    await act(async () => { fireEvent.click(button); });

    await waitFor(() => expect(screen.getByText("Case Test")).toBeInTheDocument());
    expect(calledWith).toBe("ABCD-1234");
  });
});

import { test, expect } from "@playwright/test";

test("sessions endpoint responds", async ({ request }) => {
  const response = await request.get("/api/sessions");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(Array.isArray(body)).toBeTruthy();
});

test("export endpoint handles missing session", async ({ request }) => {
  const response = await request.get("/api/export/does-not-exist?format=json");
  expect(response.status()).toBe(404);
});

test("replay endpoint handles missing session", async ({ request }) => {
  const response = await request.post("/api/replay/does-not-exist", {
    data: { mode: "mock" },
  });
  expect(response.status()).toBe(404);
});

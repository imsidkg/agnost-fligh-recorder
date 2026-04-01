# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flight-recorder.spec.ts >> replay endpoint handles missing session
- Location: tests/e2e/flight-recorder.spec.ts:15:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 500
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("sessions endpoint responds", async ({ request }) => {
  4  |   const response = await request.get("/api/sessions");
  5  |   expect(response.ok()).toBeTruthy();
  6  |   const body = await response.json();
  7  |   expect(Array.isArray(body)).toBeTruthy();
  8  | });
  9  | 
  10 | test("export endpoint handles missing session", async ({ request }) => {
  11 |   const response = await request.get("/api/export/does-not-exist?format=json");
  12 |   expect(response.status()).toBe(404);
  13 | });
  14 | 
  15 | test("replay endpoint handles missing session", async ({ request }) => {
  16 |   const response = await request.post("/api/replay/does-not-exist", {
  17 |     data: { mode: "mock" },
  18 |   });
> 19 |   expect(response.status()).toBe(404);
     |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  20 | });
  21 | 
```
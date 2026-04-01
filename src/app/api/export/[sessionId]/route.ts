import { getSessionWithEvents } from "@/lib/flight-recorder/store";
import { NextResponse } from "next/server";

const asTsTest = (payload: unknown) => `import { describe, it, expect } from "vitest";

const fixture = ${JSON.stringify(payload, null, 2)};

describe("recorded session replay", () => {
  it("has successful events", () => {
    expect(fixture.events.every((e: any) => e.success)).toBeTruthy();
  });
});
`;

const asPytestFixture = (payload: unknown) => `import json
import pytest

@pytest.fixture
def recorded_session():
    return json.loads('''${JSON.stringify(payload)}''')
`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "json";
  const data = await getSessionWithEvents(sessionId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (format === "pytest") {
    return new NextResponse(asPytestFixture(data), {
      headers: { "Content-Type": "text/x-python" },
    });
  }
  if (format === "ts") {
    return new NextResponse(asTsTest(data), {
      headers: { "Content-Type": "text/typescript" },
    });
  }
  return NextResponse.json(data);
}

import { getSessionWithEvents } from "@/lib/flight-recorder/store";
import { NextResponse } from "next/server";

type SessionPayload = Awaited<ReturnType<typeof getSessionWithEvents>>;

const asTsTest = (payload: SessionPayload) => `import { describe, it, expect } from "vitest";

const fixture = ${JSON.stringify(payload, null, 2)};

describe("recorded session replay", () => {
  it("matches deterministic shape", () => {
    expect(fixture.session.sessionId).toBe("${payload?.session.sessionId ?? ""}");
    expect(fixture.events.length).toBe(${payload?.events.length ?? 0});
    expect(fixture.events.map((e: any) => e.primitiveName)).toMatchSnapshot();
  });
});
`;

const asPytestFixture = (payload: SessionPayload) => `import json
import pytest

@pytest.fixture
def recorded_session():
    return json.loads('''${JSON.stringify(payload)}''')

def test_deterministic_shape(recorded_session):
    assert recorded_session["session"]["sessionId"] == "${payload?.session.sessionId ?? ""}"
    assert len(recorded_session["events"]) == ${payload?.events.length ?? 0}
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
  if (format === "bundle") {
    return NextResponse.json({
      files: {
        "session.json": JSON.stringify(data, null, 2),
        "recorded_session.py": asPytestFixture(data),
        "recorded_session.spec.ts": asTsTest(data),
      },
    });
  }
  return NextResponse.json(data);
}

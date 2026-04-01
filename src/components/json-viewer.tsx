"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function JsonViewer({ value }: { value: unknown }) {
  return (
    <MonacoEditor
      height="220px"
      language="json"
      theme="vs-dark"
      options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12 }}
      value={JSON.stringify(value, null, 2)}
    />
  );
}

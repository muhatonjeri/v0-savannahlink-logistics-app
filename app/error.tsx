"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h2>
      <p style={{ color: "#888", fontSize: "14px" }}>{error.message}</p>
      <button onClick={reset} style={{ padding: "8px 16px", background: "#e67e22", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Try again</button>
    </div>
  );
}

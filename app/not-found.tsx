export default function NotFound() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#0a1628", color: "white" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 800, color: "#e67e22" }}>404</h1>
      <p style={{ fontSize: "1.2rem", marginTop: "8px" }}>Page not found</p>
      <a href="/admin" style={{ marginTop: "16px", padding: "8px 20px", background: "#e67e22", color: "white", borderRadius: "8px", textDecoration: "none" }}>Go to Dashboard</a>
    </div>
  );
}

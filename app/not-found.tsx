import Link from "next/link";
export default function NotFound() {
  return (
    <html><body style={{background:"#0a1628",color:"white",fontFamily:"Arial",display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",margin:0,textAlign:"center"}}>
      <div>
        <div style={{fontSize:"64px",marginBottom:"16px"}}>404</div>
        <h1 style={{color:"#e67e22",marginBottom:"8px"}}>Page Not Found</h1>
        <p style={{color:"#9ca3af",marginBottom:"24px"}}>This page doesn&apos;t exist.</p>
        <Link href="/admin" style={{background:"#e67e22",color:"white",padding:"12px 24px",borderRadius:"12px",textDecoration:"none",fontWeight:600}}>
          Go to Admin
        </Link>
      </div>
    </body></html>
  );
}

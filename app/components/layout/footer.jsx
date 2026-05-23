import Image from "next/image";

export default function Footer() {

  return (    
    <>
      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "0.75rem" }}>
          <a href="/terms" className="footer-link" style={{ fontSize: 16, color: "#6b7280", textDecoration: "none", transition: "color 0.15s ease" }}>Terms of Service</a>
          <a href="./" className="nav-logo-wrap" style={{ color: "#9ca3af", textDecoration: "none" }}>
            <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 200, width: "auto" }} />
          </a>
          <a href="/setup" className="footer-link" style={{ fontSize: 16, color: "#6b7280", textDecoration: "none", transition: "color 0.15s ease" }}>Setup</a>
        </div>
        <p style={{ fontSize: 13, color: "#4b5563" }}>© {new Date().getFullYear()} North Hill Systems LLC. All rights reserved.</p>
      </footer>
    </>
  );
}
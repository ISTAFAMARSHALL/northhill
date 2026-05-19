"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

const S = {
  page:   { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", padding: "2rem" },
  card:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "2rem" },
  label:  { display: "block", fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 },
  input:  { width: "100%", padding: "10px 13px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: "0.9rem" },
  btn:    { padding: "10px 20px", borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" },
  btnSm:  { padding: "6px 14px", borderRadius: 6, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" },
  error:  { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: "1rem" },
  badge: (status) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: status === "active" ? "rgba(16,185,129,0.15)" : status === "invoiced" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
    color:      status === "active" ? "#10b981"               : status === "invoiced" ? "#f59e0b"               : "#818cf8",
    border: `1px solid ${status === "active" ? "rgba(16,185,129,0.3)" : status === "invoiced" ? "rgba(245,158,11,0.3)" : "rgba(99,102,241,0.3)"}`,
  }),
};

function LoginScreen({ onGitHubLogin, error, loading }) {
  return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem", justifyContent: "center" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 100, width: "auto" }} />
        </div>
        <div style={S.card}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "#fff", marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.5rem" }}>Sign in with the GitHub account linked to your Supabase admin profile.</p>
          {error && <div style={S.error}>{error}</div>}
          <button onClick={onGitHubLogin} style={{ ...S.btn, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            {loading ? "Redirecting…" : "Continue with GitHub"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivateModal({ order, onClose, onSuccess, accessToken }) {
  const [serverUrl, setServerUrl]   = useState("");
  const [username,  setUsername]    = useState("");
  const [password,  setPassword]    = useState("");
  const [startDate, setStartDate]   = useState(new Date().toISOString().slice(0, 10));
  const [endDate,   setEndDate]     = useState("");
  const [loading,   setLoading]     = useState(false);
  const [error,     setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          orderId:       order.id,
          userId:        order.user_id,
          userEmail:     order.user_email,
          userName:      order.user_name,
          planName:      order.plan_name,
          planTerm:      order.plan_term,
          connections:   order.connections,
          price:         order.price,
          iptvServerUrl: serverUrl,
          iptvUsername:  username,
          iptvPassword:  password,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Activation failed");
      onSuccess(order.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ ...S.card, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Activate Subscription</h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>{order.user_name || order.user_email} · {order.plan_name} {order.plan_term}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: "1.25rem", fontSize: 13 }}>
          <span style={{ color: "#9ca3af" }}>Amount: </span>
          <span style={{ color: "#10b981", fontWeight: 700 }}>${order.price}</span>
          <span style={{ color: "#9ca3af", marginLeft: 16 }}>Connections: </span>
          <span style={{ color: "#e8e8f0", fontWeight: 600 }}>{order.connections}</span>
        </div>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={S.label}>IPTV Server URL</label>
          <input type="url" required value={serverUrl} onChange={e => setServerUrl(e.target.value)} placeholder="http://iptv.example.com:8080" style={S.input} />

          <label style={S.label}>IPTV Username</label>
          <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="username" style={S.input} />

          <label style={S.label}>IPTV Password</label>
          <input type="text" required value={password} onChange={e => setPassword(e.target.value)} placeholder="password" style={S.input} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={S.label}>Start Date</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} style={S.input} />
            </div>
            <div>
              <label style={S.label}>End Date</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} style={S.input} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} style={{ ...S.btn, background: "rgba(255,255,255,0.06)", flex: 1 }}>Cancel</button>
            <button type="submit" style={{ ...S.btn, flex: 2 }} disabled={loading}>
              {loading ? "Activating…" : "Activate & Email Customer →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, accessToken, onSignOut }) {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [activating,  setActivating]  = useState(null);
  const [successIds,  setSuccessIds]  = useState(new Set());
  const [filter,      setFilter]      = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Comment out above before using the below code //
  // // PATCH: Step 1 — wipe state
  // const [wiping,      setWiping]      = useState(false);
  // const [wipeResult,  setWipeResult]  = useState(null);

  // const fetchOrders = async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     const res = await fetch("/api/admin/orders", {
  //       headers: { "Authorization": `Bearer ${accessToken}` },
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.error || "Failed to load orders");
  //     setOrders(data.orders || []);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // PATCH: Step 2 — wipe handler
  // const handleWipeTestData = async () => {
  //   if (!window.confirm(
  //     "⚠️ This will DELETE all orders and subscriptions from Supabase " +
  //     "AND all invoices and customers from Wave.\n\n" +
  //     "Only use this during testing. Are you sure?"
  //   )) return;

  //   setWiping(true);
  //   setWipeResult(null);
  //   try {
  //     const res = await fetch("/api/dev/cleanup", {
  //       method: "POST",
  //       headers: { "Authorization": `Bearer ${accessToken}` },
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.error);
  //     setWipeResult(data.results);
  //     setOrders([]); // clear table immediately
  //   } catch (err) {
  //     alert(`Wipe failed: ${err.message}`);
  //   } finally {
  //     setWiping(false);
  //   }
  // };


  useEffect(() => { if (accessToken) fetchOrders(); }, [accessToken]);

  const handleSuccess = (orderId) => {
    setSuccessIds(prev => new Set([...prev, orderId]));
    setActivating(null);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "active" } : o));
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const counts   = { all: orders.length, pending: orders.filter(o => o.status === "pending").length, invoiced: orders.filter(o => o.status === "invoiced").length, active: orders.filter(o => o.status === "active").length };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 100, width: "auto" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{user.email}</span>
            {/* PATCH: Step 3 — Wipe Test Data button (non-production only) */}
            {/* {process.env.NODE_ENV !== "production" && (
              <button
                onClick={handleWipeTestData}
                disabled={wiping}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {wiping ? "Wiping…" : "🗑 Wipe Test Data"}
              </button>
            )} */}
          <button onClick={onSignOut} style={{ ...S.btn, background: "rgba(255,255,255,0.06)", fontSize: 13, padding: "7px 14px" }}>Sign Out</button>
        </div>
      </div>

      {/* PATCH: Step 4 — Wipe result banner */}
      {/* {wipeResult && (
        <div style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 13,
          color: "#10b981",
          marginBottom: "1rem",
        }}>
          ✅ Wiped: {wipeResult.wave.invoicesDeleted} Wave invoices,
          {" "}{wipeResult.wave.customersDeleted} Wave customers,
          Supabase orders + subscriptions cleared.
          {wipeResult.wave.errors.length > 0 && (
            <span style={{ color: "#fbbf24", marginLeft: 8 }}>
              ⚠️ {wipeResult.wave.errors.length} warning(s) — check console.
            </span>
          )}
        </div>
      )} */}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Orders", value: counts.all, color: "#a78bfa" },
          { label: "Pending",      value: counts.pending,  color: "#818cf8" },
          { label: "Invoiced",     value: counts.invoiced, color: "#f59e0b" },
          { label: "Active",       value: counts.active,   color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Service Orders</h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {["all","pending","invoiced","active"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", background: filter === f ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)", color: filter === f ? "#a78bfa" : "#6b7280" }}>
                {f.charAt(0).toUpperCase() + f.slice(1)} {f !== "all" && `(${counts[f]})`}
              </button>
            ))}
            <button onClick={fetchOrders} style={{ ...S.btn, padding: "5px 12px", fontSize: 12, marginLeft: 4 }}>Refresh</button>
          </div>
        </div>

        {error && <div style={S.error}>{error}</div>}

        {loading ? (
          <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", padding: "2rem" }}>Loading orders…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", padding: "2rem" }}>No orders found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Customer","Plan","Term","Connections","Amount","Status","Date","Action"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", color: "#6b7280", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600, color: "#e8e8f0" }}>{order.user_name || "—"}</div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>{order.user_email}</div>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#e8e8f0" }}>{order.plan_name}</td>
                    <td style={{ padding: "10px 12px", color: "#9ca3af" }}>{order.plan_term}</td>
                    <td style={{ padding: "10px 12px", color: "#9ca3af", textAlign: "center" }}>{order.connections}</td>
                    <td style={{ padding: "10px 12px", color: "#10b981", fontWeight: 700 }}>${order.price}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={S.badge(successIds.has(order.id) ? "active" : order.status)}>
                        {successIds.has(order.id) ? "active" : order.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {(order.status !== "active" && !successIds.has(order.id)) ? (
                        <button onClick={() => setActivating(order)} style={S.btnSm}>
                          Activate
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "#10b981" }}>✓ Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activating && (
        <ActivateModal
          order={activating}
          accessToken={accessToken}
          onClose={() => setActivating(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [user,        setUser]        = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [loginError,  setLoginError]  = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGitHubLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      setLoginError(error.message);
      setLoginLoading(false);
    }
    // On success the browser redirects to GitHub — loading stays true
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // After GitHub OAuth redirect, check if the logged-in user is the admin
  useEffect(() => {
    if (user && process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      supabase.auth.signOut();
      setLoginError("Access denied. This panel is admin-only.");
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
        <p style={{ color: "#6b7280" }}>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onGitHubLogin={handleGitHubLogin} error={loginError} loading={loginLoading} />;
  }

  return <Dashboard user={user} accessToken={accessToken} onSignOut={handleSignOut} />;
}

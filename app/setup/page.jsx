"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const DEVICES = [
  { id: "firestick", label: "🔥 Fire TV Stick / Cube", app: "TiviMate" },
  { id: "android",    label: "🤖 Android TV / Phone / Tablet", app: "IPTV Smarters Pro" },
  { id: "appletv",   label: "🍎 Apple TV / iPhone / iPad", app: "TiviMax" },
];

const FIRESTICK_STEPS = [
  { num:"01", icon:"📲", title:"Download TiviMate", body:"On your Firestick or Android TV home screen, open the Amazon App Store or Google Play Store and search for TiviMate IPTV Player. Install the free version. A TiviMate Companion subscription unlocks advanced features including multiple playlists, recordings, and parental controls — optional but recommended.", note:null },
  { num:"02", icon:"▶️", title:"Open TiviMate and Add a Playlist", body:"Launch TiviMate. On the welcome screen tap Add Playlist. If you have used the app before go to Settings → Playlists → Add Playlist.", note:null },
  { num:"03", icon:"🔑", title:"Choose Xtream Codes Login", body:"Select Xtream Codes login from the three options presented. This uses your Server URL, Username, and Password to connect directly.", note:null },
  { num:"04", icon:"✏️", title:"Enter Your Credentials", body:"Fill in your Server URL, Username, and Password exactly as provided in your welcome email. Both are case sensitive.", fields:[{label:"Server URL",desc:"Full address including port — e.g. http://server.com:8080"},{label:"Username",desc:"Exactly as provided — case sensitive"},{label:"Password",desc:"Exactly as provided — case sensitive"}], note:null },
  { num:"05", icon:"⏳", title:"Load Channels and EPG", body:"Tap Add. TiviMate will connect and begin loading your 15,804+ channels, 42,590+ movies, and 7,841+ TV shows. The first load may take 1–3 minutes. Wait for the progress bar to complete.", note:{text:"Do not close the app during the initial load. Wait for the progress bar to complete fully.",type:"warning"} },
  { num:"06", icon:"📺", title:"Start Watching", body:"Your channel categories appear on the home screen. Browse by group, use search, or open the TV Guide (EPG) to see what is on now. Tap any channel to start streaming.", note:null },
];

const ANDROID_STEPS = [
  { num:"01", icon:"📲", title:"Download TiviMate", body:"Open the Google Play Store on your Android phone or tablet. Search for TiviMate IPTV Player and install it.", note:{text:"TiviMate works best in landscape orientation on phones. The TV guide is optimized for horizontal viewing.",type:"info"} },
  { num:"02", icon:"🔑", title:"Follow the Same Setup Steps", body:"The setup is identical to the Firestick guide — open TiviMate, tap Add Playlist, select Xtream Codes login, and enter your Server URL, Username, and Password.", note:null },
  { num:"03", icon:"📺", title:"Start Watching", body:"Browse your full channel library, movies, and TV shows. All TiviMate features including EPG, favorites, and picture-in-picture work on Android phones and tablets.", note:null },
];

const IPHONE_STEPS = [
  { num:"01", icon:"📲", title:"Download IPTV Smarters Pro", body:"Open the App Store on your iPhone or iPad. Search for IPTV Smarters Pro and install it. It is free with optional in-app features. If unavailable in your region, search for GSE Smart IPTV as an alternative.", note:null },
  { num:"02", icon:"▶️", title:"Open the App and Add a User", body:"Launch IPTV Smarters Pro. On the home screen tap Add User.", note:null },
  { num:"03", icon:"🔑", title:"Select Xtream Codes API", body:"Choose Login with Xtream Codes API from the options presented.", note:null },
  { num:"04", icon:"✏️", title:"Enter Your Credentials", body:"Give your profile a name (e.g. North Hill), then fill in your Server URL, Username, and Password exactly as provided.", fields:[{label:"Name",desc:"Any name you choose — e.g. North Hill"},{label:"Server URL",desc:"Full address including port — e.g. http://server.com:8080"},{label:"Username",desc:"Exactly as provided — case sensitive"},{label:"Password",desc:"Exactly as provided — case sensitive"}], note:null },
  { num:"05", icon:"⏳", title:"Load Channels", body:"Tap Add User. The app will connect and load your full channel list, VOD library, and EPG. First load may take a minute.", note:null },
  { num:"06", icon:"📺", title:"Browse and Watch", body:"Select your profile from the home screen. Navigate between Live TV, Movies, and Series. Use search to find specific channels or content.", note:null },
];

const APPLETV_STEPS = [
  { num:"01", icon:"📲", title:"Download TiviMax", body:"On your Apple TV home screen, open the App Store. Search for TiviMax and install it.", note:{text:"Tip: Use the Remote app on your iPhone (Control Center → Apple TV Remote) to type your credentials faster — much easier than the on-screen keyboard.",type:"info"} },
  { num:"02", icon:"▶️", title:"Open TiviMax", body:"Launch TiviMax from your Apple TV home screen.", note:null },
  { num:"03", icon:"⚙️", title:"Navigate to Settings → Playlists", body:"From the TiviMax home screen, go to Settings then select Playlists and tap Add Playlist.", note:null },
  { num:"04", icon:"🔑", title:"Select Xtream Codes", body:"Choose Xtream Codes as the playlist type.", note:null },
  { num:"05", icon:"✏️", title:"Enter Your Credentials", body:"Enter your Server URL, Username, and Password. Use the iPhone Remote app for faster text input.", fields:[{label:"Server URL",desc:"Full address including port — e.g. http://server.com:8080"},{label:"Username",desc:"Exactly as provided — case sensitive"},{label:"Password",desc:"Exactly as provided — case sensitive"}], note:null },
  { num:"06", icon:"📺", title:"Load and Watch", body:"Save your playlist. TiviMax will load your channels and EPG. Once complete browse your full channel lineup and start watching.", note:null },
];

const STEPS_MAP = { firestick:FIRESTICK_STEPS, android:ANDROID_STEPS, iphone:IPHONE_STEPS, appletv:APPLETV_STEPS };

const DOWNLOAD_LINKS = {
  firestick: [
    {
      label: "Watch Install Tutorial",
      sublabel: "YouTube — full 2026 walkthrough",
      icon: "▶️",
      href: "https://www.youtube.com/watch?v=wpcIXUqku40",
      primary: true,
    },
    {
      label: "Sideload via Downloader",
      sublabel: "Firestick — use code 272483",
      icon: "📥",
      href: "https://www.amazon.com/AFTVnews-com-Downloader/dp/B01N0BP507",
      primary: false,
      code: "272483",
    },
  ],
  android: [
    {
      label: "Google Play",
      sublabel: "Android phones & tablets",
      icon: "🟢",
      image: "/google-play-badge.png",
      href: "https://play.google.com/store/apps/details?id=com.smart.iptvplayer_smarterspro",
      primary: true,
    },
  ],
  iphone: [
    {
      label: "App Store",
      sublabel: "iPhone & iPad",
      icon: "🍎",
      image: "icon_appstore.png",
      href: "https://apps.apple.com/us/app/iptv-smarters-pro-live-vod/id6478442199",
      primary: true,
    },
  ],
  appletv: [
    {
      label: "App Store",
      sublabel: "Apple TV",
      icon: "🍎",
      image: "/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg",
      href: "https://apps.apple.com/us/app/tivimax-iptv-player-premium/id1632953327",
      primary: true,
    },
  ],
};

const TIVIMATE_FEATURES = [
  { name:"TV Guide (EPG)",       desc:"Press Menu on your remote from any channel to open the full program guide. Browse upcoming shows and schedule viewing." },
  { name:"Favorites",            desc:"Long-press Select on any channel and choose Add to Favorites. Scroll through only your favorite channels for a personal lineup." },
  { name:"Groups / Categories",  desc:"Menu → Group Options → Manage Groups to hide, reorder, or remove channel categories you don't use." },
  { name:"Picture in Picture",   desc:"While watching fullscreen, select PIP to keep your stream playing while using other apps." },
  { name:"Parental Controls",    desc:"Settings → Parental Controls. Set a PIN to restrict access to playlists, groups, or specific channels." },
  { name:"Subtitles",            desc:"Long-press Select while watching, choose CC, and switch to Closed Captions 1. Availability varies by channel." },
  { name:"Audio Sync",           desc:"Press Select while watching and adjust Audio Offset up or down if audio and video don't match." },
  { name:"External Player",      desc:"After selecting a channel choose Open in External Player to use VLC or MX Player." },
  { name:"Recordings",           desc:"Long-press any EPG entry to schedule a recording. Requires a USB drive formatted as FAT32." },
  { name:"EPG Settings",         desc:"Settings → EPG: Set Past Days to 1, Update Interval to 24 hours, Update on Playlist Change to On." },
];

const REMOTE_KEYS = [
  { btn:"Select",        action:"Open channel / Show options while playing" },
  { btn:"Back",          action:"Return to TV Guide / Show channel groups" },
  { btn:"Left / Right",  action:"Scroll through previous / next programs in EPG" },
  { btn:"Up / Down",     action:"Scroll up and down through channels" },
  { btn:"Rewind",        action:"Scroll channels up without changing channel" },
  { btn:"Fast Forward",  action:"Scroll channels down without changing channel" },
  { btn:"Menu (☰)",     action:"Group options, playlist management, EPG settings" },
];

const TROUBLESHOOTING = [
  { issue:"Channels not loading",         fix:"Check internet speed (min 10 Mbps per stream). Remove and re-add your playlist." },
  { issue:"Wrong credentials error",      fix:"Username and password are case sensitive. Copy and paste directly from your email." },
  { issue:"Buffering or freezing",        fix:"Test internet speed. Use wired ethernet if possible. Try a different channel to isolate." },
  { issue:"EPG / Guide not showing",      fix:"Go to app settings and select Update EPG. Allow up to 5 minutes to fully reload." },
  { issue:"App won't connect",            fix:"Confirm Server URL includes the port number (e.g. :8080). Remove any trailing slash." },
  { issue:"No sound on a channel",        fix:"Press Select / OK while watching and check audio track options — some channels have multiple tracks." },
  { issue:"Audio out of sync with video", fix:"In TiviMate press Select while watching and adjust the Audio Offset until they match." },
  { issue:"App crashes on load",          fix:"Delete and reinstall the app. Make sure device firmware and app are fully updated." },
];

function DownloadBar({ deviceId }) {
  const links = DOWNLOAD_LINKS[deviceId] || [];
  if (!links.length) return null;
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <p style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem", fontWeight: 600 }}>
        Download the app
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {links.map((link, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>

            {link.image ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                >
                <Image 
                  src={link.image}
                  alt="Google Play"
                  width={200}
                  height={80}
                  priority
                  style={{
                    width: "180px",
                    height: "auto",
                  }}
                />
              </a>) 
              : 
            null}

            {link.image ? null 
            : 
            (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: link.primary ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.06)",
                  border: link.primary ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", padding: "10px 18px", borderRadius: 9,
                  textDecoration: "none", transition: "opacity 0.15s",
                  fontSize: 13, fontWeight: 600,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{link.label}</div>
                  <div style={{ fontSize: 11, color: link.primary ? "rgba(255,255,255,0.75)" : "#6b7280", fontWeight: 400 }}>{link.sublabel}</div>
                </div>
              </a>
            )}
            {link.code && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#fbbf24" }}>
                ⌨️ Downloader code: <strong style={{ letterSpacing: "0.1em" }}>{link.code}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({ step }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"1.25rem 1.4rem", display:"flex", gap:"1rem", alignItems:"flex-start" }}>
      <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0, marginTop:2 }}>
        {step.num}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
          <span style={{ fontSize:16 }}>{step.icon}</span>
          <h3 style={{ fontSize:15, fontWeight:600, color:"#fff" }}>{step.title}</h3>
        </div>
        <p style={{ fontSize:13, color:"#9ca3af", lineHeight:1.7, marginBottom:step.fields||step.note?"0.75rem":0 }}>{step.body}</p>
        {step.fields && (
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:step.note?"0.75rem":0 }}>
            {step.fields.map(f => (
              <div key={f.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, padding:"7px 12px", display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa", minWidth:80, marginTop:1, letterSpacing:"0.04em", flexShrink:0 }}>{f.label}</span>
                <span style={{ fontSize:12, color:"#9ca3af", lineHeight:1.5 }}>{f.desc}</span>
              </div>
            ))}
          </div>
        )}
        {step.note && (
          <div style={{ background:step.note.type==="warning"?"rgba(245,158,11,0.08)":"rgba(124,58,237,0.08)", border:`1px solid ${step.note.type==="warning"?"rgba(245,158,11,0.25)":"rgba(124,58,237,0.25)"}`, borderRadius:8, padding:"8px 12px", fontSize:12, color:step.note.type==="warning"?"#fbbf24":"#a78bfa", lineHeight:1.6 }}>
            {step.note.type==="warning"?"⚠️ ":"ℹ️ "}{step.note.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SetupPage() {
  const [activeDevice, setActiveDevice] = useState("firestick");
  const steps  = STEPS_MAP[activeDevice];
  const device = DEVICES.find(d => d.id === activeDevice);

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#0a0a0f", minHeight:"100vh", color:"#e8e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} body{background:#0a0a0f}
        .device-tab:hover{border-color:rgba(124,58,237,0.4)!important;color:#e8e8f0!important}
        .feat-row:hover{background:rgba(124,58,237,0.05)!important}
        .ts-row:hover{background:rgba(255,255,255,0.02)!important}
        .nav-link:hover{color:#e8e8f0!important}
        .dl-btn:hover{opacity:0.88} .support-btn:hover{opacity:0.88}
        .portal-btn:hover{background:rgba(255,255,255,0.1)!important}
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-logo-wrap img { height: 150px !important; width: auto !important; }
          .nav-logo-wrap span { height: 44px !important; width: auto !important; }
        }
      `}</style>

      {/* NAV — always fully active */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 80, padding: "0 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <a href="./" className="nav-logo-wrap" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/logo.png" width={1024} height={1024} alt="North Hill Systems" loading="eager" priority style={{ height: 250, width: "auto" }} />
        </a>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div className="nav-links-desktop" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link href="/" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>← Home</Link>
            <a href="/portal" className="nav-link" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.15s ease" }}>Account</a>
          </div>
          <a href="/northhill-setup-guide.pdf" download className="dl-btn" style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:600, textDecoration:"none", transition:"opacity 0.15s" }}>↓ PDF Guide</a>
        </div>
      </nav>

      <div style={{ maxWidth:820, margin:"0 auto", padding:"3rem 1.5rem 5rem" }}>

        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:20, padding:"5px 14px", fontSize:12, color:"#a78bfa", marginBottom:"1.25rem" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
            Setup Guide
          </div>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#fff", marginBottom:"0.75rem", lineHeight:1.15 }}>Get streaming in minutes</h1>
          <p style={{ fontSize:15, color:"#9ca3af", lineHeight:1.7, maxWidth:540, margin:"0 auto" }}>
            Choose your device below. We recommend <strong style={{ color:"#e8e8f0" }}>TiviMate</strong> for Android and Firestick, <strong style={{ color:"#e8e8f0" }}>TiviMax</strong> for Apple TV, and <strong style={{ color:"#e8e8f0" }}>IPTV Smarters Pro</strong> for iPhone and iPad.
          </p>
        </div>

        <div style={{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"2rem", display:"flex", alignItems:"flex-start", gap:12 }}>
          <span style={{ fontSize:20, flexShrink:0 }}>🔐</span>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:"#e8e8f0", marginBottom:3 }}>Have your credentials ready</p>
            <p style={{ fontSize:13, color:"#9ca3af", lineHeight:1.6 }}>
              Your Server URL, Username, and Password were emailed when your account was activated. Find them anytime in your{" "}
              <Link href="/portal" style={{ color:"#a78bfa", textDecoration:"none" }}>Account Portal →</Link>
            </p>
          </div>
        </div>

        <div className="device-tabs" style={{ display:"flex", gap:"0.75rem", marginBottom:"2rem", flexWrap:"wrap" }}>
          {DEVICES.map(d => (
            <button key={d.id} className="device-tab" onClick={() => setActiveDevice(d.id)} style={{ flex:"1 1 160px", padding:"10px 14px", borderRadius:10, background:activeDevice===d.id?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)", border:activeDevice===d.id?"1.5px solid rgba(124,58,237,0.5)":"1px solid rgba(255,255,255,0.08)", color:activeDevice===d.id?"#a78bfa":"#9ca3af", fontSize:13, fontWeight:activeDevice===d.id?600:400, cursor:"pointer", textAlign:"center", transition:"all 0.15s ease" }}>
              <div>{d.label}</div>
              <div style={{ fontSize:11, marginTop:2, color:activeDevice===d.id?"#7c3aed":"#4b5563" }}>{d.app}</div>
            </button>
          ))}
        </div>

        <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:10, padding:"0.85rem 1.25rem", marginBottom:"1.75rem", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📱</span>
          <p style={{ fontSize:13, color:"#9ca3af" }}>
            Recommended app for <strong style={{ color:"#fff" }}>{device.label.replace(/^[^\s]+\s/,"")}</strong>
            {" — "}<strong style={{ color:"#10b981" }}>{device.app}</strong>
          </p>
        </div>

        <DownloadBar deviceId={activeDevice} />
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.4rem", color:"#fff", marginBottom:"1rem" }}>Setup Steps</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"2.5rem" }}>
          {steps.map(step => <StepCard key={step.num} step={step} />)}
        </div>

        {(activeDevice==="firestick"||activeDevice==="android") && (
          <>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.4rem", color:"#fff", marginBottom:"0.5rem" }}>TiviMate Features</h2>
            <p style={{ fontSize:13, color:"#6b7280", marginBottom:"1rem" }}>Get the most out of TiviMate with these built-in features.</p>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, overflow:"hidden", marginBottom:"2rem" }}>
              {TIVIMATE_FEATURES.map((f,i) => (
                <div key={f.name} className="feat-row" style={{ padding:"0.9rem 1.25rem", borderBottom:i<TIVIMATE_FEATURES.length-1?"1px solid rgba(255,255,255,0.06)":"none", display:"grid", gridTemplateColumns:"160px 1fr", gap:"1rem", transition:"background 0.15s" }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#e8e8f0" }}>{f.name}</p>
                  <p style={{ fontSize:13, color:"#9ca3af", lineHeight:1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
            {activeDevice==="firestick" && (
              <>
                <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.4rem", color:"#fff", marginBottom:"1rem" }}>Firestick Remote Guide</h2>
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, overflow:"hidden", marginBottom:"2rem" }}>
                  {REMOTE_KEYS.map((r,i) => (
                    <div key={r.btn} style={{ padding:"0.85rem 1.25rem", borderBottom:i<REMOTE_KEYS.length-1?"1px solid rgba(255,255,255,0.06)":"none", display:"grid", gridTemplateColumns:"140px 1fr", gap:"1rem" }}>
                      <p style={{ fontSize:13, fontWeight:600, color:"#a78bfa" }}>{r.btn}</p>
                      <p style={{ fontSize:13, color:"#9ca3af" }}>{r.action}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.4rem", color:"#fff", marginBottom:"1rem" }}>Troubleshooting</h2>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, overflow:"hidden", marginBottom:"2rem" }}>
          {TROUBLESHOOTING.map((t,i) => (
            <div key={t.issue} className="ts-row" style={{ padding:"0.9rem 1.25rem", borderBottom:i<TROUBLESHOOTING.length-1?"1px solid rgba(255,255,255,0.06)":"none", display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:"1rem", transition:"background 0.15s" }}>
              <p style={{ fontSize:13, fontWeight:600, color:"#e8e8f0" }}>{t.issue}</p>
              <p style={{ fontSize:13, color:"#9ca3af", lineHeight:1.6 }}>{t.fix}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.18)", borderRadius:12, padding:"1.1rem 1.4rem", marginBottom:"1.5rem" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:5 }}>Using a different app?</p>
          <p style={{ fontSize:13, color:"#9ca3af", lineHeight:1.7 }}>North Hill Systems works with any IPTV player that supports <strong style={{ color:"#e8e8f0" }}>Xtream Codes</strong> login — including GSE Smart IPTV, Perfect Player, and more. Find the Xtream Codes login option in your app and enter your Server URL, Username, and Password.</p>
        </div>

        <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"2.5rem" }}>
          <p style={{ fontSize:13, color:"#fbbf24", lineHeight:1.7 }}>⚠️ <strong>Beware of imposters.</strong> TiviMate and TiviMax are video player apps only — they do not provide channels or content. Your content comes exclusively from North Hill Systems using your credentials. Never enter payment information on third-party sites claiming to offer TiviMate streaming.</p>
        </div>

        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:14, color:"#6b7280", marginBottom:"1rem" }}>{"Still having trouble? We're here to help."}</p>
          <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="mailto:support@northhillsystems.com" className="support-btn" style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", padding:"10px 24px", borderRadius:9, fontSize:14, fontWeight:600, textDecoration:"none", transition:"opacity 0.15s" }}>Contact Support →</a>
            <Link href="/portal" className="portal-btn" style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#9ca3af", padding:"10px 24px", borderRadius:9, fontSize:14, textDecoration:"none", transition:"background 0.15s" }}>My Account Portal</Link>
          </div>
        </div>

      </div>

      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"1.5rem", textAlign:"center" }}>
        <p style={{ fontSize:12, color:"#4b5563" }}>© {new Date().getFullYear()} North Hill Systems LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}

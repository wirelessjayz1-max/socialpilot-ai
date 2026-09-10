"use client";

import { useEffect, useState } from "react";

type Generated = {
  title: string; hook: string; script: string; caption: string; hashtags: string[]; callToAction: string; visualPlan: string[];
  aiModel?: string; aiProvider?: string;
};

type VideoJob = { videoId?: string; sessionId?: string; status: string; videoUrl?: string; error?: string };

export default function Home() {
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState("TikTok / Reels / Shorts");
  const [tone, setTone] = useState("high-energy");
  const [tab, setTab] = useState("Create");
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [result, setResult] = useState<Generated | null>(null);
  const [video, setVideo] = useState<VideoJob | null>(null);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [publishPlatform, setPublishPlatform] = useState("tiktok");
  const [privacyLevel, setPrivacyLevel] = useState("");
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);

  async function loadAccounts() { const r = await fetch("/api/accounts", { cache: "no-store" }); const d = await r.json(); setAccounts(d.accounts || []); }
  useEffect(() => { loadAccounts(); }, []);
  useEffect(() => { if (publishPlatform === "tiktok") fetch("/api/tiktok/creator", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => { if (d?.data) { setCreatorInfo(d.data); setPrivacyLevel(""); } }); }, [publishPlatform]);

  async function generateContent() {
    setLoading(true); setError(""); setVideo(null);
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea, platform, tone }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed"); }
    finally { setLoading(false); }
  }

  async function createVideo() {
    if (!result) return;
    setVideoLoading(true); setError(""); setVideo(null);
    try {
      const r = await fetch("/api/video/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: result.title, hook: result.hook, script: result.script, visualPlan: result.visualPlan, platform }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Video creation failed");
      setVideo({ ...data, status: data.status || "processing" });
      if (data.videoId) pollVideo(data.videoId);
    } catch (e) { setError(e instanceof Error ? e.message : "Video creation failed"); }
    finally { setVideoLoading(false); }
  }

  async function pollVideo(videoId: string) {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const r = await fetch(`/api/video/status?videoId=${encodeURIComponent(videoId)}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Could not check video status");
        setVideo(data);
        if (data.status === "completed" || data.status === "failed") return;
      } catch (e) { setError(e instanceof Error ? e.message : "Video status failed"); return; }
    }
  }

  const nav = ["Create", "Videos", "Calendar", "Accounts", "Analytics", "Settings"];
  async function publishVideo() {
    if (!video?.videoUrl) return; setPublishing(true); setPublishResult(null); setError("");
    try { const r = await fetch("/api/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: publishPlatform, videoUrl: video.videoUrl, caption: result?.caption + "\n\n" + (result?.hashtags || []).join(" "), title: result?.title, privacyLevel, allowComment: false, allowDuet: false, allowStitch: false }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || d.error || "Publish failed"); setPublishResult(d); } catch(e) { setError(e instanceof Error ? e.message : "Publish failed"); } finally { setPublishing(false); }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><span>SocialPilot <b>AI</b></span></div>
        <nav>{nav.map(n => <button key={n} className={tab === n ? "nav active" : "nav"} onClick={() => setTab(n)}>{n}</button>)}</nav>
        <div className="side-card"><strong>AI Creator</strong><span>Turn one idea into a ready-to-publish short.</span></div>
      </aside>

      <section className="main">
        <header className="topbar"><div><div className="eyebrow">SOCIALPILOT AI</div><h1>{tab}</h1></div><div className="status-dot"><i/> AI Gateway online</div></header>

        {tab === "Accounts" ? (
          <div className="panel accounts-panel"><div className="panel-head"><div><span className="kicker">SOCIAL ACCOUNTS</span><h2>Connect your publishing accounts</h2></div></div><p className="muted">OAuth keeps platform credentials server-side. Add the matching developer credentials in Vercel before connecting.</p><div className="account-grid">{["tiktok","instagram","youtube"].map(p => { const a=accounts.find(x=>x.platform===p); return <div className="account-card" key={p}><div><strong>{p === "tiktok" ? "TikTok" : p === "instagram" ? "Instagram" : "YouTube"}</strong><span>{a?.connected ? "Connected" : "Not connected"}</span></div>{a?.connected ? <span className="connected">● Connected</span> : <a className="primary small" href={`/api/oauth/${p}/start`}>Connect</a>}</div>})}</div></div>
        ) : tab === "Create" ? (
          <div className="creator-grid">
            <section className="panel composer">
              <div className="panel-head"><div><span className="kicker">1 · IDEA</span><h2>What should we create?</h2></div></div>
              <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="Example: 3 AI tools that can save a small business owner 5 hours every week" />
              <div className="controls">
                <label>Platform<select value={platform} onChange={e => setPlatform(e.target.value)}><option>TikTok / Reels / Shorts</option><option>TikTok</option><option>Instagram Reels</option><option>YouTube Shorts</option></select></label>
                <label>Tone<select value={tone} onChange={e => setTone(e.target.value)}><option value="high-energy">High-energy</option><option value="funny">Funny</option><option value="educational">Educational</option><option value="storytelling">Storytelling</option><option value="professional">Professional</option></select></label>
              </div>
              <button className="primary wide" onClick={generateContent} disabled={loading || !idea.trim()}>{loading ? "Creating package…" : "Generate content ✦"}</button>
              {error && <div className="error">{error}</div>}
            </section>

            <section className="panel output">
              <div className="panel-head"><div><span className="kicker">2 · AI PACKAGE</span><h2>Your content</h2></div></div>
              {!result ? <div className="empty"><span>✦</span><p>Your script, caption, hashtags and shot list will appear here.</p></div> : <div className="result">
                <h3>{result.title}</h3><div className="hook">“{result.hook}”</div>{result.aiModel && <div className="muted" style={{marginBottom: 14}}>Powered by {result.aiProvider} · {result.aiModel}</div>}
                <label>Script<textarea value={result.script} readOnly /></label>
                <div className="two"><div><label>Caption<textarea value={result.caption} readOnly /></label></div><div><label>CTA<textarea value={result.callToAction} readOnly /></label></div></div>
                <div><label>Hashtags<div className="tags">{result.hashtags.map(h => <span key={h}>{h}</span>)}</div></label></div>
                <div><label>Visual plan<ol>{result.visualPlan.map((s,i)=><li key={i}>{s}</li>)}</ol></label></div>
                <button className="primary wide" onClick={createVideo} disabled={videoLoading}>{videoLoading ? "Sending to video studio…" : "Create actual video 🎬"}</button>
                {video && <div className="video-job"><strong>Video status: {video.status}</strong>{video.videoUrl && <video src={video.videoUrl} controls playsInline />}{video.status === "failed" && <p>{video.error || "Video generation failed."}</p>}</div>}
                {video?.videoUrl && <div className="publish-box"><span className="kicker">3 · PUBLISH</span><h3>Send this video to social</h3><div className="controls"><label>Account<select value={publishPlatform} onChange={e=>setPublishPlatform(e.target.value)}>{accounts.filter(a=>a.connected).map(a=><option key={a.platform} value={a.platform}>{a.platform}</option>)}</select></label>{publishPlatform === "tiktok" && <label>Privacy<select value={privacyLevel} onChange={e=>setPrivacyLevel(e.target.value)}><option value="">Select privacy…</option>{(creatorInfo?.privacy_level_options || []).map((x:string)=><option key={x}>{x}</option>)}</select></label>}</div><button className="primary wide" onClick={publishVideo} disabled={publishing || (publishPlatform === "tiktok" && !privacyLevel)}>{publishing ? "Publishing…" : "Publish now 🚀"}</button>{publishResult && <div className="success">Published request accepted. {publishResult.data?.publish_id ? `TikTok publish ID: ${publishResult.data.publish_id}` : ""}</div>}</div>}
              </div>}
            </section>
          </div>
        ) : (
          <div className="panel placeholder"><div className="panel-head"><div><span className="kicker">COMING NEXT</span><h2>{tab}</h2></div></div><p className="muted">This workspace is ready for the next SocialPilot AI module.</p></div>
        )}
      </section>
    </main>
  );
}

import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

function getClientId() {
  let id = localStorage.getItem("client_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("client_id", id);
  }

  return id;
}

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": getClientId(),
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};


const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/* ══════════════════════════════════════════ ICONS ══════════════════════════════════════════ */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  copy: "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 4v2h8V4M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2",
  check: "M20 6 9 17l-5-5",
  chart: "M18 20V10M12 20V4M6 20v-6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 14h.01M14 14h.01M20 14h.01M17 17h.01M14 17h.01M20 17h.01M17 20h.01M14 20h.01M20 20h.01",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  arrow: "M5 12h14M12 5l7 7-7 7",
  sparkle: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
};

/* ══════════════════════════════════════════ STYLES ══════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0b0f17;
    --bg2: #111827;
    --bg3: #1f2937;
    --bg4: #1f2937;
    --bg5: #374151;

    --border: rgba(255,255,255,0.06);
    --border2: rgba(255,255,255,0.1);

    --accent: #6366f1;
    --accent2: #818cf8;

    --text: #e5e7eb;
    --text2: #9ca3af;
    --text3: #6b7280;

    --green: #10b981;
    --red: #ef4444;
    --amber: #f59e0b;
  }

  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }
  * { font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--bg5); border-radius: 4px; }

  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 230px; flex-shrink: 0; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px 0; position: sticky; top: 0; height: 100vh; }
  .main {
    flex: 1;
    padding: 32px;
    max-width: 800px;
  }

  .logo { padding: 4px 18px 26px; display: flex; align-items: center; gap: 10px; }
  .logo-mark { width: 32px; height: 32px; border-radius: 9px; background: var(--accent); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px var(--accent-dim); }
  .logo-text { font-size: 16px; font-weight: 800; letter-spacing: -.4px; }
  .logo-beta { font-size: 10px; font-weight: 700; letter-spacing: .06em; background: var(--accent-dim); color: var(--accent2); padding: 2px 6px; border-radius: 4px; margin-left: 2px; }

  .nav-section { padding: 0 10px; flex: 1; }
  .nav-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; color: var(--text3); padding: 0 10px; margin-bottom: 4px; margin-top: 14px; text-transform: uppercase; }
  .nav-btn { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: var(--r); border: none; background: transparent; color: var(--text2); cursor: pointer; font-size: 13.5px; font-weight: 500; transition: all .14s; width: 100%; text-align: left; letter-spacing: -.1px; }
  .nav-btn:hover { background: var(--bg4); color: var(--text); }
  .nav-btn.active { background: var(--accent-dim); color: var(--accent2); font-weight: 600; }
  .nav-btn .ni { flex-shrink: 0; opacity: .65; }
  .nav-btn.active .ni { opacity: 1; }

  .sidebar-footer { padding: 12px 10px 0; border-top: 1px solid var(--border); margin-top: auto; }
  .user-row { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: var(--r); }
  .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; }
  .user-info { overflow: hidden; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--text3); }

  .card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 22px;
  }

  .input-wrap { position: relative; }
  .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
  input, select {
    background: var(--bg);
    border: 1px solid var(--border2);
    border-radius: 8px;
    color: var(--text);
    padding: 11px 14px;
    font-size: 14px;
    width: 100%;
  }
  input.has-icon { padding-left: 38px; }
  input:focus, select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }
  input::placeholder { color: var(--text3); }
  input.input-mono { font-family: 'DM Mono', monospace; font-size: 13px; }
  label { font-size: 12.5px; color: var(--text2); font-weight: 600; display: block; margin-bottom: 6px; }

  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: var(--r); border: none; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: all .15s; letter-spacing: -.1px; }
  .btn-primary {
  background: var(--accent);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  }
  .btn-primary:hover {
  background: #4f46e5;
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-ghost { background: var(--bg4); color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover:not(:disabled) { background: var(--bg5); color: var(--text); }
  .btn:disabled { opacity: .38; cursor: not-allowed; }
  .btn-sm { padding: 6px 13px; font-size: 13px; }
  .btn-xs { padding: 4px 10px; font-size: 12px; border-radius: 7px; }
  .btn-icon { padding: 7px; background: var(--bg4); border: 1px solid var(--border); border-radius: var(--r); color: var(--text2); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all .14s; flex-shrink: 0; }
  .btn-icon:hover { background: var(--bg5); color: var(--text); border-color: var(--border2); }
  .btn-icon.active { background: var(--accent-dim); color: var(--accent2); border-color: rgba(124,108,252,.25); }

  .page-header { margin-bottom: 28px; }
  .page-title { font-size: 21px; font-weight: 800; letter-spacing: -.5px; }
  .page-sub { font-size: 13.5px; color: var(--text2); margin-top: 3px; }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 26px; }
  .stat-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r2); padding: 18px 20px; transition: border-color .15s; }
  .stat-card:hover { border-color: var(--border2); }
  .stat-label { font-size: 11px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
  .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -.8px; line-height: 1; }
  .stat-sub { font-size: 12px; color: var(--text3); margin-top: 6px; }
  .c-accent { color: var(--accent2); }
  .c-green  { color: var(--green); }
  .c-amber  { color: var(--amber); }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th { text-align: left; padding: 9px 14px; font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 11px 14px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.017); }
  .mono { font-family: 'DM Mono', monospace; font-size: 12.5px; }
  .link-accent { color: var(--accent2); text-decoration: none; }
  .text-muted { color: var(--text2); }
  .text-dim   { color: var(--text3); }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
  .badge-purple { background: var(--accent-dim); color: var(--accent2); }
  .badge-green  { background: var(--green-dim);  color: var(--green); }
  .badge-amber  { background: var(--amber-dim);  color: var(--amber); }

  .result-card {
  background: var(--bg);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 10px;
  padding: 18px;
  margin-top: 18px;
}
  .result-url { font-family: 'DM Mono', monospace; font-size: 14px; color: var(--accent2); word-break: break-all; line-height: 1.5; }
  .result-copied { color: var(--green) !important; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(6px); animation: fadein .15s ease; }
  .modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--r3); padding: 28px; width: 90%; max-width: 440px; box-shadow: var(--shadow2); animation: slideUp .2s ease; }
  .modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
  .modal-title { font-size: 17px; font-weight: 700; }
  .modal-sub { font-size: 13px; color: var(--text3); font-family: 'DM Mono', monospace; margin-top: 3px; }
  @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }

  /* AUTH */
  .auth-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); overflow: hidden; position: relative; }
  .auth-dots { position: absolute; inset: 0; pointer-events: none; opacity: .4; background-image: radial-gradient(circle, rgba(124,108,252,.25) 1px, transparent 1px); background-size: 32px 32px; mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%); }
  .auth-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(124,108,252,.1) 0%, transparent 65%); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
  .auth-card { width: 100%; max-width: 390px; background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--r3); padding: 36px; position: relative; z-index: 1; box-shadow: 0 0 0 1px rgba(124,108,252,.05), var(--shadow2); animation: slideUp .3s ease; }
  .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
  .auth-logo-mark { width: 36px; height: 36px; border-radius: 10px; background: var(--accent); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 5px var(--accent-dim); }
  .auth-heading { font-size: 21px; font-weight: 800; letter-spacing: -.4px; }
  .auth-sub { font-size: 13.5px; color: var(--text2); margin-top: 5px; margin-bottom: 26px; }
  .auth-success { background: var(--green-dim); border: 1px solid rgba(31,209,160,.2); border-radius: var(--r); padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--green); font-weight: 500; animation: fadeSlide .2s ease; }
  .auth-error { background: var(--red-dim); border: 1px solid rgba(247,110,101,.2); border-radius: var(--r); padding: 10px 14px; margin-bottom: 14px; font-size: 13px; color: var(--red); animation: fadeSlide .15s ease; }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
  .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
  .auth-divider-text { font-size: 12px; color: var(--text3); }
  .auth-switch-btn { background: none; border: none; color: var(--accent2); cursor: pointer; font-weight: 700; font-size: 13px; font-family: inherit; padding: 0; }
  .auth-switch-btn:hover { color: var(--accent3); }
  .pw-wrap { position: relative; }
  .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text3); cursor: pointer; padding: 2px; display: flex; }
  .pw-toggle:hover { color: var(--text2); }

  .form-group { margin-bottom: 15px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .tabs { display: flex; gap: 2px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 3px; margin-bottom: 20px; }
  .tab { flex: 1; padding: 7px 8px; border: none; background: transparent; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text2); cursor: pointer; transition: all .14s; font-family: inherit; white-space: nowrap; }
  .tab:hover { color: var(--text); }
  .tab.active { background: var(--bg5); color: var(--text); }

  .mini-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 11px; }
  .bar-label { font-size: 12.5px; color: var(--text2); width: 76px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-track { flex: 1; height: 5px; background: var(--bg5); border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 99px; background: var(--accent); transition: width .45s cubic-bezier(.4,0,.2,1); }
  .bar-count { font-size: 11.5px; color: var(--text3); min-width: 24px; text-align: right; font-family: 'DM Mono', monospace; }

  .qr-img { border-radius: var(--r); background: white; padding: 8px; width: 120px; height: 120px; flex-shrink: 0; }

  .toast { position: fixed; bottom: 22px; right: 22px; background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--r); padding: 11px 16px; font-size: 13.5px; font-weight: 500; z-index: 9999; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow2); animation: slideUp .2s ease; max-width: 320px; }
  .toast-green { border-color: rgba(31,209,160,.25); color: var(--green); }
  .toast-red   { border-color: rgba(247,110,101,.25); color: var(--red); }

  .empty { text-align: center; padding: 52px 20px; }
  .empty-icon { color: var(--text3); margin-bottom: 12px; }
  .empty-title { font-size: 14px; font-weight: 600; color: var(--text2); margin-bottom: 4px; }
  .empty-sub { font-size: 13px; color: var(--text3); }

  .flex   { display: flex; }
  .col    { flex-direction: column; }
  .center { align-items: center; }
  .between{ justify-content: space-between; }
  .gap-1  { gap: 6px; }
  .gap-2  { gap: 10px; }
  .gap-3  { gap: 14px; }
  .ml-auto{ margin-left: auto; }
  .w-full { width: 100%; }
  .mt-2   { margin-top: 10px; }
  .mt-3   { margin-top: 14px; }
  .mb-2   { margin-bottom: 10px; }
  .mb-3   { margin-bottom: 14px; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin .7s linear infinite; }
`;

/* ══════════ TOAST ══════════ */
let toastTimer;
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    if (!msg) return;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(onDone, 3200);
    return () => clearTimeout(toastTimer);
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={`toast toast-${type}`}>
      <Icon d={type === "green" ? icons.check : icons.zap} size={14} />
      {msg}
    </div>
  );
}

/* ══════════ AUTH ══════════ */
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (m) => { setMode(m); setErr(""); setSuccess(""); };

  const submit = async () => {
    if (!email || !password) { setErr("Please fill in all fields"); return; }
    setErr(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch(`${API}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      if (!res.ok) { setErr(text || "Something went wrong"); setLoading(false); return; }

      if (mode === "signup") {
        // ✅ Show success, auto-switch to login after 1.2s
        setSuccess("Account created! Redirecting to sign in…");
        setPassword("");
        setTimeout(() => switchMode("login"), 1300);
      } else {
        const json = JSON.parse(text);
        localStorage.setItem("token", json.token);
        localStorage.setItem("email", email);
        onLogin(email);
      }
    } catch { setErr("Connection error — is your server running?"); }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-dots" />
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <Icon d={icons.zap} size={18} fill="white" stroke="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.4px" }}>TeenyURL</span>
          <span className="logo-beta">BETA</span>
        </div>

        <div className="auth-heading">{mode === "login" ? "Welcome back" : "Create account"}</div>
        <div className="auth-sub">{mode === "login" ? "Sign in to your dashboard" : "Start shortening links for free"}</div>

        {success && <div className="auth-success"><Icon d={icons.check} size={15} />{success}</div>}
        {err && <div className="auth-error">{err}</div>}

        <div className="form-group">
          <label>Email address</label>
          <div className="input-wrap">
            <span className="input-icon"><Icon d={icons.eye} size={14} /></span>
            <input type="email" className="has-icon" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="pw-wrap">
            <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ paddingRight: 40 }} />
            <button className="pw-toggle" onClick={() => setShowPw(p => !p)} type="button">
              <Icon d={showPw ? icons.eyeOff : icons.eye} size={15} />
            </button>
          </div>
        </div>

        <button className="btn btn-primary w-full mt-2" onClick={submit} disabled={loading} style={{ justifyContent: "center" }}>
          {loading ? <><span className="spinner" />&nbsp;Please wait…</> : <>{mode === "login" ? "Sign In" : "Create Account"}<Icon d={icons.arrow} size={15} /></>}
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">{mode === "login" ? "new here?" : "have an account?"}</span>
          <div className="auth-divider-line" />
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="auth-switch-btn" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Create a free account →" : "← Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════ SHORTEN ══════════ */
function ShortenPage({ showToast }) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [error, setError] = useState("");

  const shorten = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      let finalUrl = url.trim();

      // ✅ auto-add https
      if (!finalUrl.startsWith("http")) {
        finalUrl = "https://" + finalUrl;
      }

      const body = { longUrl: finalUrl };

      if (alias.trim()) body.customCode = alias.trim();
      if (expiry) body.expiryMinutes = Number(expiry);

      const res = await fetch(`${API}/shorten`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to shorten");
        showToast(data.error || "Failed to shorten", "red");
      } else {
        setResult(data);
        showToast("Link shortened!", "green");
      }

    } catch {
      setError("Connection error");
      showToast("Connection error", "red");
    }

    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true); showToast("Copied!", "green");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Shorten a URL</div>
        <div className="page-sub">Create short links with optional alias and expiry</div>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="form-group">
          <label>Long URL</label>
          <div className="input-wrap">
            <span className="input-icon"><Icon d={icons.link} size={14} /></span>
            <input className="has-icon" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste your long URL here..." onKeyDown={e => e.key === "Enter" && shorten()} />
          </div>
        </div>
          {error && (
            <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>
              {error}
            </div>
          )}
        <div className="form-row" style={{ marginBottom: 15 }}>
          <div>
            <label>Custom alias <span style={{ color: "var(--text3)", fontWeight: 400 }}>— optional</span></label>
            <input className="input-mono" value={alias} onChange={e => setAlias(e.target.value)} placeholder="my-slug" />
          </div>
          <div>
            <label>Expiry <span style={{ color: "var(--text3)", fontWeight: 400 }}>— minutes, optional</span></label>
            <input type="number" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="e.g. 60" min="1" />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={shorten} disabled={loading || !url.trim()}>
            {loading ? <><span className="spinner" />&nbsp;Shortening…</> : <><Icon d={icons.zap} size={14} fill="white" stroke="white" />Shorten Link</>}
          </button>
          {result && <button className="btn btn-ghost" onClick={() => { setResult(null); setUrl(""); setAlias(""); setExpiry(""); }}>New link</button>}
        </div>

        {result && (
          <div className="result-card">
            <div className="flex center between mb-2">
              <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" }}>Your short link</span>
              <div className="flex gap-1">
                <button className={`btn-icon ${showQr ? "active" : ""}`} onClick={() => setShowQr(q => !q)} title="QR Code"><Icon d={icons.qr} size={14} /></button>
                <button className="btn-icon" onClick={copy} title="Copy"><Icon d={copied ? icons.check : icons.copy} size={14} /></button>
                <a href={result.shortUrl} target="_blank" rel="noreferrer" className="btn-icon" title="Open"><Icon d={icons.external} size={14} /></a>
              </div>
            </div>

            <div className={`result-url ${copied ? "result-copied" : ""}`}>{result.shortUrl}</div>

            {result.expiry && (
              <div className="flex center gap-1 mt-2" style={{ fontSize: 12, color: "var(--amber)" }}>
                <Icon d={icons.clock} size={12} />Expires {fmtDate(result.expiry)}
              </div>
            )}

            {result.QRcode && (
              <div className="flex center gap-3 mt-3" style={{ paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <img src={result.QRcode} alt="QR Code" className="qr-img" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>QR Code</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>Scan with any camera<br />to visit this link</div>
                  <a href={result.QRcode} download="sniplink-qr.png" className="btn btn-ghost btn-sm mt-2" style={{ textDecoration: "none", display: "inline-flex" }}>Download PNG</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ ANALYTICS MODAL ══════════ */
function AnalyticsModal({ code, onClose }) {
  const [tab, setTab] = useState("overview");
  const [d, setD] = useState({ total: null, devices: [], browsers: [], timeseries: [] });

  useEffect(() => {
    const h = getHeaders();
    Promise.all([
      fetch(`${API}/analytics/${code}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/analytics/${code}/devices`, { headers: h }).then(r => r.json()),
      fetch(`${API}/analytics/${code}/browser`, { headers: h }).then(r => r.json()),
      fetch(`${API}/analytics/${code}/timeseries`, { headers: h }).then(r => r.json()),
    ]).then(([total, devices, browsers, timeseries]) =>
      setD({ total: total.totalClicks, devices: devices || [], browsers: browsers || [], timeseries: timeseries || [] })
    ).catch(() => {});
  }, [code]);

  const maxDev  = Math.max(...d.devices.map(x => +x.count), 1);
  const maxBrow = Math.max(...d.browsers.map(x => +x.count), 1);

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Analytics</div>
            <div className="modal-sub">/{code}</div>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {d.total !== null && (
          <div className="stats-grid mb-3" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
            {[["Total Clicks", d.total, "c-accent"], ["Devices", d.devices.length, ""], ["Browsers", d.browsers.length, ""]].map(([label, val, cls]) => (
              <div className="stat-card" key={label} style={{ padding: "14px 16px" }}>
                <div className="stat-label">{label}</div>
                <div className={`stat-value ${cls}`} style={{ fontSize: 22 }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        <div className="tabs">
          {["overview", "devices", "browsers", "timeline"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>
            {d.total === null ? "Loading…" : d.total == 0 ? "No clicks yet. Share your link to start tracking!" : `This link received ${d.total} click${d.total != 1 ? "s" : ""} across ${d.devices.length} device type${d.devices.length != 1 ? "s" : ""} and ${d.browsers.length} browser${d.browsers.length != 1 ? "s" : ""}.`}
          </div>
        )}

        {tab === "devices" && (
          d.devices.length === 0 ? <div className="text-dim" style={{ fontSize: 13 }}>No device data yet</div>
          : d.devices.map(x => (
            <div key={x.device} className="mini-bar">
              <div className="bar-label">{x.device}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(+x.count / maxDev) * 100}%` }} /></div>
              <div className="bar-count">{x.count}</div>
            </div>
          ))
        )}

        {tab === "browsers" && (
          d.browsers.length === 0 ? <div className="text-dim" style={{ fontSize: 13 }}>No browser data yet</div>
          : d.browsers.map(x => (
            <div key={x.browser} className="mini-bar">
              <div className="bar-label">{x.browser}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(+x.count / maxBrow) * 100}%`, background: "var(--green)" }} /></div>
              <div className="bar-count">{x.count}</div>
            </div>
          ))
        )}

        {tab === "timeline" && (
          d.timeseries.length === 0 ? <div className="text-dim" style={{ fontSize: 13 }}>No timeline data yet</div>
          : <div style={{ maxHeight: 240, overflowY: "auto" }}>
              {d.timeseries.map(r => (
                <div key={r.date} className="flex center between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span className="text-muted">{fmtDate(r.date)}</span>
                  <span className="badge badge-purple">{r.count} click{r.count != 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ MY LINKS ══════════ */
function LinksPage({ showToast }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsCode, setAnalyticsCode] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/my-links`, { headers: getHeaders() });
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
  console.error("Links error:", err);
  showToast("Failed to load links", "red");
}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const copy = (code) => { navigator.clipboard.writeText(`${API}/${code}`); showToast("Copied!", "green"); };

  const filtered = links.filter(l =>
    l.short_code.includes(search) || l.long_url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex center between">
        <div>
          <div className="page-title">My Links</div>
          <div className="page-sub">{links.length} link{links.length !== 1 ? "s" : ""} total</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>↺ Refresh</button>
      </div>

      <div className="card">
        {links.length > 0 && (
          <div className="mb-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by short code or URL…" />
          </div>
        )}

        {loading ? (
          <div className="empty"><div className="text-muted">Loading links…</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><Icon d={icons.link} size={34} /></div>
            <div className="empty-title">{links.length === 0 ? "No links yet" : "No results"}</div>
            <div className="empty-sub">{links.length === 0 ? "Shorten your first URL to see it here" : "Try a different search"}</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Short code</th><th>Destination</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l.short_code}>
                    <td className="text-dim mono" style={{ width: 36 }}>{i + 1}</td>
                    <td><span className="badge badge-purple mono">{l.short_code}</span></td>
                    <td>
                      <div className="truncate text-muted" style={{ maxWidth: 280, fontSize: 13 }} title={l.long_url}>{l.long_url}</div>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-icon" onClick={() => copy(l.short_code)} title="Copy short link"><Icon d={icons.copy} size={13} /></button>
                        <button className="btn-icon" onClick={() => setAnalyticsCode(l.short_code)} title="Analytics"><Icon d={icons.chart} size={13} /></button>
                        <a href={`${API}/${l.short_code}`} target="_blank" rel="noreferrer" className="btn-icon" title="Open link"><Icon d={icons.external} size={13} /></a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {analyticsCode && <AnalyticsModal code={analyticsCode} onClose={() => setAnalyticsCode(null)} />}
    </div>
  );
}

/* ══════════ DASHBOARD ══════════ */
function DashboardPage({ email, setPage }) {
  const [topLinks, setTopLinks] = useState([]);
  const [myLinks, setMyLinks] = useState([]);
  const [analyticsCode, setAnalyticsCode] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Fetch top analytics
        const topRes = await fetch(`${API}/analytics/top`);
        const topData = await topRes.json();
        console.log("TOP LINKS:", topData);

        // 🔹 Fetch user links
        const linksRes = await fetch(`${API}/my-links`, {
          headers: getHeaders(),
        });
        const linksData = await linksRes.json();
        console.log("MY LINKS:", linksData);

        setTopLinks(Array.isArray(topData) ? topData : topData.rows || []);
        setMyLinks(linksData || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const totalClicks = Array.isArray(topLinks)
  ? topLinks.reduce((s, l) => s + Number(l.clicks), 0)
  : 0;
  const firstName = email?.split("@")[0] || "there";

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Hey, {firstName} 👋</div>
        <div className="page-sub">Here's an overview of your TeenyURL account</div>
      </div>

      <div className="stats-grid">
        {[
          {
            label: "Total Links",
            val: myLinks.length,
            cls: "c-accent",
            sub: "created by you",
          },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls}`}>{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex center between mb-3">
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          Top performing links
        </div>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setPage("links")}
        >
          View all →
        </button>
      </div>

      <div className="card">
        {topLinks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <Icon d={icons.sparkle} size={32} />
            </div>
            <div className="empty-title">No analytics yet</div>
            <div className="empty-sub">
              Click your shortened links to generate analytics
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Short code</th>
                  <th>Clicks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map((l, i) => (
                  <tr key={l.short_code}>
                    <td className="text-dim" style={{ width: 48 }}>
                      {i === 0
                        ? "🥇"
                        : i === 1
                        ? "🥈"
                        : i === 2
                        ? "🥉"
                        : `#${i + 1}`}
                    </td>
                    <td>
                      <span className="mono link-accent">
                        {l.short_code}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-green">
                        {l.clicks}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={() => setAnalyticsCode(l.short_code)}
                        title="Analytics"
                      >
                        <Icon d={icons.chart} size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {analyticsCode && (
        <AnalyticsModal
          code={analyticsCode}
          onClose={() => setAnalyticsCode(null)}
        />
      )}
    </div>
  );
}

/* ══════════ APP SHELL ══════════ */
export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [page, setPage] = useState("shorten");
  const [toast, setToast] = useState({ msg: "", type: "green" });

  const showToast = (msg, type = "green") => setToast({ msg, type });
  const handleLogin = (em) => { setEmail(em); setAuthed(true); setPage("dashboard"); };
  const logout = () => { localStorage.clear(); setAuthed(false); setEmail(""); };

  const nav = [
    { id: "dashboard", label: "Overview",    icon: icons.home },
    { id: "shorten",   label: "Shorten URL", icon: icons.zap },
    { id: "links",     label: "My Links",    icon: icons.link },
  ];

  return (
    <>
      <style>{styles}</style>
        <div className="app">
          <div className="sidebar">
            <div className="logo">
              <div className="logo-mark"><Icon d={icons.zap} size={16} fill="white" stroke="white" /></div>
              <span className="logo-text">TeenyURL</span>
              <span className="logo-beta">BETA</span>
            </div>
            <div className="nav-section">
              <div className="nav-label">Menu</div>
              {nav.map(n => (
                <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                  <span className="ni"><Icon d={n.icon} size={15} /></span>
                  {n.label}
                </button>
              ))}
            </div>
            <div className="sidebar-footer">
              {authed ? (
                <>
                  <div className="user-row">
                    <div className="avatar">{email[0]?.toUpperCase()}</div>
                    <div className="user-info">
                      <div className="user-name">{email.split("@")[0]}</div>
                      <div className="user-role">Free plan</div>
                    </div>
                  </div>

                  <button className="nav-btn" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <button className="nav-btn" onClick={() => setPage("login")}>
                  Login / Signup
                </button>
              )}
            </div>
          </div>

          <main className="main">
            {page === "dashboard" && <DashboardPage email={email} setPage={setPage} />}
            {page === "shorten"   && <ShortenPage showToast={showToast} />}
            {page === "links"     && <LinksPage showToast={showToast} />}
            {page === "login" && <AuthScreen onLogin={handleLogin} />}
          </main>
        </div>
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: "" })} />
    </>
  );
}
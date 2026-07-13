// ─── Global Styles ─────────────────────────────────────────────────────────
// Import this string and render it inside a <style> tag in your App root.

export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #FDFAF6;
    --white: #FFFFFF;
    --brown-950: #1C0F05;
    --brown-900: #2D1B0E;
    --brown-800: #4A2E1A;
    --brown-700: #6B4226;
    --brown-600: #8B5A35;
    --brown-500: #A67C52;
    --brown-400: #C4A882;
    --brown-300: #D9C4A8;
    --brown-200: #EDE3D5;
    --brown-100: #F5EFE6;
    --brown-50: #FAF7F2;
    --gold: #C9A84C;
    --gold-light: #E8D08A;
    --success: #3D6B4F;
    --success-light: #EEF5F1;
    --error: #8B2E2E;
    --error-light: #F5EAEA;
    --warning: #8B6A1A;
    --warning-light: #F5F0E0;
    --shadow-sm: 0 1px 3px rgba(28,15,5,0.08);
    --shadow-md: 0 4px 16px rgba(28,15,5,0.1);
    --shadow-lg: 0 8px 32px rgba(28,15,5,0.12);
    --shadow-xl: 0 16px 64px rgba(28,15,5,0.15);
    --radius: 12px;
    --radius-lg: 20px;
    --radius-xl: 28px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--brown-900); -webkit-font-smoothing: antialiased; }

  .aiq-root { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Auth ── */
  .auth-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    background: var(--white);
  }
  .auth-left {
    background: linear-gradient(160deg, var(--brown-900) 0%, var(--brown-700) 60%, var(--brown-600) 100%);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 56px 52px; position: relative; overflow: hidden;
  }
  .auth-left::before {
    content: ''; position: absolute; top: -80px; right: -80px;
    width: 320px; height: 320px; border-radius: 50%;
    background: rgba(201,168,76,0.12); pointer-events: none;
  }
  .auth-left::after {
    content: ''; position: absolute; bottom: -60px; left: -60px;
    width: 240px; height: 240px; border-radius: 50%;
    background: rgba(255,255,255,0.05); pointer-events: none;
  }
  .auth-brand { display: flex; align-items: center; gap: 12px; }
  .auth-brand-icon {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--white); object-fit: cover; flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }
  .auth-brand-name { font-family: 'Cormorant Garamond', serif; font-size: 19px; line-height: 1.25; font-weight: 600; color: var(--white); letter-spacing: 0.02em; }
  .auth-hero { z-index: 1; }
  .auth-hero h1 { font-family: 'Cormorant Garamond', serif; font-size: 52px; font-weight: 700; color: var(--white); line-height: 1.1; margin-bottom: 20px; }
  .auth-hero p { font-size: 16px; color: rgba(255,255,255,0.65); line-height: 1.7; max-width: 340px; }
  .auth-features { display: flex; flex-direction: column; gap: 14px; z-index: 1; }
  .auth-feat { display: flex; align-items: center; gap: 12px; }
  .auth-feat-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
  .auth-feat span { font-size: 14px; color: rgba(255,255,255,0.75); }

  .auth-right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px 64px; background: var(--cream);
  }
  .auth-form-box { width: 100%; max-width: 420px; }
  .auth-form-box h2 { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 700; color: var(--brown-900); margin-bottom: 8px; }
  .auth-form-box p.sub { font-size: 14px; color: var(--brown-500); margin-bottom: 36px; }

  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--brown-700); margin-bottom: 8px; }
  .form-input {
    width: 100%; padding: 13px 16px; border: 1.5px solid var(--brown-200);
    border-radius: var(--radius); background: var(--white); font-family: 'DM Sans', sans-serif;
    font-size: 15px; color: var(--brown-900); outline: none; transition: all 0.2s;
  }
  .form-input:focus { border-color: var(--brown-600); box-shadow: 0 0 0 3px rgba(107,66,38,0.08); }
  .form-input::placeholder { color: var(--brown-300); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 24px; border-radius: var(--radius); font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none;
  }
  .btn-primary { background: var(--brown-800); color: var(--white); width: 100%; }
  .btn-primary:hover { background: var(--brown-900); box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary { background: var(--brown-100); color: var(--brown-800); }
  .btn-secondary:hover { background: var(--brown-200); }
  .btn-ghost { background: transparent; color: var(--brown-600); border: 1.5px solid var(--brown-200); }
  .btn-ghost:hover { background: var(--brown-50); border-color: var(--brown-400); }
  .btn-danger { background: var(--error-light); color: var(--error); border: 1.5px solid rgba(139,46,46,0.2); }
  .btn-danger:hover { background: #f0d8d8; }
  .btn-sm { padding: 8px 16px; font-size: 13px; border-radius: 8px; }
  .btn-gold { background: linear-gradient(135deg, var(--gold), #B8924A); color: var(--white); }
  .btn-gold:hover { box-shadow: 0 4px 20px rgba(201,168,76,0.35); transform: translateY(-1px); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  .auth-switch { margin-top: 24px; text-align: center; font-size: 14px; color: var(--brown-500); }
  .auth-switch button { background: none; border: none; color: var(--brown-700); font-weight: 600; cursor: pointer; text-decoration: underline; font-family: 'DM Sans', sans-serif; font-size: 14px; }

  /* ── App Shell ── */
  .app-shell { min-height: 100vh; display: flex; }
  .sidebar {
    width: 260px; background: var(--brown-900); display: flex; flex-direction: column;
    padding: 28px 0; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    box-shadow: 4px 0 24px rgba(28,15,5,0.15);
  }
  .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .sidebar-brand-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--white); object-fit: cover; flex-shrink: 0; }
  .sidebar-brand-name { font-family: 'Cormorant Garamond', serif; font-size: 15px; line-height: 1.25; font-weight: 600; color: var(--white); }
  .sidebar-brand-sub { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; text-transform: uppercase; }

  .sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 2px; }
  .nav-section-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); padding: 12px 12px 6px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px;
    cursor: pointer; transition: all 0.15s; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 400;
    border-left: 3px solid transparent; position: relative;
  }
  .nav-item:hover { background: rgba(255,255,255,0.07); color: var(--white); }
  .nav-item.active { background: rgba(201,168,76,0.18); color: var(--gold-light); font-weight: 500; border-left-color: var(--gold); }
  .nav-item.active .nav-icon { color: var(--gold); }
  .nav-icon { font-size: 18px; width: 20px; text-align: center; }

  .sidebar-user { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px; }
  .sidebar-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--brown-600), var(--brown-400));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: var(--white); flex-shrink: 0;
  }
  .sidebar-user-info { flex: 1; min-width: 0; }
  .sidebar-user-name { font-size: 13px; font-weight: 500; color: var(--white); truncate: ellipsis; white-space: nowrap; overflow: hidden; }
  .sidebar-user-role { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: capitalize; }
  .logout-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.4); font-size: 18px; padding: 4px; border-radius: 6px; transition: all 0.15s; }
  .logout-btn:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.08); }

  .main-content { margin-left: 260px; flex: 1; padding: 40px 48px; min-height: 100vh; }
  .page-header { margin-bottom: 36px; }
  .page-title { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: var(--brown-900); }
  .page-sub { font-size: 15px; color: var(--brown-500); margin-top: 6px; }

  /* ── Cards ── */
  .card {
    background: var(--white); border-radius: var(--radius-lg); padding: 28px;
    box-shadow: var(--shadow-sm); border: 1px solid var(--brown-100);
  }
  .card-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: var(--brown-900); margin-bottom: 20px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
  .stat-card {
    background: var(--white); border-radius: var(--radius-lg); padding: 24px;
    border: 1px solid var(--brown-100); box-shadow: var(--shadow-sm); position: relative; overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--brown-600), var(--gold)); }
  .stat-icon { font-size: 28px; margin-bottom: 12px; }
  .stat-val { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 700; color: var(--brown-900); line-height: 1; }
  .stat-label { font-size: 13px; color: var(--brown-500); margin-top: 4px; font-weight: 500; }

  /* ── Clock In Section ── */
  .clock-panel {
    background: linear-gradient(145deg, var(--brown-900) 0%, var(--brown-800) 100%);
    border-radius: var(--radius-xl); padding: 40px; color: var(--white);
    margin-bottom: 32px; position: relative; overflow: hidden;
    box-shadow: var(--shadow-xl);
  }
  .clock-panel::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 220px; height: 220px; border-radius: 50%;
    background: rgba(201,168,76,0.1);
  }
  .clock-time {
    font-family: 'Cormorant Garamond', serif; font-size: 64px; font-weight: 700;
    letter-spacing: -0.02em; line-height: 1; margin-bottom: 4px;
  }
  .clock-date { font-size: 15px; color: rgba(255,255,255,0.6); margin-bottom: 32px; }
  .gps-status {
    display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
    border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 28px;
  }
  .gps-ok { background: rgba(61,107,79,0.3); color: #7DC49A; }
  .gps-err { background: rgba(139,46,46,0.3); color: #E8948F; }
  .gps-loading { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
  .gps-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .gps-dot.ok { background: #7DC49A; animation: pulse-green 2s infinite; }
  .gps-dot.err { background: #E8948F; }
  .gps-dot.loading { background: rgba(255,255,255,0.5); animation: pulse-white 1s infinite; }
  @keyframes pulse-green { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.8)} }
  @keyframes pulse-white { 0%,100%{opacity:0.5} 50%{opacity:1} }

  .clock-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-clock-in {
    padding: 14px 36px; border-radius: var(--radius); font-family: 'DM Sans', sans-serif;
    font-size: 16px; font-weight: 600; cursor: pointer; border: none; transition: all 0.25s;
    background: linear-gradient(135deg, var(--gold), #B8924A); color: var(--white);
    box-shadow: 0 4px 20px rgba(201,168,76,0.35);
  }
  .btn-clock-in:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,168,76,0.45); }
  .btn-clock-in:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-clock-refresh {
    padding: 14px 20px; border-radius: var(--radius); font-family: 'DM Sans', sans-serif;
    font-size: 16px; cursor: pointer; border: 1.5px solid rgba(255,255,255,0.2);
    background: transparent; color: rgba(255,255,255,0.7); transition: all 0.2s;
  }
  .btn-clock-refresh:hover { background: rgba(255,255,255,0.08); color: var(--white); }

  /* ── Distance Meter ── */
  .distance-bar { margin-top: 20px; }
  .distance-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; display: flex; justify-content: space-between; }
  .dist-track { height: 6px; background: rgba(255,255,255,0.1); border-radius: 100px; overflow: hidden; }
  .dist-fill { height: 100%; border-radius: 100px; transition: width 0.5s; }
  .dist-fill.safe { background: linear-gradient(90deg, #7DC49A, #4CAF50); }
  .dist-fill.warn { background: linear-gradient(90deg, #E8C97A, #FFC107); }
  .dist-fill.danger { background: linear-gradient(90deg, #E8948F, #f44336); }

  /* ── Table ── */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--brown-500); padding: 12px 16px;
    border-bottom: 1px solid var(--brown-100);
  }
  .data-table td { padding: 14px 16px; font-size: 14px; color: var(--brown-800); border-bottom: 1px solid var(--brown-50); transition: background 0.15s; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: var(--brown-50); }
  .badge {
    display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px;
    border-radius: 100px; font-size: 12px; font-weight: 500;
  }
  .badge-success { background: var(--success-light); color: var(--success); }
  .badge-error { background: var(--error-light); color: var(--error); }
  .badge-warning { background: var(--warning-light); color: var(--warning); }
  .badge-neutral { background: var(--brown-100); color: var(--brown-600); }

  /* ── Location Setup ── */
  .loc-map-mock {
    width: 100%; height: 220px; border-radius: var(--radius); background: var(--brown-50);
    border: 2px dashed var(--brown-200); display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;
    position: relative; overflow: hidden;
  }
  .loc-map-active {
    background: linear-gradient(135deg, #e8f4ee, #f0f7f4);
    border: 2px solid var(--success); border-style: solid;
  }
  .loc-coords { font-family: monospace; font-size: 13px; color: var(--brown-600); background: var(--brown-100); padding: 6px 14px; border-radius: 6px; }
  .radius-input-wrap { display: flex; align-items: center; gap: 12px; }
  .radius-display { font-size: 22px; font-weight: 700; color: var(--brown-800); font-family: 'Cormorant Garamond', serif; min-width: 80px; }

  /* ── Avatar ── */
  .avatar {
    width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600; color: var(--white);
  }
  .avatar-sm { width: 32px; height: 32px; font-size: 12px; }
  .avatar-lg { width: 56px; height: 56px; font-size: 18px; }

  /* ── Toast ── */
  .toast-wrap { position: fixed; bottom: 32px; right: 32px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
  .toast {
    display: flex; align-items: center; gap: 12px; padding: 14px 20px;
    border-radius: var(--radius); background: var(--white); box-shadow: var(--shadow-lg);
    border-left: 4px solid; font-size: 14px; color: var(--brown-800);
    animation: slideIn 0.3s ease; min-width: 280px;
  }
  .toast.success { border-color: var(--success); }
  .toast.error { border-color: var(--error); }
  .toast.info { border-color: var(--brown-500); }
  @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(28,15,5,0.55); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); }
  .modal { background: var(--white); border-radius: var(--radius-xl); padding: 40px; max-width: 500px; width: 100%; box-shadow: var(--shadow-xl); }
  .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: var(--brown-900); margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: var(--brown-500); margin-bottom: 28px; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 28px; }

  /* ── Empty State ── */
  .empty-state { text-align: center; padding: 64px 32px; color: var(--brown-400); }
  .empty-state-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .empty-state h3 { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: var(--brown-600); margin-bottom: 8px; }
  .empty-state p { font-size: 14px; }

  /* ── Filters ── */
  .filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .filter-input { padding: 9px 14px; border: 1.5px solid var(--brown-200); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--brown-800); outline: none; background: var(--white); }
  .filter-input:focus { border-color: var(--brown-500); }

  /* ── Profile card ── */
  .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
  .profile-info h2 { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: var(--brown-900); }
  .profile-info p { font-size: 14px; color: var(--brown-500); margin-top: 2px; }

  /* ── Alert Box ── */
  .alert { padding: 14px 18px; border-radius: var(--radius); font-size: 14px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 10px; }
  .alert-error { background: var(--error-light); color: var(--error); border: 1px solid rgba(139,46,46,0.15); }
  .alert-success { background: var(--success-light); color: var(--success); border: 1px solid rgba(61,107,79,0.15); }
  .alert-warning { background: var(--warning-light); color: var(--warning); border: 1px solid rgba(139,106,26,0.15); }
  .alert-info { background: var(--brown-50); color: var(--brown-700); border: 1px solid var(--brown-200); }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .auth-wrap { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 32px 24px; }
    .sidebar { width: 100%; height: auto; position: relative; }
    .main-content { margin-left: 0; padding: 24px 16px; }
    .app-shell { flex-direction: column; }
    .clock-time { font-size: 42px; }
  }
`;

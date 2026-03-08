// ═══════════════════════════════════════
//  STATE & HELPERS
// ═══════════════════════════════════════
const VALID_FLAT_CODES = ['flat-001','flat-002','flat-003','flat-101','flat-102'];
const VALID_SEC_CODES  = ['sec-001','sec-002','sec-003'];

// ── HARDCODED ACCOUNTS ──────────────────────────────────────────────
const HARDCODED_USERS = [
  {
    role: 'guard',
    name: 'Ramya',
    email: 'ramya@gmail.com',
    password: 'security@123',
    secCode: 'sec-001'
  },
  {
    role: 'tenant',
    name: 'Shamika Hasini',
    email: 'shamikahasini@gmail.com',
    password: 'shamika2002',
    block: 'A',
    flat: '101',
    phone: '9182469652',
    flatCode: 'flat-101'
  },
  {
    role: 'tenant',
    name: 'Udaya',
    email: 'udaya@gmail.com',
    password: 'shamika2002',
    block: 'B',
    flat: '402',
    phone: '9182469652',
    flatCode: 'flat-002'
  },
  {
    role: 'tenant',
    name: 'Kishore',
    email: 'kishore@gmail.com',
    password: 'shamika2002',
    block: 'C',
    flat: '202',
    phone: '9182469652',
    flatCode: 'flat-003'
  }
];

let currentPortal = 'tenant';
let currentUser   = null;
let state = {
  users: [],
  visitors: [],
  visitLog: [],
  preApprovals: [],
  schedules: [],
  absencePw: {}
};

function loadState(){
  try{
    const s = localStorage.getItem('vaes_state');
    if(s){ state = JSON.parse(s); }
  }catch(e){}
  HARDCODED_USERS.forEach(hu => {
    if(!state.users.find(u => u.email === hu.email)){
      state.users.push(hu);
    } else {
      const idx = state.users.findIndex(u => u.email === hu.email);
      state.users[idx] = { ...state.users[idx], ...hu };
    }
  });
  saveState();
}

function saveState(){ localStorage.setItem('vaes_state', JSON.stringify(state)); }
loadState();

function ts(){ return new Date().toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'}); }
function isValidEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function showToast(msg, icon='✅'){
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-icon').textContent = icon;
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3500);
}

function showErr(id, show){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.toggle('show', show);
  const inp = el.previousElementSibling?.tagName !== 'LABEL' ? el.previousElementSibling : null;
  if(inp) inp.classList.toggle('err', show);
}

function eyeToggle(id, btn){
  const inp = document.getElementById(id);
  if(inp.type==='password'){inp.type='text'; btn.textContent='🙈';}
  else{inp.type='password'; btn.textContent='👁';}
}

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function closeModalOut(e, id){ if(e.target.id===id) closeModal(id); }

// ═══════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════
function selectPortal(p, el){
  currentPortal = p;
  document.querySelectorAll('.portal-pill').forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
  const tab = document.querySelector('.a-tab.active').textContent.includes('Create') ? 'signup' : 'login';
  if(tab==='signup') showSignupForm(p);
}

function switchAuthTab(tab){
  document.querySelectorAll('.a-tab').forEach((t,i)=>t.classList.toggle('active', (i===0&&tab==='login')||(i===1&&tab==='signup')));
  document.querySelectorAll('.form-section').forEach(f=>f.classList.remove('active'));
  if(tab==='login'){ document.getElementById('fs-login').classList.add('active'); }
  else { showSignupForm(currentPortal); }
}

function showSignupForm(p){
  document.querySelectorAll('.form-section').forEach(f=>f.classList.remove('active'));
  document.getElementById(p==='tenant'?'fs-signup-tenant':'fs-signup-guard').classList.add('active');
}

function doLogin(){
  const email = document.getElementById('l-email').value.trim();
  const pw    = document.getElementById('l-pw').value;
  let ok = true;
  if(!isValidEmail(email)){ showErr('l-email-err',true); ok=false; } else showErr('l-email-err',false);
  if(!pw){ showErr('l-pw-err',true); ok=false; } else showErr('l-pw-err',false);
  if(!ok) return;

  const user = state.users.find(u => u.email.toLowerCase()===email.toLowerCase() && u.password===pw);
  if(!user){ showToast('Invalid email or password','❌'); return; }

  currentUser = user;
  if(user.role==='guard') loadGuardDash();
  else loadTenantDash();
}

function doSignupTenant(){
  const name  = document.getElementById('st-name').value.trim();
  const block = document.getElementById('st-block').value.trim().toUpperCase();
  const flat  = document.getElementById('st-flat').value.trim();
  const email = document.getElementById('st-email').value.trim();
  const code  = document.getElementById('st-code').value.trim().toLowerCase();
  const pw    = document.getElementById('st-pw').value;
  let ok = true;
  if(!name){showErr('st-name-err',true);ok=false;}else showErr('st-name-err',false);
  if(!block){showErr('st-block-err',true);ok=false;}else showErr('st-block-err',false);
  if(!flat){showErr('st-flat-err',true);ok=false;}else showErr('st-flat-err',false);
  if(!isValidEmail(email)){showErr('st-email-err',true);ok=false;}else showErr('st-email-err',false);
  if(!VALID_FLAT_CODES.includes(code)){showErr('st-code-err',true);ok=false;}else showErr('st-code-err',false);
  if(pw.length<8){showErr('st-pw-err',true);ok=false;}else showErr('st-pw-err',false);
  if(!ok) return;
  if(state.users.find(u=>u.email===email)){ showToast('Email already registered','❌'); return; }
  state.users.push({role:'tenant',name,block,flat,email,password:pw,flatCode:code});
  saveState();
  showToast(`Account created! Welcome, ${name}`,'🎉');
  switchAuthTab('login');
  document.getElementById('l-email').value = email;
}

function doSignupGuard(){
  const name  = document.getElementById('sg-name').value.trim();
  const email = document.getElementById('sg-email').value.trim();
  const code  = document.getElementById('sg-code').value.trim().toLowerCase();
  const pw    = document.getElementById('sg-pw').value;
  let ok = true;
  if(!name){showErr('sg-name-err',true);ok=false;}else showErr('sg-name-err',false);
  if(!isValidEmail(email)){showErr('sg-email-err',true);ok=false;}else showErr('sg-email-err',false);
  if(!VALID_SEC_CODES.includes(code)){showErr('sg-code-err',true);ok=false;}else showErr('sg-code-err',false);
  if(pw.length<8){showErr('sg-pw-err',true);ok=false;}else showErr('sg-pw-err',false);
  if(!ok) return;
  if(state.users.find(u=>u.email===email)){ showToast('Email already registered','❌'); return; }
  state.users.push({role:'guard',name,email,password:pw,secCode:code});
  saveState();
  showToast(`Security account created! Welcome, ${name}`,'🎉');
  switchAuthTab('login');
  document.getElementById('l-email').value = email;
}

function logout(){
  currentUser = null;
  showScreen('s-auth');
  document.getElementById('l-email').value='';
  document.getElementById('l-pw').value='';
}

// ═══════════════════════════════════════
//  SECURITY DASHBOARD
// ═══════════════════════════════════════
function loadGuardDash(){
  showScreen('s-security');
  document.getElementById('guard-nav-name').textContent = currentUser.name;
  refreshGuardStats();
  renderGuardRequests();
  renderGuardLog();
}

function secTab(name, el){
  document.querySelectorAll('#s-security .d-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#s-security .dash-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('sp-'+name).classList.add('active');
  if(name==='requests') renderGuardRequests();
  if(name==='log') renderGuardLog();
}

function refreshGuardStats(){
  // Merge visitors + scheduled entries for accurate counts
  const all = getMergedLog();
  document.getElementById('sg-stat-today').textContent = all.length;
  document.getElementById('sg-stat-pending').textContent = all.filter(v=>v.status==='pending').length;
  document.getElementById('sg-stat-approved').textContent = all.filter(v=>v.status==='approved').length;
  document.getElementById('sg-stat-denied').textContent = all.filter(v=>v.status==='denied').length;
}

// ── NEW HELPER: build a unified log merging visitors + scheduled entries ──
function getMergedLog(){
  const log = [...state.visitLog];
  const scheduledIds = new Set(log.map(e => e.scheduleId).filter(Boolean));

  state.schedules.forEach(s => {
    // Only add if not already synced into the log
    if(!scheduledIds.has(s.id)){
      log.unshift({
        id: 'sch-' + s.id,
        scheduleId: s.id,
        name: s.name,
        phone: s.phone || '—',
        purpose: s.purpose || 'Scheduled Visit',
        block: s.block,
        flat: s.flat,
        status: 'scheduled',
        via: 'Pre-Scheduled',
        time: s.date + (s.time ? ' ' + s.time : ''),
        isScheduled: true
      });
    }
  });
  return log;
}

function sendApprovalRequest(){
  const name    = document.getElementById('vr-name').value.trim();
  const phone   = document.getElementById('vr-phone').value.trim();
  const purpose = document.getElementById('vr-purpose').value;
  const block   = document.getElementById('vr-block').value.trim().toUpperCase();
  const flat    = document.getElementById('vr-flat').value.trim();
  let ok = true;
  if(!name){showErr('vr-name-err',true);ok=false;}else showErr('vr-name-err',false);
  if(!phone){showErr('vr-phone-err',true);ok=false;}else showErr('vr-phone-err',false);
  if(!purpose){showErr('vr-purpose-err',true);ok=false;}else showErr('vr-purpose-err',false);
  if(!block){showErr('vr-block-err',true);ok=false;}else showErr('vr-block-err',false);
  if(!flat){showErr('vr-flat-err',true);ok=false;}else showErr('vr-flat-err',false);
  if(!ok) return;

  const isPA = state.preApprovals.find(pa=>pa.block===block && pa.flat===flat && pa.phone===phone);

  // ── FIX: also check if visitor matches a scheduled guest ──
  const isSched = state.schedules.find(s =>
    s.block===block && s.flat===flat &&
    (s.phone===phone || s.name.toLowerCase()===name.toLowerCase())
  );

  let status, via;
  if(isPA){
    status = 'approved'; via = 'Pre-Approved';
  } else if(isSched){
    status = 'approved'; via = 'Pre-Scheduled';
  } else {
    status = 'pending'; via = 'Awaiting Approval';
  }

  const entry = {
    id: Date.now(), name, phone, purpose, block, flat,
    status, via,
    time: ts(), guardId: currentUser.email,
    scheduleId: isSched ? isSched.id : undefined
  };
  state.visitors.unshift(entry);
  state.visitLog.unshift({...entry});
  saveState();

  ['vr-name','vr-phone','vr-block','vr-flat'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('vr-purpose').selectedIndex=0;

  refreshGuardStats();
  if(isPA)    showToast(`${name} is pre-approved! Access granted.`,'✅');
  else if(isSched) showToast(`${name} is pre-scheduled! Access granted.`,'📅');
  else        showToast(`Approval request sent to Flat ${block}-${flat}`,'📨');
}

function verifyAbsencePw(){
  const block   = document.getElementById('vpw-block').value.trim().toUpperCase();
  const flat    = document.getElementById('vpw-flat').value.trim();
  const entered = document.getElementById('vpw-input').value;
  const res     = document.getElementById('vpw-result');
  res.style.display='block';
  if(!block||!flat||!entered){ res.innerHTML='<span style="color:var(--warn)">⚠️ Please fill all fields</span>'; return; }
  const tenant = state.users.find(u=>u.role==='tenant' && u.block===block && u.flat===flat);
  if(!tenant){ res.innerHTML='<span style="color:var(--danger)">❌ No tenant found for Block '+block+', Flat '+flat+'</span>'; return; }
  const saved = state.absencePw[tenant.email];
  if(!saved){ res.innerHTML='<span style="color:var(--warn)">⚠️ Tenant has not set an absence password</span>'; return; }
  if(saved === entered){
    const entry = {
      id:Date.now(), name:'Absence Password Entry', phone:'—', purpose:'Pre-approved (Absence PW)',
      block, flat, status:'approved', via:'Absence Password', time:ts(), guardId:currentUser.email
    };
    state.visitors.unshift(entry);
    state.visitLog.unshift({...entry});
    saveState(); refreshGuardStats();
    res.innerHTML='<span style="color:var(--success)">✅ Password correct! Access granted for Block '+block+', Flat '+flat+'</span>';
    document.getElementById('vpw-block').value='';
    document.getElementById('vpw-flat').value='';
    document.getElementById('vpw-input').value='';
  } else {
    res.innerHTML='<span style="color:var(--danger)">❌ Incorrect password</span>';
  }
}

function renderGuardRequests(){
  const list = document.getElementById('guard-requests-list');
  const mine = state.visitors.filter(v=>v.guardId===currentUser.email);
  if(!mine.length){ list.innerHTML='<div class="empty"><div class="empty-icon">📭</div><div class="empty-txt">No requests sent yet</div></div>'; return; }
  list.innerHTML = mine.map(v=>`
    <div class="req-item">
      <div class="req-avatar ${v.status==='approved'?'av-green':v.status==='denied'?'':'av-blue'}">${v.name.charAt(0)}</div>
      <div class="req-details">
        <div class="req-name">${v.name}</div>
        <div class="req-meta">${v.phone} · ${v.purpose} · Block ${v.block}, Flat ${v.flat} · ${v.time}</div>
      </div>
      <span class="badge ${v.status==='approved'?'badge-green':v.status==='denied'?'badge-red':'badge-warn'}">${v.status.toUpperCase()}</span>
    </div>
  `).join('');
}

function renderGuardLog(){
  const tbody = document.getElementById('guard-log-body');

  // ── FIX: use merged log so scheduled guests always appear ──
  const merged = getMergedLog();

  if(!merged.length){ tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem">No entries yet</td></tr>'; return; }

  tbody.innerHTML = merged.map(v=>{
    const isScheduled = v.isScheduled;
    const statusClass = v.status==='approved'  ? 'badge-green'
                      : v.status==='denied'    ? 'badge-red'
                      : v.status==='scheduled' ? 'badge-blue'
                      : 'badge-warn';
    return `
    <tr ${isScheduled ? 'style="opacity:.8"' : ''}>
      <td>
        ${isScheduled ? '<span style="font-size:.7rem;background:rgba(168,85,247,.15);color:#a78bfa;border:1px solid rgba(168,85,247,.3);border-radius:4px;padding:1px 5px;margin-right:4px;">SCHED</span>' : ''}
        ${v.name}
      </td>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:.78rem">${v.block}-${v.flat}</span></td>
      <td>${v.purpose}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--muted)">${v.time}</td>
      <td><span class="badge ${statusClass}">${v.status}</span></td>
      <td style="font-size:.78rem;color:var(--muted)">${v.via}</td>
    </tr>`;
  }).join('');
}

function exportCSV(){
  const merged = getMergedLog();
  const rows = [['Visitor','Block','Flat','Purpose','Time','Status','Via'],
    ...merged.map(v=>[v.name,v.block,v.flat,v.purpose,v.time,v.status,v.via])];
  const csv = rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download = 'visit_log.csv'; a.click();
  showToast('Log exported','⬇');
}

// ═══════════════════════════════════════
//  TENANT DASHBOARD
// ═══════════════════════════════════════
function loadTenantDash(){
  showScreen('s-tenant');
  document.getElementById('tenant-nav-name').textContent = `${currentUser.name} · Block ${currentUser.block}-${currentUser.flat}`;
  refreshTenantStats();
  renderTenantPending();
  renderPreApprovals();
  renderSchedules();
  renderTenantLog();
}

function tenTab(name, el){
  document.querySelectorAll('#s-tenant .d-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#s-tenant .dash-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tp-'+name).classList.add('active');
}

function refreshTenantStats(){
  const mine = state.visitors.filter(v=>v.block===currentUser.block && v.flat===currentUser.flat);
  const pending = mine.filter(v=>v.status==='pending').length;
  document.getElementById('tn-stat-pending').textContent = pending;
  document.getElementById('tn-stat-approved').textContent = mine.filter(v=>v.status==='approved').length;
  document.getElementById('tn-stat-denied').textContent = mine.filter(v=>v.status==='denied').length;
  document.getElementById('tn-stat-preapproved').textContent =
    state.preApprovals.filter(p=>p.block===currentUser.block&&p.flat===currentUser.flat).length
    + state.schedules.filter(s=>s.block===currentUser.block&&s.flat===currentUser.flat).length;
  document.getElementById('tn-notif').style.display = pending > 0 ? 'inline-block' : 'none';
}

function renderTenantPending(){
  const list = document.getElementById('tenant-pending-list');
  const mine = state.visitors.filter(v=>v.block===currentUser.block && v.flat===currentUser.flat);
  const pending = mine.filter(v=>v.status==='pending');
  if(!pending.length){ list.innerHTML='<div class="empty"><div class="empty-icon">🎉</div><div class="empty-txt">No pending approvals</div></div>'; return; }
  list.innerHTML = pending.map(v=>`
    <div class="req-item" id="req-${v.id}">
      <div class="req-avatar av-blue">${v.name.charAt(0)}</div>
      <div class="req-details">
        <div class="req-name">${v.name}</div>
        <div class="req-meta">${v.phone} · ${v.purpose} · ${v.time}</div>
      </div>
      <div class="req-actions">
        <button class="btn btn-success btn-sm" onclick="approveVisitor(${v.id})">✓ Approve</button>
        <button class="btn btn-danger btn-sm" onclick="denyVisitor(${v.id})">✕ Deny</button>
      </div>
    </div>
  `).join('');
}

function approveVisitor(id){
  const v = state.visitors.find(x=>x.id===id);
  const l = state.visitLog.find(x=>x.id===id);
  if(v){ v.status='approved'; v.via='Host Approved'; }
  if(l){ l.status='approved'; l.via='Host Approved'; }
  saveState(); refreshTenantStats(); renderTenantPending(); renderTenantLog();
  showToast('Visitor approved! Gate notified.','✅');
}

function denyVisitor(id){
  const v = state.visitors.find(x=>x.id===id);
  const l = state.visitLog.find(x=>x.id===id);
  if(v){ v.status='denied'; v.via='Host Denied'; }
  if(l){ l.status='denied'; l.via='Host Denied'; }
  saveState(); refreshTenantStats(); renderTenantPending(); renderTenantLog();
  showToast('Visitor denied.','🚫');
}

function renderTenantLog(){
  const tbody = document.getElementById('tenant-log-body');

  // ── FIX: include scheduled entries in tenant log too ──
  const visitEntries = state.visitLog.filter(v=>v.block===currentUser.block && v.flat===currentUser.flat);

  // Add scheduled guests not yet in visitLog
  const syncedSchedIds = new Set(visitEntries.map(e=>e.scheduleId).filter(Boolean));
  const schedEntries = state.schedules
    .filter(s=>s.block===currentUser.block && s.flat===currentUser.flat && !syncedSchedIds.has(s.id))
    .map(s=>({
      id:'sch-'+s.id, scheduleId:s.id,
      name:s.name, phone:s.phone||'—',
      purpose:s.purpose||'Scheduled Visit',
      block:s.block, flat:s.flat,
      status:'scheduled', via:'Pre-Scheduled',
      time:s.date+(s.time?' '+s.time:''),
      isScheduled:true
    }));

  const all = [...visitEntries, ...schedEntries];

  if(!all.length){ tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">No visits yet</td></tr>'; return; }
  tbody.innerHTML = all.map(v=>{
    const statusClass = v.status==='approved'  ? 'badge-green'
                      : v.status==='denied'    ? 'badge-red'
                      : v.status==='scheduled' ? 'badge-blue'
                      : 'badge-warn';
    return `
    <tr>
      <td>
        ${v.isScheduled ? '<span style="font-size:.7rem;background:rgba(168,85,247,.15);color:#a78bfa;border:1px solid rgba(168,85,247,.3);border-radius:4px;padding:1px 5px;margin-right:4px;">SCHED</span>' : ''}
        ${v.name}
      </td>
      <td>${v.purpose}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--muted)">${v.time}</td>
      <td><span class="badge ${statusClass}">${v.status}</span></td>
      <td style="font-size:.78rem;color:var(--muted)">${v.via}</td>
    </tr>`;
  }).join('');
}

// ─── Pre-Approvals ───
function addPreApproval(){
  const name     = document.getElementById('pa-name').value.trim();
  const phone    = document.getElementById('pa-phone').value.trim();
  const relation = document.getElementById('pa-relation').value.trim();
  const until    = document.getElementById('pa-until').value;
  const schedule = document.getElementById('pa-schedule').value;
  if(!name){showErr('pa-name-err',true);return;} showErr('pa-name-err',false);
  state.preApprovals.push({
    id:Date.now(), name, phone, relation, until, schedule,
    block:currentUser.block, flat:currentUser.flat
  });
  saveState(); closeModal('m-add-pa'); renderPreApprovals(); refreshTenantStats();
  document.getElementById('pa-name').value=''; document.getElementById('pa-phone').value='';
  document.getElementById('pa-relation').value=''; document.getElementById('pa-until').value='';
  showToast(`${name} added to pre-approvals`,'✅');
}

function removePA(id){
  state.preApprovals = state.preApprovals.filter(p=>p.id!==id);
  saveState(); renderPreApprovals(); refreshTenantStats();
  showToast('Pre-approval removed','🗑️');
}

function renderPreApprovals(){
  const list = document.getElementById('preapproval-list');
  const mine = state.preApprovals.filter(p=>p.block===currentUser.block&&p.flat===currentUser.flat);
  if(!mine.length){ list.innerHTML='<div class="empty"><div class="empty-icon">👥</div><div class="empty-txt">No pre-approvals yet</div></div>'; return; }
  list.innerHTML = mine.map(p=>`
    <div class="pa-item">
      <div class="req-avatar av-green">${p.name.charAt(0)}</div>
      <div class="pa-details">
        <div class="pa-name">${p.name}</div>
        <div class="pa-meta">${p.phone}${p.relation?' · '+p.relation:''}${p.until?' · Until '+p.until:''} · ${scheduleLabel(p.schedule)}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removePA(${p.id})">✕</button>
    </div>
  `).join('');
}

// ─── Schedules ───
function addSchedule(){
  const name    = document.getElementById('sc-name').value.trim();
  const phone   = document.getElementById('sc-phone').value.trim();
  const date    = document.getElementById('sc-date').value;
  const time    = document.getElementById('sc-time').value;
  const purpose = document.getElementById('sc-purpose').value.trim();
  if(!name){showErr('sc-name-err',true);return;} showErr('sc-name-err',false);
  if(!date){showErr('sc-date-err',true);return;} showErr('sc-date-err',false);

  const schedId = Date.now();

  state.schedules.push({
    id: schedId, name, phone, date, time, purpose,
    block:currentUser.block, flat:currentUser.flat
  });

  // ── FIX: also push a synced entry into visitLog so guard sees it immediately ──
  const logEntry = {
    id: 'sch-' + schedId,
    scheduleId: schedId,
    name,
    phone: phone || '—',
    purpose: purpose || 'Scheduled Visit',
    block: currentUser.block,
    flat:  currentUser.flat,
    status: 'scheduled',
    via: 'Pre-Scheduled',
    time: date + (time ? ' ' + time : ''),
    isScheduled: true
  };
  state.visitLog.unshift(logEntry);

  saveState(); closeModal('m-add-schedule'); renderSchedules(); renderTenantLog(); refreshTenantStats();
  ['sc-name','sc-phone','sc-date','sc-time','sc-purpose'].forEach(id=>document.getElementById(id).value='');
  showToast(`${name} scheduled for ${date}`,'📅');
}

function removeSchedule(id){
  state.schedules = state.schedules.filter(s=>s.id!==id);
  // Also remove the synced log entry
  state.visitLog = state.visitLog.filter(e=>e.scheduleId!==id);
  saveState(); renderSchedules(); renderTenantLog(); refreshTenantStats();
  showToast('Schedule removed','🗑️');
}

function renderSchedules(){
  const list = document.getElementById('schedule-list');
  const mine = state.schedules.filter(s=>s.block===currentUser.block&&s.flat===currentUser.flat);
  if(!mine.length){ list.innerHTML='<div class="empty"><div class="empty-icon">📅</div><div class="empty-txt">No scheduled guests</div></div>'; return; }
  list.innerHTML = mine.map(s=>`
    <div class="pa-item">
      <div class="req-avatar av-blue" style="background:linear-gradient(135deg,#7c3aed,#a855f7)">${s.name.charAt(0)}</div>
      <div class="pa-details">
        <div class="pa-name">${s.name}</div>
        <div class="pa-meta">${s.phone?s.phone+' · ':''}${s.date}${s.time?' at '+s.time:''} ${s.purpose?'· '+s.purpose:''}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeSchedule(${s.id})">✕</button>
    </div>
  `).join('');
}

// ─── Absence Password ───
function saveAbsencePw(){
  const pw = document.getElementById('absence-pw').value;
  if(!pw||pw.length<4){ showToast('Enter a password (min 4 chars)','⚠️'); return; }
  state.absencePw[currentUser.email] = pw;
  saveState();
  const status = document.getElementById('absence-pw-status');
  if(status){ status.style.display='block'; status.innerHTML='<span style="color:var(--success)">✅ Password saved! Security can now use this to grant entry.</span>'; }
  showToast('Absence password saved!','🔒');
}

// ─── Helpers ───
function scheduleLabel(s){
  return {any:'Any Time',weekdays:'Weekdays',weekends:'Weekends',morning:'Morning',afternoon:'Afternoon'}[s]||s;
}

// Set default future date for pre-approval
const tomorrow = new Date(); tomorrow.setFullYear(tomorrow.getFullYear()+1);
document.getElementById('pa-until').value = tomorrow.toISOString().split('T')[0];
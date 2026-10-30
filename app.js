(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE = 'monstiez-universe-starter-v1';
  const demoContent = [
    {id:'mv-we-go-up',title:'Music video discovery',subtitle:'Add the verified official video link here.',category:'Music video',type:'Video',duration:'MV',tone:'music',label:'WE GO UP',member:'All members'},
    {id:'stage-live',title:'Stage & performance',subtitle:'A home for official stage and performance links.',category:'Performance',type:'Stage',duration:'LIVE',tone:'performance',label:'ON STAGE',member:'All members'},
    {id:'behind-scenes',title:'Behind the scenes',subtitle:'Save official behind-the-scenes moments.',category:'Behind the scenes',type:'Behind the scenes',duration:'BTS',tone:'behind',label:'OFF CAMERA',member:'All members'},
    {id:'shorts-pick',title:'Short-form highlights',subtitle:'Collect official Shorts and vertical clips.',category:'Shorts',type:'Shorts',duration:'SHORT',tone:'short',label:'LITTLE MOMENT',member:'All members'},
    {id:'fan-favorite',title:'Your current favorite',subtitle:'Make a personal list of clips to revisit.',category:'Performance',type:'Fan pick',duration:'SAVE',tone:'performance',label:'FAN FAVORITE',member:'Ahyeon'},
    {id:'comeback-watch',title:'Release watchlist',subtitle:'A sample card for future official releases.',category:'Music video',type:'Watchlist',duration:'NEW',tone:'music',label:'ON YOUR LIST',member:'All members'}
  ];
  const members = [
    {name:'Ruka',initial:'R',color:'#ffd9e8',tagline:'The Ruka corner',description:'Build a personal collection of Ruka performance clips, moments and official appearances.'},
    {name:'Pharita',initial:'P',color:'#ffefd0',tagline:'The Pharita corner',description:'Collect favorite Pharita moments, performance links and fan-made reminders.'},
    {name:'Asa',initial:'A',color:'#d6f4f1',tagline:'The Asa corner',description:'Keep your favorite Asa stages, rap moments and official content together.'},
    {name:'Ahyeon',initial:'A',color:'#ffc9e4',tagline:'The Ahyeon corner',description:'A place to save Ahyeon performances, vocals, dance moments and favorite official clips.'},
    {name:'Rami',initial:'R',color:'#fff0d7',tagline:'The Rami corner',description:'Gather favorite Rami vocal moments, stages and official content in one place.'},
    {name:'Rora',initial:'R',color:'#e0dcff',tagline:'The Rora corner',description:'Save Rora performances, live vocals and memorable official moments.'},
    {name:'Chiquita',initial:'C',color:'#ffe0ee',tagline:'The Chiquita corner',description:'Build a collection of Chiquita performances, funny moments and official clips.'}
  ];
  const defaultGoals = [
    {id:'goal-watch',title:'Watch one favorite performance',detail:'Personal fan goal · not an official metric',done:false},
    {id:'goal-share',title:'Share a moment with a fellow MONSTIEZ',detail:'Personal fan goal · not an official metric',done:false},
    {id:'goal-save',title:'Save a clip for every member',detail:'Personal fan goal · not an official metric',done:true}
  ];
  const defaultEvents = [
    {id:'event-check',name:'Check the official schedule',date:'',detail:'Reminder placeholder · verify official announcements'},
    {id:'event-watch',name:'Community watch session',date:'',detail:'Your own reminder · add a date below'}
  ];
  let state = readState();
  let currentScreen = 'welcome';
  let feedFilter = 'All';
  let contentFilter = 'All';
  let memberFilter = 'All';
  let selectedMember = 'Ahyeon';
  let statsPlatform = 'YouTube';
  let toastTimeout;
  let currentTrackerView = null; // {kind:'release'|'audience'|'totals'|'compare'|'sources', ...}

  function readState() {
    const empty = {goals:defaultGoals,events:defaultEvents,saved:[],favorites:[],entered:false};
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE) || 'null');
      return stored && typeof stored === 'object' ? {...empty,...stored} : empty;
    } catch { return empty; }
  }
  function persist() { try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch { showToast('Could not save to this device.'); } }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function showToast(message) {
    const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function goTo(screen) {
    if (screen === 'welcome' && state.entered) screen = 'home';
    const target = $(`#${screen}Screen`);
    if (!target) return;
    currentScreen = screen;
    $$('.screen').forEach(node => node.classList.toggle('active', node === target));
    $('#topbar').style.display = screen === 'welcome' ? 'none' : 'flex';
    $('#bottomNav').style.display = screen === 'welcome' ? 'none' : 'grid';
    const navId = screen === 'trackerview' ? 'stats' : screen;
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.screen === navId));
    $('#main').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
    if (screen === 'home') renderHomeContent();
    if (screen === 'discover') renderDiscover();
    if (screen === 'member') renderMember();
    if (screen === 'stats') renderStatsScreen();
    if (screen === 'events') renderEvents();
  }

  /* ---------- hash router for tracker subviews ---------- */
  function routeFromHash() {
    const hash = location.hash.replace(/^#\/?/, '');
    if (!hash) return false;
    if (['home','discover','stats','events','me','member'].includes(hash)) {
      // Main screens are also deep-linkable (e.g. shared #stats links).
      state.entered = true; persist();
      goTo(hash);
      return true;
    }
    const parts = hash.split('/');
    const detailRoot = $('#detailRoot');
    if (parts[0] === 'release' && (parts[1] === 'v' || parts[1] === 's') && parts[2]) {
      currentTrackerView = { kind: 'release', platformKind: parts[1], id: decodeURIComponent(parts[2]) };
      goTo('trackerview');
      MONSTIEZ.detail.render(parts[1], decodeURIComponent(parts[2]));
      return true;
    }
    if (parts[0] === 'audience') {
      currentTrackerView = { kind: 'audience' };
      goTo('trackerview');
      MONSTIEZ.views.audience(detailRoot);
      return true;
    }
    if (parts[0] === 'totals' && (parts[1] === 'youtube' || parts[1] === 'spotify')) {
      currentTrackerView = { kind: 'totals', platform: parts[1] };
      goTo('trackerview');
      MONSTIEZ.views.totals(detailRoot, parts[1]);
      return true;
    }
    if (parts[0] === 'compare' && parts[1] === 'from' && parts[2] && parts[3]) {
      currentTrackerView = { kind: 'compare', fromKind: parts[2], fromId: decodeURIComponent(parts[3]) };
      goTo('trackerview');
      MONSTIEZ.views.compare(detailRoot, parts[2], decodeURIComponent(parts[3]));
      return true;
    }
    if (parts[0] === 'sources') {
      currentTrackerView = { kind: 'sources' };
      goTo('trackerview');
      MONSTIEZ.views.sources(detailRoot);
      return true;
    }
    return false;
  }
  window.addEventListener('hashchange', () => { if (!routeFromHash() && currentScreen === 'trackerview') goTo('stats'); });
  function makeContentCard(item) {
    const saved = state.saved.includes(item.id);
    return `<article class="content-card" data-id="${escapeHtml(item.id)}">
      <div class="thumb ${escapeHtml(item.tone)}"><span class="thumb-tag">${escapeHtml(item.type)}</span><div class="thumb-label">${escapeHtml(item.label)}</div><span class="thumb-play" aria-hidden="true">▶</span></div>
      <div class="content-body"><div class="content-meta">✦ ${escapeHtml(item.category)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subtitle)}</p><div class="content-foot"><span>${escapeHtml(item.duration)} · Link to be verified</span><button class="save-btn ${saved?'saved':''}" data-save="${escapeHtml(item.id)}" aria-label="${saved?'Remove saved':'Save'} ${escapeHtml(item.title)}">${saved?'♥':'♡'}</button></div></div>
    </article>`;
  }
  /* ---------- real tracked videos (from data/*.json, provenance preserved) ---------- */
  function realVideos() {
    const st = MONSTIEZ.store.get();
    if (!st.loaded || !st.catalog || !st.catalog.videos || !st.catalog.videos.length) return null;
    return MONSTIEZ.store.videoList();
  }
  function tagLabelOf(slug) {
    const t = ((MONSTIEZ.store.get().catalog || {}).tags || []).find(t => t.slug === slug);
    return t ? t.label : (slug || '').replace(/_/g, ' ');
  }
  function makeVideoCard(v) {
    const saved = state.saved.includes(v.id);
    const l = v.views && MONSTIEZ.util.latest(v.views);
    const views = l ? `${MONSTIEZ.util.compact(l.v)} views` : 'counting…';
    return `<article class="content-card" data-id="${escapeHtml(v.id)}">
      <a class="video-thumb" href="https://www.youtube.com/watch?v=${escapeHtml(v.id)}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(v.title)} on YouTube">
        <img src="${escapeHtml(v.thumb)}" alt="" loading="lazy" onerror="this.classList.add('broken')"/>
        <span class="thumb-play" aria-hidden="true">▶</span>
      </a>
      <div class="content-body"><div class="content-meta">✦ ${escapeHtml(tagLabelOf(v.tag))}</div><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.channel)} · ${escapeHtml(views)}</p><div class="content-foot"><span>YouTube · official video</span><button class="save-btn ${saved?'saved':''}" data-save="${escapeHtml(v.id)}" aria-label="${saved?'Remove saved':'Save'} ${escapeHtml(v.title)}">${saved?'♥':'♡'}</button></div></div>
    </article>`;
  }
  function videoMatches(v, query) {
    return `${v.title} ${v.channel} ${tagLabelOf(v.tag)}`.toLowerCase().includes(query);
  }
  function attachSaveListeners(root) {
    $$('[data-save]', root).forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.save;
      state.saved = state.saved.includes(id) ? state.saved.filter(x => x !== id) : [...state.saved,id];
      persist(); renderHomeContent(); renderDiscover(); renderMember(); showToast(state.saved.includes(id) ? 'Saved to your fan collection ♡' : 'Removed from your saved collection.');
    }));
  }
  function renderHomeContent() {
    const list = $('#latestList');
    const vids = realVideos();
    if (vids) {
      let items = [...vids].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
      if (feedFilter === 'News') items = items.filter(v => v.tag === 'variety');
      if (feedFilter === 'Events') { list.innerHTML = '<div class="empty-state">Your calendar is ready for release dates, livestreams and personal reminders. Open <b>Fan calendar</b> to add one.</div>'; return; }
      if (feedFilter === 'For You') items = items.filter(v => videoMatches(v, selectedMember.toLowerCase()));
      if (feedFilter === 'Videos') items = items.filter(v => ['music_video','performance'].includes(v.tag));
      list.innerHTML = items.length ? items.slice(0,4).map(makeVideoCard).join('') : '<div class="empty-state">Nothing here yet — new releases appear automatically as the tracker catalogue updates.</div>';
      attachSaveListeners(list);
      return;
    }
    let items = demoContent;
    if (feedFilter === 'Videos') items = items.filter(x => ['Music video','Shorts'].includes(x.category));
    if (feedFilter === 'News') items = items.filter(x => x.category === 'Behind the scenes');
    if (feedFilter === 'Events') { list.innerHTML = '<div class="empty-state">Your calendar is ready for release dates, livestreams and personal reminders. Open <b>Fan calendar</b> to add one.</div>'; return; }
    if (feedFilter === 'For You') items = items.filter(x => x.member === selectedMember || x.id === 'fan-favorite');
    list.innerHTML = items.slice(0,4).map(makeContentCard).join(''); attachSaveListeners(list);
  }
  function renderDiscoverFilters() {
    const vids = realVideos();
    const row = $('#discoverFilters');
    if (!vids) return;
    const counts = new Map([['All', vids.length]]);
    for (const v of vids) { const lbl = tagLabelOf(v.tag); counts.set(lbl, (counts.get(lbl) || 0) + 1); }
    const entries = [...counts.entries()].sort((a,b)=>b[1]-a[1]);
    if (!entries.some(([lbl]) => lbl === contentFilter)) contentFilter = 'All';
    row.innerHTML = entries.map(([lbl,n]) => `<button class="chip ${contentFilter===lbl?'active':''}" data-category="${escapeHtml(lbl)}">${escapeHtml(lbl)} <small>${n}</small></button>`).join('');
    $$('[data-category]', row).forEach(btn=>btn.addEventListener('click',()=>{contentFilter=btn.dataset.category;$$('[data-category]').forEach(b=>b.classList.toggle('active',b===btn));renderDiscover();}));
  }
  function renderDiscover() {
    renderDiscoverFilters();
    const query = ($('#searchInput')?.value || '').trim().toLowerCase();
    const vids = realVideos();
    if (vids) {
      let items = vids.filter(v => contentFilter === 'All' || tagLabelOf(v.tag) === contentFilter);
      if (query) items = items.filter(v => videoMatches(v, query));
      items.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
      $('#discoverCount').textContent = `${items.length} ${items.length === 1 ? 'video' : 'videos'}`;
      $('#discoverList').innerHTML = items.length ? items.map(makeVideoCard).join('') : '<div class="empty-state">No matching videos yet. Try another search, or clear the filter.</div>';
      attachSaveListeners($('#discoverList'));
      return;
    }
    let items = demoContent.filter(item => contentFilter === 'All' || item.category === contentFilter);
    if (query) items = items.filter(item => `${item.title} ${item.subtitle} ${item.category} ${item.member} ${item.label}`.toLowerCase().includes(query));
    $('#discoverCount').textContent = `${items.length} ${items.length === 1 ? 'collection' : 'collections'}`;
    $('#discoverList').innerHTML = items.length ? items.map(makeContentCard).join('') : '<div class="empty-state">No matching items yet. Try another search, or clear the filter.</div>';
    attachSaveListeners($('#discoverList'));
  }
  function renderStats() {
    // Fan goals pane content (shown when the Fan goals tab is selected).
    const host=$('#goalList');
    host.innerHTML = state.goals.length ? state.goals.map(goal=>`<article class="goal-item"><span class="goal-symbol">${goal.done?'✓':'♡'}</span><div class="goal-detail"><strong>${escapeHtml(goal.title)}</strong><small>${escapeHtml(goal.detail)}</small></div><button class="goal-state ${goal.done?'done':''}" data-toggle-goal="${escapeHtml(goal.id)}">${goal.done?'Done':'Mark done'}</button><button class="goal-delete" data-delete-goal="${escapeHtml(goal.id)}" aria-label="Delete ${escapeHtml(goal.title)}">×</button></article>`).join('') : '<div class="empty-state">No personal goals yet. Add one below to start your own fan journey.</div>';
    $$('[data-toggle-goal]',host).forEach(btn=>btn.addEventListener('click',()=>{const g=state.goals.find(x=>x.id===btn.dataset.toggleGoal); if(!g)return; g.done=!g.done;persist();renderStats();showToast(g.done?'Goal marked complete. Nice work!':'Goal moved back to in progress.');}));
    $$('[data-delete-goal]',host).forEach(btn=>btn.addEventListener('click',()=>{state.goals=state.goals.filter(x=>x.id!==btn.dataset.deleteGoal);persist();renderStats();showToast('Personal goal removed.');}));
  }

  /* ---------- Stats screen: tracker tabs + fan goals ---------- */
  function renderStatsScreen() {
    const trackerRoot = $('#trackerRoot');
    const goalsPane = $('#fanGoalsPane');
    if (statsPlatform === 'Fan goals') {
      trackerRoot.hidden = true; trackerRoot.innerHTML = '';
      goalsPane.hidden = false;
      renderStats();
    } else {
      goalsPane.hidden = true;
      trackerRoot.hidden = false;
      MONSTIEZ.tracker.setPlatform(statsPlatform === 'Spotify' ? 'spotify' : 'youtube');
      MONSTIEZ.tracker.render();
    }
  }
  function renderEvents() {
    const host=$('#eventList');
    host.innerHTML = state.events.length ? state.events.map(event=>{
      const date = event.date ? new Date(`${event.date}T12:00:00`) : null;
      const day = date && !Number.isNaN(date.getTime()) ? date.getDate() : '—';
      const month = date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en',{month:'short'}).toUpperCase() : 'DATE';
      return `<article class="event-item"><div class="event-date-box"><b>${day}</b><small>${month}</small></div><div class="event-content"><strong>${escapeHtml(event.name)}</strong><p>${escapeHtml(event.detail || 'Personal reminder')}${event.date?' · '+escapeHtml(event.date):''}</p></div><div class="event-actions"><button data-edit-event="${escapeHtml(event.id)}">${event.date?'Edit date':'Add date'}</button><button class="delete-event" data-delete-event="${escapeHtml(event.id)}" aria-label="Delete reminder">×</button></div></article>`;
    }).join('') : '<div class="empty-state">Your calendar is clear. Add a release reminder or your own fan event.</div>';
    $$('[data-delete-event]',host).forEach(btn=>btn.addEventListener('click',()=>{state.events=state.events.filter(e=>e.id!==btn.dataset.deleteEvent);persist();renderEvents();showToast('Reminder removed.');}));
    $$('[data-edit-event]',host).forEach(btn=>btn.addEventListener('click',()=>{const event=state.events.find(e=>e.id===btn.dataset.editEvent);if(!event)return;$('#eventName').value=event.name;$('#eventDate').value=event.date||'';$('#eventName').dataset.editId=event.id;$('#eventForm').scrollIntoView({behavior:'smooth',block:'center'});$('#eventName').focus();}));
  }
  function renderMembers() {
    $('#memberSelectors').innerHTML = members.map(m=>`<button class="member-choice ${selectedMember===m.name?'selected':''}" data-member="${m.name}" style="--member-color:${m.color}" aria-pressed="${selectedMember===m.name}"><span class="member-avatar">${m.initial}</span><strong>${m.name}</strong></button>`).join('');
    $$('[data-member]', $('#memberSelectors')).forEach(btn=>btn.addEventListener('click',()=>{selectedMember=btn.dataset.member;memberFilter='All';$$('[data-member-tab]').forEach(b=>b.classList.toggle('active',b.dataset.memberTab==='All'));renderMember();}));
  }
  function renderMember() {
    const m=members.find(x=>x.name===selectedMember)||members[3];selectedMember=m.name;
    renderMembers();$('#memberName').textContent=m.name;$('#memberAvatar').textContent=m.initial;$('#memberAvatar').style.background=`linear-gradient(145deg,${m.color},#38303f)`;$('#memberTagline').textContent=m.tagline;$('#memberDescription').textContent=m.description;
    const favorite=state.favorites.includes(m.name);$('#favoriteMember').classList.toggle('favorited',favorite);$('#favoriteMember').textContent=favorite?'♥ In your favorites':'♡ Add to favorites';
    let items;
    const vids = realVideos();
    if (vids) {
      // Real tracked content mentioning this member by name (channels/title), honest empty state otherwise.
      const nameRe = new RegExp(selectedMember.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i');
      items = vids.filter(v => nameRe.test(v.title) || nameRe.test(v.channel));
      if (memberFilter !== 'All') items = items.filter(v => tagLabelOf(v.tag) === memberFilter);
      items.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
      $('#memberContent').innerHTML = items.length ? items.map(makeVideoCard).join('')
        : `<div class="empty-state">No tracked videos mention ${escapeHtml(selectedMember)} by name yet. The catalogue follows the channels the tracker watches — try another member or browse Discover.</div>`;
    } else {
      items = demoContent.filter(item => item.member === 'All members' || item.member === selectedMember);
      if (memberFilter !== 'All') items = items.filter(item => item.category === memberFilter);
      $('#memberContent').innerHTML = items.length ? items.map(makeContentCard).join('') : '<div class="empty-state">No matching saved sample cards for this category. Try All, or add verified content for this member.</div>';
    }
    attachSaveListeners($('#memberContent'));
  }
  function addGoal(title) {
    const clean=title.trim();if(!clean)return;state.goals.unshift({id:'goal-'+Date.now(),title:clean,detail:'Personal fan goal · saved on this device',done:false});persist();if(currentScreen==='stats')renderStatsScreen();else renderStats();$('#goalInput').value='';showToast('Your personal goal has been added ♡');
  }
  function addEvent(name,date,id) {
    const clean=name.trim();if(!clean||!date)return;
    const detail='Personal reminder';
    if(id){const event=state.events.find(x=>x.id===id);if(event){event.name=clean;event.date=date;event.detail=detail;}}
    else state.events.unshift({id:'event-'+Date.now(),name:clean,date,detail});
    persist();renderEvents();$('#eventName').value='';$('#eventDate').value='';delete $('#eventName').dataset.editId;showToast(id?'Reminder updated.':'Reminder saved on this device.');
  }
  function exportData() {
    const blob=new Blob([JSON.stringify({app:'MONSTIEZ Universe',exportedAt:new Date().toISOString(),notice:'Personal local data only. Demo content and sample chart are not official statistics.',data:state},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='monstiez-universe-my-data.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast('Your local data export was created.');
  }
  function resetDemo() {
    if(!window.confirm('Reset this starter demo? This clears saved clips, favorites, personal goals and reminders on this device.'))return;
    state={goals:defaultGoals.map(x=>({...x})),events:defaultEvents.map(x=>({...x})),saved:[],favorites:[],entered:true};persist();renderHomeContent();renderDiscover();renderStatsScreen();renderEvents();renderMember();showToast('Demo reset.');
  }
  // Navigation and controls
  $$('[data-screen]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();if(btn.dataset.screen==='home'&&!state.entered&&currentScreen==='welcome'){state.entered=true;persist();}goTo(btn.dataset.screen);}));
  $('#joinButton').addEventListener('click',()=>{state.entered=true;persist();goTo('home');showToast('Welcome to your MONSTIEZ corner ♡');});
  $('#notificationButton').addEventListener('click',()=>showToast('You are all caught up. Add reminders in your fan calendar.'));
  $$('[data-feed]').forEach(btn=>btn.addEventListener('click',()=>{feedFilter=btn.dataset.feed;$$('[data-feed]').forEach(b=>b.classList.toggle('active',b===btn));renderHomeContent();}));
  $$('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{contentFilter=btn.dataset.category;$$('[data-category]').forEach(b=>b.classList.toggle('active',b===btn));renderDiscover();}));
  $('#searchInput').addEventListener('input',renderDiscover);$('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';renderDiscover();$('#searchInput').focus();});
  $$('[data-platform]').forEach(btn=>btn.addEventListener('click',()=>{statsPlatform=btn.dataset.platform;$$('[data-platform]').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-selected',String(b===btn));});renderStatsScreen();}));
  $('#goalForm').addEventListener('submit',e=>{e.preventDefault();addGoal($('#goalInput').value);});
  $('#addGoalButton').addEventListener('click',()=>{$('#goalInput').focus();$('#goalForm').scrollIntoView({behavior:'smooth',block:'center'});});
  $('#eventForm').addEventListener('submit',e=>{e.preventDefault();addEvent($('#eventName').value,$('#eventDate').value,$('#eventName').dataset.editId);});
  $('#addEventButton').addEventListener('click',()=>{$('#eventName').focus();$('#eventForm').scrollIntoView({behavior:'smooth',block:'center'});});
  $('#favoriteMember').addEventListener('click',()=>{state.favorites=state.favorites.includes(selectedMember)?state.favorites.filter(x=>x!==selectedMember):[...state.favorites,selectedMember];persist();renderMember();showToast(state.favorites.includes(selectedMember)?`${selectedMember} added to your favorites ♡`:`${selectedMember} removed from favorites.`);});
  $$('[data-member-tab]').forEach(btn=>btn.addEventListener('click',()=>{memberFilter=btn.dataset.memberTab;$$('[data-member-tab]').forEach(b=>b.classList.toggle('active',b===btn));renderMember();}));
  $('#exportButton').addEventListener('click',exportData);$('#resetButton').addEventListener('click',resetDemo);

  /* ---------- theme (F-25) + share (F-24) ---------- */
  function applyTheme(mode) {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    const btn = $('#themeToggle');
    if (btn) { btn.textContent = mode === 'dark' ? '☀' : '☾'; btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
  }
  let themeMode = 'light';
  try { themeMode = localStorage.getItem('monstiez-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch {}
  applyTheme(themeMode);
  $('#themeToggle').addEventListener('click', () => {
    themeMode = themeMode === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('monstiez-theme', themeMode); } catch {}
    applyTheme(themeMode);
    showToast(themeMode === 'dark' ? 'Dark mode on — easy on the night-time eyes.' : 'Light mode on ♡');
  });
  $('#shareButton').addEventListener('click', async () => {
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title: 'MONSTIEZ Universe', url }); return; }
      await navigator.clipboard.writeText(url);
      showToast('Link copied — same screen, same filters ♡');
    } catch {
      showToast('Could not share from here — copy the address bar link instead.');
    }
  });

  // First render: show the welcome screen until Join is tapped on a new installation.
  renderHomeContent();renderDiscover();renderEvents();renderMember();
  // Dynamic date label on the home screen.
  const dateLabel=$('#homeScreen .date-label');
  if(dateLabel) dateLabel.textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
  // Data store: load tracker data, then refresh any visible tracker UI.
  MONSTIEZ.store.onChange(()=>{
    if(currentScreen==='stats' && statsPlatform!=='Fan goals') MONSTIEZ.tracker.render();
    if(currentScreen==='trackerview' && currentTrackerView){ routeFromHash(); }
    if(currentScreen==='home') renderHomeContent();
    if(currentScreen==='discover') renderDiscover();
    if(currentScreen==='member') renderMember();
  });
  MONSTIEZ.store.load();
  MONSTIEZ.tracker.init($('#trackerRoot'), { onOpenRelease: (href)=>{ location.hash = href.replace(/^#/,''); } });
  if(!routeFromHash()){ if(state.entered) goTo('home'); else goTo('welcome'); }
  if('serviceWorker' in navigator && location.protocol.startsWith('http') && !['localhost','127.0.0.1'].includes(location.hostname)) window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js').then(reg=>{
      // "A new version is ready" bar (reference parity F-26): never swap the app
      // underneath someone while they are reading — offer a Reload button instead.
      const showBar = () => {
        if ($('#updateBar')) return;
        const bar=document.createElement('div');
        bar.id='updateBar'; bar.className='update-bar'; bar.setAttribute('role','status');
        bar.innerHTML='<span>A new version is ready.</span><button id="updateReload">Reload</button>';
        document.querySelector('.app-shell').appendChild(bar);
        $('#updateReload').addEventListener('click',()=>{ if(navigator.serviceWorker.controller){navigator.serviceWorker.controller.postMessage('skip-waiting');} location.reload(); });
      };
      const check = () => { const w = reg.waiting || (reg.installing && reg.installing.state==='installed' ? reg.installing : null); if (w && navigator.serviceWorker.controller) showBar(); };
      reg.addEventListener('updatefound',()=>{ const nw=reg.installing; if(nw) nw.addEventListener('statechange',()=>{ if(nw.state==='installed' && navigator.serviceWorker.controller) showBar(); }); });
      check();
      setInterval(()=>reg.update().catch(()=>{}), 60*60*1000);
    }).catch(()=>{});
  });
})();

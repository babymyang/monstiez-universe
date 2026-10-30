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
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.screen === screen || (screen === 'member' && btn.dataset.screen === 'me' && false)));
    $('#main').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'smooth'});
    if (screen === 'discover') renderDiscover();
    if (screen === 'member') renderMember();
    if (screen === 'stats') renderGoals();
    if (screen === 'events') renderEvents();
  }
  function makeContentCard(item) {
    const saved = state.saved.includes(item.id);
    return `<article class="content-card" data-id="${escapeHtml(item.id)}">
      <div class="thumb ${escapeHtml(item.tone)}"><span class="thumb-tag">${escapeHtml(item.type)}</span><div class="thumb-label">${escapeHtml(item.label)}</div><span class="thumb-play" aria-hidden="true">▶</span></div>
      <div class="content-body"><div class="content-meta">✦ ${escapeHtml(item.category)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subtitle)}</p><div class="content-foot"><span>${escapeHtml(item.duration)} · Link to be verified</span><button class="save-btn ${saved?'saved':''}" data-save="${escapeHtml(item.id)}" aria-label="${saved?'Remove saved':'Save'} ${escapeHtml(item.title)}">${saved?'♥':'♡'}</button></div></div>
    </article>`;
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
    let items = demoContent;
    if (feedFilter === 'Videos') items = items.filter(x => ['Music video','Shorts'].includes(x.category));
    if (feedFilter === 'News') items = items.filter(x => x.category === 'Behind the scenes');
    if (feedFilter === 'Events') { list.innerHTML = '<div class="empty-state">Your calendar is ready for release dates, livestreams and personal reminders. Open <b>Fan calendar</b> to add one.</div>'; return; }
    if (feedFilter === 'For You') items = items.filter(x => x.member === selectedMember || x.id === 'fan-favorite');
    list.innerHTML = items.slice(0,4).map(makeContentCard).join(''); attachSaveListeners(list);
  }
  function renderDiscover() {
    const query = ($('#searchInput')?.value || '').trim().toLowerCase();
    let items = demoContent.filter(item => contentFilter === 'All' || item.category === contentFilter);
    if (query) items = items.filter(item => `${item.title} ${item.subtitle} ${item.category} ${item.member} ${item.label}`.toLowerCase().includes(query));
    $('#discoverCount').textContent = `${items.length} ${items.length === 1 ? 'collection' : 'collections'}`;
    $('#discoverList').innerHTML = items.length ? items.map(makeContentCard).join('') : '<div class="empty-state">No matching items yet. Try another search, or clear the filter.</div>';
    attachSaveListeners($('#discoverList'));
  }
  function renderStats() {
    const config = {
      'YouTube': {title:'Track the big moments',sub:'A place for verified video milestones and snapshots.',label:'Your video tracker',value:'♡',change:'Add your first snapshot',source:'SAMPLE DASHBOARD'},
      'Spotify': {title:'Your listening corner',sub:'A place to organize verified links and your personal listening goals.',label:'Your listening goal',value:'♪',change:'Set a personal target',source:'NO LIVE STREAM DATA'},
      'Fan goals': {title:'Your own fan journey',sub:'Track personal goals that are meaningful to you.',label:'Goals completed',value:String(state.goals.filter(g=>g.done).length),change:`of ${state.goals.length} personal goals`,source:'LOCAL PERSONAL DATA'}
    };
    const c = config[statsPlatform];
    $('#statsSource').textContent = c.source; $('#statsFeatureTitle').textContent = c.title; $('#statsFeatureSub').textContent = c.sub; $('#mainStatLabel').textContent = c.label; $('#mainStatValue').textContent = c.value; $('#mainStatChange').textContent = c.change;
    if(statsPlatform==='Spotify') $('#statsDisclaimer').textContent='This is a listening-goal workspace, not Spotify play counts. Add source links or snapshots only after verifying the source.';
    else if(statsPlatform==='Fan goals') $('#statsDisclaimer').textContent='Counts shown here come from goals you check off locally on this device.';
    else $('#statsDisclaimer').textContent='No live figures are claimed. Connect a verified source or enter a snapshot to make this your own.';
    const metrics = statsPlatform === 'Fan goals' ? [['✓','Completed',String(state.goals.filter(g=>g.done).length)],['☆','In progress',String(state.goals.filter(g=>!g.done).length)],['♡','Saved clips',String(state.saved.length)]] : statsPlatform === 'Spotify' ? [['♪','Listening','Personal'],['♡','Favorites','Local'],['↗','Links','Verify']] : [['▶','Milestones','Verify'],['▥','Snapshots','Add yours'],['♡','Fan goals','Personal']];
    $('#metricGrid').innerHTML = metrics.map(m=>`<article class="metric-card"><span>${m[0]}</span><strong>${m[1]}</strong><small>${m[2]}</small></article>`).join('');
    // Chart is deliberately a visual placeholder; label it as illustrative rather than implying real metrics.
    const multiplier = $('#chartRange').value === '30' ? 1 : $('#chartRange').value === '90' ? .82 : .68;
    const points = [142,126,110,86,65,43].map((y,i)=>[34+i*86,160-(160-y)*multiplier]);
    const line = points.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
    $('#linePath').setAttribute('d',line); $('#areaPath').setAttribute('d',line+` L${points[points.length-1][0]} 160 L${points[0][0]} 160Z`);
    $('#chartDots').innerHTML = points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5"/>`).join('');
  }
  function renderGoals() {
    renderStats(); const host=$('#goalList');
    host.innerHTML = state.goals.length ? state.goals.map(goal=>`<article class="goal-item"><span class="goal-symbol">${goal.done?'✓':'♡'}</span><div class="goal-detail"><strong>${escapeHtml(goal.title)}</strong><small>${escapeHtml(goal.detail)}</small></div><button class="goal-state ${goal.done?'done':''}" data-toggle-goal="${escapeHtml(goal.id)}">${goal.done?'Done':'Mark done'}</button><button class="goal-delete" data-delete-goal="${escapeHtml(goal.id)}" aria-label="Delete ${escapeHtml(goal.title)}">×</button></article>`).join('') : '<div class="empty-state">No personal goals yet. Add one below to start your own fan journey.</div>';
    $$('[data-toggle-goal]',host).forEach(btn=>btn.addEventListener('click',()=>{const g=state.goals.find(x=>x.id===btn.dataset.toggleGoal); if(!g)return; g.done=!g.done;persist();renderGoals();showToast(g.done?'Goal marked complete. Nice work!':'Goal moved back to in progress.');}));
    $$('[data-delete-goal]',host).forEach(btn=>btn.addEventListener('click',()=>{state.goals=state.goals.filter(x=>x.id!==btn.dataset.deleteGoal);persist();renderGoals();showToast('Personal goal removed.');}));
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
    let items=demoContent.filter(item=>item.member==='All members'||item.member===m.name);
    if(memberFilter!=='All') items=items.filter(item=>item.category===memberFilter);
    $('#memberContent').innerHTML=items.length?items.map(makeContentCard).join(''):'<div class="empty-state">No matching saved sample cards for this category. Try All, or add verified content for this member.</div>';
    attachSaveListeners($('#memberContent'));
  }
  function addGoal(title) {
    const clean=title.trim();if(!clean)return;state.goals.unshift({id:'goal-'+Date.now(),title:clean,detail:'Personal fan goal · saved on this device',done:false});persist();renderGoals();$('#goalInput').value='';showToast('Your personal goal has been added ♡');
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
    state={goals:defaultGoals.map(x=>({...x})),events:defaultEvents.map(x=>({...x})),saved:[],favorites:[],entered:true};persist();renderHomeContent();renderDiscover();renderStats();renderGoals();renderEvents();renderMember();showToast('Demo reset.');
  }
  // Navigation and controls
  $$('[data-screen]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();if(btn.dataset.screen==='home'&&!state.entered&&currentScreen==='welcome'){state.entered=true;persist();}goTo(btn.dataset.screen);}));
  $('#joinButton').addEventListener('click',()=>{state.entered=true;persist();goTo('home');showToast('Welcome to your MONSTIEZ corner ♡');});
  $('#notificationButton').addEventListener('click',()=>showToast('You are all caught up. Add reminders in your fan calendar.'));
  $$('[data-feed]').forEach(btn=>btn.addEventListener('click',()=>{feedFilter=btn.dataset.feed;$$('[data-feed]').forEach(b=>b.classList.toggle('active',b===btn));renderHomeContent();}));
  $$('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{contentFilter=btn.dataset.category;$$('[data-category]').forEach(b=>b.classList.toggle('active',b===btn));renderDiscover();}));
  $('#searchInput').addEventListener('input',renderDiscover);$('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';renderDiscover();$('#searchInput').focus();});
  $$('[data-platform]').forEach(btn=>btn.addEventListener('click',()=>{statsPlatform=btn.dataset.platform;$$('[data-platform]').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-selected',String(b===btn));});renderStats();}));
  $('#chartRange').addEventListener('change',renderStats);
  $('#goalForm').addEventListener('submit',e=>{e.preventDefault();addGoal($('#goalInput').value);});
  $('#addGoalButton').addEventListener('click',()=>{$('#goalInput').focus();$('#goalForm').scrollIntoView({behavior:'smooth',block:'center'});});
  $('#eventForm').addEventListener('submit',e=>{e.preventDefault();addEvent($('#eventName').value,$('#eventDate').value,$('#eventName').dataset.editId);});
  $('#addEventButton').addEventListener('click',()=>{$('#eventName').focus();$('#eventForm').scrollIntoView({behavior:'smooth',block:'center'});});
  $('#favoriteMember').addEventListener('click',()=>{state.favorites=state.favorites.includes(selectedMember)?state.favorites.filter(x=>x!==selectedMember):[...state.favorites,selectedMember];persist();renderMember();showToast(state.favorites.includes(selectedMember)?`${selectedMember} added to your favorites ♡`:`${selectedMember} removed from favorites.`);});
  $$('[data-member-tab]').forEach(btn=>btn.addEventListener('click',()=>{memberFilter=btn.dataset.memberTab;$$('[data-member-tab]').forEach(b=>b.classList.toggle('active',b===btn));renderMember();}));
  $('#exportButton').addEventListener('click',exportData);$('#resetButton').addEventListener('click',resetDemo);

  // First render: show the welcome screen until Join is tapped on a new installation.
  renderHomeContent();renderDiscover();renderStats();renderGoals();renderEvents();renderMember();
  if(state.entered) goTo('home'); else goTo('welcome');
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();

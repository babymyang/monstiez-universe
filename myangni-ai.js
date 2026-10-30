(() => {
  'use strict';
  // Myangni AI — a tiny, fully local fan assistant. No cloud, no accounts,
  // no paid APIs: intent matching runs on-device and the chat log never
  // leaves localStorage. It answers fan questions, explains the app, cheers
  // you up, navigates to any screen — and reads the tracker's own dated,
  // sourced snapshots so its numbers are never invented.
  const STORAGE = 'monstiez-myangni-chat-v1';
  const $ = (sel, root = document) => root.querySelector(sel);
  const escapeHtml = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ------------------------------------------------------------ facts ----
  const MEMBERS = {
    Ruka:{blurb:'Ruka is MONSTIEZ\u2019 power rapper from Japan. Her corner is perfect for stage clips and rap moments.'},
    Pharita:{blurb:'Pharita comes from Thailand and is known for her elegant vocals. Save her vocal covers and behind moments.'},
    Asa:{blurb:'Asa is a Japanese rapper and producer-type all-rounder. Her corner loves fast flows and cool stages.'},
    Ahyeon:{blurb:'Ahyeon is a Korean vocalist famous for her powerful high notes. Collect her vocal moments here.'},
    Rami:{blurb:'Rami is a Korean vocalist with a soft, emotional tone. Her corner gathers stages and live vocals.'},
    Rora:{blurb:'Rora is a Korean vocalist known for her mature voice. Save her performances and livestream moments.'},
    Chiquita:{blurb:'Chiquita is the Thai maknae, loved for her energy and charm. Her corner collects fun and cute moments.'}
  };
  const FACTS = {
    group:'BABYMONSTER is a seven-member girl group under YG Entertainment. They made their debut in late 2023, and the fandom name is MONSTIEZ \u2661 (fan-maintained info \u2014 double-check official channels for anything important).',
    songs:'Fan-favorite releases include BATTER UP, Stuck In The Middle, SHEESH, FOREVER and more recent ones like Hot Sauce and WE GO UP. For the official, always-current list, check BABYMONSTER\u2019s official channel \u2014 that\u2019s the source of truth.',
    members:'The seven members are Ruka, Pharita, Asa, Ahyeon, Rami, Rora and Chiquita. Ask me about any one of them by name!',
    fandom:'The official fandom name is MONSTIEZ \u2014 that\u2019s you! This whole app is a fan-made space for MONSTIEZ.'
  };

  // -------------------------------------------- tracker-backed answers ----
  // The tracker stores cumulative daily snapshots with an explicit source,
  // method and date on every value. The assistant reads the same store the
  // UI uses (MONSTIEZ.store) and always quotes the date + source, so no
  // number it says is ever invented.
  const STOP = new Set(['the','and','does','do','have','has','what','how','many','much','about','tell','me','my','is','are','of','for','on','in','it','to','a','an','does','any','was','were','show','can','you','please']);
  const fmt = n => { try { return new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:2}).format(n); } catch { return String(n); } };
  const latest = map => {
    if (!map || typeof map !== 'object') return null;
    const dates = Object.keys(map).sort();
    if (!dates.length) return null;
    const d = dates[dates.length - 1];
    return Object.assign({ date: d }, map[d]);
  };
  function trackerAnswer(msg) {
    if (!has(msg, /\bview|stream|plays|playcount|listen|subscriber|how many|numbers? (of|for)|stats? (of|for)/)) return null;
    const S = window.MONSTIEZ && MONSTIEZ.store ? MONSTIEZ.store.get() : null;
    if (!S || !S.loaded || !S.catalog) return { text: 'The tracker data hasn\u2019t loaded on this device yet \u2014 open Stats once while online and I\u2019ll be able to quote the latest dated snapshots!', expr: 'sleepy', nav: 'stats' };
    const tokens = msg.split(' ').filter(t => t.length > 1 && !STOP.has(t));
    const yt = S.youtube || {}, sp = S.spotify || {};
    const wantStreams = has(msg, /\bstream|plays|listen/);
    const wantViews = has(msg, /\bview|video|\bmv\b|youtube/);
    const wantSubs = has(msg, /\bsubscriber|channel total/);
    let bestV = null, vScore = 0;
    (S.catalog.videos || []).forEach(v => {
      const t = `${v.title} ${v.channel}`.toLowerCase();
      let sc = 0; tokens.forEach(tok => { if (t.includes(tok)) sc++; });
      if (sc > vScore) { vScore = sc; bestV = v; }
    });
    let bestS = null, sScore = 0;
    (S.catalog.songs || []).forEach(sg => {
      const t = `${sg.name} ${sg.album}`.toLowerCase();
      let sc = 0; tokens.forEach(tok => { if (t.includes(tok)) sc++; });
      if (sc > sScore) { sScore = sc; bestS = sg; }
    });
    if (wantSubs && !bestV && !bestS) {
      const subs = latest(yt.channel && yt.channel.subscribers), views = latest(yt.channel && yt.channel.views);
      if (subs) return { text: `BABYMONSTER\u2019s official channel: ${fmt(subs.v)} subscribers${views ? ' and ' + fmt(views.v) + ' total views' : ''} as of ${subs.date}. Dated snapshot from ${subs.source}.`, expr: 'proud', chips: ['Open Stats', 'SHEESH streams'] };
    }
    if (bestS && sScore > 0 && (wantStreams || (!wantViews && sScore >= vScore))) {
      const key = Object.keys(sp.tracks || {}).find(k => k.split('|')[0].toLowerCase() === bestS.name.toLowerCase());
      const e = key && latest(sp.tracks[key]);
      if (e) return { text: `\u201c${bestS.name}\u201d has ${fmt(e.v)} Spotify streams as of ${e.date}${e.daily ? ' \u2014 about ' + fmt(e.daily) + ' a day' : ''}. Source: ${e.source} (third-party public figures, not an official Spotify API total).`, expr: 'excited', chips: ['Any YouTube views?', 'Tell me about the group'] };
      return { text: `\u201c${bestS.name}\u201d is in the catalogue, but no dated Spotify snapshot for it is cached on this device yet. Open Stats to see what\u2019s available.`, expr: 'peek', nav: 'stats' };
    }
    if (bestV && vScore > 0) {
      const e = latest(((yt.videos || {})[bestV.id] || {}).views);
      if (e) return { text: `\u201c${bestV.title}\u201d (${bestV.channel}) is at ${fmt(e.v)} views as of ${e.date}. Dated fan-collected snapshot from ${e.source} \u2014 nothing here is invented \u2661`, expr: 'proud', chips: ['Open Stats', 'Compare releases'] };
      return { text: `I track \u201c${bestV.title}\u201d, but no dated view snapshot for it is cached on this device yet. Open Stats to see what the tracker has.`, expr: 'peek', nav: 'stats' };
    }
    return { text: 'Tell me which release to look up \u2014 for example \u201chow many views does SHEESH have?\u201d or \u201cHot Sauce streams\u201d \u2014 and I\u2019ll pull the latest dated snapshot with its source.', expr: 'peek', chips: ['WE GO UP views', 'SHEESH streams'] };
  }

  // ---------------------------------------------------------- intents ----
  const has = (msg, re) => re.test(msg);
  function answer(raw) {
    const msg = raw.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
    const tokens = msg.split(' ');
    const navVerb = has(msg, /\b(open|go|show|take|switch|bring|visit|jump|where)\b/);
    const nav = (screen, phrase) => ({ text: phrase, nav: screen, expr: 'excited' });

    // individual member question
    const member = Object.keys(MEMBERS).find(name => tokens.includes(name.toLowerCase()));
    if (member && has(msg, /\b(who|what|tell|about|member|bias)\b|^ra|^ph|^as|^ah|^ch|^ro/)) {
      const fav = (JSON.parse(localStorage.getItem('monstiez-universe-starter-v1') || '{"favorites":[]}').favorites || []).includes(member);
      return { text: MEMBERS[member].blurb + (fav ? ' \u2661 She\u2019s already in your favorites!' : ' Open the Member corner to add her to your favorites.'), nav: 'member', chips: ['Open Member corner', 'Tell me about the group'] };
    }
    // tracker-backed numbers (checked before generic navigation)
    const tracked = trackerAnswer(msg);
    if (tracked) return tracked;

    // navigation
    if (has(msg, /\bstat|tracker|milestone chart/)) return nav('stats', 'Taking you to Stats & milestones \u2014 the numbers behind the love \u2661');
    if (has(msg, /\bdiscover|search|video|content/)) return nav('discover', 'Off to Discover \u2014 let\u2019s find something to watch \u2726');
    if (has(msg, /\bcalendar|event|schedule/)) return nav('events', 'Opening your Fan calendar. Never miss a moment!');
    if (has(msg, /\bmember|bias|profile/)) return nav('member', 'Member corner, coming right up \u2661');
    if (has(msg, /\bmy (space|baemon|corner|profile)\b|^me\b/)) return nav('me', 'Your corner, your rules \u2661');
    if (has(msg, /\bhome$|^home\b/) && navVerb || msg === 'home') return nav('home', 'Back home we go \u2727');

    // how-to
    if (has(msg, /\bsave|heart|bookmark/)) return { text: 'Tap the little \u2661 on any content card to save it to your collection. Everything stays on this device \u2014 no account needed.', expr: 'love', chips: ['How do I export my data?', 'Open Discover'] };
    if (has(msg, /\bgoal|milestone/)) return { text: 'Open Stats & milestones, scroll to \u201cMy fan goals\u201d and add your own \u2014 like \u201cwatch one stage today\u201d. Tick them off as you go and I\u2019ll celebrate with you!', nav: 'stats', expr: 'proud', chips: ['Open Stats', 'What can you do?'] };
    if (has(msg, /\breminder|add.*(event|date)/)) return { text: 'In the Fan calendar, use \u201cAdd a reminder\u201d \u2014 give it a name and a date and it\u2019s saved locally. I\u2019ll keep my paws crossed for the big day \u2727', nav: 'events', expr: 'happy' };
    if (has(msg, /\bexport|backup|download my/)) return { text: 'Go to My Baemon space and tap \u201cExport my local data\u201d \u2014 you\u2019ll get a JSON file of your goals, reminders and saved clips.', nav: 'me', expr: 'proud' };
    if (has(msg, /\breset|start over|clear (everything|all my)/)) return { text: 'My Baemon space has a \u201cReset this demo\u201d option. It wipes local goals, reminders and saves on this device \u2014 use it gently!', nav: 'me', expr: 'peek' };
    if (has(msg, /\binstall|home screen|pwa|add to (home|desktop)/)) {
      if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; return { text: 'I asked your browser to open the install dialog \u2014 check the top of the screen \u2661', expr: 'excited' }; }
      return { text: 'On Android/Chrome: open the browser menu and choose \u201cInstall app\u201d or \u201cAdd to Home screen\u201d. Then MONSTIEZ Universe lives on your phone like a real app \u2661', expr: 'excited' };
    }
    if (has(msg, /\bnotification|notify|push|alert/)) return { text: 'This build keeps everything local, so there are no push notifications yet \u2014 your reminders live quietly in the Fan calendar. I\u2019ll nudge the developers \u2726', expr: 'sleepy' };
    if (has(msg, /\bdark|light|theme|night/)) return { text: 'Tap the \u2600/\u263e button in the top bar \u2014 dark mode is lovely for late-night streaming sessions \u2661', expr: 'sleepy' };
    if (has(msg, /\bshare|link/)) return { text: 'The \u2197 button in the top bar shares the exact screen you\u2019re on \u2014 filters and all \u2014 so your fellow MONSTIEZ land right where you are \u2726', expr: 'happy' };

    // facts
    if (has(msg, /\bmembers?\b|lineup|who is in|seven|7 members/)) return { text: FACTS.members, chips: ['Tell me about Ahyeon', 'Tell me about the group', 'What is the fandom name?'] };
    if (member) return { text: MEMBERS[member].blurb, nav: 'member', chips: ['Open Member corner', 'Tell me about the group'] };
    if (has(msg, /\bfandom|monstiez|fan name/)) return { text: FACTS.fandom, expr: 'love' };
    if (has(msg, /\bsong|music|album|ep\b|discograph|release|comeback|track|mv\b/)) return { text: FACTS.songs, chips: ['SHEESH streams', 'Open Discover', 'Tell me about the group'] };
    if (has(msg, /\bgroup|baemon|babymonster|yg\b|debut|agency|company/)) return { text: FACTS.group, chips: ['Tell me about the members', 'What songs do they have?'] };

    // honesty about data
    if (has(msg, /\breal|official|accurate|live (data|stats)|fake|sample|trust|true number/)) return { text: 'Good question! Tracker numbers come from dated public snapshots \u2014 each one stores its source, method and collection date, and Stats \u203a Sources shows them all. Personal goals and saves are local only. Nothing pretends to be an official statistic \u2726', expr: 'peek' };

    // feelings / smalltalk
    if (has(msg, /\bcheer|motivat|encourag|sad|tired|down|lonely|stress|bad day|rough/)) {
      const lines = [
        'Hey, even a tiny bit of progress is still progress. Watch one favorite stage, breathe, and let the music hug you \u2661',
        'Seven stars worked hard so you could smile today. One song, one deep breath \u2014 you\u2019ve got this! \u2727',
        'MONSTIEZ stick together. You\u2019re not alone \u2014 your fan space is right here whenever you need it \u2661'
      ];
      return { text: lines[Math.floor(Math.random() * lines.length)], expr: 'love' };
    }
    if (has(msg, /\bthank|thx|\bty\b|gomawo/)) return { text: 'Anytime! Helping MONSTIEZ is literally my favorite thing \u2661', expr: 'happy' };
    if (has(msg, /\blove you|ily|you('re| are) (cute|adorable|the best)|so cute/)) return { text: 'Eeee! \u2661 You just made my whiskers wiggle. Let\u2019s keep celebrating our seven stars together!', expr: 'love' };
    if (has(msg, /\bhi\b|hello|hey|annyeong|hiya|good (morning|afternoon|evening)/)) return { text: 'Hiii! \u2661 I\u2019m Myangni, your fan buddy. Ask me about the members, the app, or the latest tracked views \u2014 or just say hi!', expr: 'happy', chips: ['What can you do?', 'Tell me about the members'] };
    if (has(msg, /\bwho are you|what are you|are you (an? )?(ai|robot|bot|real cat)|your name|what can you do|abilities|^help\b/)) return { text: 'I\u2019m Myangni, the MONSTIEZ Universe cat \u2727 I\u2019m a tiny local assistant \u2014 no cloud, no account, everything stays on your device. I can:\nguide you around the app \u00b7 quote the tracker\u2019s latest dated view & stream snapshots \u00b7 answer fan questions \u00b7 explain how saving, goals and reminders work \u00b7 cheer you up when you need it', expr: 'proud', chips: ['Tell me about the members', 'WE GO UP views', 'Cheer me up'] };
    if (has(msg, /\bwhat is this app|about (this|the) app|what does this app/)) return { text: 'MONSTIEZ Universe is your fan-made BABYMONSTER companion: discover tracked videos, follow views and streams with dated sources, keep a fan calendar and collect favorite moments \u2014 all with me, Myangni, by your side \u2661', expr: 'happy' };

    // fallback
    return { text: pick([
      'Mmm, my whiskers aren\u2019t sure I understood \u2727 Try asking about the members, the tracked views, the fan goals \u2014 or tap one of the chips below!',
      'I\u2019m still a small-town cat with a small vocabulary \u2661 Ask me \u201cwhat can you do?\u201d and I\u2019ll show off!'
    ]), expr: 'peek', chips: ['What can you do?', 'Tell me about the members', 'Open Stats'] };
  }
  const pick = list => list[Math.floor(Math.random() * list.length)];

  // ------------------------------------------------------------- chat ----
  let drawer, log, chipsRow, input, deferredInstall = null;
  let history = [];
  try { history = JSON.parse(localStorage.getItem(STORAGE) || '[]'); if (!Array.isArray(history)) history = []; } catch { history = []; }
  const remember = who => { history.push(who); history = history.slice(-40); try { localStorage.setItem(STORAGE, JSON.stringify(history)); } catch {} };

  function scrollLog() { log.scrollTop = log.scrollHeight; }
  function addMsg(who, text, expr) {
    const el = document.createElement('div');
    el.className = `myangni-msg ${who === 'you' ? 'from-you' : 'from-myangni'}`;
    if (who === 'myangni') {
      const avatar = document.createElement('img');
      avatar.className = 'msg-avatar';
      avatar.src = `./assets/myangni-${expr || 'happy'}.svg`;
      avatar.alt = '';
      el.appendChild(avatar);
    }
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    String(text).split('\n').forEach(line => {
      const p = document.createElement('p');
      p.innerHTML = escapeHtml(line) || '&nbsp;';
      bubble.appendChild(p);
    });
    el.appendChild(bubble);
    log.appendChild(el);
    scrollLog();
  }
  function showChips(list) {
    chipsRow.innerHTML = '';
    (list || []).forEach(label => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'myangni-chip';
      chip.textContent = label;
      chip.addEventListener('click', () => submit(label));
      chipsRow.appendChild(chip);
    });
    chipsRow.style.display = (list && list.length) ? 'flex' : 'none';
  }
  function typing(on) {
    let dots = $('.typing-row', log);
    if (on && !dots) {
      dots = document.createElement('div');
      dots.className = 'myangni-msg from-myangni typing-row';
      dots.innerHTML = '<img class="msg-avatar" src="./assets/myangni-peek.svg" alt=""><div class="msg-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
      log.appendChild(dots); scrollLog();
    } else if (!on && dots) dots.remove();
  }
  function respond(raw) {
    typing(true);
    const a = window.Myangni;
    const buddy = a && a.buddyImg();
    if (buddy) a.face(buddy, 'peek');
    setTimeout(() => {
      typing(false);
      const r = answer(raw);
      addMsg('myangni', r.text, r.expr);
      remember({ who: 'myangni', text: r.text });
      showChips(r.chips);
      if (buddy) a.react(buddy, r.expr || 'happy', 1800);
      if (r.nav) {
        const btn = document.querySelector(`[data-screen="${r.nav}"]`);
        if (btn) setTimeout(() => { btn.click(); setTimeout(close, 850); }, 550);
      }
    }, 420 + Math.random() * 520);
  }
  function submit(value) {
    const text = String(value || '').trim();
    if (!text) return;
    addMsg('you', text);
    remember({ who: 'you', text });
    input.value = '';
    showChips([]);
    respond(text);
  }
  function open() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    window.Myangni && window.Myangni.setBuddyVisible(false);
    if (!history.length) {
      const hello = 'Hiii! \u2661 I\u2019m Myangni, your MONSTIEZ Universe buddy. Ask me anything about the app, the members \u2014 or the latest tracked views!';
      addMsg('myangni', hello, 'wink');
      remember({ who: 'myangni', text: hello });
      showChips(['What can you do?', 'WE GO UP views', 'Cheer me up', 'Open Stats']);
    } else { renderHistory(); showChips(['What can you do?', 'Cheer me up']); }
    setTimeout(() => input.focus({ preventScroll: true }), 260);
  }
  function close() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    window.Myangni && window.Myangni.setBuddyVisible(true);
  }
  function renderHistory() {
    log.innerHTML = '';
    history.slice(-40).forEach(m => addMsg(m.who, m.text, m.who === 'myangni' ? 'happy' : undefined));
    scrollLog();
  }
  function build() {
    drawer = document.createElement('div');
    drawer.className = 'myangni-drawer';
    drawer.id = 'myangniDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Ask Myangni');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="myangni-backdrop" data-close></div>
      <div class="myangni-panel" role="document">
        <header class="myangni-head">
          <img class="myangni-head-avatar" src="./assets/myangni-peek.svg" alt="" />
          <div><strong>Ask Myangni</strong><small>local fan buddy \u00b7 runs on your device</small></div>
          <button class="myangni-close" type="button" data-close aria-label="Close chat">\u00d7</button>
        </header>
        <div class="myangni-log" aria-live="polite"></div>
        <div class="myangni-chips" style="display:none"></div>
        <form class="myangni-form">
          <input type="text" maxlength="200" placeholder="Ask Myangni anything\u2026" aria-label="Message Myangni" autocomplete="off" />
          <button class="primary-btn" type="submit" aria-label="Send">Send \u2661</button>
        </form>
      </div>`;
    document.body.appendChild(drawer);
    log = $('.myangni-log', drawer);
    chipsRow = $('.myangni-chips', drawer);
    input = $('.myangni-form input', drawer);
    $('.myangni-form', drawer).addEventListener('submit', e => { e.preventDefault(); submit(input.value); });
    drawer.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });
    document.addEventListener('myangni:chat-open', open);
    document.querySelectorAll('.ask-myangni-btn').forEach(btn => btn.addEventListener('click', open));
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
  }
  build();
})();

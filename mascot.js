(() => {
  'use strict';
  // Myangni mascot engine: expression swapping, idle life, empty-state faces
  // and the floating buddy that reacts to what you do in the app.
  const BASE = './assets/';
  const EXPRESSIONS = {
    default:'myangni.svg', happy:'myangni-happy.svg', wink:'myangni-wink.svg',
    excited:'myangni-excited.svg', love:'myangni-love.svg', peek:'myangni-peek.svg',
    sleepy:'myangni-sleepy.svg', sad:'myangni-sad.svg', proud:'myangni-proud.svg', party:'myangni-party.svg'
  };
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Object.values(EXPRESSIONS).forEach(file => { const img = new Image(); img.src = BASE + file; });

  function url(name) { return BASE + (EXPRESSIONS[name] || EXPRESSIONS.default); }
  function face(img, name) {
    if (!img || img.dataset.expr === name) return;
    img.dataset.expr = name;
    img.src = url(name);
    img.classList.remove('mascot-pop'); void img.offsetWidth; img.classList.add('mascot-pop');
  }
  // Show an expression briefly, then fall back to the previous one.
  function react(img, name, hold = 1500) {
    if (!img) return;
    const previous = img.dataset.expr || 'default';
    face(img, name);
    clearTimeout(img._revertTimer);
    img._revertTimer = setTimeout(() => face(img, previous), hold);
  }
  const pick = list => list[Math.floor(Math.random() * list.length)];

  // ------------------------------------------------------------ buddy ----
  let buddy, buddyImg, bubble, bubbleTimer, hidden = false;
  function initBuddy() {
    if (buddy) return;
    buddy = document.createElement('div');
    buddy.className = 'mascot-buddy';
    buddy.setAttribute('aria-hidden', 'false');
    buddyImg = document.createElement('img');
    buddyImg.src = url('default');
    buddyImg.dataset.expr = 'default';
    buddyImg.alt = 'Myangni, your fan companion — tap to chat';
    bubble = document.createElement('div');
    bubble.className = 'mascot-bubble';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    const openChat = () => document.dispatchEvent(new CustomEvent('myangni:chat-open'));
    buddyImg.addEventListener('click', openChat);
    buddy.appendChild(bubble); buddy.appendChild(buddyImg);
    document.body.appendChild(buddy);
    idleLoop();
  }
  function showBubble(text, ms = 2800) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  function idleLoop() {
    if (REDUCED) return;
    const step = () => {
      const visible = buddy && buddy.offsetParent !== null && !hidden;
      if (visible && !bubble.classList.contains('show')) {
        const roll = Math.random();
        if (roll < .5) react(buddyImg, 'sleepy', 170);          // blink
        else if (roll < .78) react(buddyImg, 'peek', 1100);     // curious look
        else react(buddyImg, 'happy', 1200);
      }
      setTimeout(step, 4200 + Math.random() * 4600);
    };
    setTimeout(step, 3500);
  }
  // Public mini-API used by app.js and the assistant.
  window.Myangni = {
    face: (el, name) => face(el, name),
    react: (el, name, hold) => react(el, name, hold),
    say(text, expr, ms) { initBuddy(); showBubble(text, ms); if (expr) react(buddyImg, expr, Math.min(ms || 2800, 3200)); },
    cheer(expr) { initBuddy(); if (expr) react(buddyImg, expr, 1600); },
    buddyImg: () => buddyImg,
    setBuddyVisible(visible) {
      initBuddy();
      hidden = !visible;
      buddy.classList.toggle('hidden', !visible);
    }
  };

  // ----------------------------------------------- welcome / hero life ----
  const welcomeCycle = ['default', 'happy', 'wink', 'excited', 'love'];
  let welcomeIndex = 0;
  setInterval(() => {
    const welcomeArt = document.querySelector('#welcomeScreen.active .welcome-art img');
    if (welcomeArt && !REDUCED) { welcomeIndex = (welcomeIndex + 1) % welcomeCycle.length; face(welcomeArt, welcomeCycle[welcomeIndex]); }
    const hero = document.querySelector('#homeScreen.active .hero-mascot');
    if (hero && Math.random() < .55 && !REDUCED) react(hero, pick(['happy', 'wink', 'love', 'excited']), 2400);
  }, 3000);

  // ------------------------------------------- empty-state expressions ----
  const EMPTY_FACES = { discoverScreen: 'peek', eventsScreen: 'sleepy', statsScreen: 'proud', homeScreen: 'wink', trackerviewScreen: 'peek', memberScreen: 'sad' };
  function decorateEmptyStates(root) {
    (root || document).querySelectorAll('.empty-state:not([data-mascot])').forEach(box => {
      box.dataset.mascot = '1';
      const screen = box.closest('.screen');
      const expr = (screen && EMPTY_FACES[screen.id]) || 'happy';
      const img = document.createElement('img');
      img.className = 'empty-mascot';
      img.src = url(expr);
      img.alt = '';
      img.dataset.expr = expr;
      box.prepend(img);
    });
  }
  new MutationObserver(muts => {
    for (const m of muts) if (m.addedNodes.length) decorateEmptyStates(m.target);
  }).observe(document.body, { childList: true, subtree: true });
  decorateEmptyStates(document);
})();

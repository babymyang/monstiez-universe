/* Icon generator: renders the app icon PNGs from an original SVG via sharp. */
const sharp = require("/home/z/my-project/node_modules/sharp");
const fs = require("fs");
const path = require("path");

const OUT = "/home/z/my-project/public/icons";
fs.mkdirSync(OUT, { recursive: true });

const iconSvg = (maskable) => {
  const pad = maskable ? 100 : 60;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBDCEB"/>
      <stop offset="100%" stop-color="#EFDDF7"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="${maskable ? 0 : 220}" fill="url(#bg)"/>
  <g transform="translate(${pad}, ${pad - 30}) scale(${(1024 - 2 * pad) / 900})">
    <!-- ears -->
    <path d="M270 400 L230 180 L420 280 Z" fill="#4A414F"/>
    <path d="M285 385 L265 260 L380 320 Z" fill="#FF9CC2"/>
    <path d="M630 400 L670 180 L480 280 Z" fill="#4A414F"/>
    <path d="M615 385 L635 260 L520 320 Z" fill="#FF9CC2"/>
    <!-- head -->
    <ellipse cx="450" cy="520" rx="240" ry="220" fill="#4A414F"/>
    <!-- eyes -->
    <ellipse cx="365" cy="520" rx="52" ry="58" fill="#fff"/>
    <ellipse cx="535" cy="520" rx="52" ry="58" fill="#fff"/>
    <circle cx="372" cy="527" r="33" fill="#38293A"/>
    <circle cx="528" cy="527" r="33" fill="#38293A"/>
    <circle cx="384" cy="515" r="12" fill="#fff"/>
    <circle cx="540" cy="515" r="12" fill="#fff"/>
    <!-- blush -->
    <circle cx="295" cy="590" r="38" fill="#FF9CC2" opacity="0.55"/>
    <circle cx="605" cy="590" r="38" fill="#FF9CC2" opacity="0.55"/>
    <!-- nose + mouth -->
    <path d="M435 590 h30 l-15 20 Z" fill="#FF7FAE"/>
    <path d="M420 625 q15 15 30 0 q15 15 30 0" stroke="#2E2833" stroke-width="10" stroke-linecap="round" fill="none"/>
    <!-- crown -->
    <path d="M390 240 l14 30 46 -40 46 40 14 -30 0 44 -120 0 Z" fill="#FFD34E" stroke="#E8A820" stroke-width="5" stroke-linejoin="round"/>
    <!-- heart -->
    <path d="M640 190 c12 -16 36 -8 36 12 c0 16 -20 32 -36 44 c-16 -12 -36 -28 -36 -44 c0 -20 24 -28 36 -12 Z" fill="#FF4F9A"/>
  </g>
</svg>`;
};

(async () => {
  await sharp(Buffer.from(iconSvg(false))).resize(192, 192).png().toFile(path.join(OUT, "icon-192.png"));
  await sharp(Buffer.from(iconSvg(false))).resize(512, 512).png().toFile(path.join(OUT, "icon-512.png"));
  await sharp(Buffer.from(iconSvg(true))).resize(512, 512).png().toFile(path.join(OUT, "icon-maskable-512.png"));
  console.log("icons generated:", fs.readdirSync(OUT));
})();

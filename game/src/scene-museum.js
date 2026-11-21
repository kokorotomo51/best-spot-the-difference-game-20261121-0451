// Scene 1 — "The Midnight Museum": a night hall with arched windows,
// a landscape painting, a chandelier, a clock, pedestals, a bench with
// a sleeping cat, and a rug. draw() renders the original when
// `altered` is empty; each difference id in `altered` changes one
// detail in the right-hand panel.
import {
  circle,
  drawFlame,
  drawMoon,
  drawStars,
  fillCircle,
  glow,
  roundedRect,
  star,
  strokeCircle,
  text,
} from './draw.js';

export const museumScene = {
  id: 'museum',
  title: 'The Midnight Museum',
  subtitle: 'Round 1 · the hall of curiosities',
  differences: [
    { id: 'star', x: 96, y: 66, r: 26, label: 'a star vanished from the window' },
    { id: 'moon', x: 280, y: 88, r: 26, label: 'the painted moon changed phase' },
    { id: 'vase', x: 92, y: 288, r: 30, label: 'the vase on the pedestal changed' },
    { id: 'cat', x: 280, y: 348, r: 26, label: 'the cat opened its eyes' },
    { id: 'clock', x: 478, y: 216, r: 26, label: 'the clock shows another time' },
    { id: 'candle', x: 332, y: 46, r: 24, label: 'a chandelier candle went out' },
    { id: 'rug', x: 280, y: 416, r: 26, label: 'the rug stripe changed colour' },
  ],

  draw(ctx, altered, rand, time) {
    const W = 560;
    const H = 440;

    // Wall and floor.
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#2b2340');
    wall.addColorStop(0.72, '#3a2b4d');
    wall.addColorStop(0.72, '#4a3350');
    wall.addColorStop(1, '#5a3d55');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#241c33';
    ctx.fillRect(0, 316, W, 10);
    // Wooden floor with plank seams.
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(0, 326, W, H - 326);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const x = (i / 7) * W;
      ctx.beginPath();
      ctx.moveTo(x, 326);
      ctx.lineTo(x - 26 + i * 8, H);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 372);
    ctx.lineTo(W, 372);
    ctx.stroke();

    // Arched windows, left and right.
    drawWindow(ctx, 36, 28, 118, 148, rand, altered.has('star'));
    drawWindow(ctx, 406, 28, 118, 148, rand, false);

    // Centre landscape painting in a gold frame.
    ctx.fillStyle = '#8a6a2f';
    ctx.fillRect(206, 38, 148, 126);
    ctx.fillStyle = '#16233d';
    ctx.fillRect(214, 46, 132, 110);
    drawStars(ctx, rand, 218, 50, 124, 50, 12, '#cfe0ff');
    drawMoon(ctx, 280, 88, 15, altered.has('moon') ? 'full' : 'crescent');
    ctx.fillStyle = '#2c4a3a';
    ctx.beginPath();
    ctx.moveTo(214, 156);
    ctx.lineTo(258, 104);
    ctx.lineTo(296, 140);
    ctx.lineTo(322, 112);
    ctx.lineTo(346, 156);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1d3328';
    ctx.fillRect(214, 140, 132, 16);

    // Banners flanking the painting.
    drawBanner(ctx, 176, 60, '#7a2e3a');
    drawBanner(ctx, 366, 60, '#2e5a7a');

    // Chandelier: chain, ring, five candles.
    ctx.strokeStyle = '#c9a44a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 0);
    ctx.lineTo(280, 18);
    ctx.stroke();
    strokeCircle(ctx, 280, 34, 52, '#c9a44a', 4);
    const candleXs = [228, 254, 280, 306, 332];
    for (let i = 0; i < candleXs.length; i++) {
      const cx = candleXs[i];
      ctx.fillStyle = '#f2ead2';
      ctx.fillRect(cx - 4, 18, 8, 18);
      const out = altered.has('candle') && i === 4;
      if (!out) drawFlame(ctx, cx, 14, 7, time + i * 200);
      else {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, 16);
        ctx.quadraticCurveTo(cx + 3, 10, cx, 5);
        ctx.stroke();
      }
    }

    // Wall clock, right side.
    ctx.fillStyle = '#8a6a2f';
    circle(ctx, 478, 216, 30);
    ctx.fill();
    fillCircle(ctx, 478, 216, 24, '#f2ead2');
    for (let h = 0; h < 12; h++) {
      const a = (h / 12) * Math.PI * 2;
      fillCircle(ctx, 478 + Math.cos(a) * 19, 216 + Math.sin(a) * 19, 1.8, '#3a2b1d');
    }
    const hands = altered.has('clock') ? [3, 0] : [10, 2];
    drawHand(ctx, 478, 216, hands[0], 13);
    drawHand(ctx, 478, 216, hands[1], 18);
    fillCircle(ctx, 478, 216, 3, '#3a2b1d');

    // Left pedestal + vase (or squat amber pot when altered).
    drawPedestal(ctx, 66, 300);
    if (!altered.has('vase')) {
      ctx.fillStyle = '#3f8f8a';
      ctx.beginPath();
      ctx.moveTo(84, 262);
      ctx.quadraticCurveTo(72, 280, 78, 296);
      ctx.lineTo(106, 296);
      ctx.quadraticCurveTo(112, 280, 100, 262);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#57b3ac';
      ctx.fillRect(86, 256, 12, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(80, 270, 5, 20);
    } else {
      ctx.fillStyle = '#c07a2e';
      ctx.beginPath();
      ctx.moveTo(80, 268);
      ctx.quadraticCurveTo(70, 282, 78, 296);
      ctx.lineTo(106, 296);
      ctx.quadraticCurveTo(114, 282, 104, 268);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e09a44';
      ctx.fillRect(88, 262, 8, 8);
    }

    // Right pedestal + crystal.
    drawPedestal(ctx, 428, 300);
    glow(ctx, 470, 272, 30, '#7de8ff', 0.4);
    ctx.fillStyle = '#7de8ff';
    ctx.beginPath();
    ctx.moveTo(470, 252);
    ctx.lineTo(486, 276);
    ctx.lineTo(470, 296);
    ctx.lineTo(454, 276);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(470, 258);
    ctx.lineTo(478, 274);
    ctx.lineTo(470, 290);
    ctx.lineTo(462, 274);
    ctx.closePath();
    ctx.fill();

    // Bench with the sleeping cat.
    ctx.fillStyle = '#4a2f1d';
    ctx.fillRect(214, 344, 132, 12);
    ctx.fillRect(222, 356, 8, 34);
    ctx.fillRect(330, 356, 8, 34);
    ctx.fillStyle = '#5d3d26';
    ctx.fillRect(214, 338, 132, 8);
    // Cat: curled body, head, ears, tail.
    ctx.fillStyle = '#1f1b26';
    ctx.beginPath();
    ctx.ellipse(280, 332, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 306, 322, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(298, 314);
    ctx.lineTo(300, 304);
    ctx.lineTo(306, 312);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(312, 313);
    ctx.lineTo(316, 304);
    ctx.lineTo(318, 314);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1f1b26';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(248, 334);
    ctx.quadraticCurveTo(236, 330, 240, 318);
    ctx.stroke();
    if (altered.has('cat')) {
      glow(ctx, 302, 321, 8, '#ffd94d', 0.7);
      glow(ctx, 311, 321, 8, '#ffd94d', 0.7);
      fillCircle(ctx, 302, 321, 2.4, '#ffd94d');
      fillCircle(ctx, 311, 321, 2.4, '#ffd94d');
    } else {
      ctx.strokeStyle = '#0e0c12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(299, 321);
      ctx.quadraticCurveTo(302, 323, 305, 321);
      ctx.moveTo(308, 321);
      ctx.quadraticCurveTo(311, 323, 314, 321);
      ctx.stroke();
    }

    // Rug with a centre stripe that changes colour when altered.
    ctx.fillStyle = '#7a2e3a';
    ctx.beginPath();
    ctx.ellipse(280, 414, 120, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = altered.has('rug') ? '#2e7a4a' : '#a83a4a';
    ctx.beginPath();
    ctx.ellipse(280, 414, 84, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f4d67a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(280, 414, 104, 17, 0, 0, Math.PI * 2);
    ctx.stroke();
    void W;
    void H;
  },
};

function drawWindow(ctx, x, y, w, h, rand, hideStar) {
  ctx.fillStyle = '#1d2b4a';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + 30);
  ctx.quadraticCurveTo(x + w / 2, y - 22, x + w, y + 30);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  drawStars(ctx, rand, x, y, w, h * 0.7, 10, '#dfe9ff');
  drawMoon(ctx, x + w - 30, y + 34, 12, 'crescent');
  if (!hideStar) {
    ctx.fillStyle = '#ffe98a';
    star(ctx, x + 60, y + 38, 9);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#8a6a2f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + 30);
  ctx.quadraticCurveTo(x + w / 2, y - 22, x + w, y + 30);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
}

function drawBanner(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 18, y);
  ctx.lineTo(x + 18, y + 52);
  ctx.lineTo(x + 9, y + 42);
  ctx.lineTo(x, y + 52);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4d67a';
  star(ctx, x + 9, y + 20, 6);
  ctx.fill();
}

function drawPedestal(ctx, x, y) {
  ctx.fillStyle = '#5a4a6b';
  ctx.fillRect(x, y, 52, 14);
  ctx.fillRect(x + 8, y + 14, 36, 66);
  ctx.fillRect(x, y + 80, 52, 10);
  ctx.fillStyle = '#6e5c82';
  ctx.fillRect(x, y, 52, 4);
}

function drawHand(ctx, cx, cy, hours, len) {
  const a = ((hours % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#3a2b1d';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
  ctx.stroke();
}

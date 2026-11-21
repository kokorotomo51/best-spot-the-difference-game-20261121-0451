// Scene 2 — "The Alchemist's Study": shelves of potion bottles, an
// owl, a moonlit window, a desk with an open book and a candle, a
// bubbling cauldron, and a broom. Same contract as the museum scene:
// `altered` holds the ids whose detail differs in the right panel.
import {
  circle,
  drawFlame,
  drawMoon,
  drawStars,
  fillCircle,
  glow,
  roundedRect,
  star,
  text,
} from './draw.js';

export const studyScene = {
  id: 'study',
  title: "The Alchemist's Study",
  subtitle: 'Round 2 · bottles, books and bubbles',
  differences: [
    { id: 'potion', x: 122, y: 86, r: 26, label: 'a potion changed colour' },
    { id: 'moon', x: 460, y: 78, r: 26, label: 'the window moon changed phase' },
    { id: 'owl', x: 352, y: 66, r: 24, label: 'the owl closed its eyes' },
    { id: 'flame', x: 182, y: 268, r: 24, label: 'the desk candle burned low' },
    { id: 'bubbles', x: 482, y: 298, r: 26, label: 'the cauldron lost its bubbles' },
    { id: 'book', x: 280, y: 340, r: 28, label: 'a diagram vanished from the book' },
    { id: 'broom', x: 46, y: 300, r: 28, label: 'the broom disappeared' },
  ],

  draw(ctx, altered, rand, time) {
    const W = 560;
    const H = 440;

    // Timber wall and floor.
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#3a2a1c');
    wall.addColorStop(0.7, '#4a3624');
    wall.addColorStop(0.7, '#3a2a1c');
    wall.addColorStop(1, '#4a3624');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#5d4326';
    ctx.fillRect(0, 330, W, H - 330);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo((i / 6) * W, 330);
      ctx.lineTo((i / 6) * W - 20, H);
      ctx.stroke();
    }

    // Top shelves with potion bottles.
    drawShelf(ctx, 36, 118);
    drawShelf(ctx, 36, 168);
    drawBottle(ctx, 62, 96, '#9a4ac8', 'round');
    drawBottle(ctx, 102, 92, '#3f9a8a', 'flask');
    drawBottle(ctx, 122, 86, altered.has('potion') ? '#3fae4a' : '#9a4ac8', 'tall');
    drawBottle(ctx, 168, 94, '#c84a5a', 'round');
    drawBottle(ctx, 70, 146, '#4a7ac8', 'flask');
    drawBottle(ctx, 118, 144, '#c8a24a', 'tall');
    drawBottle(ctx, 162, 146, '#7ac84a', 'round');

    // Owl perched on the shelf end.
    drawOwl(ctx, 352, 62, altered.has('owl'), time);

    // Moonlit window, right.
    ctx.fillStyle = '#1d2b4a';
    roundedRect(ctx, 404, 30, 120, 128, 8);
    ctx.fill();
    ctx.save();
    roundedRect(ctx, 404, 30, 120, 128, 8);
    ctx.clip();
    drawStars(ctx, rand, 408, 34, 112, 80, 12, '#dfe9ff');
    drawMoon(ctx, 460, 78, 16, altered.has('moon') ? 'full' : 'crescent');
    ctx.fillStyle = '#24405c';
    ctx.beginPath();
    ctx.moveTo(404, 158);
    ctx.lineTo(440, 120);
    ctx.lineTo(470, 146);
    ctx.lineTo(496, 118);
    ctx.lineTo(524, 158);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#6b4a2f';
    ctx.lineWidth = 6;
    roundedRect(ctx, 404, 30, 120, 128, 8);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(464, 30);
    ctx.lineTo(464, 158);
    ctx.moveTo(404, 94);
    ctx.lineTo(524, 94);
    ctx.stroke();

    // Hanging dried herbs, left of the window.
    ctx.strokeStyle = '#7a8a4a';
    ctx.lineWidth = 2;
    for (const hx of [300, 316]) {
      ctx.beginPath();
      ctx.moveTo(hx, 30);
      ctx.lineTo(hx, 52);
      ctx.stroke();
      ctx.fillStyle = '#5a7a3a';
      ctx.beginPath();
      ctx.ellipse(hx, 62, 7, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Broom leaning by the left wall (missing when altered).
    if (!altered.has('broom')) {
      ctx.strokeStyle = '#8a6a3a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(56, 230);
      ctx.lineTo(38, 368);
      ctx.stroke();
      ctx.fillStyle = '#c8a24a';
      ctx.beginPath();
      ctx.moveTo(38, 368);
      ctx.lineTo(26, 402);
      ctx.lineTo(52, 402);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8a6a3a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(38, 376);
      ctx.lineTo(30, 400);
      ctx.moveTo(40, 378);
      ctx.lineTo(40, 400);
      ctx.stroke();
    }

    // Desk.
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(96, 316, 368, 16);
    ctx.fillStyle = '#54381f';
    ctx.fillRect(108, 332, 12, 62);
    ctx.fillRect(440, 332, 12, 62);
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(96, 316, 368, 5);

    // Open book, centre of the desk.
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.moveTo(280, 322);
    ctx.lineTo(232, 314);
    ctx.lineTo(232, 352);
    ctx.lineTo(280, 360);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(280, 322);
    ctx.lineTo(328, 314);
    ctx.lineTo(328, 352);
    ctx.lineTo(280, 360);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8a888';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = '#8a7a5a';
    ctx.beginPath();
    ctx.moveTo(242, 326);
    ctx.lineTo(268, 330);
    ctx.moveTo(242, 336);
    ctx.lineTo(268, 340);
    ctx.moveTo(292, 330);
    ctx.lineTo(318, 326);
    ctx.moveTo(292, 340);
    ctx.lineTo(318, 336);
    ctx.stroke();
    if (!altered.has('book')) {
      ctx.strokeStyle = '#7a4a9a';
      ctx.lineWidth = 2;
      star(ctx, 255, 342, 7);
      ctx.stroke();
      fillCircle(ctx, 255, 342, 2, '#7a4a9a');
    }

    // Desk candle with a flame that burns low when altered.
    ctx.fillStyle = '#f2ead2';
    ctx.fillRect(176, 288, 12, 26);
    ctx.fillStyle = '#c8a24a';
    ctx.fillRect(172, 312, 20, 5);
    drawFlame(ctx, 182, 284, altered.has('flame') ? 4 : 8, time, !altered.has('flame'));

    // Ink pot and quill, right of the book.
    fillCircle(ctx, 356, 306, 9, '#1d1a24');
    fillCircle(ctx, 356, 303, 5, '#3a2a6a');
    ctx.strokeStyle = '#e8e8f2';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(372, 314);
    ctx.quadraticCurveTo(384, 296, 392, 282);
    ctx.stroke();

    // Scroll, left of the book.
    ctx.fillStyle = '#e8dcc0';
    roundedRect(ctx, 118, 300, 44, 16, 7);
    ctx.fill();
    ctx.fillStyle = '#b8a888';
    fillCircle(ctx, 122, 308, 5, '#b8a888');
    fillCircle(ctx, 158, 308, 5, '#b8a888');

    // Cauldron with bubbles.
    ctx.fillStyle = '#2b2b33';
    ctx.beginPath();
    ctx.moveTo(448, 300);
    ctx.quadraticCurveTo(446, 340, 482, 342);
    ctx.quadraticCurveTo(518, 340, 516, 300);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4ac86a';
    ctx.beginPath();
    ctx.ellipse(482, 300, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, 482, 296, 40, '#4ac86a', 0.3);
    const bubbles = altered.has('bubbles') ? [[482, 282, 6]] : [[466, 282, 6], [482, 270, 8], [498, 282, 5]];
    for (const [bx, by, br] of bubbles) {
      ctx.strokeStyle = '#b8f2c8';
      ctx.lineWidth = 2;
      circle(ctx, bx, by + Math.sin(time / 400 + bx) * 3, br);
      ctx.stroke();
    }
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(452, 342);
    ctx.lineTo(446, 368);
    ctx.moveTo(512, 342);
    ctx.lineTo(518, 368);
    ctx.stroke();
    void W;
    void H;
  },
};

function drawShelf(ctx, x, y) {
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(x, y, 168, 8);
  ctx.fillStyle = '#54381f';
  ctx.fillRect(x, y + 8, 168, 4);
}

function drawBottle(ctx, x, y, liquid, shape) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.fillStyle = liquid;
  if (shape === 'round') {
    circle(ctx, x, y, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(x - 4, y - 20, 8, 7);
  } else if (shape === 'flask') {
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 20);
    ctx.lineTo(x + 5, y - 20);
    ctx.lineTo(x + 12, y + 10);
    ctx.quadraticCurveTo(x, y + 18, x - 12, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(x - 5, y - 24, 10, 5);
  } else {
    roundedRect(ctx, x - 8, y - 18, 16, 34, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(x - 4, y - 24, 8, 7);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(x - 8, y - 10, 4, 12);
  ctx.restore();
}

function drawOwl(ctx, x, y, asleep, time) {
  ctx.fillStyle = '#5a4632';
  circle(ctx, x, y + 16, 16);
  ctx.fill();
  circle(ctx, x, y, 13);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 9);
  ctx.lineTo(x - 13, y - 19);
  ctx.lineTo(x - 4, y - 12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 11, y - 9);
  ctx.lineTo(x + 13, y - 19);
  ctx.lineTo(x + 4, y - 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7a5f42';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  if (asleep) {
    ctx.strokeStyle = '#1d1408';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 2);
    ctx.quadraticCurveTo(x - 5, y, x - 2, y - 2);
    ctx.moveTo(x + 2, y - 2);
    ctx.quadraticCurveTo(x + 5, y, x + 8, y - 2);
    ctx.stroke();
  } else {
    const blink = Math.sin(time / 900) > 0.96 ? 0.3 : 1;
    fillCircle(ctx, x - 5, y - 2, 3.4 * blink + 0.4, '#ffd94d');
    fillCircle(ctx, x + 5, y - 2, 3.4 * blink + 0.4, '#ffd94d');
    fillCircle(ctx, x - 5, y - 2, 1.6, '#1d1408');
    fillCircle(ctx, x + 5, y - 2, 1.6, '#1d1408');
  }
  ctx.fillStyle = '#e09a44';
  ctx.beginPath();
  ctx.moveTo(x - 3, y + 3);
  ctx.lineTo(x + 3, y + 3);
  ctx.lineTo(x, y + 8);
  ctx.closePath();
  ctx.fill();
  text(ctx, 'z', x + 16, y - 16, '700 13px Georgia, serif', '#aeb8d8');
}

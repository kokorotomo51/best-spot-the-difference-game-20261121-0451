// Scene 3 — "The Moonlit Garden": a night garden with a fountain,
// a stone arch, hedges, flower beds, a bench, a lantern post, a big
// moon, and fireflies. Same contract: `altered` holds the ids whose
// detail differs in the right panel.
import {
  circle,
  drawMoon,
  drawStars,
  fillCircle,
  glow,
  roundedRect,
  star,
} from './draw.js';

export const gardenScene = {
  id: 'garden',
  title: 'The Moonlit Garden',
  subtitle: 'Round 3 · fountains and fireflies',
  differences: [
    { id: 'moon', x: 452, y: 62, r: 26, label: 'the moon lost its craters' },
    { id: 'fountain', x: 280, y: 262, r: 26, label: 'a water arc went missing' },
    { id: 'lantern', x: 490, y: 250, r: 26, label: 'the lantern went dark' },
    { id: 'flower', x: 92, y: 352, r: 24, label: 'a flower changed colour' },
    { id: 'bench', x: 92, y: 286, r: 26, label: 'a bench slat vanished' },
    { id: 'firefly', x: 352, y: 150, r: 22, label: 'a firefly flew away' },
    { id: 'stones', x: 280, y: 418, r: 26, label: 'a stepping stone vanished' },
  ],

  draw(ctx, altered, rand, time) {
    const W = 560;
    const H = 440;

    // Night sky and ground.
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#131f3d');
    sky.addColorStop(0.55, '#24355c');
    sky.addColorStop(0.55, '#2c4a34');
    sky.addColorStop(1, '#1d3325');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    drawStars(ctx, rand, 0, 0, W, 200, 46, '#dfe9ff');

    // Big moon, cratered unless altered.
    if (altered.has('moon')) {
      glow(ctx, 452, 62, 66, '#f2ead2', 0.3);
      fillCircle(ctx, 452, 62, 30, '#f2ead2');
    } else {
      drawMoon(ctx, 452, 62, 30, 'full');
    }

    // Distant tree line.
    ctx.fillStyle = '#1a2c22';
    for (let i = 0; i < 9; i++) {
      const tx = 10 + i * 62 + rand() * 14;
      const th = 52 + rand() * 34;
      ctx.beginPath();
      ctx.moveTo(tx, 246);
      ctx.lineTo(tx + 22, 246 - th);
      ctx.lineTo(tx + 44, 246);
      ctx.closePath();
      ctx.fill();
    }

    // Stone arch / trellis over the centre path.
    ctx.strokeStyle = '#7a7a86';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(196, 250);
    ctx.quadraticCurveTo(196, 130, 280, 128);
    ctx.quadraticCurveTo(364, 130, 364, 250);
    ctx.stroke();
    ctx.strokeStyle = '#9a9aa8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(196, 250);
    ctx.quadraticCurveTo(196, 130, 280, 128);
    ctx.quadraticCurveTo(364, 130, 364, 250);
    ctx.stroke();
    // Climbing roses on the arch.
    for (const [rx, ry] of [[212, 196], [232, 158], [262, 140], [300, 138], [330, 154], [348, 188]]) {
      fillCircle(ctx, rx, ry, 5, '#c84a5a');
      fillCircle(ctx, rx - 2, ry - 2, 2, '#e87a8a');
    }
    ctx.fillStyle = '#3f7a3a';
    for (const [lx, ly] of [[222, 176], [248, 148], [288, 134], [318, 146], [340, 172]]) {
      ctx.beginPath();
      ctx.ellipse(lx, ly, 8, 4, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hedges left and right.
    drawHedge(ctx, 8, 236, 128, 84);
    drawHedge(ctx, 424, 236, 128, 84);

    // Flower beds in front of the hedges.
    drawFlowerBed(ctx, 24, 330, altered.has('flower'));
    drawFlowerBed(ctx, 424, 330, false);

    // Bench, left.
    ctx.fillStyle = '#6b4a2f';
    const slats = altered.has('bench') ? 3 : 4;
    for (let i = 0; i < slats; i++) {
      ctx.fillRect(48, 262 + i * 12, 88, 8);
    }
    ctx.fillStyle = '#54381f';
    ctx.fillRect(48, 262 + slats * 12, 88, 8);
    ctx.fillRect(56, 306, 8, 34);
    ctx.fillRect(120, 306, 8, 34);
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(48, 258, 88, 5);

    // Lantern post, right.
    ctx.fillStyle = '#2b2b33';
    ctx.fillRect(486, 190, 7, 130);
    ctx.fillStyle = '#3a3a44';
    roundedRect(ctx, 472, 158, 36, 40, 5);
    ctx.fill();
    if (!altered.has('lantern')) {
      glow(ctx, 490, 178, 44, '#ffd94d', 0.55);
      ctx.fillStyle = '#ffe98a';
      roundedRect(ctx, 478, 164, 24, 28, 4);
      ctx.fill();
      ctx.fillStyle = '#fff7cc';
      fillCircle(ctx, 490, 178, 6, '#fff7cc');
    } else {
      ctx.fillStyle = '#565660';
      roundedRect(ctx, 478, 164, 24, 28, 4);
      ctx.fill();
    }
    ctx.fillStyle = '#2b2b33';
    ctx.beginPath();
    ctx.moveTo(468, 158);
    ctx.lineTo(512, 158);
    ctx.lineTo(490, 146);
    ctx.closePath();
    ctx.fill();

    // Fountain, centre.
    ctx.fillStyle = '#8a8a96';
    ctx.beginPath();
    ctx.ellipse(280, 372, 74, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6a6a78';
    ctx.beginPath();
    ctx.ellipse(280, 370, 62, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5fa8d8';
    ctx.beginPath();
    ctx.ellipse(280, 368, 52, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a8a96';
    ctx.fillRect(272, 300, 16, 66);
    ctx.fillStyle = '#9a9aa8';
    ctx.beginPath();
    ctx.ellipse(280, 300, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5fa8d8';
    ctx.beginPath();
    ctx.ellipse(280, 298, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Water arcs: three normally, two when altered.
    ctx.strokeStyle = '#9ad8f2';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const arcs = altered.has('fountain')
      ? [[-26, 236], [26, 236]]
      : [[-34, 232], [0, 224], [34, 232]];
    for (const [dx, top] of arcs) {
      ctx.beginPath();
      ctx.moveTo(280, 296);
      ctx.quadraticCurveTo(280 + dx, top + 26, 280 + dx * 1.7, 344);
      ctx.stroke();
    }
    ctx.fillStyle = '#c8ecfa';
    for (const [dx] of arcs) {
      fillCircle(ctx, 280 + dx * 1.7, 346, 3, '#c8ecfa');
    }

    // Fireflies, drifting with time. One big one near the arch
    // vanishes when altered.
    for (let i = 0; i < 9; i++) {
      const fx = 60 + ((i * 53 + 20) % 440);
      const fy = 120 + ((i * 37 + 10) % 130);
      const wob = Math.sin(time / 500 + i * 1.7) * 10;
      const tw = 0.5 + Math.sin(time / 300 + i) * 0.4;
      glow(ctx, fx + wob, fy, 12, '#d8f28a', 0.35 * tw + 0.15);
      fillCircle(ctx, fx + wob, fy, 2.4, '#e8ffa8');
    }
    if (!altered.has('firefly')) {
      const fx = 352 + Math.sin(time / 600) * 8;
      const fy = 150 + Math.cos(time / 700) * 6;
      glow(ctx, fx, fy, 20, '#ffe98a', 0.7);
      fillCircle(ctx, fx, fy, 4, '#fff3c4');
      ctx.strokeStyle = 'rgba(255,243,196,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fx - 8, fy - 2);
      ctx.lineTo(fx - 3, fy);
      ctx.moveTo(fx + 8, fy - 2);
      ctx.lineTo(fx + 3, fy);
      ctx.stroke();
    }

    // Stepping-stone path: five stones, four when altered.
    const stones = altered.has('stones') ? 4 : 5;
    for (let i = 0; i < stones; i++) {
      const sy = 392 + i * 0;
      const sx = 244 + i * 18;
      ctx.fillStyle = '#9a9aa8';
      ctx.beginPath();
      ctx.ellipse(sx, 400 + (i % 2) * 6 + i * 6, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a7a86';
      ctx.beginPath();
      ctx.ellipse(sx, 402 + (i % 2) * 6 + i * 6, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      void sy;
    }
    void W;
    void H;
  },
};

function drawHedge(ctx, x, y, w, h) {
  ctx.fillStyle = '#2c5a2e';
  roundedRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.fillStyle = '#3a7a3a';
  for (let i = 0; i < 10; i++) {
    const hx = x + 10 + (i % 5) * ((w - 20) / 4);
    const hy = y + 10 + Math.floor(i / 5) * (h - 24);
    fillCircle(ctx, hx, hy, 9, '#3a7a3a');
  }
  ctx.fillStyle = '#244d26';
  ctx.fillRect(x, y + h - 8, w, 8);
}

function drawFlowerBed(ctx, x, y, firstRedToWhite) {
  ctx.fillStyle = '#4a2f1d';
  roundedRect(ctx, x, y, 112, 44, 8);
  ctx.fill();
  const colors = ['#c84a5a', '#e8a24a', '#8a5ac8', '#e8e8f2', '#c84a5a'];
  for (let i = 0; i < 5; i++) {
    const fx = x + 16 + i * 20;
    const fy = y + 20;
    ctx.strokeStyle = '#3f7a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, y + 40);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    let petal = colors[i];
    if (i === 0 && firstRedToWhite) petal = '#e8e8f2';
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      fillCircle(ctx, fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 4, petal);
    }
    fillCircle(ctx, fx, fy, 3.4, '#ffd94d');
  }
}

// Shared canvas drawing helpers: frames, markers, crosshair, sky
// bodies and other small pieces every scene reuses.

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function star(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function glow(ctx, x, y, r, color, alpha = 0.55) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

export function fillCircle(ctx, x, y, r, color) {
  circle(ctx, x, y, r);
  ctx.fillStyle = color;
  ctx.fill();
}

export function strokeCircle(ctx, x, y, r, color, width) {
  circle(ctx, x, y, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

// Ornate gold frame drawn around a panel.
export function panelFrame(ctx, x, y, w, h) {
  ctx.save();
  ctx.strokeStyle = '#8a6a2f';
  ctx.lineWidth = 6;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = '#f4d67a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  ctx.fillStyle = '#f4d67a';
  for (const [cx, cy] of [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ]) {
    fillCircle(ctx, cx, cy, 5, '#f4d67a');
  }
  ctx.restore();
}

// Glowing ring marker for a found difference. `pop` is 0..1 while the
// marker scales in, then rests at 1 with a gentle pulse.
export function drawMarker(ctx, x, y, r, pop, time) {
  const pulse = 1 + Math.sin(time / 350) * 0.05;
  const rr = r * (0.3 + 0.7 * pop) * pulse;
  ctx.save();
  ctx.globalAlpha = 0.35 * pop;
  strokeCircle(ctx, x, y, rr + 8, '#ffd94d', 8);
  ctx.globalAlpha = 1;
  strokeCircle(ctx, x, y, rr, '#ffd94d', 4);
  strokeCircle(ctx, x, y, rr - 5, '#fff7cc', 2);
  // Small check tick at the ring's lower right.
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + rr * 0.45, y + rr * 0.15);
  ctx.lineTo(x + rr * 0.65, y + rr * 0.4);
  ctx.lineTo(x + rr * 1.0, y - rr * 0.25);
  ctx.stroke();
  ctx.restore();
}

// Red X flash for a wrong mark.
export function drawWrongMark(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ff5a4e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const s = 14;
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
  ctx.restore();
}

// Pulsing hint ring around one unfound difference.
export function drawHintRing(ctx, x, y, r, time) {
  const t = (time % 900) / 900;
  const rr = r * (0.9 + t * 0.5);
  ctx.save();
  ctx.globalAlpha = 0.9 - t * 0.7;
  strokeCircle(ctx, x, y, rr, '#7de8ff', 4);
  ctx.restore();
}

// Keyboard crosshair, drawn on both panels at the same scene point.
export function drawCrosshair(ctx, x, y, time) {
  const blink = 0.6 + Math.sin(time / 180) * 0.4;
  ctx.save();
  ctx.globalAlpha = blink;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  circle(ctx, x, y, 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 24, y);
  ctx.lineTo(x - 8, y);
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 24, y);
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x, y + 24);
  ctx.stroke();
  fillCircle(ctx, x, y, 3, '#ffffff');
  ctx.restore();
}

// Moon: 'crescent' or 'full'. A pale disc with a shadow bite for the
// crescent, or a cratered disc for the full moon.
export function drawMoon(ctx, x, y, r, kind) {
  ctx.save();
  if (kind === 'crescent') {
    fillCircle(ctx, x, y, r, '#ffd94d');
    glow(ctx, x, y, r * 2.2, '#ffd94d', 0.35);
    fillCircle(ctx, x + r * 0.55, y - r * 0.3, r * 0.9, '#1d2b4a');
  } else {
    glow(ctx, x, y, r * 2.2, '#f2ead2', 0.3);
    fillCircle(ctx, x, y, r, '#f2ead2');
    fillCircle(ctx, x - r * 0.3, y - r * 0.2, r * 0.18, '#ddd2b4');
    fillCircle(ctx, x + r * 0.35, y + r * 0.3, r * 0.13, '#ddd2b4');
    fillCircle(ctx, x + r * 0.1, y - r * 0.45, r * 0.1, '#ddd2b4');
  }
  ctx.restore();
}

// Candle flame with a wobble driven by time.
export function drawFlame(ctx, x, y, s, time, bright = true) {
  const wob = Math.sin(time / 130 + x) * s * 0.12;
  ctx.save();
  glow(ctx, x, y, s * 3, '#ffb347', bright ? 0.5 : 0.18);
  ctx.beginPath();
  ctx.moveTo(x, y - s * 1.6 + wob * 0.3);
  ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.4, x, y + s * 0.5);
  ctx.quadraticCurveTo(x - s * 0.8, y - s * 0.4, x, y - s * 1.6 + wob * 0.3);
  ctx.fillStyle = bright ? '#ffcf5c' : '#8a7a5a';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.7);
  ctx.quadraticCurveTo(x + s * 0.4, y, x, y + s * 0.35);
  ctx.quadraticCurveTo(x - s * 0.4, y, x, y - s * 0.7);
  ctx.fillStyle = bright ? '#fff3c4' : '#6b6250';
  ctx.fill();
  ctx.restore();
}

// A field of small stars from a seeded random source.
export function drawStars(ctx, rand, x0, y0, w, h, count, color = '#ffffff') {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = x0 + rand() * w;
    const y = y0 + rand() * h;
    const r = 1 + rand() * 1.8;
    ctx.globalAlpha = 0.4 + rand() * 0.6;
    fillCircle(ctx, x, y, r, color);
  }
  ctx.restore();
}

export function text(ctx, str, x, y, font, color, align = 'center') {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function panelTitle(ctx, x, y, w, label, color = '#f4d67a') {
  text(ctx, label, x + w / 2, y, '600 15px Georgia, serif', color);
}

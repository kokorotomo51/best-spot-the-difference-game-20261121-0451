// Spot the Oddity — game controller: boot, state machine, input,
// rendering, HUD, and the deterministic ?shot= states used for the
// entry screenshots. All artwork is drawn by the scene modules.
import { SCENES } from './scenes.js';
import { makeRandom, pickSeed } from './prng.js';
import {
  drawCrosshair,
  drawHintRing,
  drawMarker,
  drawWrongMark,
  panelFrame,
  panelTitle,
  text,
} from './draw.js';
import { playChime, playFanfare, playHint, playThud, toggleMuted, isMuted } from './audio.js';

export const PANEL_W = 560;
export const PANEL_H = 440;
const PAD_X = 22;
const PAD_TOP = 30;
const GAP = 36;
const CANVAS_W = PAD_X * 2 + PANEL_W * 2 + GAP; // 1200
const CANVAS_H = PAD_TOP + PANEL_H + 30; // 500
const LEFT_X = PAD_X;
const RIGHT_X = PAD_X + PANEL_W + GAP;
const PANEL_Y = PAD_TOP;
const ROUND_TIME_BONUS = 500;
const HINTS_PER_ROUND = 3;
const WRONG_PENALTY_MS = 5000;
const WRONG_SCORE_COST = 25;
const FIND_SCORE = 100;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hud = {
  round: document.getElementById('hud-round'),
  found: document.getElementById('hud-found'),
  timer: document.getElementById('hud-timer'),
  score: document.getElementById('hud-score'),
  hints: document.getElementById('hud-hints'),
  hintBtn: document.getElementById('btn-hint'),
  restartBtn: document.getElementById('btn-restart'),
  soundBtn: document.getElementById('btn-sound'),
};

const params = new URLSearchParams(window.location.search);
const seed = pickSeed(params);
const shot = params.get('shot');

const game = {
  screen: 'title',
  round: 0,
  found: new Map(), // diff id -> timestamp found
  score: 0,
  hintsLeft: HINTS_PER_ROUND,
  carriedMs: 0,
  roundStart: 0,
  penaltyMs: 0,
  roundBonus: 0,
  crosshair: { x: 280, y: 220 },
  keyboardUsed: false,
  wrongMarks: [],
  floats: [],
  hint: null,
  totalTimeMs: 0,
};

function scene() {
  return SCENES[game.round];
}

function elapsedMs(now) {
  if (game.screen === 'title') return game.carriedMs;
  if (game.screen === 'won') return game.totalTimeMs;
  return game.carriedMs + (now - game.roundStart) + game.penaltyMs;
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function startRound(round, keepScore) {
  game.round = round;
  game.found = new Map();
  game.hintsLeft = HINTS_PER_ROUND;
  game.penaltyMs = 0;
  game.roundStart = performance.now();
  game.screen = 'playing';
  game.hint = null;
  if (!keepScore) game.score = 0;
  game.crosshair = { x: 280, y: 220 };
}

function startGame() {
  game.carriedMs = 0;
  game.totalTimeMs = 0;
  startRound(0, false);
}

function finishRound(now) {
  const roundMs = now - game.roundStart + game.penaltyMs;
  const roundSeconds = Math.floor(roundMs / 1000);
  const timeBonus = Math.max(0, ROUND_TIME_BONUS - roundSeconds * 5);
  game.roundBonus = timeBonus + game.hintsLeft * 50;
  game.score += game.roundBonus;
  game.carriedMs += roundMs;
  game.screen = 'roundDone';
  playFanfare();
}

function advanceAfterRound() {
  if (game.round + 1 >= SCENES.length) {
    game.totalTimeMs = game.carriedMs;
    game.screen = 'won';
    playFanfare();
  } else {
    startRound(game.round + 1, true);
  }
}

function allDiffIds() {
  return new Set(scene().differences.map((d) => d.id));
}

function tryMark(sx, sy, panel) {
  if (game.screen !== 'playing') return;
  const now = performance.now();
  const hit = scene().differences.find(
    (d) => !game.found.has(d.id) && Math.hypot(d.x - sx, d.y - sy) <= d.r,
  );
  if (hit) {
    game.found.set(hit.id, now);
    game.score += FIND_SCORE;
    game.floats.push({ x: sx, y: sy, text: `+${FIND_SCORE}`, until: now + 900, panel });
    playChime();
    if (game.found.size === scene().differences.length) {
      window.setTimeout(() => {
        if (game.screen === 'playing') finishRound(performance.now());
      }, 650);
    }
  } else {
    game.penaltyMs += WRONG_PENALTY_MS;
    game.score = Math.max(0, game.score - WRONG_SCORE_COST);
    game.wrongMarks.push({ x: sx, y: sy, panel, until: now + 700 });
    game.floats.push({ x: sx, y: sy, text: `-${WRONG_SCORE_COST} · +5s`, until: now + 900, panel });
    playThud();
  }
  updateHud(now);
}

function useHint() {
  if (game.screen !== 'playing' || game.hintsLeft <= 0) return;
  const remaining = scene().differences.filter((d) => !game.found.has(d.id));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  game.hintsLeft -= 1;
  game.hint = { id: pick.id, until: performance.now() + 2000 };
  playHint();
  updateHud(performance.now());
}

function panelAt(cx, cy) {
  if (cy < PANEL_Y || cy > PANEL_Y + PANEL_H) return null;
  if (cx >= LEFT_X && cx <= LEFT_X + PANEL_W) return { panel: 'left', x: LEFT_X };
  if (cx >= RIGHT_X && cx <= RIGHT_X + PANEL_W) return { panel: 'right', x: RIGHT_X };
  return null;
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

canvas.addEventListener('click', (event) => {
  const p = canvasPoint(event);
  if (game.screen === 'title') {
    startGame();
    updateHud(performance.now());
    return;
  }
  if (game.screen === 'roundDone') {
    advanceAfterRound();
    updateHud(performance.now());
    return;
  }
  if (game.screen === 'won') {
    startGame();
    updateHud(performance.now());
    return;
  }
  const hit = panelAt(p.x, p.y);
  if (hit) tryMark(p.x - hit.x, p.y - PANEL_Y, hit.panel);
});

window.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 32 : 12;
  const c = game.crosshair;
  let moved = false;
  if (event.key === 'ArrowLeft') {
    c.x = Math.max(10, c.x - step);
    moved = true;
  } else if (event.key === 'ArrowRight') {
    c.x = Math.min(PANEL_W - 10, c.x + step);
    moved = true;
  } else if (event.key === 'ArrowUp') {
    c.y = Math.max(10, c.y - step);
    moved = true;
  } else if (event.key === 'ArrowDown') {
    c.y = Math.min(PANEL_H - 10, c.y + step);
    moved = true;
  }
  if (moved) {
    game.keyboardUsed = true;
    event.preventDefault();
    return;
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (game.screen === 'title') startGame();
    else if (game.screen === 'roundDone') advanceAfterRound();
    else if (game.screen === 'won') startGame();
    else tryMark(c.x, c.y, 'left');
    updateHud(performance.now());
    return;
  }
  if (event.key === 'h' || event.key === 'H') useHint();
  if (event.key === 'm' || event.key === 'M') {
    toggleMuted();
    updateHud(performance.now());
  }
});

hud.hintBtn.addEventListener('click', useHint);
hud.restartBtn.addEventListener('click', () => {
  startGame();
  updateHud(performance.now());
});
hud.soundBtn.addEventListener('click', () => {
  toggleMuted();
  updateHud(performance.now());
});

function updateHud(now) {
  const s = scene();
  hud.round.textContent = `${s.title} · Round ${game.round + 1} of ${SCENES.length}`;
  hud.found.textContent = `${game.found.size} of ${s.differences.length} found`;
  hud.timer.textContent = formatTime(elapsedMs(now));
  hud.score.textContent = String(game.score);
  hud.hints.textContent = `${game.hintsLeft} hints`;
  hud.hintBtn.disabled = game.screen !== 'playing' || game.hintsLeft <= 0;
  hud.soundBtn.textContent = isMuted() ? 'Sound: off' : 'Sound: on';
}

// ---------- rendering ----------

function drawPanel(originX, altered, now) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(originX, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(originX, PANEL_Y);
  scene().draw(ctx, altered, makeRandom(seed), now);
  ctx.restore();
}

function drawFoundMarkers(now) {
  for (const d of scene().differences) {
    const at = game.found.get(d.id);
    if (at === undefined) continue;
    const pop = Math.min(1, (now - at) / 300);
    for (const ox of [LEFT_X, RIGHT_X]) {
      drawMarker(ctx, ox + d.x, PANEL_Y + d.y, d.r, pop, now);
    }
  }
}

function drawOverlayCard(cx, cy, w, h, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 8, 18, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#1c1626';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 18);
  ctx.fill();
  ctx.stroke();
  text(ctx, title, cx, cy - h / 2 + 44, '700 38px Georgia, serif', '#f4d67a');
  lines.forEach((line, i) => {
    text(ctx, line.text, cx, cy - h / 2 + 92 + i * 30, line.font || '17px Georgia, serif', line.color || '#e8e0d0');
  });
  ctx.restore();
}

function render(now) {
  ctx.fillStyle = '#14101d';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  panelTitle(ctx, LEFT_X, 14, PANEL_W, 'ORIGINAL');
  panelTitle(ctx, RIGHT_X, 14, PANEL_W, 'FIND THE DIFFERENCES');

  if (game.screen === 'won') {
    drawPanel(LEFT_X, new Set(), now);
    drawPanel(RIGHT_X, allDiffIds(), now);
  } else {
    drawPanel(LEFT_X, new Set(), now);
    drawPanel(RIGHT_X, allDiffIds(), now);
  }
  drawFoundMarkers(now);

  // Hint ring on both panels.
  if (game.hint && now < game.hint.until) {
    const d = scene().differences.find((x) => x.id === game.hint.id);
    if (d) {
      for (const ox of [LEFT_X, RIGHT_X]) drawHintRing(ctx, ox + d.x, PANEL_Y + d.y, d.r, now);
    }
  } else if (game.hint && now >= game.hint.until) {
    game.hint = null;
  }

  // Wrong-mark flashes.
  game.wrongMarks = game.wrongMarks.filter((m) => now < m.until);
  for (const m of game.wrongMarks) {
    const ox = m.panel === 'left' ? LEFT_X : RIGHT_X;
    const alpha = (m.until - now) / 700;
    drawWrongMark(ctx, ox + m.x, PANEL_Y + m.y, alpha);
  }

  // Floating score texts.
  game.floats = game.floats.filter((f) => now < f.until);
  for (const f of game.floats) {
    const ox = f.panel === 'left' ? LEFT_X : RIGHT_X;
    const alpha = (f.until - now) / 900;
    ctx.save();
    ctx.globalAlpha = alpha;
    text(ctx, f.text, ox + f.x, PANEL_Y + f.y - 34, '700 19px Georgia, serif', '#ffd94d');
    ctx.restore();
  }

  // Keyboard crosshair on both panels while playing.
  if (game.screen === 'playing' && game.keyboardUsed) {
    for (const ox of [LEFT_X, RIGHT_X]) {
      drawCrosshair(ctx, ox + game.crosshair.x, PANEL_Y + game.crosshair.y, now);
    }
  }

  panelFrame(ctx, LEFT_X, PANEL_Y, PANEL_W, PANEL_H);
  panelFrame(ctx, RIGHT_X, PANEL_Y, PANEL_W, PANEL_H);

  if (game.screen === 'title') {
    drawOverlayCard(CANVAS_W / 2, CANVAS_H / 2, 640, 330, 'SPOT THE ODDITY', [
      { text: 'A midnight museum mystery in three rooms', font: 'italic 19px Georgia, serif', color: '#cbbf9f' },
      { text: 'Find 7 differences in each room. Click a difference —' },
      { text: 'or move the crosshair with the arrow keys and press Enter.' },
      { text: 'Hints are limited. A wrong mark costs 25 points and 5 seconds.' },
      { text: 'Click or press Enter to begin', font: '700 19px Georgia, serif', color: '#ffd94d' },
    ], '#f4d67a');
  } else if (game.screen === 'roundDone') {
    drawOverlayCard(CANVAS_W / 2, CANVAS_H / 2, 560, 250, 'ROOM CLEARED!', [
      { text: `${scene().title} — all 7 differences found.` },
      { text: `Round bonus: +${game.roundBonus} points`, font: '700 19px Georgia, serif', color: '#ffd94d' },
      { text: game.round + 1 >= SCENES.length ? 'Click to see your result' : 'Click to enter the next room' },
    ], '#7de8ff');
  } else if (game.screen === 'won') {
    drawOverlayCard(CANVAS_W / 2, CANVAS_H / 2, 600, 300, 'CASE CLOSED!', [
      { text: 'You spotted every oddity in all three rooms.', font: 'italic 18px Georgia, serif', color: '#cbbf9f' },
      { text: `Final score: ${game.score}`, font: '700 22px Georgia, serif', color: '#ffd94d' },
      { text: `Total time: ${formatTime(game.totalTimeMs)}` },
      { text: 'Click or press Enter to play again', font: '700 18px Georgia, serif', color: '#7de8ff' },
    ], '#f4d67a');
  }
}

function frame(now) {
  render(now);
  if (game.screen === 'playing') {
    hud.timer.textContent = formatTime(elapsedMs(now));
  }
  requestAnimationFrame(frame);
}

// ---------- deterministic ?shot= states for the entry screenshots ----------
// ?round=N (1..3) deep-links straight into a room, so any room can be
// opened directly; ?shot=play honours it too.
const roundParam = Math.min(
  SCENES.length - 1,
  Math.max(0, (Number.parseInt(params.get('round') || '1', 10) || 1) - 1),
);

function applyShotState() {
  if (shot === 'start') {
    game.screen = 'title';
  } else if (shot === 'play') {
    startRound(roundParam, false);
    const now = performance.now();
    const firstThree = scene().differences.slice(0, 3);
    for (const d of firstThree) game.found.set(d.id, now - 1000);
    game.score = 3 * FIND_SCORE;
    game.carriedMs = 47000;
    game.roundStart = now;
    game.penaltyMs = 0;
    game.keyboardUsed = true;
    game.crosshair = { x: 150, y: 300 };
  } else if (shot === 'end') {
    game.round = SCENES.length - 1;
    game.screen = 'won';
    game.score = 2450;
    game.totalTimeMs = 204000;
    game.carriedMs = 204000;
    game.roundStart = performance.now();
    for (const d of scene().differences) game.found.set(d.id, performance.now() - 1000);
  } else if (params.has('round')) {
    startRound(roundParam, false);
  }
  updateHud(performance.now());
}

applyShotState();
requestAnimationFrame(frame);

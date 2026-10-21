(function () {
  var canvas = document.getElementById('bg-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1;
  var notes = [], rings = [], bars = [];
  var NOTE_GLYPHS = ['\u266A', '\u266B', '\u266C', '\u2669'];
  var COLORS = ['#A9F00F', '#00E5FF', '#7B61FF', '#FF3D9A'];

  function hexToRgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.max(24, Math.floor(W / 28));
    bars = [];
    for (var i = 0; i < count; i++) {
      bars.push({ x: i * (W / count), w: W / count - 3, phase: Math.random() * Math.PI * 2, speed: 0.8 + Math.random() * 2.2 });
    }
  }

  function spawnNote(initial) {
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 20,
      size: 14 + Math.random() * 26,
      vy: 0.3 + Math.random() * 0.8,
      drift: Math.random() * Math.PI * 2,
      glyph: NOTE_GLYPHS[Math.floor(Math.random() * NOTE_GLYPHS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.25 + Math.random() * 0.4
    };
  }

  function spawnRing() {
    return { x: Math.random() * W, y: Math.random() * H * 0.8 + H * 0.1, r: 0, max: 120 + Math.random() * 140, color: COLORS[Math.floor(Math.random() * COLORS.length)] };
  }

  function init() {
    resize();
    notes = [];
    for (var i = 0; i < 22; i++) notes.push(spawnNote(true));
    rings = [spawnRing(), spawnRing()];
  }

  function drawGrid(t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.07)';
    ctx.lineWidth = 1;
    var step = 56;
    var offset = (t * 0.02) % step;
    for (var x = 0; x <= W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (var y = -step + offset; y <= H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawWaves(t) {
    ctx.save();
    ctx.lineWidth = 2;
    for (var k = 0; k < 3; k++) {
      ctx.beginPath();
      var amp = 30 + k * 18;
      var yBase = H * (0.35 + k * 0.18);
      for (var x = 0; x <= W; x += 8) {
        var y = yBase + Math.sin(x * 0.006 + t * 0.001 * (k + 1)) * amp + Math.sin(x * 0.015 - t * 0.0015) * (amp * 0.35);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hexToRgba(COLORS[k + 1], 0.22);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEqualizer(t) {
    ctx.save();
    for (var i = 0; i < bars.length; i++) {
      var b = bars[i];
      var h = (Math.sin(t * 0.002 * b.speed + b.phase) * 0.5 + 0.5) * H * 0.12 + H * 0.015;
      var grad = ctx.createLinearGradient(0, H - h, 0, H);
      grad.addColorStop(0, 'rgba(169, 240, 15, 0.32)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0.02)');
      ctx.fillStyle = grad;
      ctx.fillRect(b.x, H - h, b.w, h);
    }
    ctx.restore();
  }

  function drawRings(dt) {
    ctx.save();
    ctx.lineWidth = 1.5;
    for (var i = 0; i < rings.length; i++) {
      var r = rings[i];
      r.r += dt * 0.04;
      var a = Math.max(0, 1 - r.r / r.max);
      ctx.strokeStyle = hexToRgba(r.color, a * 0.5);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
      if (r.r >= r.max) rings[i] = spawnRing();
    }
    ctx.restore();
  }

  function drawNotes(t, dt) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      n.y -= n.vy * dt * 0.06;
      n.x += Math.sin(t * 0.001 + n.drift) * 0.4;
      if (n.y < -30) notes[i] = spawnNote(false);
      ctx.globalAlpha = n.alpha;
      ctx.fillStyle = n.color;
      ctx.font = n.size + 'px sans-serif';
      ctx.fillText(n.glyph, n.x, n.y);
    }
    ctx.restore();
  }

  var last = 0;
  function frame(now) {
    var dt = last ? Math.min(now - last, 50) : 16;
    last = now;
    ctx.clearRect(0, 0, W, H);
    drawGrid(now);
    drawWaves(now);
    drawRings(dt);
    drawEqualizer(now);
    drawNotes(now, dt);
    if (!reduce) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  init();
  if (reduce) {
    frame(0);
  } else {
    requestAnimationFrame(frame);
  }
})();

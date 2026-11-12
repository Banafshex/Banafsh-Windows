(function () {
  'use strict';

  class BanafshNetworkCanvas {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.mode = 'idle'; // 'idle' | 'connecting' | 'connected'
      this.isDark = true;
      this.nodes = [];
      this.flashes = [];
      this.burstStart = 0;
      this.connectedAt = 0;
      this.lastPulse = 0;
      this.rafId = null;
      this.timerId = null;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!this.canvas || !this.ctx) return;
      this.resize();
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stopLoop();
        else this.scheduleNext();
      });
      this.scheduleNext();
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(300, rect.width || window.innerWidth || 430);
      this.height = Math.max(400, rect.height || window.innerHeight || 780);
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (!this.nodes.length) this.seedNodes();
      this.drawFrame(performance.now());
    }

    seedNodes() {
      const count = 30;
      this.nodes = [];
      for (let i = 0; i < count; i++) {
        this.nodes.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: 1.6 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          cyan: i % 3 === 0,
          energy: 0
        });
      }
    }

    setTheme(isDark) {
      this.isDark = !!isDark;
      this.drawFrame(performance.now());
    }

    setMode(mode, celebrate = false) {
      this.mode = mode;
      const now = performance.now();
      if (mode === 'connected') {
        this.connectedAt = now;
        if (celebrate) this.burstStart = now;
      } else {
        this.burstStart = 0;
      }
      this.scheduleNext();
    }

    stopLoop() {
      if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
      if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
    }

    scheduleNext() {
      this.stopLoop();
      if (!this.ctx || document.hidden) return;
      if (this.reducedMotion) {
        this.drawFrame(performance.now());
        return;
      }
      const now = performance.now();
      const fast =
        this.mode === 'connecting' ||
        (this.burstStart && now - this.burstStart < 1500) ||
        (this.connectedAt && now - this.connectedAt < 2500);

      if (fast) {
        this.rafId = requestAnimationFrame((ts) => {
          this.rafId = null;
          this.drawFrame(ts);
          this.scheduleNext();
        });
      } else {
        this.timerId = setTimeout(() => {
          this.timerId = null;
          this.drawFrame(performance.now());
          this.scheduleNext();
        }, 42);
      }
    }

    drawFrame(nowMs) {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      ctx.clearRect(0, 0, w, h);

      const isDark = this.isDark;
      const speedMul = this.mode === 'connecting' ? 2.1 : (this.mode === 'connected' ? 1.25 : 0.85);
      const t = nowMs * 0.001;

      let boost = 1;
      if (this.mode === 'connected' && this.connectedAt) {
        const bt = (nowMs - this.connectedAt) / 1000;
        if (bt < 2.4) {
          boost = 1 + 0.75 * Math.exp(-Math.pow(bt / 0.55, 1.4));
        }
      }

      // Move nodes gently
      if (!this.reducedMotion) {
        for (const n of this.nodes) {
          n.x += n.vx * speedMul;
          n.y += n.vy * speedMul;
          if (n.x < -16) n.x = w + 16;
          if (n.x > w + 16) n.x = -16;
          if (n.y < -16) n.y = h + 16;
          if (n.y > h + 16) n.y = -16;
          n.energy *= 0.94;
        }
      }

      // Build nearby pairs
      const maxDist = 118;
      const maxDist2 = maxDist * maxDist;
      const edges = [];
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist2) {
            edges.push({ a: i, b: j, dist: Math.sqrt(d2) });
          }
        }
      }

      // Connecting sparks
      if (this.mode === 'connecting' && !this.reducedMotion && edges.length > 0 && nowMs - this.lastPulse > 240) {
        this.lastPulse = nowMs;
        const pick = edges[Math.floor(Math.random() * edges.length)];
        this.flashes.push({ a: pick.a, b: pick.b, t: nowMs, dur: 480 });
        this.nodes[pick.a].energy = 1;
        this.nodes[pick.b].energy = 1;
      }
      this.flashes = this.flashes.filter((f) => nowMs - f.t < f.dur);

      const lineRgb = isDark ? '56, 189, 248' : '124, 58, 237';
      const baseAlpha = isDark ? 0.22 : 0.11;

      // Draw edges
      ctx.lineWidth = 0.85;
      for (const e of edges) {
        const na = this.nodes[e.a];
        const nb = this.nodes[e.b];
        const a = Math.min(0.36, (1 - e.dist / maxDist) * baseAlpha * boost);
        ctx.strokeStyle = `rgba(${lineRgb}, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }

      // Draw electric flashes
      for (const fl of this.flashes) {
        const age = (nowMs - fl.t) / fl.dur;
        const alpha = Math.max(0, 1 - age) * (isDark ? 0.5 : 0.35);
        const na = this.nodes[fl.a];
        const nb = this.nodes[fl.b];
        const sparkRgb = isDark ? '235, 248, 255' : '124, 58, 237';
        ctx.strokeStyle = `rgba(${sparkRgb}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }

      // Draw nodes
      for (const n of this.nodes) {
        const pulse = 0.76 + 0.24 * Math.sin(t * 1.15 + n.phase);
        const rgb = n.cyan
          ? (isDark ? '34, 211, 238' : '6, 182, 212')
          : (isDark ? '167, 139, 250' : '124, 58, 237');
        const haloAlpha = Math.min(0.45, (isDark ? 0.18 : 0.1) * pulse * boost);
        ctx.fillStyle = `rgba(${rgb}, ${haloAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.7 * pulse, 0, Math.PI * 2);
        ctx.fill();

        const coreAlpha = Math.min(0.95, (isDark ? 0.78 : 0.45) * boost);
        ctx.fillStyle = `rgba(${rgb}, ${coreAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Celebratory burst ring on connect
      if (this.mode === 'connected' && this.burstStart) {
        const age = (nowMs - this.burstStart) / 1000;
        const dur = 1.35;
        if (age < dur) {
          const p = age / dur;
          const ease = 1 - Math.pow(1 - p, 2.2);
          const cx = w / 2;
          const cy = h * 0.34;
          const radius = ease * Math.max(w, h) * 0.8;
          const alpha = (1 - p) * (isDark ? 0.45 : 0.3);
          ctx.strokeStyle = isDark ? `rgba(103, 232, 249, ${alpha.toFixed(3)})` : `rgba(16, 185, 129, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 2.2 * (1 - p) + 0.8;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          this.burstStart = 0;
        }
      }
    }
  }

  window.BanafshNetworkCanvas = BanafshNetworkCanvas;
})();

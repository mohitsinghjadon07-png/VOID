(() => {
  'use strict';

  const aura = document.getElementById('cursorAura');
  const canvas = document.getElementById('networkCanvas');
  const network = document.querySelector('.void-network');
  const blocks = Array.from(document.querySelectorAll('.chain-block'));
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarseQuery = window.matchMedia('(pointer: coarse)');
  let raf = 0;
  let nodes = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointer = { x: -1000, y: -1000, active: false };
  let reduceMotion = reducedQuery.matches || document.body.dataset.reducedMotion === 'true';
  let level = document.body.dataset.motion || 'balanced';

  function dimensions() {
    if (!canvas || !network) return;
    const rect = network.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const areaCount = Math.round((width * height) / 19000);
    const count = Math.min(70, Math.max(24, level === 'immersive' ? areaCount + 20 : level === 'calm' ? areaCount - 8 : areaCount + 3));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .19,
      vy: (Math.random() - .5) * .19,
      size: .7 + Math.random() * 1.25,
      phase: Math.random() * Math.PI * 2
    }));
    draw(0, true);
  }

  function draw(time = 0, staticFrame = false) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, width, height);
    const intensity = level === 'immersive' ? 1 : level === 'calm' ? .52 : .78;
    const maxDistance = level === 'immersive' ? 150 : level === 'calm' ? 100 : 122;
    const pull = pointer.active && !coarseQuery.matches ? (level === 'immersive' ? .00025 : .00011) : 0;

    nodes.forEach((node, index) => {
      if (!staticFrame && !reduceMotion) {
        if (pull) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < 220) { node.vx += dx * pull; node.vy += dy * pull; }
        }
        node.vx = Math.max(-.38, Math.min(.38, node.vx * .996));
        node.vy = Math.max(-.38, Math.min(.38, node.vy * .996));
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;
      }

      for (let j = index + 1; j < nodes.length; j += 1) {
        const other = nodes[j];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * .29 * intensity;
          ctx.strokeStyle = `rgba(174, 113, 255, ${alpha})`;
          ctx.lineWidth = .65;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
      const pulse = reduceMotion ? 1 : .75 + Math.sin(time * .0013 + node.phase) * .25;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 177, 255, ${.52 * intensity})`;
      ctx.shadowBlur = level === 'immersive' ? 9 : 5;
      ctx.shadowColor = 'rgba(155, 76, 255, .58)';
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    if (!staticFrame && !reduceMotion) raf = requestAnimationFrame(draw);
  }

  function restart() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    reduceMotion = reducedQuery.matches || document.body.dataset.reducedMotion === 'true';
    level = document.body.dataset.motion || level;
    dimensions();
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  }

  if (canvas && ctx) {
    dimensions();
    if (!reduceMotion) raf = requestAnimationFrame(draw);
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      dimensions();
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }, { passive: true });
    document.addEventListener('void:motionchange', restart);
    if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', restart);
    else if (reducedQuery.addListener) reducedQuery.addListener(restart);
  }

  if (aura && !coarseQuery.matches) {
    window.addEventListener('pointermove', (event) => {
      aura.style.left = `${event.clientX}px`;
      aura.style.top = `${event.clientY}px`;
      aura.style.opacity = '0.62';
      if (network) {
        const rect = network.getBoundingClientRect();
        pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
      }
      blocks.forEach((block) => {
        const rect = block.getBoundingClientRect();
        const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
        block.classList.toggle('near-cursor', distance < 205);
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => { aura.style.opacity = '0'; pointer.active = false; blocks.forEach(block => block.classList.remove('near-cursor')); });
    document.addEventListener('pointerenter', () => { aura.style.opacity = '.45'; });
  }
})();

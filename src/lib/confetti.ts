const COLORS = ['#5DE0E6', '#FE2C55', '#FFFFFF', '#FFD166'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  color: string;
}

/**
 * Lancio leggero di coriandoli su un canvas a tutto schermo. Restituisce una funzione
 * che interrompe l'animazione. Pensato per durare un paio di secondi.
 */
export function launchConfetti(canvas: HTMLCanvasElement, count = 140): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);

  const pieces: Piece[] = Array.from({ length: count }, () => ({
    x: width / 2 + (Math.random() - 0.5) * width * 0.3,
    y: height * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 13 - 4,
    size: Math.random() * 7 + 5,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#5DE0E6',
  }));

  let frame = 0;
  let raf = 0;
  const totalFrames = 170;

  const draw = () => {
    frame++;
    ctx.clearRect(0, 0, width, height);
    const fade = Math.min(1, (totalFrames - frame) / 40);
    for (const p of pieces) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (frame < totalFrames) raf = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, width, height);
  };
  raf = requestAnimationFrame(draw);

  return () => cancelAnimationFrame(raf);
}

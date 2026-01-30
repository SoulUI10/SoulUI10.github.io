// /System/Effects/firework.js

export class Fireworks {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = "999999"; // Above OS UI
    this.canvas.style.pointerEvents = "none"; // Don't block UI

    document.body.appendChild(this.canvas);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.particles = [];
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  explode(x, y) {
    const colors = ["#ff004c", "#ffea00", "#00f0ff", "#7b00ff", "#00ff88"];
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x,
        y,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 5 + 2,
        life: 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  loop() {
    this.ctx.fillStyle = "rgba(0,0,0,0.15)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.speed *= 0.96;
      p.life--;

      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, 2, 2);

      if (p.life <= 0) this.particles.splice(i, 1);
    });

    requestAnimationFrame(() => this.loop());
  }
}

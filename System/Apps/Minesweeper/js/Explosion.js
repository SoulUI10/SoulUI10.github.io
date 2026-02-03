// ======= Explosion.js =======
class Particle {
  constructor(x, y, radius = 5, scale = 1, speed = 5, color = "#FFF") {
    this.x = x;           // current x position
    this.y = y;           // current y position
    this.radius = radius; // visible size
    this.scale = scale;   // shrinking factor
    this.speed = speed;   // movement speed
    this.color = color;   // particle color
    this.direction = { x: 0, y: 0 }; // movement vector
  }

  update() {
    // shrink particle
    this.radius -= this.scale / 5;
    if (this.radius < 0) this.radius = 0;

    // move particle
    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class Explosion {
  constructor(x, y, number = 20, size = 9, speed = 15) {
    this.particles = [];
    const sizeMin = 4;
    const speedMin = 7;

    for (let i = 0; i < number; i++) {
      const p = new Particle(
        x,
        y,
        random(sizeMin, size),
        random(0.5, 1),
        random(speedMin, speed),
        randomColor()
      );
      p.direction = Explosion.randomDirection();
      this.particles.push(p);
    }
  }

  static randomDirection() {
    const angle = Math.random() * 2 * Math.PI; // 0 to 2π radians
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  update(ctx) {
    this.particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
    // Optionally remove dead particles (radius <= 0)
    this.particles = this.particles.filter(p => p.radius > 0);
  }

  isFinished() {
    return this.particles.length === 0;
  }
}

// ======= Helper for color =======
function randomColor() {
  const colors = [
    "#CC1600", "#D33407", "#E17016", "#FFA318", "#525252"
  ];
  const chance = Math.random() * 100;
  if (chance < 10) return colors[0];
  if (chance < 20) return colors[1];
  if (chance < 30) return colors[2];
  if (chance < 50) return colors[3];
  return colors[4];
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

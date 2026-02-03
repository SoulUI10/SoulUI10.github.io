class Board {
  constructor(map, mineNumber) {
    // Default padding and zone size
    this.padding = 2;
    this.zoneSize = 30;

    // Determine columns and rows
    if (typeof map === "number") {
      this.column = Math.max(1, Math.round(Math.sqrt(map)));
      this.row = Math.max(1, Math.round(Math.sqrt(map)));
    } else {
      this.column = Math.max(1, Math.floor(autoSize(map.width)));
      this.row = Math.max(1, Math.floor(autoSize(map.height)));
    }

    this.boardSize = this.column * this.row;
    this.numberNotUnveiled = this.boardSize;

    // Validate mine number
    this.mineNumber = this.setMineNumber(mineNumber, this.column);

    // Arrays for zones, mines, and values
    this.zones = [];
    this.mines = [];
    this.values = Array.from({ length: this.boardSize }, () => 0);

    // Fit board to canvas if necessary
    if (typeof map !== "number") this.autoFit(map);

    // Initialize board
    this.setZone();
  }

  // --- Helpers ---
  autoFit(canvas) {
    let x = canvas.width - this.column * (this.zoneSize + this.padding) - this.padding;
    let y = canvas.height - this.row * (this.zoneSize + this.padding) - this.padding;
    this.padding += Math.floor(Math.min(x / (this.column + 1), y / (this.row + 1)));
  }

  setMineNumber(x, defaultValue) {
    try {
      if (typeof x === "string") throw new TypeError("Should be a number");
      if (isNaN(x)) throw { name: "Empty input", level: "Warning", message: "Default value will be applied" };
      if (x === 0) throw "Warning, input is 0";
    } catch (e) {
      console.log("%cWarning: " + (e.message || e) + ", using default value " + defaultValue, "color: orange");
      x = defaultValue;
    }
    return x;
  }

  removeFromArray(value, array) {
    return array.filter(v => v !== value);
  }

  // --- Zone positioning ---
  north(z) { return z < this.column || z === this.boardSize ? this.boardSize : z - this.column; }
  south(z) { return z >= this.boardSize - this.column || z === this.boardSize ? this.boardSize : z + this.column; }
  east(z) { return z % this.column === this.column - 1 || z === this.boardSize ? this.boardSize : z + 1; }
  west(z) { return z % this.column === 0 || z === this.boardSize ? this.boardSize : z - 1; }

  neighbour(z) {
    const neighbours = [
      this.north(z),
      this.north(this.east(z)),
      this.north(this.west(z)),
      this.south(z),
      this.south(this.east(z)),
      this.south(this.west(z)),
      this.east(z),
      this.west(z)
    ];
    return this.removeFromArray(this.boardSize, neighbours);
  }

  hasMine(n) { return this.mines.includes(n); }

  setMines() {
    while (this.mines.length < this.mineNumber) {
      const n = Math.floor(Math.random() * this.boardSize); // 0..boardSize-1
      if (!this.hasMine(n)) this.mines.push(n);
    }
    this.mines.sort((a, b) => a - b);
  }

  setValues() {
    for (let i = 0; i < this.mines.length; i++) {
      const coords = this.neighbour(this.mines[i]);
      coords.forEach(c => this.values[c]++);
    }
  }

  addZone() {
    const idx = this.zones.length;
    const x = (this.zoneSize + this.padding) * (idx % this.column) + this.padding;
    const y = (this.zoneSize + this.padding) * Math.floor(idx / this.column) + this.padding;
    const mine = this.hasMine(idx);
    const value = this.values[idx];
    this.zones.push(new Zone(x, y, mine, this.zoneSize, value));
  }

  setZone() {
    this.setMines();
    this.setValues();
    while (this.zones.length < this.boardSize) this.addZone();
  }

  getZone(x, y) {
    if (x <= (this.zoneSize + this.padding) * this.column && y <= (this.zoneSize + this.padding) * this.row) {
      const column = Math.floor(x / (this.zoneSize + this.padding));
      const row = Math.floor(y / (this.zoneSize + this.padding));
      return row * this.column + column;
    }
    return null;
  }

  // --- Gameplay ---
  unveil(z) {
    const zone = this.zones[z];
    if (!zone.flag && !zone.isUnveiled) {
      zone.unveil();
      this.numberNotUnveiled--;
      return true;
    }
    return false;
  }

  expand(z) {
    if (this.unveil(z)) {
      if (!this.zones[z].value) {
        this.neighbour(z).forEach(n => { if (!this.zones[n].isUnveiled) this.expand(n); });
      }
    }
  }

  clicked(z, canvas) {
    this.expand(z);
    if (this.zones[z].hasMine()) this.gameOver(z, canvas);
    else this.checkWin(canvas);
  }

  checkWin(canvas) {
    if (this.numberNotUnveiled === this.mineNumber) this.alertStatus(canvas, "win");
  }

  gameOver(z, canvas) {
    this.mines.forEach(i => this.zones[i].unveil());
    this.explode(this.zones[z], canvas);
    this.alertStatus(canvas, "lose");
  }

  explode(zone, canvas) {
    canvas.dispatchEvent(new CustomEvent("explode", { detail: { x: zone.x, y: zone.y } }));
  }

  alertStatus(canvas, type) {
    canvas.dispatchEvent(new CustomEvent(type));
  }

  update(x, y, evt, canvas) {
    const z = this.getZone(x, y);
    if (!this.zones[z]) return;
    switch (evt) {
      case "click": this.clicked(z, canvas); break;
      case "contextmenu": this.zones[z].switchFlag(); break;
      case "mousemove": break;
    }
    this.draw(canvas);
  }

  draw(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.zones.forEach(zone => zone.draw(canvas));
  }
}

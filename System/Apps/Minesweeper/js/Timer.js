function Timer() {
  this.timer = null;
  this.time = null;
  this.counter = "00:00";

  this.count = () => {
    const now = Date.now();
    const diff = now - this.time;

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    this.counter =
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");
  };

  this.start = (startTime) => {
    if (this.timer) return; // ✅ prevent double start

    this.time = startTime ? startTime.getTime() : Date.now();

    this.timer = setInterval(() => {
      this.count();
    }, 1000);
  };

  this.stop = () => {
    clearInterval(this.timer);
    this.timer = null;
  };

  this.reset = () => {
    this.stop();
    this.counter = "00:00";
  };
}

function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}

setInterval(updateTime, 500);
updateTime();

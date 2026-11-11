const orbitModel = document.querySelector(".orbital-art");
const launchButton = orbitModel.querySelector(".orbit-launch");
const pauseButton = orbitModel.querySelector(".orbit-pause");
const earth = orbitModel.querySelector(".orbit-earth");
const moon = orbitModel.querySelector(".orbit-moon");
const rocket = orbitModel.querySelector(".orbit-rocket");
const missionStatus = orbitModel.querySelector(".orbit-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let flight;

orbitModel.classList.add("is-ready");

pauseButton.addEventListener("click", () => {
  const paused = orbitModel.classList.toggle("is-paused");
  pauseButton.setAttribute("aria-pressed", String(paused));
});

function landing() {
  orbitModel.classList.remove("is-launching");
  orbitModel.classList.add("has-landed");
  missionStatus.textContent = "The rocket has reached the Moon.";
  flight = undefined;
}

launchButton.addEventListener("click", () => {
  if (flight) return;

  orbitModel.classList.remove("has-landed");
  missionStatus.textContent = "Rocket launched.";

  if (reducedMotion.matches) {
    landing();
    return;
  }

  orbitModel.classList.add("is-launching");
  const scene = launchButton.getBoundingClientRect();
  const earthBounds = earth.getBoundingClientRect();
  const moonBounds = moon.getBoundingClientRect();
  const earthX = earthBounds.left + earthBounds.width / 2 - scene.left;
  const earthY = earthBounds.top + earthBounds.height / 2 - scene.top;
  const moonX = moonBounds.left + moonBounds.width / 2 - scene.left;
  const moonY = moonBounds.top + moonBounds.height / 2 - scene.top;
  const distance = Math.hypot(moonX - earthX, moonY - earthY);
  const directionX = (moonX - earthX) / distance;
  const directionY = (moonY - earthY) / distance;
  const earthRadius = earth.offsetWidth / 2;
  const moonRadius = moon.offsetWidth / 2;
  const closePass = distance < earthRadius + moonRadius + 12;
  // During a projected close pass, launch from the side to keep the flight visible.
  const startX = earthX + (closePass ? directionY : directionX) * earthRadius;
  const startY = earthY + (closePass ? -directionX : directionY) * earthRadius;
  const endX = moonX + (closePass ? directionY : -directionX) * moonRadius;
  const endY = moonY + (closePass ? -directionX : -directionY) * moonRadius;
  const bend = closePass ? earthRadius * .8 : Math.hypot(endX - startX, endY - startY) * .24;
  const middleX = (startX + endX) / 2 + directionY * bend;
  const middleY = (startY + endY) / 2 - directionX * bend;

  const keyframes = Array.from({length: 13}, (_, step) => {
    const t = step / 12;
    const remaining = 1 - t;
    const x = remaining ** 2 * startX + 2 * remaining * t * middleX + t ** 2 * endX;
    const y = remaining ** 2 * startY + 2 * remaining * t * middleY + t ** 2 * endY;
    const tangentX = remaining * (middleX - startX) + t * (endX - middleX);
    const tangentY = remaining * (middleY - startY) + t * (endY - middleY);
    return {
      left: (100 * x / scene.width) + "%",
      top: (100 * y / scene.height) + "%",
      transform: "translate(-50%, -50%) rotate(" + Math.atan2(tangentY, tangentX) + "rad)",
      opacity: t === 1 ? 0 : 1
    };
  });

  flight = rocket.animate(keyframes, {duration: 1900, easing: "cubic-bezier(.42, 0, .55, 1)"});
  flight.addEventListener("finish", landing, {once: true});
});

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) flight?.finish();
});

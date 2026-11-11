const display = document.querySelector(".project-display");
const triggers = [...display.querySelectorAll(".project-trigger")];
const panels = triggers.map((trigger) => document.getElementById(trigger.getAttribute("aria-controls")));
const mouseHover = window.matchMedia("(any-hover: hover)");
let active = null;
let pinned = false;

function selectProject(trigger, keepOpen = false) {
  active = trigger;
  pinned = keepOpen;

  triggers.forEach((button, index) => {
    const selected = button === trigger;
    button.setAttribute("aria-expanded", String(selected));
    panels[index].hidden = !selected;
  });
}

selectProject(null);
display.classList.add("is-interactive");

triggers.forEach((trigger) => {
  trigger.addEventListener("pointerenter", (event) => {
    if (mouseHover.matches && event.pointerType === "mouse" && trigger !== active) {
      const openPanel = panels[triggers.indexOf(active)];
      if (!openPanel?.contains(document.activeElement)) {
        selectProject(trigger);
      }
    }
  });

  trigger.addEventListener("click", () => {
    if (active === trigger && pinned) {
      selectProject(null);
    } else {
      selectProject(trigger, true);
    }
  });
});

function closePreview() {
  const openPanel = panels[triggers.indexOf(active)];
  if (!pinned && !openPanel?.contains(document.activeElement)) {
    selectProject(null);
  }
}

display.addEventListener("pointerleave", closePreview);
display.addEventListener("focusout", (event) => {
  if (!display.contains(event.relatedTarget) && !display.matches(":hover") && !pinned) {
    selectProject(null);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !active) return;

  if (display.contains(document.activeElement)) {
    active.focus({preventScroll: true});
  }
  selectProject(null);
});

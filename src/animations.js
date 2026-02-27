// ═══════════════════════════════════════════════════════════════════════
//  ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════

let _stylesInjected = false;

function _injectBuiltInStyles() {
  if (_stylesInjected || typeof document === "undefined") return;
  _stylesInjected = true;

  const css = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeOutUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
@keyframes fadeOutDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slideOutLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } }
@keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes zoomOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.5); } }
@keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
@keyframes bounceOut { 0% { opacity: 1; transform: scale(1); } 20% { transform: scale(0.9); } 50%,55% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0; transform: scale(0.3); } }
`.trim();

  const style = document.createElement("style");
  style.setAttribute("data-nojs-animations", "");
  style.textContent = css;
  document.head.appendChild(style);
}

export function _animateIn(el, animName, transitionName, durationMs) {
  _injectBuiltInStyles();
  const fallback = durationMs || 1000;
  if (animName) {
    const target = el.firstElementChild || el;
    target.classList.add(animName);
    if (durationMs) target.style.animationDuration = durationMs + "ms";
    target.addEventListener(
      "animationend",
      () => target.classList.remove(animName),
      { once: true },
    );
  }
  if (transitionName) {
    const target = el.firstElementChild || el;
    target.classList.add(
      transitionName + "-enter",
      transitionName + "-enter-active",
    );
    requestAnimationFrame(() => {
      target.classList.remove(transitionName + "-enter");
      target.classList.add(transitionName + "-enter-to");
      const done = () => {
        target.classList.remove(
          transitionName + "-enter-active",
          transitionName + "-enter-to",
        );
      };
      target.addEventListener("transitionend", done, { once: true });
      // Fallback
      setTimeout(done, fallback);
    });
  }
}

export function _animateOut(el, animName, transitionName, callback, durationMs) {
  _injectBuiltInStyles();
  const fallback = durationMs || 2000;
  if (!el.firstElementChild && !el.childNodes.length) {
    callback();
    return;
  }
  if (animName) {
    const target = el.firstElementChild || el;
    target.classList.add(animName);
    if (durationMs) target.style.animationDuration = durationMs + "ms";
    target.addEventListener(
      "animationend",
      () => {
        target.classList.remove(animName);
        callback();
      },
      { once: true },
    );
    setTimeout(callback, fallback); // Fallback
    return;
  }
  if (transitionName) {
    const target = el.firstElementChild || el;
    target.classList.add(
      transitionName + "-leave",
      transitionName + "-leave-active",
    );
    requestAnimationFrame(() => {
      target.classList.remove(transitionName + "-leave");
      target.classList.add(transitionName + "-leave-to");
      const done = () => {
        target.classList.remove(
          transitionName + "-leave-active",
          transitionName + "-leave-to",
        );
        callback();
      };
      target.addEventListener("transitionend", done, { once: true });
      setTimeout(done, fallback);
    });
    return;
  }
  callback();
}

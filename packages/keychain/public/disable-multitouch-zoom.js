const disableMultiTouchZoom = (event) => {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
};

window.addEventListener("touchstart", disableMultiTouchZoom, {
  passive: false,
});
window.addEventListener("touchmove", disableMultiTouchZoom, {
  passive: false,
});
window.addEventListener("touchend", disableMultiTouchZoom, {
  passive: false,
});

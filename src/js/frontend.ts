export const isTouch = () => {
  return !window.matchMedia("(hover: hover)").matches;
};
const LINE_WIDTH = window.matchMedia("(any-hover: none)").matches ? 2 : 1;
const POINT_RADIUS = LINE_WIDTH * 5;
const ARROW_LENGTH = POINT_RADIUS * 6;
const RAINBOW_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "violet",
];
const MIN_DRAW_LENGTH = 1;

export {
  LINE_WIDTH,
  POINT_RADIUS,
  ARROW_LENGTH,
  RAINBOW_COLORS,
  MIN_DRAW_LENGTH,
};

const LINE_WIDTH = window.matchMedia("(any-hover: none)").matches ? 1 : 1;
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
const INITIAL_BASE_LINE_DATA = {
  start: { x: 250, y: 250 },
  end: { x: 600, y: 250 },
};

export {
  LINE_WIDTH,
  POINT_RADIUS,
  ARROW_LENGTH,
  RAINBOW_COLORS,
  MIN_DRAW_LENGTH,
  INITIAL_BASE_LINE_DATA,
};

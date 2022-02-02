import { LINE_WIDTH, RAINBOW_COLORS, MIN_DRAW_LENGTH } from "./constants.js";

import { rand, approximateLength, transformLine } from "./helpers.js";

var RAINBOW_COUNTER = 0;

function rainbowColor() {
  return RAINBOW_COLORS[RAINBOW_COUNTER++ % 7];
}

function randomColor() {
  return `hsla(${rand(0, 360)}, ${rand(50, 100)}%, ${rand(20, 50)}%, 1)`;
}

const FRACTAL_COLOR_FUN = randomColor;

function drawLine(ctx, line) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(line.start.x, line.start.y);
  ctx.lineTo(line.end.x, line.end.y);
  ctx.strokeStyle = FRACTAL_COLOR_FUN();
  ctx.lineWidth = LINE_WIDTH;
  ctx.stroke();
  ctx.restore();
}

function drawFractal(ctx, generator, lineRef, depth, drawAllLines = false) {
  if (depth <= 0 || approximateLength(lineRef) <= MIN_DRAW_LENGTH) {
    drawLine(ctx, lineRef);
  } else {
    for (const [i, gen] of generator.generators.entries()) {
      const line = generator.lines[i];
      if (drawAllLines) {
        drawLine(ctx, line);
      }
      const newLine = transformLine(line, lineRef);

      drawFractal(ctx, gen, newLine, depth - 1, drawAllLines);
    }
  }
}

export { randomColor, drawLine, drawFractal };

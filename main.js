import {
  randomColor,
  getDrawFractalIterator,
  drawFractal,
} from "./drawFractal.js";

import { Rectangle } from "./shapes.js";

import { FractalControl } from "./fractalControl.js";

import { Koch } from "./exampleGenerators.js";

var MouseTouchTracker = function (window, canvas, callback) {
  var canvasIsDragging = false;

  function processEvent(evt) {
    var rect = canvas.getBoundingClientRect();
    var offsetTop = rect.top;
    var offsetLeft = rect.left;

    if (evt.touches) {
      return {
        x: evt.touches[0].clientX - offsetLeft,
        y: evt.touches[0].clientY - offsetTop,
      };
    } else {
      return {
        x: evt.clientX - offsetLeft,
        y: evt.clientY - offsetTop,
      };
    }
  }

  function onDown(evt) {
    canvasIsDragging = true;
    evt.preventDefault();
    var coords = processEvent(evt);
    callback("down", coords.x, coords.y);
  }

  function onUp(evt) {
    if (canvasIsDragging) {
      evt.preventDefault();
      callback("up");
      canvasIsDragging = false;
    }
  }

  function onMove(evt) {
    if (canvasIsDragging) {
      evt.preventDefault();
      var coords = processEvent(evt);
      callback("move", coords.x, coords.y);
    }
  }

  function onResize(evt) {
    callback("resize", window.innerWidth, window.innerHeight);
  }

  window.onresize = onResize;

  window.ontouchmove = onMove;
  window.onmousemove = onMove;

  canvas.ontouchstart = onDown;
  canvas.onmousedown = onDown;

  window.ontouchend = onUp;
  window.onmouseup = onUp;
};

// Compatibility animation loop
window.requestAnimFrame = (function (callback) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 0);
    }
  );
})();

function raw_draw(ctx, offScreenCanvas, fractalControls, hideControls) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(offScreenCanvas, 0, 0);
  if (!hideControls) {
    for (const fractalControl of fractalControls) {
      fractalControl.render(ctx);
    }
  }
}

var isDrawingLoop = true;

function init() {
  var canvas = document.getElementById("mainCanvas");
  var offScreenCanvas = document.getElementById("offScreenCanvas");
  var ctx = canvas.getContext("2d");
  var ctx_off = offScreenCanvas.getContext("2d");
  var startX = 0;
  var startY = 0;

  let baseLineData = {
    start: { x: 50, y: 220 },
    end: { x: 400, y: 220 },
  };
  var drawingOptions = {
    maxDepth: false,
    drawAllLines: false,
  };
  var fractalControls = [new FractalControl(baseLineData, Koch, 20)];
  var fc0 = fractalControls[0];
  var canvasIsPanning = false;

  document.getElementById("StartStop").onclick = () => {
    if (!isDrawingLoop) {
      isDrawingLoop = true;
      loop();
    } else {
      isDrawingLoop = false;
    }
  };

  canvas.width = window.innerWidth * 0.75 - 10;
  canvas.height = window.innerHeight * 0.95 - 10;
  offScreenCanvas.width = canvas.width;
  offScreenCanvas.height = canvas.height;

  var drawFractalIterator;

  function refreshDrawFractalIter() {
    drawFractalIterator = getDrawFractalIterator(
      ctx_off,
      fc0.generator,
      fc0.baseLine,
      drawingOptions.maxDepth,
      drawingOptions.drawAllLines
    );
  }
  refreshDrawFractalIter();

  var mtt = new MouseTouchTracker(window, canvas, function (evtType, x, y) {
    switch (evtType) {
      case "down":
        startX = x;
        startY = y;
        canvasIsPanning = true;

        for (const fractalControl of fractalControls) {
          if (fractalControl.onDown(ctx, { x: x, y: y })) {
            canvasIsPanning = false;
            break;
          }
        }
        break;

      case "up":
        for (const fractalControl of fractalControls) {
          fractalControl.onUp();
        }
        canvasIsPanning = false;
        break;

      case "move":
        ctx_off.clearRect(0, 0, ctx_off.canvas.width, ctx_off.canvas.height);
        var dx = x - startX;
        var dy = y - startY;
        startX = x;
        startY = y;

        for (const fractalControl of fractalControls) {
          fractalControl.onMove({ x: x, y: y }, dx, dy);
        }
        if (canvasIsPanning) {
          for (const fractalControl of fractalControls) {
            fractalControl.translateAll(dx, dy);
          }
        }
        refreshDrawFractalIter();
        break;

      case "resize":
        canvas.width = window.innerWidth * 0.75 - 10;
        canvas.height = window.innerHeight * 0.95 - 10;
        offScreenCanvas.width = canvas.width;
        offScreenCanvas.height = canvas.height;
        ctx_off.clearRect(0, 0, ctx_off.canvas.width, ctx_off.canvas.height);
        refreshDrawFractalIter();
        break;
    }

    raw_draw(
      ctx,
      offScreenCanvas,
      fractalControls,
      drawingOptions.hideControls
    );
  });

  var count = 0;
  function draw(maxDepth, drawAllLines, hideControls) {
    drawingOptions.hideControls = hideControls;
    if (
      drawingOptions.maxDepth != maxDepth ||
      drawingOptions.drawAllLines != drawAllLines
    ) {
      drawingOptions.maxDepth = maxDepth;
      drawingOptions.drawAllLines = drawAllLines;

      ctx_off.clearRect(0, 0, ctx_off.canvas.width, ctx_off.canvas.height);
      refreshDrawFractalIter();
    }
    for (let i = 0; i < 100; i++) {
      if (drawFractalIterator.next().done) {
        refreshDrawFractalIter();
      }
    }

    count++;
    raw_draw(
      ctx,
      offScreenCanvas,
      fractalControls,
      drawingOptions.hideControls
    );
  }

  raw_draw(ctx, offScreenCanvas, fractalControls, drawingOptions.hideControls);

  return draw;
}

var draw = init();

var MAX_REFRESH = 10000;

function loop() {
  let refreshRate = document.getElementById("RefreshRate").value;
  let maxDepth = document.getElementById("Depth").value;
  let drawAllLines = document.getElementById("DrawAllLines").checked;
  let hideControls = document.getElementById("HideControls").checked;

  if (!refreshRate) {
    refreshRate = 1;
  } else if (MAX_REFRESH < refreshRate) {
    refreshRate = MAX_REFRESH;
  } else if (refreshRate < 1) {
    refreshRate = 1;
  }
  document.getElementById("RefreshRate").value = Math.floor(refreshRate);
  for (let i = 0; i < refreshRate; i++) {
    if (!isDrawingLoop) {
      break;
    }
    draw(maxDepth, drawAllLines, hideControls);
  }
  if (isDrawingLoop) {
    requestAnimFrame(loop);
  }
}

loop();

import { clonePoint } from "./helpers.js";

import {
  //randomColor,
  getDrawFractalIterator,
  //drawFractal,
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
    callback("down", coords);
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
      let evtPoint =
        evt.touches && evt.touches[0]
          ? { x: evt.touches[0].clientX, y: evt.touches[0].clientY }
          : processEvent(evt);
      let evtPoint2 =
        evt.touches && evt.touches[1]
          ? { x: evt.touches[1].clientX, y: evt.touches[1].clientY }
          : undefined;
      callback("move", evtPoint, evtPoint2);
    }
  }

  function onWheel(evt) {
    const evtPoint = { x: evt.clientX, y: evt.clientY };
    const evtPoint2 = undefined;
    const evtDelta = { x: evt.deltaX, y: evt.deltaY };
    callback("wheel", evtPoint, evtPoint2, evtDelta);
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

  window.onwheel = onWheel;
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
  var startPoint = { x: 0, y: 0 };

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

  var mtt = new MouseTouchTracker(window, canvas, function (
    evtType,
    evtPoint,
    evtPoint2 = undefined,
    evtDelta = undefined
  ) {
    switch (evtType) {
      case "down":
        console.log("down");
        startPoint = clonePoint(evtPoint);
        canvasIsPanning = true;

        for (const fractalControl of fractalControls) {
          if (fractalControl.onDown(ctx, evtPoint)) {
            canvasIsPanning = false;
            break;
          }
        }
        break;

      case "up":
        console.log("up");
        for (const fractalControl of fractalControls) {
          fractalControl.onUp();
        }
        canvasIsPanning = false;
        break;

      case "move":
        console.log("move");
        console.log(startPoint);
        console.log("1", evtPoint);
        console.log("2", evtPoint2);
        ctx_off.clearRect(0, 0, ctx_off.canvas.width, ctx_off.canvas.height);

        const delta = {
          x: evtPoint.x - startPoint.x,
          y: evtPoint.y - startPoint.y,
        };
        console.log(delta);
        startPoint = clonePoint(evtPoint);
        console.log(startPoint);

        for (const fractalControl of fractalControls) {
          fractalControl.onMove(evtPoint, delta);
        }
        if (canvasIsPanning) {
          for (const fractalControl of fractalControls) {
            fractalControl.translateAll(delta);
          }
        }
        refreshDrawFractalIter();
        break;

      case "wheel":
        console.log("wheel", evtPoint, evtDelta);
        break;

      case "resize":
        console.log("resize");
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

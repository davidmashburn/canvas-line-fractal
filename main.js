import {
  Point,
  Rectangle,
  Arc,
  ArrowLine,
  generatePointsAndArrowLinesFromGeneratorData,
} from "./shapes.js";

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

function raw_draw(ctx, offScreenCanvas, fractalControls) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(offScreenCanvas, 0, 0);
  for (const fractalControl of fractalControls) {
    fractalControl.render(ctx);
  }
}

var isDrawingLoop = false;

function init() {
  var canvas = document.getElementById("mainCanvas");
  var offScreenCanvas = document.getElementById("offScreenCanvas");
  var ctx = canvas.getContext("2d");
  var ctx_off = offScreenCanvas.getContext("2d");
  var startX = 0;
  var startY = 0;
  var rectangle_off = new Rectangle(150, 150, 100, 100, "red");

  let baseLineData = {
    start: { x: 50, y: 220 },
    end: { x: 400, y: 220 },
  };
  var fractalControls = [new FractalControl(baseLineData, Koch, 2)];
  var canvasIsPanning = false;

  document.getElementById("Draw").onclick = () => {
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
        break;

      case "resize":
        canvas.width = window.innerWidth * 0.75 - 10;
        canvas.height = window.innerHeight * 0.95 - 10;
        offScreenCanvas.width = canvas.width;
        offScreenCanvas.height = canvas.height;
        rectangle_off.render(ctx_off);
        break;
    }

    raw_draw(ctx, offScreenCanvas, fractalControls);
  });

  var count = 0;
  var r;
  function draw() {
    let colors = ["red", "orange", "yellow", "green", "cyan", "blue", "violet"];
    rectangle_off.color = colors[count % colors.length];
    //r = (bottom, top) => bottom + Math.floor(Math.random() * (top - bottom));
    // rectangle_off.color = (
    //   `hsla(${r(0, 360)}, ${r(50, 100)}%, ${r(20, 50)}%, 1)`
    // );
    rectangle_off.x = 150 + (count % 400);
    rectangle_off.y = 150 + ((count / 400) % 400);
    rectangle_off.render(ctx_off);

    //count = (count + 1) % colors.length;
    count++;
    raw_draw(ctx, offScreenCanvas, fractalControls);
  }

  draw();

  return draw;
}

var draw = init();

var MAX_REFRESH = 10000;

function loop() {
  let refreshRate = document.getElementById("RefreshRate").value;
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
    draw();
  }
  if (isDrawingLoop) {
    requestAnimFrame(loop);
  }
}
